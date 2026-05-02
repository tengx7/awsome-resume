import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useResumeStore } from '../../store/resumeStore';
import { TemplateRenderer } from '../../templates';
import { SelectionToolbar } from '../ai/SelectionToolbar';

/**
 * PC 中栏简历画布
 * - 浅灰背景
 * - 中间白色 A4 居中
 * - 左下缩放控件 -/100%/+
 */
export const PCCanvas: React.FC = () => {
  const { data, settings } = useResumeStore();
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(2, z + 0.1));
  const zoomOut = () => setZoom((z) => Math.max(0.4, z - 0.1));

  return (
    <div className="relative flex-1 h-full flex flex-col bg-[#F4F6F5] overflow-hidden">
      {/* 画布滚动容器 */}
      <div className="resume-print-canvas flex-1 overflow-auto flex items-start justify-center py-10 px-6" data-selection-scope="true">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            boxShadow: '0 10px 40px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.06)',
            borderRadius: 4,
            backgroundColor: '#fff',
          }}
          className="resume-preview-wrapper"
        >
          <TemplateRenderer data={data} settings={settings} />
        </div>
      </div>

      {/* 选区浮动工具栏（按选区定位） */}
      <div className="no-print">
        <SelectionToolbar />
      </div>

      {/* 左下缩放控件 */}
      <div className="no-print absolute left-6 bottom-6 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm">
        <button
          onClick={zoomOut}
          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-zp-primary"
          title="缩小"
        >
          <Minus size={14} />
        </button>
        <span className="min-w-[44px] text-center text-[12px] text-gray-700 font-mono">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-zp-primary"
          title="放大"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

export default PCCanvas;
