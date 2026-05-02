import React, { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { TemplateRenderer } from '../templates';
import { ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';

/** A4 页面高度（mm） */
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.7795275591; // 1mm ≈ 3.78px @ 96dpi

export const PreviewPanel: React.FC = () => {
  const { data, settings } = useResumeStore();
  const [zoom, setZoom] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));
  const handleZoomReset = () => setZoom(1);

  // 估算页数：基于 resume-preview 的实际高度 / A4 高度
  useEffect(() => {
    const calcPages = () => {
      const node = document.getElementById('resume-preview');
      if (!node) return;
      const h = node.offsetHeight;
      const pages = Math.max(1, Math.ceil(h / (A4_HEIGHT_MM * MM_TO_PX - 2)));
      setPageCount(pages);
    };
    // 首次 + 每次 data/settings 变化后延迟测量
    const t = setTimeout(calcPages, 60);
    return () => clearTimeout(t);
  }, [data, settings]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Zoom controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">预览</span>
          <span className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
            <FileText size={11} className="text-emerald-600" />
            共 {pageCount} 页
          </span>
          {settings.onePageMode && pageCount > 1 && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              超出一页，建议缩短内容或压缩行高
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            title="缩小"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg min-w-[48px] text-center transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            title="放大"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleZoomReset}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors ml-1"
            title="重置缩放"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto flex items-start justify-center py-8 px-4">
        <div
          ref={wrapperRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            boxShadow: '0 10px 40px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.08)',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}
          className="resume-preview-wrapper"
        >
          <TemplateRenderer data={data} settings={settings} />
        </div>
      </div>
    </div>
  );
};
