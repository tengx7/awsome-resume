import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Loader2, Wand2, Gauge, Target, Minimize2, Maximize2, Languages, Check, X as XIcon } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { rewriteTextStream } from '../../services/ai';
import type { RewriteMode } from '../../services/ai/types';

interface AIFieldButtonProps {
  /** 当前字段的值 */
  value: string;
  /** 采纳后的回调 */
  onApply: (next: string) => void;
  /** 可选上下文（目标岗位/JD）用于 Prompt */
  context?: { role?: string; jd?: string };
  /** 按钮位置微调 */
  className?: string;
  /** 仅显示的模式（默认全部） */
  modes?: RewriteMode[];
  /** 按钮尺寸，默认 14 */
  size?: number;
  /** 文案前缀（默认"AI 增强"） */
  label?: string;
}

interface ModeMeta {
  id: RewriteMode;
  label: string;
  icon: React.ComponentType<any>;
  hint: string;
}

const ALL_MODES: ModeMeta[] = [
  { id: 'polish', label: '润色', icon: Wand2, hint: '保持原意，提升表达' },
  { id: 'quantify', label: '量化', icon: Gauge, hint: '补充数据、规模、效果' },
  { id: 'star', label: 'STAR 化', icon: Target, hint: '强化情境/任务/行动/结果' },
  { id: 'shorten', label: '压缩', icon: Minimize2, hint: '保留最关键一句' },
  { id: 'expand', label: '扩写', icon: Maximize2, hint: '丰满细节与结果' },
  { id: 'translate_en', label: '译为英文', icon: Languages, hint: '生成英文简历版本' },
];

/** 弹层宽度 */
const MENU_WIDTH = 208;
const OUTPUT_WIDTH = 340;
const GAP = 6;

/**
 * 把弹层挂到 body（Portal）并按触发按钮位置计算坐标，
 * 规避父级 overflow 裁剪 + 小容器宽度不足导致内容（例如「采纳」按钮）被遮挡。
 */
const useAnchorRect = (ref: React.RefObject<HTMLElement>, open: boolean) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const calc = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
    };
    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('scroll', calc, true); // 捕获任意滚动容器
    return () => {
      window.removeEventListener('resize', calc);
      window.removeEventListener('scroll', calc, true);
    };
  }, [open, ref]);

  return rect;
};

/** 根据 anchor rect + 期望宽度计算 top-right 贴靠坐标（并夹紧到视口内） */
const positionBelow = (rect: DOMRect | null, width: number) => {
  if (!rect) return { top: 0, left: 0, visibility: 'hidden' as const };
  const vw = window.innerWidth;
  // 右对齐按钮右边
  let left = rect.right - width;
  if (left < 8) left = 8;
  if (left + width > vw - 8) left = vw - 8 - width;
  const top = rect.bottom + GAP;
  return { top, left, visibility: 'visible' as const };
};

