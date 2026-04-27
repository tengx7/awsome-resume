import type { RewriteMode, GuidancePhase } from './types';

/**
 * 所有 Prompt 模板集中在这里，方便后续优化和多语言切换。
 * 设计原则：
 * 1. 尽量约束输出格式（纯文本或 JSON），避免前端解析失败。
 * 2. 少说废话，直接出结果（用户 UI 会说"正在生成"）。
 * 3. 默认中文，可通过 language 参数切换。
 */

const ZH_SYSTEM = `你是一位资深的技术招聘官和简历撰写专家，熟悉大厂的用人标准与 STAR 法则。
回答必须直接、克制、真实，不得虚构未提供的事实，不得使用"我认为"、"希望"等口水话。`;

const EN_SYSTEM = `You are a senior tech recruiter and resume writing expert, familiar with FAANG standards and the STAR framework.
Answers must be direct, concise, and factual. Do not fabricate anything not provided; avoid filler phrases.`;

export function getSystemPrompt(language: 'zh' | 'en'): string {
  return language === 'en' ? EN_SYSTEM : ZH_SYSTEM;
}

/** 改写单条句子 */
export function rewritePrompt(
  original: string,
  mode: RewriteMode,
  context?: { role?: string; jd?: string },
  language: 'zh' | 'en' = 'zh',
): string {
  const zh: Record<RewriteMode, string> = {
    polish: '请润色下列简历描述，使表达更专业、简洁、有力，但严格保持原意，不要虚构数据：',
    quantify:
      '请将下列简历描述改写为量化成就：补充合理的规模、比例、效果类数据（如有不合理之处请用方括号[待确认]标记），让 HR 一眼看到价值：',
    star:
      '请将下列简历描述改写为 STAR 结构：清晰体现情境（S）、任务（T）、行动（A）、结果（R），合并为一段简洁有力的成就句（单句即可）：',
    shorten: '请将下列简历描述压缩为不超过一行的精炼版本，保留最关键的成就：',
    expand: '请将下列简历描述扩写为更丰满的版本，补充具体动作和结果，但不得虚构事实：',
    translate_en: '请将下列中文简历内容翻译成地道的英文简历表达，使用动词开头的 bullet 风格：',
    translate_zh: '请将下列英文简历内容翻译成地道的中文简历表达，符合国内简历习惯：',
  };
  const en: Record<RewriteMode, string> = {
    polish: 'Polish the following resume line to be more professional, concise, and impactful while preserving the original meaning. Do not fabricate:',
    quantify:
      'Rewrite the following resume line into a quantified achievement: add reasonable metrics (scale/ratio/impact). Mark uncertain data with [TBD]:',
    star: 'Rewrite the following resume line using the STAR framework (Situation/Task/Action/Result), merged into a single crisp bullet:',
    shorten: 'Compress the following resume line into a single-line version, keeping only the most impactful point:',
    expand: 'Expand the following resume line with more concrete actions and results, without fabricating facts:',
    translate_en: 'Translate the following Chinese resume content into idiomatic English using verb-led bullet style:',
    translate_zh: 'Translate the following English resume content into idiomatic Chinese suitable for Chinese resumes:',
  };

  const prompts = language === 'en' ? en : zh;
  const ctx: string[] = [];
  if (context?.role) ctx.push(language === 'en' ? `Target role: ${context.role}` : `目标岗位：${context.role}`);
  if (context?.jd) ctx.push(language === 'en' ? `Target JD: ${context.jd.slice(0, 800)}` : `岗位 JD 摘要：${context.jd.slice(0, 800)}`);

  const intro = prompts[mode];
  const contextBlock = ctx.length ? `\n\n${ctx.join('\n')}` : '';
  const tail = language === 'en'
    ? '\n\nReturn ONLY the rewritten content. No explanations, no markdown, no quotes.'
    : '\n\n只返回改写后的内容本身，不要任何解释、不要 Markdown、不要引号。';

  return `${intro}${contextBlock}\n\n原文：${original}${tail}`;
}

