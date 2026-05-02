import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, FileJson, Printer, ChevronDown, Sparkles, Wand2 } from 'lucide-react';
import { useResumeStore } from '../store/resumeStore';
import { useAIStore } from '../store/aiStore';
import { TEMPLATE_LIST } from '../templates';
import { exportToPDF, exportToJSON, importFromJSON } from '../utils/export';

export const TopBar: React.FC = () => {
  const { data, settings, importData, resetToDefault } = useResumeStore();
  const { setAssistantOpen, setAutoFillOpen, isReady } = useAIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const currentTpl = TEMPLATE_LIST.find((t) => t.id === settings.templateId);

  const handlePDFExport = () => {
    const name = data.personal.name ? `${data.personal.name}的简历` : '我的简历';
    exportToPDF(name);
    setShowMenu(false);
  };

  const handleJSONExport = () => {
    const name = data.personal.name ? `${data.personal.name}简历数据` : '简历数据';
    exportToJSON(data, name);
    setShowMenu(false);
  };

  const handleJSONImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromJSON(file);
      importData(imported as typeof data);
      alert('✅ 数据导入成功！');
    } catch {
      alert('❌ 导入失败，请确认文件格式正确');
    }
    e.target.value = '';
  };

  const handlePrint = () => {
    window.print();
    setShowMenu(false);
  };

  const handleReset = () => {
    if (confirm('确认重置为示例数据？当前所有修改将丢失。')) {
      resetToDefault();
    }
  };

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-5 justify-between z-10">
{/* Logo —— 神器风：浅绿底圆角 + 白色文档 + 金色星闪 */}
      <div className="flex items-center gap-2.5">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 flex-shrink-0"
          aria-label="AI 简历 Logo"
        >
          <defs>
            <linearGradient id="logo-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#00A67E" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-g)" />
          <path
            d="M9 8.5h10l3 3V22a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 22V10A1.5 1.5 0 0 1 9 8.5Z"
            fill="#ffffff"
            opacity="0.96"
          />
          <rect x="10" y="13" width="8" height="1.4" rx="0.7" fill="#00A67E" opacity="0.85" />
          <rect x="10" y="16" width="10" height="1.4" rx="0.7" fill="#00A67E" opacity="0.55" />
          <rect x="10" y="19" width="7" height="1.4" rx="0.7" fill="#00A67E" opacity="0.55" />
          <g transform="translate(22 6)">
            <path d="M3 0L3.7 2.3L6 3L3.7 3.7L3 6L2.3 3.7L0 3L2.3 2.3Z" fill="#FBBF24" />
          </g>
        </svg>
        <div>
          <span className="text-sm font-bold text-emerald-700">AI 简历</span>
          <span className="ml-2 text-xs text-gray-400 hidden sm:inline">
            {data.personal.name ? `${data.personal.name} 的简历` : 'Awesome Resume'}
          </span>
        </div>
      </div>

{/* 中间：当前模板指示 + 页数胶囊（神器风） */}
      <div className="hidden md:flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${settings.colorTheme.primary}15`,
            color: settings.colorTheme.secondary,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: settings.colorTheme.primary }}
          />
          <span>{currentTpl?.name ?? '标准'} 模板</span>
        </div>
        {settings.onePageMode && (
          <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
            一页模式
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* AI 助手按钮：整个项目的差异化入口 */}
        <button
          onClick={() => setAssistantOpen(true)}
          className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 rounded-lg transition-all"
          title="AI 助手：粘贴 JD 生成匹配度与改写建议"
        >
          <Sparkles size={13} className="text-emerald-600" />
          <span>AI 简历助手</span>
          {!isReady() && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"
              title="尚未配置"
            />
          )}
        </button>

        {/* AI 一键成稿按钮 */}
        <button
          onClick={() => setAutoFillOpen(true)}
          className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200 rounded-lg transition-all"
          title="AI 一键成稿：60 秒生成专业简历"
        >
          <Wand2 size={13} className="text-orange-500" />
          <span className="hidden sm:inline">一键成稿</span>
          {!isReady() && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"
              title="尚未配置"
            />
          )}
        </button>

        {/* Import JSON */}
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleJSONImport} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="从 JSON 文件导入数据"
        >
          <Upload size={14} />
          <span className="hidden sm:inline">导入</span>
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="重置为示例数据"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">重置</span>
        </button>

        {/* Export Dropdown —— 绿色主按钮 */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-colors font-medium shadow-sm"
          >
            <Download size={14} />
            导出
            <ChevronDown size={12} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                <button onClick={handlePDFExport} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Download size={14} className="text-emerald-600" />
                  下载 PDF
                </button>
                <button onClick={handleJSONExport} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <FileJson size={14} className="text-blue-600" />
                  导出 JSON
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={handlePrint} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Printer size={14} className="text-gray-500" />
                  打印
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
