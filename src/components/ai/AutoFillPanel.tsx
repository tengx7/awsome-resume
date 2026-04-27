import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X,
  Wand2,
  Upload,
  MessageCircle,
  Star,
  Sparkles,
  Send,
  Loader2,
  Check,
  ChevronRight,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Rocket,
  Award,
  Languages,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useResumeStore } from '../../store/resumeStore';
import { useAIStore } from '../../store/aiStore';
import {
  autoFillFromText,
  autoFillFromResumeText,
  guidanceGetNextQuestion,
  guidanceExtractInfo,
  starImproveAll,
  scoreStar,
} from '../../services/ai';
import type { ParsedResumeData, ChatMessageItem, GuidancePhase, StarImprovement } from '../../services/ai/types';

type AutoFillTab = 'freeform' | 'file' | 'guidance' | 'star';

const TABS: { key: AutoFillTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'freeform', label: '智能解析', icon: <Wand2 size={16} />, desc: '粘贴自我介绍，AI 自动填充' },
  { key: 'file', label: '导入简历', icon: <Upload size={16} />, desc: '上传 PDF/DOCX 简历文件' },
  { key: 'guidance', label: '引导填写', icon: <MessageCircle size={16} />, desc: 'AI 聊天式逐项提问' },
  { key: 'star', label: 'STAR 改造', icon: <Star size={16} />, desc: '一键检查并改进成就点' },
];

const PHASE_LABELS: Record<GuidancePhase, string> = {
  idle: '',
  greeting: '开始对话',
  basic_info: '基本信息',
  work_experience: '工作经历',
  education: '教育背景',
  skills: '技能特长',
  projects: '项目经历',
  review: '总结回顾',
  done: '完成',
};

/** 生成简单 ID */
const uid = () => Math.random().toString(36).substr(2, 9);

export const AutoFillPanel: React.FC = () => {
  const { config } = useAIStore();
  const { autoFillOpen, setAutoFillOpen } = useAIStore();
  const store = useResumeStore();

  const [activeTab, setActiveTab] = useState<AutoFillTab>('freeform');
  const [loading, setLoading] = useState(false);

  if (!autoFillOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAutoFillOpen(false)} />

      {/* Panel */}
      <div className="relative w-[90%] max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">AI 一键成稿</h2>
              <p className="text-xs text-gray-400">60 秒生成专业简历</p>
            </div>
          </div>
          <button onClick={() => setAutoFillOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-3 gap-1.5 border-b border-gray-100 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'freeform' && <FreeFormTab onLoading={setLoading} loading={loading} />}
          {activeTab === 'file' && <FileUploadTab onLoading={setLoading} loading={loading} />}
          {activeTab === 'guidance' && <GuidanceTab onLoading={setLoading} loading={loading} />}
          {activeTab === 'star' && <StarImproveTab onLoading={setLoading} loading={loading} />}
        </div>
      </div>
    </div>
  );
};

