/**
 * 选区工具条 + 跨组件事件总线
 *
 * 画布里的文字被用户选中时：
 *  1. 浮出一个迷你工具栏（B / I / U / Bullet / Ordered / AI 生成 / AI 润色 / 引用文本）
 *  2. "引用文本" 把选中文本通过 SelectionBus 发送给右侧 AI 面板，AI 面板底部会出现 "A 已选文本" chip
 *  3. "AI 润色 / AI 生成" 直接把当前选中文本推到 AI 面板并触发对话
 *
 * 说明：
 *  - 由于简历模板里的 HTML 并非 contentEditable，这里只负责"选中 → 引用到 AI"这条链路，
 *    以及展示 B/I/U 的 UI（是否真正改写模板属于进一步增强，这里优先保证像素对齐的体验）。
 *  - `contentEditable` 元素上的富文本操作（加粗等）仍会通过 document.execCommand 生效。
 */
import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Wand2, Quote } from 'lucide-react';

// ============ 事件总线 ============
type Payload =
  | { type: 'quote'; text: string }
  | { type: 'ai-polish'; text: string }
  | { type: 'ai-generate'; text: string };

type Listener = (p: Payload) => void;
const listeners = new Set<Listener>();

export const SelectionBus = {
  emit(p: Payload) {
    listeners.forEach((l) => l(p));
  },
  on(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

// ============ 浮动工具栏 ============
interface Pos {
  top: number;
  left: number;
}

/**
 * 监听整个文档的选区变化，在选区附近弹出一个小工具栏。
 * 只在"简历画布"容器（含 data-selection-scope）内的选区生效，避免其他输入框选中时误触发。
 */
export const SelectionToolbar: React.FC = () => {
  const [pos, setPos] = useState<Pos | null>(null);
  const [text, setText] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isInsideScope = (node: Node | null): boolean => {
      let el: Node | null = node;
      while (el && el !== document.body) {
        if ((el as HTMLElement).dataset?.selectionScope === 'true') return true;
        el = (el as HTMLElement).parentNode;
      }
      return false;
    };

    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPos(null);
        setText('');
        return;
      }
      const value = sel.toString().trim();
      if (!value) {
        setPos(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!isInsideScope(range.commonAncestorContainer)) {
        setPos(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        setPos(null);
        return;
      }
      setPos({
        top: rect.top + window.scrollY - 46,
        left: rect.left + window.scrollX + rect.width / 2,
      });
      setText(value);
    };

    // 鼠标抬起 / 键盘选择 后计算
    const onUp = () => setTimeout(update, 0);
    const onDown = (e: MouseEvent) => {
      // 点击工具栏自身不要清除
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) return;
      setPos(null);
    };
    document.addEventListener('mouseup', onUp);
    document.addEventListener('keyup', onUp);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('scroll', () => setPos(null), true);
    return () => {
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('keyup', onUp);
      document.removeEventListener('mousedown', onDown);
    };
  }, []);

  if (!pos || !text) return null;

  const exec = (cmd: string) => {
    try {
      document.execCommand(cmd, false);
    } catch {
      /* ignore */
    }
  };

  const IconBtn: React.FC<{
    title: string;
    onClick: () => void;
    children: React.ReactNode;
    highlight?: boolean;
  }> = ({ title, onClick, children, highlight }) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`h-7 px-1.5 min-w-[28px] flex items-center justify-center text-[12px] rounded hover:bg-gray-100 transition-colors ${
        highlight ? 'text-zp-primary font-medium' : 'text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="w-px h-4 bg-gray-200 mx-0.5" />;

  return (
    <div
      ref={toolbarRef}
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}
      className="flex items-center gap-0.5 px-1 py-1 bg-white border border-gray-200 rounded-lg shadow-[0_6px_20px_rgba(15,23,42,0.12)] animate-fadeIn"
    >
      <IconBtn title="加粗" onClick={() => exec('bold')}>
        <span className="font-bold">B</span>
      </IconBtn>
      <IconBtn title="斜体" onClick={() => exec('italic')}>
        <span className="italic">I</span>
      </IconBtn>
      <IconBtn title="下划线" onClick={() => exec('underline')}>
        <span className="underline">U</span>
      </IconBtn>
      <Divider />
      <IconBtn title="无序列表" onClick={() => exec('insertUnorderedList')}>
        <span className="text-[14px] leading-none">•≡</span>
      </IconBtn>
      <IconBtn title="有序列表" onClick={() => exec('insertOrderedList')}>
        <span className="text-[13px] leading-none">1≡</span>
      </IconBtn>
      <Divider />
      <IconBtn
        title="AI 生成内容"
        highlight
        onClick={() => SelectionBus.emit({ type: 'ai-generate', text })}
      >
        <Sparkles size={13} className="mr-0.5" />
        AI 生成
      </IconBtn>
      <IconBtn
        title="AI 润色"
        highlight
        onClick={() => SelectionBus.emit({ type: 'ai-polish', text })}
      >
        <Wand2 size={13} className="mr-0.5" />
        AI 润色
      </IconBtn>
      <IconBtn
        title="引用到对话框"
        highlight
        onClick={() => SelectionBus.emit({ type: 'quote', text })}
      >
        <Quote size={12} className="mr-0.5" />
        引用文本
      </IconBtn>
    </div>
  );
};

export default SelectionToolbar;
