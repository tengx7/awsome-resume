import React, { useEffect, useRef } from 'react';

/**
 * EditableText —— 画布内就地编辑的文字节点
 *
 * 设计要点：
 *  - 非编辑态：普通文字；hover 时显示下划虚线 + 柔和背景，提示可点击
 *  - 编辑态：contentEditable 激活，光标进入；失焦自动同步到 store
 *  - 支持多行 (multiline=true) 或单行 (默认)
 *  - 使用 uncontrolled 模式（不由 React 控制光标）避免中文输入法被打断
 *  - 当外部 value 发生变化且与当前 DOM 文本不一致时，才同步回 DOM（避免光标跳动）
 */
export interface EditableTextProps {
  /** 当前文本值 */
  value: string;
  /** 失焦时把新文本回写到 store */
  onCommit: (next: string) => void;
  /** 占位文字（空文本时灰色提示） */
  placeholder?: string;
  /** 是否允许换行（默认 false） */
  multiline?: boolean;
  /** 内联样式透传 */
  style?: React.CSSProperties;
  /** 额外的 class */
  className?: string;
  /** 包裹元素标签，默认 span；多行可用 div */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'li';
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onCommit,
  placeholder,
  multiline = false,
  style,
  className,
  as = 'span',
}) => {
  const ref = useRef<HTMLElement>(null);
  const lastExternalRef = useRef<string>(value);

  // 当外部 value 变化（比如 AI 润色后）且与当前 DOM 文本不一致时，才回写
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return; // 正在编辑时不打扰
    if (el.innerText !== value) {
      el.innerText = value;
    }
    lastExternalRef.current = value;
  }, [value]);

  const handleBlur = () => {
    const next = (ref.current?.innerText || '').replace(/\u00A0/g, ' ');
    if (next !== lastExternalRef.current) {
      onCommit(next);
      lastExternalRef.current = next;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      // 回滚为最新 value
      if (ref.current) ref.current.innerText = lastExternalRef.current;
      (e.target as HTMLElement).blur();
    }
  };

  const isEmpty = !value || !value.trim();

  const Tag: any = as;

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      data-editable="true"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      // 非空时首次渲染把文字塞进去
      dangerouslySetInnerHTML={{ __html: escapeHtml(value || '') }}
      data-placeholder={isEmpty ? placeholder || '' : ''}
      style={{
        outline: 'none',
        cursor: 'text',
        borderRadius: 3,
        transition: 'background-color .15s, box-shadow .15s',
        whiteSpace: multiline ? 'pre-wrap' : 'normal',
        minHeight: '1em',
        ...style,
      }}
      className={`editable-text ${isEmpty ? 'is-empty' : ''} ${className || ''}`}
    />
  );
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

export default EditableText;