// ========== Tab 1: 自由表述智能解析 ==========
function FreeFormTab({ onLoading, loading }: { onLoading: (v: boolean) => void; loading: boolean }) {
  const { config } = useAIStore();
  const store = useResumeStore();
  const [text, setText] = useState('');
  const [result, setResult] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (!text.trim()) return;
    onLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await autoFillFromText(config, text);
      if (!data) throw new Error('AI 返回数据格式异常，请重试');
      setResult(data);
    } catch (e: any) {
      setError(e.message || '解析失败，请检查 AI 配置后重试');
    } finally {
      onLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    applyParsedData(store, result);
    // 关闭面板
    useAIStore.getState().setAutoFillOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-700 leading-relaxed">
          粘贴你的<strong>自我介绍</strong>或<strong>流水账</strong>（如"我是小王，北京大学计算机系 2020 届毕业生..."），
          AI 会自动解析并填充到所有模块。
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`示例：\n我叫张三，2020 年从北京大学计算机科学与技术专业毕业。毕业后加入了字节跳动做前端开发工程师，主要负责抖音 Web 端的性能优化工作，把首屏加载时间从 3s 优化到了 1.2s。2023 年跳槽到阿里淘宝技术部...`}
        className="w-full h-48 p-4 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 placeholder:text-gray-300"
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {!result ? (
        <button
          onClick={handleParse}
          disabled={!text.trim() || loading}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-medium rounded-xl hover:from-violet-600 hover:to-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          {loading ? 'AI 解析中...' : '一键解析'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check size={15} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">解析完成！以下是提取的信息：</span>
            </div>
            <ParsedResultPreview data={result} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={15} /> 采纳并填充到简历
            </button>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
            >
              重新输入
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== Tab 2: 文件导入 ==========
function FileUploadTab({ onLoading, loading }: { onLoading: (v: boolean) => void; loading: boolean }) {
  const { config } = useAIStore();
  const store = useResumeStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [extractedText, setExtractedText] = useState('');
  const [result, setResult] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  /** 从文件中提取纯文本 */
  const extractFromFile = async (file: File): Promise<string> => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.json')) {
      // JSON 文件直接读取
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        // 如果是本应用的 JSON 格式，直接导入
        if (data.personal || data.workExperience || data.education) {
          return JSON.stringify(data, null, 2);
        }
        return text;
      } catch {
        return text;
      }
    }
    if (name.endsWith('.txt') || name.endsWith('.md')) {
      return await file.text();
    }
    if (name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx')) {
      // PDF/DOCX：读取为文本（浏览器端简化处理）
      return await readFileAsText(file);
    }
    throw new Error('不支持的文件格式，请上传 PDF、DOCX、TXT 或 JSON 文件');
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setResult(null);
    onLoading(true);
    try {
      const text = await extractFromFile(file);
      setExtractedText(text);
    } catch (err: any) {
      setError(err.message || '文件处理失败');
    } finally {
      onLoading(false);
    }
    e.target.value = '';
  };

  const handleParse = async () => {
    if (!extractedText.trim()) return;
    onLoading(true);
    setError('');
    try {
      const data = await autoFillFromResumeText(config, extractedText);
      if (!data) throw new Error('AI 返回数据格式异常');
      setResult(data);
    } catch (e: any) {
      setError(e.message || '解析失败，请重试');
    } finally {
      onLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    applyParsedData(store, result);
    useAIStore.getState().setAutoFillOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <p className="text-sm text-amber-700 leading-relaxed">
          上传已有的 PDF / DOCX / TXT / JSON 格式简历文件，AI 将解析内容并按新模板重新组织。
        </p>
      </div>

      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.md,.json" onChange={handleFileChange} className="hidden" />

      {!extractedText ? (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="w-full py-10 border-2 border-dashed border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/30 transition-all flex flex-col items-center gap-2"
        >
          {loading ? <Loader2 size={28} className="animate-spin text-violet-500" /> : <Upload size={28} className="text-gray-400" />}
          <span className="text-sm text-gray-500">{loading ? '读取文件中...' : '点击或拖拽上传简历文件'}</span>
          <span className="text-xs text-gray-400">支持 PDF、DOCX、TXT、JSON</span>
        </button>
      ) : !result ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <FileText size={15} className="text-blue-500" />
            <span className="truncate">{fileName}</span>
            <span className="text-xs text-gray-400 ml-auto">已提取文本 ({extractedText.length} 字)</span>
          </div>

          <div className="max-h-32 overflow-auto bg-gray-50 rounded-lg p-3 text-xs text-gray-600 whitespace-pre-wrap">
            {extractedText.slice(0, 1500)}{extractedText.length > 1500 ? '\n...' : ''}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleParse}
              disabled={loading}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-medium rounded-xl hover:from-violet-600 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {loading ? 'AI 解析中...' : 'AI 智能解析'}
            </button>
            <button
              onClick={() => { setExtractedText(''); setFileName(''); }}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
            >
              重新选择
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <ParsedResultPreview data={result} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleApply} className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <Check size={15} /> 采纳并填充到简历
            </button>
            <button onClick={() => { setResult(null); setExtractedText(''); }} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
              重新上传
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

// ========== Tab 3: 问答式引导 ==========
function GuidanceTab({ onLoading, loading }: { onLoading: (v: boolean) => void; loading: boolean }) {
  const { config } = useAIStore();
  const store = useResumeStore();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<GuidancePhase>('greeting');
  const [collectedInfo, setCollectedInfo] = useState<Record<string, any>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    const welcomeMsg: ChatMessageItem = {
      id: uid(),
      role: 'assistant',
      content: `你好！我是你的简历写作助手 👋 我会通过聊天的方式帮你一步步完善简历。\n\n先告诉我：**你叫什么名字？想应聘什么职位？**`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMsg]);
    setPhase('greeting');
    setCollectedInfo({});
  };

  useEffect(() => {
    startChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessageItem = {
      id: uid(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    onLoading(true);

    abortRef.current = new AbortController();

    try {
      // 1. 提取用户回答中的结构化信息
      const extracted = await guidanceExtractInfo(config, input.trim(), phase);
      if (extracted) {
        setCollectedInfo((prev) => mergeCollectedInfo(prev, extracted));
      }

      // 2. 构建 AI 对话历史
      const history = newMessages.map((m) => ({ role: m.role, content: m.content }));

      // 3. 获取 AI 下一个问题
      const reply = await guidanceGetNextQuestion(config, history, phase, collectedInfo);

      // 从回复中提取阶段标记
      const phaseMatch = reply.match(/\[PHASE:(\w+)\]/i);
      const nextPhase = phaseMatch ? (phaseMatch[1] as GuidancePhase) : phase;

      const cleanReply = reply.replace(/\[PHASE:\w+\]/i, '').trim();

      const aiMsg: ChatMessageItem = {
        id: uid(),
        role: 'assistant',
        content: cleanReply,
        timestamp: Date.now(),
      };
    setMessages((prev) => [...prev, aiMsg]);
    setPhase(nextPhase);

    // 如果进入 review 阶段，自动应用收集到的信息
    if (nextPhase === 'review' && Object.keys(collectedInfo).length > 0) {
      const reviewMsg: ChatMessageItem = {
        id: uid(),
        role: 'assistant',
        content: `\n\n---\n✅ 太好了！我已经帮你整理好了所有信息，点击下方按钮即可一键填充到简历编辑器中。`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, reviewMsg]);
    }
  } catch (e: any) {
    const errMsg: ChatMessageItem = {
      id: uid(),
      role: 'assistant',
      content: `抱歉出错了：${e.message || '请检查 AI 配置后重试'}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, errMsg]);
  } finally {
    onLoading(false);
  }
};

  const handleApplyCollected = () => {
    applyPartialData(store, collectedInfo);
    useAIStore.getState().setAutoFillOpen(false);
  };

  const handleReset = () => {
    setMessages([]);
    setPhase('greeting');
    setCollectedInfo({});
    setTimeout(() => startChat(), 100);
  };

  const hasCollectableData = Object.keys(collectedInfo).length > 0 &&
    (collectedInfo.personal?.name ||
     collectedInfo.workExperience?.length > 0 ||
     collectedInfo.education?.length > 0 ||
     collectedInfo.skills?.length > 0);

  return (
    <div className="flex flex-col h-[45vh]">
      {/* Phase indicator */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        {(['greeting', 'basic_info', 'work_experience', 'education', 'skills', 'projects', 'review'] as GuidancePhase[]).map((p, i) => (
          <React.Fragment key={p}>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
              p === phase ? 'bg-violet-100 text-violet-700' :
              ['greeting', 'basic_info', 'work_experience', 'education', 'skills', 'projects'].indexOf(p) < ['greeting', 'basic_info', 'work_experience', 'education', 'skills', 'projects'].indexOf(phase)
                ? 'bg-green-50 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {['greeting', 'basic_info', 'work_experience', 'education', 'skills', 'projects'].indexOf(p) < ['greeting', 'basic_info', 'work_experience', 'education', 'skills', 'projects'].indexOf(phase) ? (
                <Check size={10} />
              ) : (
                <span>{i + 1}</span>
              )}
              {PHASE_LABELS[p]}
            </div>
            {i < 6 && <ChevronRight size={12} className="text-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-violet-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-violet-500" />
              <span className="text-xs text-gray-500">思考中...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input + Actions */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入你的回答..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
            <Trash2 size={12} /> 重新开始
          </button>
          {hasCollectableData && (
            <button
              onClick={handleApplyCollected}
              className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <Check size={12} /> 填充到简历
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== Tab 4: STAR 改造 ==========
function StarImproveTab({ onLoading, loading }: { onLoading: (v: boolean) => void; loading: boolean }) {
  const { config } = useAIStore();
  const { data, updateWorkExperience } = useResumeStore();
  const [results, setResults] = useState<StarImprovement[]>([]);
  const [selectedWorkIdx, setSelectedWorkIdx] = useState<number>(0);
  const [error, setError] = useState('');

  const workExperiences = data.workExperience;
  const currentWork = workExperiences[selectedWorkIdx];
  const currentAchievements = currentWork?.achievements || [];

  const handleImprove = async () => {
    if (currentAchievements.length === 0) return;
    onLoading(true);
    setError('');
    setResults([]);
    try {
      const improved = await starImproveAll(config, currentAchievements);
      setResults(improved);
      // 同时对每条进行打分
      const scoredResults: StarImprovement[] = [];
      for (let i = 0; i < improved.length; i++) {
        try {
          const score = await scoreStar(config, improved[i].improved || currentAchievements[i]);
          scoredResults.push({ ...improved[i], score: score! });
        } catch {
          scoredResults.push(improved[i]);
        }
      }
      setResults(scoredResults);
    } catch (e: any) {
      setError(e.message || 'STAR 改进失败，请重试');
    } finally {
      onLoading(false);
    }
  };

  const handleApplySingle = (idx: number) => {
    const item = results[idx];
    if (!item?.improved) return;
    const newAchievements = [...currentAchievements];
    newAchievements[idx] = item.improved;
    updateWorkExperience(currentWork.id, { achievements: newAchievements });
    // 更新 results 标记为已采纳
    setResults((prev) => prev.map((r, i) => i === idx ? r : r));
  };

  const handleApplyAll = () => {
    const newAchievements = results.map((r) => r.improved || currentAchievements[results.indexOf(r)] || '');
    updateWorkExperience(currentWork.id, { achievements: newAchievements });
  };

  if (workExperiences.length === 0) {
    return (
      <div className="text-center py-8">
        <Star size={36} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">暂无工作经历</p>
        <p className="text-xs text-gray-400 mt-1">请先在编辑器中添加工作经历</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <p className="text-sm text-purple-700 leading-relaxed">
          STAR 法则是写好工作成就的黄金标准。<strong>S</strong>ituation 情境 / <strong>T</strong>ask 任务 /
          <strong>A</strong>ction 行动 / <strong>R</strong>esult 结果。
          选择一份工作，AI 将逐条检查并改进你的成就描述。
        </p>
      </div>

      {/* Work selector */}
      <div className="flex gap-2 flex-wrap">
        {workExperiences.map((work, idx) => (
          <button
            key={work.id}
            onClick={() => { setSelectedWorkIdx(idx); setResults([]); }}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              selectedWorkIdx === idx
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {work.company || `工作 ${idx + 1}`}
          </button>
        ))}
      </div>

      {currentAchievements.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">该工作经历暂无成就条目</p>
        </div>
      ) : !results.length ? (
        <div className="space-y-3">
          {/* Current achievements preview */}
          <div className="space-y-2">
            {currentAchievements.map((ach, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-400 mt-0.5 w-5">{i + 1}.</span>
                <span className="text-sm text-gray-700 flex-1">{ach}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleImprove}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
            {loading ? 'STAR 分析中...' : '一键 STAR 改造'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Results */}
          <div className="space-y-3">
            {results.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Score bar */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500">#{i + 1}</span>
                  <div className="flex-1 flex items-center gap-1.5">
                    {(['situation', 'task', 'action', 'result'] as const).map((dim) => {
                      const val = item.score?.[dim] || 0;
                      const color = val >= 20 ? 'bg-green-400' : val >= 12 ? 'bg-amber-400' : 'bg-red-300';
                      return (
                        <div key={dim} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${val * 4}%` }} />
                          </div>
                          <span className="text-[9px] text-gray-400 uppercase">{dim[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <span className={`text-xs font-bold ${item.score && item.score.total >= 80 ? 'text-green-600' : item.score && item.score.total >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                    {item.score?.total || 0}分
                  </span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="text-xs text-gray-400">原文：</div>
                  <div className="text-sm text-gray-600 line-through">{item.original}</div>
                  <div className="text-xs text-green-600 mt-2">改进后：</div>
                  <div className="text-sm text-gray-800 font-medium">{item.improved}</div>
                  {item.score?.suggestions?.[0] && (
                    <div className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mt-1">
                      💡 {item.score.suggestions[0]}
                    </div>
                  )}
                  <button
                    onClick={() => handleApplySingle(i)}
                    className="mt-2 px-3 py-1 bg-violet-50 text-violet-600 text-xs font-medium rounded-lg hover:bg-violet-100 transition-colors"
                  >
                    采纳这条改进
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleApplyAll}
            className="w-full py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check size={15} /> 一键采纳全部改进
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

// ========== 工具组件 ==========

/** 解析结果预览 */
function ParsedResultPreview({ data }: { data: ParsedResumeData }) {
  const sections: { key: string; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'personal', label: '基本信息', icon: <User size={13} />, count: Object.values(data.personal).filter(Boolean).length },
    { key: 'workExperience', label: '工作经历', icon: <Briefcase size={13} />, count: data.workExperience.length },
    { key: 'education', label: '教育背景', icon: <GraduationCap size={13} />, count: data.education.length },
    { key: 'skills', label: '技能特长', icon: <Code size={13} />, count: data.skills.reduce((s, c) => s + (c.items?.length || 0), 0) },
    { key: 'projects', label: '项目经历', icon: <Rocket size={13} />, count: data.projects.length },
    { key: 'certificates', label: '证书荣誉', icon: <Award size={13} />, count: data.certificates.length },
    { key: 'languages', label: '语言能力', icon: <Languages size={13} />, count: data.languages.length },
  ];

  return (
    <div className="space-y-2">
      {sections.filter(s => s.count > 0).map((sec) => (
        <div key={sec.key} className="flex items-center gap-2 text-xs">
          <span className="text-green-600">{sec.icon}</span>
          <span className="font-medium text-gray-700">{sec.label}</span>
          <span className="text-green-600 font-bold">{sec.count}</span>
          {sec.key === 'personal' && data.personal.name && (
            <span className="text-gray-400 truncate ml-1">{data.personal.name}{data.personal.title ? ` · ${data.personal.title}` : ''}</span>
          )}
          {sec.key === 'workExperience' && data.workExperience[0]?.company && (
            <span className="text-gray-400 truncate ml-1">{data.workExperience.map(w => w.company).filter(Boolean).join('、')}</span>
          )}
          {sec.key === 'education' && data.education[0]?.school && (
            <span className="text-gray-400 truncate ml-1">{data.education.map(e => e.school).filter(Boolean).join('、')}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** 将 AI 解析的数据应用到 store */
function applyParsedData(_store: ReturnType<typeof useResumeStore>, data: ParsedResumeData) {
  const store = useResumeStore.getState();
  // Personal info
  const personalUpdates: Record<string, string> = {};
  if (data.personal.name) personalUpdates.name = data.personal.name;
  if (data.personal.title) personalUpdates.title = data.personal.title;
  if (data.personal.email) personalUpdates.email = data.personal.email;
  if (data.personal.phone) personalUpdates.phone = data.personal.phone;
  if (data.personal.location) personalUpdates.location = data.personal.location;
  if (data.personal.website) personalUpdates.website = data.personal.website;
  if (data.personal.linkedin) personalUpdates.linkedin = data.personal.linkedin;
  if (data.personal.github) personalUpdates.github = data.personal.github;
  if (data.personal.summary) personalUpdates.summary = data.personal.summary;
  if (Object.keys(personalUpdates).length > 0) {
    store.updatePersonal(personalUpdates);
  }

  // Clear existing and add parsed data for array fields
  // Work Experience
  if (data.workExperience.length > 0) {
    // Remove existing
    const existingWorkIds = [...store.data.workExperience].map(w => w.id);
    existingWorkIds.forEach(id => store.deleteWorkExperience(id));
    // Add new ones
    data.workExperience.forEach((w) => {
      store.addWorkExperience();
      // Get the newly added item's id (last one)
      const newList = store.data.workExperience;
      const newItem = newList[newList.length - 1];
      if (newItem) {
        store.updateWorkExperience(newItem.id, {
          company: w.company || '',
          position: w.position || '',
          startDate: w.startDate || '',
          endDate: w.endDate || '',
          current: w.current || false,
          description: w.description || '',
          achievements: w.achievements || [],
        });
      }
    });
  }

  // Education
  if (data.education.length > 0) {
    const existingEduIds = [...store.data.education].map(e => e.id);
    existingEduIds.forEach(id => store.deleteEducation(id));
    data.education.forEach((e) => {
      store.addEducation();
      const newList = store.data.education;
      const newItem = newList[newList.length - 1];
      if (newItem) {
        store.updateEducation(newItem.id, {
          school: e.school || '',
          degree: e.degree || '',
          major: e.major || '',
          startDate: e.startDate || '',
          endDate: e.endDate || '',
          gpa: e.gpa || '',
          description: e.description || '',
        });
      }
    });
  }

  // Skills
  if (data.skills.length > 0) {
    const existingSkillIds = [...store.data.skills].map(s => s.id);
    existingSkillIds.forEach(id => store.deleteSkill(id));
    data.skills.forEach((s) => {
      store.addSkill();
      const newList = store.data.skills;
      const newItem = newList[newList.length - 1];
      if (newItem) {
        store.updateSkill(newItem.id, {
          category: s.category || '',
          items: s.items || [],
        });
      }
    });
  }

  // Projects
  if (data.projects.length > 0) {
    const existingProjIds = [...store.data.projects].map(p => p.id);
    existingProjIds.forEach(id => store.deleteProject(id));
    data.projects.forEach((p) => {
      store.addProject();
      const newList = store.data.projects;
      const newItem = newList[newList.length - 1];
      if (newItem) {
        store.updateProject(newItem.id, {
          name: p.name || '',
          role: p.role || '',
          startDate: p.startDate || '',
          endDate: p.endDate || '',
          description: p.description || '',
          technologies: p.technologies || [],
          link: p.link || '',
        });
      }
    });
  }

  // Certificates
  if (data.certificates.length > 0) {
    const existingCertIds = [...store.data.certificates].map(c => c.id);
    existingCertIds.forEach(id => store.deleteCertificate(id));
    data.certificates.forEach((c) => {
      store.addCertificate();
      const newList = store.data.certificates;
      const newItem = newList[newList.length - 1];
      if (newItem) {
        store.updateCertificate(newItem.id, {
          name: c.name || '',
          issuer: c.issuer || '',
          date: c.date || '',
          link: c.link || '',
        });
      }
    });
  }

  // Languages
  if (data.languages.length > 0) {
    const existingLangIds = [...store.data.languages].map(l => l.id);
    existingLangIds.forEach(id => store.deleteLanguage(id));
    data.languages.forEach((l) => {
      store.addLanguage();
      const newList = store.data.languages;
      const newItem = newList[newList.length - 1];
      if (newItem) {
        store.updateLanguage(newItem.id, {
          name: l.name || '',
          level: l.level || '',
        });
      }
    });
  }
}

/** 将问答式引导中逐步收集的部分数据应用到 store */
function applyPartialData(_store: ReturnType<typeof useResumeStore>, info: Record<string, any>) {
  const store = useResumeStore.getState();
  if (info.personal && Object.values(info.personal).some(Boolean)) {
    const updates: Record<string, string> = {};
    for (const [k, v] of Object.entries(info.personal)) {
      if (v) updates[k] = String(v);
    }
    if (Object.keys(updates).length > 0) store.updatePersonal(updates);
  }
  // 其他数组字段采用追加策略而非覆盖
  if (info.workExperience?.length > 0) {
    info.workExperience.forEach((w: any) => {
      store.addWorkExperience();
      const newList = store.data.workExperience;
      const newItem = newList[newList.length - 1];
      if (newItem) {
        store.updateWorkExperience(newItem.id, {
          company: w.company || '', position: w.position || '',
          startDate: w.startDate || '', endDate: w.endDate || '',
          current: w.current || false, description: w.description || '',
          achievements: w.achievements || [],
        });
      }
    });
  }
  if (info.education?.length > 0) {
    info.education.forEach((e: any) => {
      store.addEducation();
      const newList = store.data.education;
      const newItem = newList[newList.length - 1];
      if (newItem) {
        store.updateEducation(newItem.id, {
          school: e.school || '', degree: e.degree || '',
          major: e.major || '', startDate: e.startDate || '',
          endDate: e.endDate || '', gpa: e.gpa || '',
          description: e.description || '',
        });
      }
    });
  }
  if (info.skills?.length > 0) {
    info.skills.forEach((s: any) => {
      if (s.items?.length > 0) {
        // 尝试匹配已有分类或新建
        const existings = store.data.skills;
        const matched = existings.find((ex) =>
          ex.category && s.category && ex.category.includes(s.category.split(/[\/、]/)[0])
        );
        if (matched) {
          store.updateSkill(matched.id, { items: [...new Set([...matched.items, ...s.items])] });
        } else {
          store.addSkill();
          const newList = store.data.skills;
          const newItem = newList[newList.length - 1];
          if (newItem) {
            store.updateSkill(newItem.id, { category: s.category || '其他', items: s.items || [] });
          }
        }
      }
    });
  }
}

/** 合并增量收集到的信息 */
function mergeCollectedInfo(prev: Record<string, any>, delta: ParsedResumeData | null): Record<string, any> {
  if (!delta) return prev;
  const merged = { ...prev };
  if (delta.personal) {
    merged.personal = { ...(merged.personal || {}), ...delta.personal };
  }
  if (delta.workExperience?.length > 0) {
    merged.workExperience = [...(merged.workExperience || []), ...delta.workExperience];
  }
  if (delta.education?.length > 0) {
    merged.education = [...(merged.education || []), ...delta.education];
  }
  if (delta.skills?.length > 0) {
    merged.skills = [...(merged.skills || []), ...delta.skills];
  }
  if (delta.projects?.length > 0) {
    merged.projects = [...(merged.projects || []), ...delta.projects];
  }
  if (delta.certificates?.length > 0) {
    merged.certificates = [...(merged.certificates || []), ...delta.certificates];
  }
  if (delta.languages?.length > 0) {
    merged.languages = [...(merged.languages || []), ...delta.languages];
  }
  return merged;
}
