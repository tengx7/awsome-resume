import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  HelpCircle,
  Download,
  Upload,
  RotateCcw,
  FileJson,
  Printer,
  ChevronDown,
  Github,
} from 'lucide-react';
import { useResumeStore } from '../store/resumeStore';
import { exportToPDF, exportToJSON, importFromJSON } from '../utils/export';
import { ZhipinLogo } from './branding/ZhipinLogo';

type ViewMode = 'left' | 'both' | 'right';

interface Props {
  pageCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (v: ViewMode) => void;
  isMobile?: boolean;
}

/**
 * 简历神器 AI —— 统一顶栏
 * PC：‹ + Logo + 标题面包屑 + 视图三图标 + 导出按钮
 * Mobile：‹ + Logo + 标题 + 共N页 + ?
 */
export const AppTopBar: React.FC<Props> = ({
  pageCount = 2,
  viewMode = 'both',
  onViewModeChange,
  isMobile = false,
}) => {
  const navigate = useNavigate();
  const { data, importData, resetToDefault } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const title =
    data.personal.name && data.education?.[0]?.school
      ? `${data.personal.name}-${data.education[0].school}`
      : '简历神器-北京某某学院';

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/templates');
  };

  const handlePDFExport = () => {
    const name = data.personal.name ? `${data.personal.name}的简历` : '我的简历';
    exportToPDF(name);
    setMenuOpen(false);
  };
  const handleJSONExport = () => {
    const name = data.personal.name ? `${data.personal.name}简历数据` : '简历数据';
    exportToJSON(data, name);
    setMenuOpen(false);
  };
  const handleJSONImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromJSON(file);
      importData(imported as typeof data);
      alert('✅ 数据导入成功');
    } catch {
      alert('❌ 导入失败');
    }
    e.target.value = '';
  };
  const handleReset = () => {
    if (confirm('确认重置为示例数据？')) resetToDefault();
    setMenuOpen(false);
  };
  const handlePrint = () => {
    window.print();
    setMenuOpen(false);
  };

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-gray-100 flex items-center px-4 md:px-5 gap-3 z-20">
      {/* 返回 */}
      <button
        onClick={handleBack}
        className="p-1 -ml-1 text-gray-500 hover:text-gray-800 rounded"
        title="返回"
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>

      {/* Logo */}
      <Link to="/" className="flex-shrink-0">
        <ZhipinLogo tone="brand" text="AI简历" size={24} />
      </Link>

      {/* 面包屑标题 + 共 N 页 + ? */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[14px] font-medium text-gray-900 truncate">{title}</span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-[11px] text-gray-600 flex-shrink-0">
          共{pageCount}页
        </span>
        <button
          className="flex-shrink-0 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
          title="帮助"
        >
          <HelpCircle size={16} />
        </button>
      </div>

      {/* 弹性占位 */}
      <div className="flex-1" />

      {/* 视图模式三图标（仅 PC 显示） —— 胶囊分段控件，贴近参考图 */}
      {!isMobile && onViewModeChange && (
        <div className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-gray-100 border border-gray-200 mr-2">
          {([
            { id: 'left', label: '仅左栏' },
            { id: 'both', label: '三栏布局' },
            { id: 'right', label: '仅右栏' },
          ] as { id: ViewMode; label: string }[]).map(({ id, label }) => {
            const active = viewMode === id;
            return (
              <button
                key={id}
                onClick={() => onViewModeChange(id)}
                title={label}
                aria-label={label}
                aria-pressed={active}
                className={`flex items-center justify-center w-8 h-7 rounded-md transition-all ${
                  active
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ViewModeIcon mode={id} />
              </button>
            );
          })}
        </div>
      )}

      {/* GitHub 按钮（仅 PC 显示） */}
      {!isMobile && (
        <a
          href="https://github.com/tengx7/awsome-resume"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-[12px] font-medium transition-all border border-gray-200"
          title="程序员腾哥 · GitHub"
        >
          <Github size={14} />
          <span className="hidden lg:inline">程序员腾哥</span>
        </a>
      )}

      {/* 导出按钮组 */}
      {!isMobile && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleJSONImport}
            className="hidden"
          />
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-zp-primary hover:bg-[#00B589] text-white text-[13px] font-medium rounded-lg shadow-sm transition-colors"
            >
              <Download size={13} />
              导出
              <ChevronDown size={11} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                  <button
                    onClick={handlePDFExport}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download size={14} className="text-zp-primary" />
                    下载 PDF
                  </button>
                  <button
                    onClick={handleJSONExport}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileJson size={14} className="text-blue-600" />
                    导出 JSON
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Upload size={14} className="text-emerald-600" />
                    导入 JSON
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Printer size={14} className="text-gray-500" />
                    打印
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <RotateCcw size={14} className="text-gray-500" />
                    重置为示例
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default AppTopBar;

/**
 * 视图模式图标（14×10 的矩形内按分栏形式填充）
 *  - left：左侧实心、右两格镂空
 *  - both：中间实心（突出编辑区）、左右镂空
 *  - right：右侧实心、左两格镂空
 * 用原生 SVG 保证与参考图一致的像素级观感。
 */
const ViewModeIcon: React.FC<{ mode: 'left' | 'both' | 'right' }> = ({ mode }) => {
  // 外框 16x12，内部三列
  const stroke = 'currentColor';
  const fill = 'currentColor';
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
      {/* 外边框 */}
      <rect
        x="0.75"
        y="0.75"
        width="14.5"
        height="10.5"
        rx="1.5"
        stroke={stroke}
        strokeWidth="1.25"
      />
      {/* 选中列填充 */}
      {mode === 'left' && (
        <rect x="0.75" y="0.75" width="4.83" height="10.5" rx="1.2" fill={fill} />
      )}
      {mode === 'both' && (
        <rect x="5.58" y="0.75" width="4.83" height="10.5" fill={fill} />
      )}
      {mode === 'right' && (
        <rect x="10.42" y="0.75" width="4.83" height="10.5" rx="1.2" fill={fill} />
      )}
      {/* 两根分隔线：始终显示，表达"三栏结构" */}
      <line x1="5.58" y1="1.25" x2="5.58" y2="10.75" stroke={stroke} strokeWidth="1" opacity="0.9" />
      <line x1="10.42" y1="1.25" x2="10.42" y2="10.75" stroke={stroke} strokeWidth="1" opacity="0.9" />
    </svg>
  );
};
