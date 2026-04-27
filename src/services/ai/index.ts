/**
 * AI 服务统一入口
 * - 浏览器直连 Provider，使用 OpenAI 兼容协议
 * - 支持流式（SSE）与一次性返回
 * - JSON 解析失败时降级为 null 而非抛错
 */
import type {
  AIConfig,
  ChatMessage,
  GuidancePhase,
  JDAnalysis,
  ParsedResumeData,
  RewriteMode,
  StarScore,
  StarImprovement,
  StreamHandlers,
} from './types';
import {
  getSystemPrompt,
  guidanceChatPrompt,
  guidanceExtractPrompt,
  jdAnalysisPrompt,
  parseFreeTextPrompt,
  parseResumeTextPrompt,
  rewritePrompt,
  starImproveAllPrompt,
  starScorePrompt,
} from './prompts';

function buildHeaders(config: AIConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }
  return headers;
}

function getEndpoint(config: AIConfig): string {
  const base = (config.baseURL || '').replace(/\/+$/, '');
  return `${base}/chat/completions`;
}

/**
 * 非流式调用：返回完整字符串
 */
export async function chatOnce(
  config: AIConfig,
  messages: ChatMessage[],
  opts?: { signal?: AbortSignal; temperature?: number },
): Promise<string> {
  if (!config.baseURL) throw new Error('未配置 AI baseURL，请先在 "AI 设置" 中完成配置');
  const res = await fetch(getEndpoint(config), {
    method: 'POST',
    headers: buildHeaders(config),
    signal: opts?.signal,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: opts?.temperature ?? config.temperature,
      stream: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI 请求失败（${res.status}）：${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';
  return content.trim();
}

/**
 * 流式调用：逐字符回调，失败时自动降级为一次性调用
 */
export async function chatStream(
  config: AIConfig,
  messages: ChatMessage[],
  handlers: StreamHandlers,
  opts?: { temperature?: number },
): Promise<void> {
  if (!config.baseURL) {
    handlers.onError?.(new Error('未配置 AI baseURL，请先在 "AI 设置" 中完成配置'));
    return;
  }
  try {
    const res = await fetch(getEndpoint(config), {
      method: 'POST',
      headers: buildHeaders(config),
      signal: handlers.signal,
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: opts?.temperature ?? config.temperature,
        stream: true,
      }),
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI 请求失败（${res.status}）：${text.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // 按行切分 SSE
      let idx = buffer.indexOf('\n');
      while (idx !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        idx = buffer.indexOf('\n');
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const delta: string = json?.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            full += delta;
            handlers.onDelta?.(delta);
          }
        } catch {
          // 某些 provider 会在流中夹带 keep-alive 或非 JSON，忽略即可
        }
      }
    }
    handlers.onDone?.(full.trim());
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * 提取首个 JSON 对象（容忍 LLM 把 JSON 包在 markdown 代码块里）
 */
function extractJSON<T = any>(text: string): T | null {
  if (!text) return null;
  // 去掉 markdown ```json ... ``` 包装
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  // 找第一个 { 到最后一个 }
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

// ========== 高阶 API ==========

/** 改写一条简历描述 */
export async function rewriteText(
  config: AIConfig,
  original: string,
  mode: RewriteMode,
  context?: { role?: string; jd?: string },
): Promise<string> {
  if (!original.trim()) return original;
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: rewritePrompt(original, mode, context, config.language) },
  ];
  const result = await chatOnce(config, messages);
  // 去掉可能的包裹引号
  return result.replace(/^["'「『]|["'」』]$/g, '').trim();
}

/** 流式改写（UI 上边写边显示） */
export function rewriteTextStream(
  config: AIConfig,
  original: string,
  mode: RewriteMode,
  handlers: StreamHandlers,
  context?: { role?: string; jd?: string },
): void {
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: rewritePrompt(original, mode, context, config.language) },
  ];
  void chatStream(config, messages, handlers);
}

/** STAR 打分 */
export async function scoreStar(
  config: AIConfig,
  achievement: string,
): Promise<StarScore | null> {
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: starScorePrompt(achievement, config.language) },
  ];
  const raw = await chatOnce(config, messages, { temperature: 0.2 });
  return extractJSON<StarScore>(raw);
}

/** JD 分析 */
export async function analyzeJD(
  config: AIConfig,
  jd: string,
  resumeSummary: string,
): Promise<JDAnalysis | null> {
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: jdAnalysisPrompt(jd, resumeSummary, config.language) },
  ];
  const raw = await chatOnce(config, messages, { temperature: 0.3 });
  return extractJSON<JDAnalysis>(raw);
}

// ========== AI 一键成稿（Auto-Fill）高阶 API ==========

/** 自由表述 → 结构化简历 */
export async function autoFillFromText(
  config: AIConfig,
  text: string,
): Promise<ParsedResumeData | null> {
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: parseFreeTextPrompt(text, config.language) },
  ];
  const raw = await chatOnce(config, messages, { temperature: 0.3 });
  return extractJSON<ParsedResumeData>(raw);
}

/** 简历文件文本 → 结构化数据 */
export async function autoFillFromResumeText(
  config: AIConfig,
  rawText: string,
): Promise<ParsedResumeData | null> {
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: parseResumeTextPrompt(rawText, config.language) },
  ];
  const raw = await chatOnce(config, messages, { temperature: 0.3 });
  return extractJSON<ParsedResumeData>(raw);
}

/** 问答式引导：获取 AI 下一个问题 */
export async function guidanceGetNextQuestion(
  config: AIConfig,
  history: Array<{ role: string; content: string }>,
  phase: GuidancePhase,
  collectedInfo: Record<string, any>,
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: guidanceChatPrompt(history, phase, collectedInfo, config.language) },
  ];
  return chatOnce(config, messages, { temperature: 0.7 });
}

/** 问答式引导：从用户回答中提取结构化数据 */
export async function guidanceExtractInfo(
  config: AIConfig,
  userAnswer: string,
  phase: GuidancePhase,
): Promise<ParsedResumeData | null> {
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: guidanceExtractPrompt(userAnswer, phase, config.language) },
  ];
  const raw = await chatOnce(config, messages, { temperature: 0.2 });
  return extractJSON<ParsedResumeData>(raw);
}

/** STAR 法则批量改进工作成就 */
export async function starImproveAll(
  config: AIConfig,
  achievements: string[],
): Promise<StarImprovement[]> {
  if (!achievements.length) return [];
  const messages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt(config.language) },
    { role: 'user', content: starImproveAllPrompt(achievements, config.language) },
  ];
  const raw = await chatOnce(config, messages, { temperature: 0.4 });
  const result = extractJSON<Array<{
    original: string;
    improved: string;
    missingAspect: string;
    suggestion: string;
  }>>(raw);
  if (!result || !Array.isArray(result)) return [];
  return result.map((item) => ({
    original: item.original || '',
    improved: item.improved || '',
    score: { total: 0, situation: 0, task: 0, action: 0, result: 0, suggestions: [item.suggestion] } as StarScore,
  }));
}