export const AIFieldButton: React.FC<AIFieldButtonProps> = ({
  value,
  onApply,
  context,
  className = '',
  modes,
  size = 14,
  label = 'AI 增强',
}) => {
  const { config, isReady, setAssistantOpen, setSettingsOpen } = useAIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [currentMode, setCurrentMode] = useState<RewriteMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const hasOutput = !!(draft || loading || error);

  const menuRect = useAnchorRect(btnRef, menuOpen);
  const outputRect = useAnchorRect(btnRef, hasOutput);

  // 点击外部关闭（同时检查按钮/菜单/输出容器）
  useEffect(() => {
    if (!menuOpen && !hasOutput) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      if (outputRef.current?.contains(t)) return;
      setMenuOpen(false);
      // 输出框不在外部点击时强制关闭（避免用户误点丢失 AI 结果），仅关菜单
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen, hasOutput]);

  const availableModes = modes
    ? ALL_MODES.filter((m) => modes.includes(m.id))
    : ALL_MODES;

  const trigger = (mode: RewriteMode) => {
    if (!isReady()) {
      setSettingsOpen(true);
      setMenuOpen(false);
      return;
    }
    const input = (value || '').trim();
    if (!input) {
      setError('请先填写内容再让 AI 改写');
      setMenuOpen(false);
      return;
    }
    // 关闭菜单，进入生成状态
    setMenuOpen(false);
    setDraft('');
    setError(null);
    setCurrentMode(mode);
    setLoading(true);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    rewriteTextStream(
      config,
      input,
      mode,
      {
        signal: ac.signal,
        onDelta: (chunk) => setDraft((prev) => prev + chunk),
        onDone: (full) => {
          setLoading(false);
          const clean = full.replace(/^["'「『]|["'」』]$/g, '').trim();
          setDraft(clean || '（AI 未返回内容）');
        },
        onError: (err) => {
          setLoading(false);
          setError(err.message || 'AI 调用失败');
        },
      },
      context,
    );
  };

  const cancel = () => {
    abortRef.current?.abort();
    setLoading(false);
    setDraft('');
    setCurrentMode(null);
    setError(null);
  };

  const apply = () => {
    if (draft.trim()) onApply(draft.trim());
    setDraft('');
    setCurrentMode(null);
    setError(null);
  };

  const ready = isReady();

  const menuPos = positionBelow(menuRect, MENU_WIDTH);
  const outputPos = positionBelow(outputRect, OUTPUT_WIDTH);

  return (
    <>
      <div className={`relative inline-flex ${className}`}>
        <button
          ref={btnRef}
          type="button"
          onClick={() => {
            if (!ready) {
              setSettingsOpen(true);
              return;
            }
            // 有输出时优先切换到菜单（再次改写）
            setMenuOpen((v) => !v);
          }}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md transition-colors ${
            ready
              ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={ready ? 'AI 智能改写' : '点击配置 AI'}
        >
          <Sparkles size={size} />
          <span>{label}</span>
        </button>
      </div>

      {/* ============ Portal：模式下拉菜单 ============ */}
      {menuOpen && ready && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            width: MENU_WIDTH,
            visibility: menuPos.visibility,
            zIndex: 1000,
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-xl py-1"
        >
          {availableModes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => trigger(m.id)}
                className="w-full flex items-start gap-2 px-2.5 py-1.5 text-left hover:bg-purple-50 transition-colors"
              >
                <Icon size={13} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800">{m.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{m.hint}</p>
                </div>
              </button>
            );
          })}
          <div className="h-px bg-gray-100 my-1" />
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setAssistantOpen(true);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-blue-50 transition-colors text-blue-600"
          >
            <Target size={13} />
            <span className="text-xs font-medium">打开 AI 助手（JD 对齐）</span>
          </button>
        </div>,
        document.body,
      )}

      {/* ============ Portal：生成结果浮窗 ============ */}
      {hasOutput && createPortal(
        <div
          ref={outputRef}
          style={{
            position: 'fixed',
            top: outputPos.top,
            left: outputPos.left,
            width: OUTPUT_WIDTH,
            maxWidth: 'calc(100vw - 16px)',
            visibility: outputPos.visibility,
            zIndex: 1001,
          }}
          className="bg-white border border-purple-200 rounded-lg shadow-2xl p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700">
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              AI {currentMode && (ALL_MODES.find((m) => m.id === currentMode)?.label || '')}
              {loading && <span className="text-[10px] text-gray-400 font-normal ml-1">生成中…</span>}
            </div>
            <button
              type="button"
              onClick={cancel}
              className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
              title="关闭"
            >
              <XIcon size={12} />
            </button>
          </div>

          {error ? (
            <p className="text-xs text-red-500 leading-relaxed">{error}</p>
          ) : (
            <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words max-h-56 overflow-y-auto bg-purple-50/40 border border-purple-100 rounded px-2 py-1.5">
              {draft || <span className="text-gray-400">等待响应…</span>}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={cancel}
              className="px-2.5 py-1 text-[11px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              取消
            </button>
            {!loading && !error && draft && (
              <button
                type="button"
                onClick={apply}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-purple-600 hover:bg-purple-700 rounded"
              >
                <Check size={11} />
                采纳
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
