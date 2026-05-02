import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppTopBar } from '../components/AppTopBar';
import { PCLeftPanel } from '../components/pc/PCLeftPanel';
import { PCCanvas } from '../components/pc/PCCanvas';
import { PCAIPanel } from '../components/pc/PCAIPanel';
import { AISettingsModal } from '../components/ai/AISettingsModal';

type ViewMode = 'left' | 'both' | 'right';

/** 宽度约束（像素） */
const LEFT_MIN = 220;
const LEFT_MAX = 520;
const LEFT_DEFAULT = 300;
const RIGHT_MIN = 260;
const RIGHT_MAX = 560;
const RIGHT_DEFAULT = 340;

const LS_LEFT = 'pc-editor-left-w';
const LS_RIGHT = 'pc-editor-right-w';

const readNum = (key: string, fallback: number, min: number, max: number) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  } catch {
    return fallback;
  }
};

/**
 * 竖向拖拽把手
 *  · 鼠标按下后监听 document mousemove
 *  · direction='left-right'：拖动改变**前一个栏**的宽度
 *  · direction='right-left'：拖动改变**后一个栏**的宽度
 */
const Resizer: React.FC<{
  onDrag: (deltaPx: number) => void;
  onReset?: () => void;
}> = ({ onDrag, onReset }) => {
  const draggingRef = useRef(false);
  const startXRef = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    startXRef.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startXRef.current;
      if (dx === 0) return;
      startXRef.current = e.clientX;
      onDrag(dx);
    };
    const mu = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', mv);
    document.addEventListener('mouseup', mu);
    return () => {
      document.removeEventListener('mousemove', mv);
      document.removeEventListener('mouseup', mu);
    };
  }, [onDrag]);

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={onReset}
      title="拖动调整宽度 · 双击重置"
      className="group relative w-1 flex-shrink-0 bg-gray-100 hover:bg-emerald-300 active:bg-emerald-500 cursor-col-resize transition-colors"
    >
      {/* 扩大可点击区域 */}
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
      {/* 中间可视小把手 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-8 rounded-full bg-gray-300 group-hover:bg-emerald-500 transition-colors pointer-events-none" />
    </div>
  );
};

/**
 * PC 三栏编辑器
 *
 * 布局：
 * ┌─────────────────────────────────────────────┐
 * │           AppTopBar (h-14)                  │
 * ├────────┬─┬──────────────────┬─┬─────────────┤
 * │  Left  │▏│     Canvas       │▏│   AI Panel  │
 * └────────┴─┴──────────────────┴─┴─────────────┘
 *           ↑                    ↑
 *           左侧分隔条（可拖）    右侧分隔条（可拖）
 */
export const PCEditorPage: React.FC = () => {
  const [pageCount, setPageCount] = useState(2);
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const [leftW, setLeftW] = useState<number>(() => readNum(LS_LEFT, LEFT_DEFAULT, LEFT_MIN, LEFT_MAX));
  const [rightW, setRightW] = useState<number>(() => readNum(LS_RIGHT, RIGHT_DEFAULT, RIGHT_MIN, RIGHT_MAX));

  // 持久化
  useEffect(() => {
    try {
      localStorage.setItem(LS_LEFT, String(leftW));
    } catch {}
  }, [leftW]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_RIGHT, String(rightW));
    } catch {}
  }, [rightW]);

  const onDragLeft = useCallback((dx: number) => {
    setLeftW((w) => Math.min(LEFT_MAX, Math.max(LEFT_MIN, w + dx)));
  }, []);
  const onDragRight = useCallback((dx: number) => {
    // 右侧把手：向右拖 → 右栏变窄；向左拖 → 右栏变宽
    setRightW((w) => Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, w - dx)));
  }, []);

  // 估算页数
  useEffect(() => {
    const calc = () => {
      const node = document.getElementById('resume-preview');
      if (!node) return;
      const h = node.offsetHeight;
      setPageCount(Math.max(1, Math.ceil(h / (297 * 3.7795 - 2))));
    };
    const t = setTimeout(calc, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div data-lock-scroll="true" className="flex flex-col h-screen bg-white overflow-hidden">
      <div className="no-print">
        <AppTopBar
          pageCount={pageCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左栏 */}
        {viewMode !== 'right' && (
          <>
            <div
              className="no-print flex-shrink-0 border-r border-gray-100 overflow-hidden"
              style={{ width: `${leftW}px` }}
            >
              <PCLeftPanel />
            </div>
            <div className="no-print">
              <Resizer onDrag={onDragLeft} onReset={() => setLeftW(LEFT_DEFAULT)} />
            </div>
          </>
        )}

        {/* 中栏 */}
        <PCCanvas />

        {/* 右栏 */}
        {viewMode !== 'left' && (
          <>
            <div className="no-print">
              <Resizer onDrag={onDragRight} onReset={() => setRightW(RIGHT_DEFAULT)} />
            </div>
            <div
              className="no-print flex-shrink-0 overflow-hidden"
              style={{ width: `${rightW}px` }}
            >
              <PCAIPanel />
            </div>
          </>
        )}
      </div>

      {/* 全局浮层：仅保留 AI 配置（API Key）弹窗 */}
      <div className="no-print">
        <AISettingsModal />
      </div>
    </div>
  );
};

export default PCEditorPage;