/** STAR 打分 */
export function starScorePrompt(achievement: string, language: 'zh' | 'en' = 'zh'): string {
  if (language === 'en') {
    return `Analyze the following resume bullet using STAR (Situation/Task/Action/Result). Score each dimension 0-25 and give suggestions.

Bullet: ${achievement}

Return ONLY valid JSON (no markdown code fence) like:
{"total":80,"situation":20,"task":18,"action":22,"result":20,"suggestions":["..."]}`;
  }
  return `请基于 STAR 法则分析下面这条简历成就：给情境(S)/任务(T)/行动(A)/结果(R) 各打 0-25 分，汇总 total 为 0-100，并给出 1-3 条具体改进建议。

内容：${achievement}

只返回 JSON（不要 markdown 代码块），格式如：
{"total":80,"situation":20,"task":18,"action":22,"result":20,"suggestions":["建议1","建议2"]}`;
}

/** JD 分析 */
export function jdAnalysisPrompt(
  jd: string,
  resumeSummary: string,
  language: 'zh' | 'en' = 'zh',
): string {
  if (language === 'en') {
    return `Compare the candidate's resume highlights with the job description. Extract key skill/tech keywords from JD, mark which ones are covered by the resume.

JD:
${jd}

Resume highlights:
${resumeSummary}

Return ONLY valid JSON (no markdown):
{"matchScore":75,"matchedKeywords":["..."],"missingKeywords":["..."],"overallAdvice":"...","sectionAdvices":[{"section":"workExperience","advice":"..."}]}`;
  }
  return `请对比下面候选人的简历要点与岗位 JD：从 JD 抽取关键技能/技术词，标出简历中已覆盖与缺失的关键词，并给出整体建议和分版块的改写建议。

【JD】
${jd}

【简历要点】
${resumeSummary}

只返回 JSON（不要 markdown 代码块），格式：
{"matchScore":0-100,"matchedKeywords":["词1"],"missingKeywords":["词2"],"overallAdvice":"一段话整体建议","sectionAdvices":[{"section":"workExperience/projects/skills/summary","advice":"具体改法"}]}`;
}

// ========== AI 一键成稿 Prompt ==========

/** 自由表述 → 结构化简历：解析用户粘贴的自我介绍 */
export function parseFreeTextPrompt(text: string, language: 'zh' | 'en' = 'zh'): string {
  if (language === 'en') {
    return `Parse the following free-form self-introduction into a structured resume JSON. Extract ALL information you can find.

User's text:
${text}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "personal": {"name":"","title":"","email":"","phone":"","location":"","website":"","linkedin":"","github":"","summary":""},
  "workExperience": [{"company":"","position":"","startDate":"","endDate":"","current":false,"description":"","achievements":[""]}],
  "education": [{"school":"","degree":"","major":"","startDate":"","endDate":"","gpa":"","description":""}],
  "skills": [{"category":"","items":[""]}],
  "projects": [{"name":"","role":"","startDate":"","endDate":"","description":"","technologies":[],"link":""}],
  "certificates": [{"name":"","issuer":"","date":"","link":""}],
  "languages": [{"name":"","level":""}]
}

Rules:
- Extract as much detail as possible from the text.
- For work experience, split achievements into separate STAR-format bullet points.
- If information is missing, leave the field as empty string or empty array.
- Use reasonable date format like "2020-09" or "2020-09 - 2023-07".
- Do NOT fabricate any information not mentioned in the text.`;
  }
  return `请将下面用户粘贴的自由表述式自我介绍，解析为结构化简历 JSON。尽可能提取所有信息。

用户的原始文本：
${text}

只返回 JSON（不要 markdown 代码块），格式严格如下：
{
  "personal": {"name":"","title":"","email":"","phone":"","location":"","website":"","linkedin":"","github":"","summary":""},
  "workExperience": [{"company":"","position":"","startDate":"","endDate":"","current":false,"description":"","achievements":[""]}],
  "education": [{"school":"","degree":"","major":"","startDate":"","endDate":"","gpa":"","description":""}],
  "skills": [{"category":"","items":[""]}],
  "projects": [{"name":"","role":"","startDate":"","endDate":"","description":"","technologies":[],"link":""}],
  "certificates": [{"name":"","issuer":"","date":"","link":""}],
  "languages": [{"name":"","level":""}]
}

规则：
1. 尽可能从文本中提取所有可用信息
2. 工作经历的每条成就要拆成独立的 STAR 格式要点
3. 缺失的信息留空字符串或空数组，不要编造
4. 日期使用"2020-09"或"2020-09 ~ 2023-07"格式
5. 不要返回任何解释文字，只返回纯 JSON`;
}

