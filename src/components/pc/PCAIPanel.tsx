import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Send,
  Plus,
  ChevronDown,
  Sparkles,
  PencilLine,
  ClipboardCheck,
  RefreshCw,
  Settings2,
  Key,
  AlertCircle,
  X,
  Quote,
} from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { useResumeStore } from '../../store/resumeStore';
import { chatStream } from '../../services/ai';
import { getSystemPrompt } from '../../services/ai/prompts';
import type { ChatMessage } from '../../services/ai/types';
import type { ResumeData } from '../../types/resume';
import { SelectionBus } from '../ai/SelectionToolbar';

/** 卡通吉祥物头像（SVG） */
const Mascot: React.FC = () => (
  <div className="relative">
    <div
      className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
      style={{
        background:
          'radial-gradient(circle at 35% 30%, #9FE8B8 0%, #34D399 55%, #009B73 100%)',
      }}
    >
      <svg width="56" height="50" viewBox="0 0 56 50" xmlns="http://www.w3.org/2000/svg">
        {/* 眼睛（眯眯） */}
        <path
          d="M14 22 Q 18 18 22 22"
          stroke="#222"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M34 22 Q 38 18 42 22"
          stroke="#222"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* 嘴巴（波浪笑） */}
        <path
          d="M20 32 Q 23 28 26 32 Q 28 34 30 32 Q 33 28 36 32"
          stroke="#222"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
    {/* 双手举起（白色小椭圆） */}
    <div
      className="absolute -left-2 -top-1 w-4 h-5 bg-white rounded-full rotate-[-30deg]"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
    />
    <div
      className="absolute -right-2 -top-1 w-4 h-5 bg-white rounded-full rotate-[30deg]"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
    />
  </div>
);

/** 快捷操作气泡 */
const QuickBubble: React.FC<{
  label: string;
  onClick: () => void;
}> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] text-gray-700 bg-white border border-gray-200 hover:border-zp-primary hover:text-zp-primary transition-all"
  >
    {label}
  </button>
);

/** 底部工具 chip */
const ToolChip: React.FC<{
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}> = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[11px] text-gray-600 hover:border-zp-primary hover:text-zp-primary"
  >
    {icon}
    {label}
  </button>
);

/** 构造给 AI 的简历背景文本，供其“读懂用户简历” */
function buildResumeSummary(data: ResumeData): string {
  const p = data.personal || ({} as any);
  const lines: string[] = [];
  if (p.name) lines.push(`姓名：${p.name}`);
  if (p.title) lines.push(`目标岗位：${p.title}`);
  if (p.summary) lines.push(`个人简介：${p.summary}`);

  if (data.education?.length) {
    lines.push('\n【教育经历】');
    data.education.slice(0, 3).forEach((e) => {
      lines.push(`- ${e.school} ${e.degree || ''} ${e.major || ''} (${e.startDate || ''}~${e.endDate || ''})`);
    });
  }

  if (data.workExperience?.length) {
    lines.push('\n【工作经历】');
    data.workExperience.slice(0, 5).forEach((w) => {
      lines.push(`- ${w.company} / ${w.position} (${w.startDate || ''}~${w.endDate || ''})`);
      if (w.description) lines.push(`  ${w.description}`);
      (w.achievements || []).slice(0, 4).forEach((a) => lines.push(`  • ${a}`));
    });
  }

  if (data.projects?.length) {
    lines.push('\n【项目经历】');
    data.projects.slice(0, 4).forEach((pj) => {
      lines.push(`- ${pj.name} / ${pj.role || ''}`);
      if (pj.description) lines.push(`  ${pj.description}`);
    });
  }

  if (data.skills?.length) {
    lines.push('\n【技能】');
    data.skills.slice(0, 6).forEach((s) => {
      lines.push(`- ${s.category}: ${(s.items || []).join('、')}`);
    });
  }

  return lines.join('\n').slice(0, 4000);
}

type Msg = { role: 'ai' | 'user'; content: string };