/** 简历文件文本 → 结构化数据 */
export function parseResumeTextPrompt(rawText: string, language: 'zh' | 'en' = 'zh'): string {
  if (language === 'en') {
    return `Parse the following resume text (extracted from PDF/DOCX) into structured JSON.

Resume content:
${rawText.slice(0, 8000)}

Return ONLY valid JSON (no markdown):
{
  "personal": {"name":"","title":"","email":"","phone":"","location":"","website":"","linkedin":"","github":"","summary":""},
  "workExperience": [{"company":"","position":"","startDate":"","endDate":"","current":false,"description":"","achievements":[""]}],
  "education": [{"school":"","degree":"","major":"","startDate":"","endDate":"","gpa":"","description":""}],
  "skills": [{"category":"","items":[""]}],
  "projects": [{"name":"","role":"","startDate":"","endDate":"","description":"","technologies":[],"link":""}],
  "certificates": [{"name":"","issuer":"","date":"","link":""}],
  "languages": [{"name":"","level":""}]
}

Rules: Extract all available info. Split achievements into STAR bullets. Leave empty for missing data. No fabrication.`;
  }
  return `请将以下从简历文件（PDF/DOCX）中提取的文本内容解析为结构化简历 JSON。

简历原文内容：
${rawText.slice(0, 8000)}

只返回 JSON（不要 markdown 代码块），格式严格如下：
{
  "personal": {"name":"","title":"","email":"","phone":"","location":"","website":"","linkedin":"","github":"","summary":""},
  "workExperience": [{"company":"","position":"","startDate":"","endDate":"","current":false,"description":"","achievements":[""]}],
  "education": [{"school":"","degree":"","major":"","startDate":"","endDate":"","gpa":"","description":""}],
  "skills": [{"category":"","items":[""]}],
  "projects": [{"name":"","role":"","startDate":"","endDate":"","description":"","technologies":[],"link":""}],
  "certificates": [{"name":"","issuer":"","date":"","link":""}],
  "languages": [{"name":"","level":""}]
}

规则：尽量提取所有信息，工作成就拆为 STAR 要点，缺失信息留空，不要编造。只返回 JSON。`;
}

/** 问答式引导：根据当前阶段生成下一个问题 */
export function guidanceChatPrompt(
  conversationHistory: Array<{ role: string; content: string }>,
  currentPhase: GuidancePhase,
  collectedInfo: Record<string, any>,
  language: 'zh' | 'en' = 'zh',
): string {
  const phaseMap: Record<GuidancePhase, string> = {
    idle: '',
    greeting: '用户刚开始，需要友好地打招呼并询问基本信息（姓名、目标职位）',
    basic_info: '正在收集基本联系方式信息',
    work_experience: '正在收集工作经历',
    education: '正在收集教育背景',
    skills: '正在收集技能信息',
    projects: '正在收集项目经历',
    review: '所有信息已收集完毕，进行总结回顾',
    done: '',
  };

  if (language === 'en') {
    return `You are a friendly resume writing assistant helping someone build their resume through conversation.

Current phase: ${currentPhase} (${phaseMap[currentPhase] || ''})
Information collected so far:
${JSON.stringify(collectedInfo, null, 2)}

Conversation history:
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}

Based on the current phase and what info is already collected, ask the NEXT most relevant question to fill in the resume.
- Be conversational and natural, like a real career coach
- Ask one focused question at a time
- If the user gave new info, acknowledge it briefly and ask about the next missing piece
- When a section seems complete, suggest moving to the next section
- Keep responses concise (2-4 sentences max)
- End your response with [PHASE:<phase>] where <phase> is one of: greeting, basic_info, work_experience, education, skills, projects, review, done`;
  }

  return `你是一位友好的简历写作助手，通过对话帮助用户逐步完善简历。

当前阶段：${currentPhase}（${phaseMap[currentPhase] || ''}）
已收集的信息：
${JSON.stringify(collectedInfo, null, 2)}

对话历史：
${conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}

根据当前阶段和已收集的信息，提出下一个最相关的问题来补充简历。
- 像真正的职业顾问一样自然、亲切地聊天
- 每次只问一个重点问题
- 如果用户提供了新信息，简短确认后继续问下一个缺失的信息
- 当某个板块看起来完整了，建议进入下一个板块
- 保持回复简洁（2-4 句话）
- 回复末尾用 [PHASE:<phase>] 标记下一步骤的阶段名（greeting/basic_info/work_experience/education/skills/projects/review/done）`;
}

/** 问答式引导：从用户回答中提取结构化增量信息 */
export function guidanceExtractPrompt(userAnswer: string, currentPhase: GuidancePhase, language: 'zh' | 'en' = 'zh'): string {
  if (language === 'en') {
    return `Extract structured resume information from the user's answer below. Current phase: ${currentPhase}.

User's answer: ${userAnswer}

Return ONLY JSON with only the fields relevant to this phase. Leave others empty:
{"personal":{},"workExperience":[],"education":[],"skills":[],"projects":[],"certificates":[],"languages":[]}

For work_experience phase, extract company, position, dates, description, achievements.
For skills phase, extract category and skill items.
Be precise - only extract what was actually mentioned.`;
  }
  return `从用户的回答中提取当前阶段相关的结构化简历信息。当前阶段：${currentPhase}。

用户回答：${userAnswer}

只返回 JSON（不要 markdown），只包含与当前阶段相关的字段：
{"personal":{},"workExperience":[],"education":[],"skills":[],"projects":[],"certificates":[],"languages":[]}

精确提取，只提取明确提到的信息，不要编造。`;
}

/** STAR 法则一键改进：批量改进所有工作成就 */
export function starImproveAllPrompt(achievements: string[], language: 'zh' | 'en' = 'zh'): string {
  const items = achievements.map((a, i) => `${i + 1}. ${a}`).join('\n');
  if (language === 'en') {
    return `Improve the following resume achievement bullets using STAR framework (Situation / Task / Action / Result).

Achievements:
${items}

Return ONLY JSON array (no markdown):
[
  {"original":"...","improved":"STAR-improved version","missingAspect":"S|T|A|R|none","suggestion":"brief tip"}
]

For each achievement:
- Rewrite it to clearly show Situation, Task, Action, and Result
- Identify which aspect(s) were weak or missing originally
- Give a concise improvement suggestion`;
  }
  return `请用 STAR 法则（情境 S / 任务 T / 行动 A / 结果 R）改进以下工作成就列表：

成就列表：
${items}

只返回 JSON 数组（不要 markdown 代码块）：
[
  {"original":"原文","improved":"改进后的版本","missingAspect":"S|T|A|R|none","suggestion":"简要改进提示"}
]

对每条成就：
- 改写以清晰体现 STAR 四要素
- 标出原文中哪个方面薄弱或缺失
- 给出简洁的改进建议`;
}