export const PCAIPanel: React.FC = () => {
  const { config, isReady, setSettingsOpen } = useAIStore();
  const { data } = useResumeStore();
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  /** 用户从画布引用过来的文本（会作为 prompt 上下文） */
  const [quotedText, setQuotedText] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const resumeSummary = useMemo(() => buildResumeSummary(data), [data]);
  const ready = isReady();

  /**
   * 通用对话：
   * - 使用通用的 system prompt，并把用户当前简历作为背景注入
   * - 整个历史交给 LLM，支持多轮对话
   * - 流式输出，逐字展示
   */
  const handleSend = async (text?: string, opts?: { quoted?: string; keepQuote?: boolean }) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');

    // 引用文本优先度：显式传入 > state 中的 quotedText
    const quote = opts?.quoted ?? quotedText;

    // 拼接展示用的用户消息（带引用）
    const displayContent = quote
      ? `「引用」${quote}\n\n${content}`
      : content;
    const history: Msg[] = [...msgs, { role: 'user', content: displayContent }];
    setMsgs(history);
    if (!opts?.keepQuote) setQuotedText('');

    if (!ready) {
      setMsgs((p) => [
        ...p,
        {
          role: 'ai',
          content: '还没配置 AI 服务，请先点击右上角「配置 API Key」完成配置。',
        },
      ]);
      setTimeout(() => setSettingsOpen(true), 300);
      return;
    }

    // 构造 system + 简历背景 + 历史消息
    const systemPrompt =
      getSystemPrompt(config.language) +
      '\n\n当前在用户的简历编辑器里对话，下面是用户的简历摘要，请结合它回答用户的问题。\n' +
      '输出规则：\n' +
      '- 直接用中文回答，简洁、结构化，必要时用 Markdown / bullet list。\n' +
      '- 不要固定输出 JSON 格式，除非用户明确要求。\n' +
      '- 如果用户要求润色/改写简历内容，直接给出改写后的文本。\n' +
      '- 如果用户要求诊断简历，请分点列出优点、问题、以及改进建议。\n' +
      '- 如果消息里包含「引用原文」块，表示用户此刻正在针对这段原文发问，请优先围绕这段原文回答。\n\n' +
      `【用户简历摘要】\n${resumeSummary || '（用户尚未填写简历）'}`;

    // 最后一条 user 消息转成 LLM 可理解的结构化内容（含引用块）
    const llmUserContent = quote
      ? `【引用原文】\n${quote}\n\n【我的问题】\n${content}`
      : content;

    const historyForLLM: ChatMessage[] = history
      .slice(0, -1)
      .map<ChatMessage>((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...historyForLLM,
      { role: 'user', content: llmUserContent },
    ];

    // 占位一个空的 AI 消息，流式追加
    setLoading(true);
    setMsgs((p) => [...p, { role: 'ai', content: '' }]);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    let acc = '';
    chatStream(
      config,
      messages,
      {
        signal: ac.signal,
        onDelta: (delta) => {
          acc += delta;
          setMsgs((p) => {
            const next = [...p];
            // 更新最后一条 AI 消息
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].role === 'ai') {
                next[i] = { role: 'ai', content: acc };
                break;
              }
            }
            return next;
          });
          // 追加时自动滚到底
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        },
        onDone: (full) => {
          setLoading(false);
          const finalText = (full || acc).trim() || '（AI 未返回内容）';
          setMsgs((p) => {
            const next = [...p];
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].role === 'ai') {
                next[i] = { role: 'ai', content: finalText };
                break;
              }
            }
            return next;
          });
        },
        onError: (err) => {
          setLoading(false);
          setMsgs((p) => {
            const next = [...p];
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].role === 'ai') {
                next[i] = {
                  role: 'ai',
                  content: `出错了：${err?.message || '未知错误'}\n\n请检查右上角 AI 配置是否正确。`,
                };
                break;
              }
            }
            return next;
          });
        },
      },
    );
  };

  // 监听画布选区工具栏发来的事件：引用 / AI 润色 / AI 生成
  useEffect(() => {
    const off = SelectionBus.on((p) => {
      if (!p.text) return;
      if (p.type === 'quote') {
        setQuotedText(p.text);
        // 滑到底并聚焦到输入框
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        }, 50);
      } else if (p.type === 'ai-polish') {
        void handleSend('请帮我润色下面这段文字，保持原意但更专业、有力，直接给出改写后的内容即可。', { quoted: p.text });
      } else if (p.type === 'ai-generate') {
        void handleSend('请基于下面这段内容，给我扩充生成更丰富的简历描述，突出量化成果。', { quoted: p.text });
      }
    });
    return () => {
      off;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgs, loading, ready, quotedText]);

  return (
    <aside className="relative h-full w-full bg-[#FAFBFA] border-l border-gray-100 flex flex-col">
      {/* 顶部工具栏：AI 设置（配置 Key）+ 清空对话 */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 flex-shrink-0">
        <span className="text-[12px] font-medium text-gray-500">AI 简历助手</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              ready
                ? 'bg-emerald-50 text-zp-primary border border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
            title={ready ? '已配置，点击修改' : '尚未配置 AI 服务，点击填入 API Key'}
          >
            <Key size={11} />
            {ready ? 'AI 已就绪' : '配置 API Key'}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-zp-primary hover:bg-gray-100"
            title="AI 设置"
          >
            <Settings2 size={13} />
          </button>
          <button
            onClick={() => setMsgs([])}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-zp-primary hover:bg-gray-100"
            title="清空对话"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* 顶部吉祥物 + 欢迎语 */}
      <div className="px-6 pt-4 pb-3 flex-shrink-0">
        <div className="flex justify-start">
          <Mascot />
        </div>
        <p className="mt-4 text-[14px] text-gray-700 leading-relaxed">
          你好！我是你的AI简历助手，能通过对话帮你打造受HR青睐的专业简历。
        </p>
        <div className="mt-3 text-[13px] text-gray-600 leading-relaxed">
          <p className="font-medium text-gray-800">我能为你：</p>
          <ul className="mt-1 space-y-0.5 pl-4 list-disc marker:text-zp-primary">
            <li>
              <span className="font-medium text-gray-800">润色 / 诊断</span>整份简历内容。
            </li>
            <li>
              <span className="font-medium text-gray-800">精准调整</span>简历的任何部分。
            </li>
          </ul>
          <p className="mt-2">
            <span className="font-medium text-gray-800">按你的指令定制修改</span>，尝试和我对话吧！
            <span className="ml-1">📝✨</span>
          </p>
        </div>

        {/* 未配置时的醒目提示条 */}
        {!ready && (
          <button
            onClick={() => setSettingsOpen(true)}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-800 hover:bg-amber-100 transition-colors text-left"
          >
            <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
            <span className="flex-1">尚未配置 AI 服务，点击此处填写 API Key</span>
            <Key size={12} className="text-amber-600 flex-shrink-0" />
          </button>
        )}
      </div>

      {/* 对话消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 space-y-3 scrollbar-thin">
        {msgs.length === 0 && (
          <div className="flex flex-col items-start gap-2">
            <QuickBubble
              label="帮我AI润色简历"
              onClick={() => handleSend('请帮我润色当前简历')}
            />
            <QuickBubble
              label="帮我AI诊断简历"
              onClick={() => handleSend('请帮我诊断当前简历的问题和不足')}
            />
          </div>
        )}

        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-zp-primary text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-400 text-[12px] shadow-sm">
              AI 正在思考…
            </div>
          </div>
        )}
      </div>

      {/* 底部输入组 */}
      <div className="flex-shrink-0 px-4 pb-3 pt-2 bg-[#FAFBFA]">
        {/* 3 个工具 chip */}
        <div className="flex items-center gap-2 mb-2">
          <ToolChip
            label="AI润色"
            icon={<PencilLine size={11} className="text-zp-primary" />}
            onClick={() => handleSend('请帮我润色当前简历，让表达更专业')}
          />
          <ToolChip
            label="AI诊断"
            icon={<ClipboardCheck size={11} className="text-zp-primary" />}
            onClick={() => handleSend('请帮我诊断当前简历的问题和不足')}
          />
          <ToolChip
            label="关键词匹配"
            icon={<Sparkles size={11} className="text-zp-primary" />}
            onClick={() => handleSend('请列出我的简历最能吸引HR的关键词')}
          />
        </div>

        {/* 已选文本 chip（画布引用过来的文本）*/}
        {quotedText && (
          <div className="mb-2 flex items-center gap-1.5 max-w-full">
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EDF3EE] border border-emerald-200 text-[11px] text-emerald-700 max-w-full"
              title={quotedText}
            >
              <Quote size={10} />
              <span className="font-medium">A</span>
              <span>已选文本</span>
              <span className="text-emerald-500/70 truncate max-w-[160px] ml-1">{quotedText}</span>
              <button
                onClick={() => setQuotedText('')}
                className="ml-1 w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-emerald-200/60 text-emerald-600"
                title="取消引用"
              >
                <X size={9} />
              </button>
            </span>
          </div>
        )}

        {/* 输入框 */}
        <div className="bg-white border border-gray-200 rounded-xl p-2 focus-within:border-zp-primary">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={ready ? (quotedText ? '请输入你的想法' : '可以继续问我问题哦') : '请先在上方配置 API Key'}
            rows={1}
            className="w-full px-2 py-1 text-[13px] resize-none focus:outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-0.5 px-2 py-0.5 rounded-md hover:bg-gray-50 text-[11px] text-gray-500">
                简历各模块
                <ChevronDown size={10} />
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-50"
                title="添加附件"
              >
                <Plus size={13} />
              </button>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-full bg-zp-primary text-white flex items-center justify-center hover:bg-[#00B589] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="发送"
            >
              <Send size={12} />
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-gray-400">
          内容由AI生成，请仔细甄别
        </p>
      </div>
    </aside>
  );
};

export default PCAIPanel;
