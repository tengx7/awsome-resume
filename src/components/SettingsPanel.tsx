import React, { useRef, useState, useMemo } from 'react';
import {
  Palette,
  Type,
  LayoutGrid,
  Bookmark,
  Save,
  Trash2,
  Download,
  Upload,
  Check,
  Sparkles,
  Shapes,
  Rows,
  FileText,
} from 'lucide-react';
import { useResumeStore } from '../store/resumeStore';
import { TEMPLATE_LIST } from '../templates';
import { COLOR_THEMES, FONT_FAMILIES } from '../data/defaults';
import { FontFamily, TemplateId } from '../types/resume';

type TplCategory = 'all' | 'basic' | 'classic' | 'modern' | 'pro';
type TplTab = 'job' | 'style';

const CATEGORY_FILTERS: { id: TplCategory; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'basic', label: '基础' },
  { id: 'modern', label: '现代' },
  { id: 'classic', label: '经典' },
  { id: 'pro', label: '专业' },
];

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    setTemplate,
    setColorTheme,
    setFontSize,
    setFontFamily,
    toggleShowAvatar,
    setLineHeight,
    setSectionGap,
    toggleOnePageMode,
    presets,
    savePreset,
    applyPreset,
    deletePreset,
    exportPresets,
    importPresets,
  } = useResumeStore();

  const [presetName, setPresetName] = useState('');
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 模板筛选 Tab
  const [tplTab, setTplTab] = useState<TplTab>('style');
  const [tplCategory, setTplCategory] = useState<TplCategory>('all');

  const filteredTemplates = useMemo(() => {
    if (tplCategory === 'all') return TEMPLATE_LIST;
    return TEMPLATE_LIST.filter((t) => t.category === tplCategory);
  }, [tplCategory]);

  const handleSavePreset = () => {
    const name = presetName.trim() || `我的预设 ${presets.length + 1}`;
    savePreset(name);
    setPresetName('');
  };

  const handleExport = () => {
    const json = exportPresets();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-presets-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importPresets(String(reader.result || ''));
      setImportMsg({ type: result.success ? 'success' : 'error', text: result.message });
      setTimeout(() => setImportMsg(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full scrollbar-thin">
      {/* ========= 页面布局：一页模式 + 行高 + 模块间距 ========= */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
          <LayoutGrid size={15} />
          页面布局
          <span className="text-[10px] font-normal text-gray-400 ml-auto">间距 · 行高 · 一页</span>
        </h3>

        {/* 一页模式按钮 */}
        <button
          onClick={toggleOnePageMode}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
            settings.onePageMode
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
          title="启用后模板会自动压缩行高与模块间距，尝试保持一页内"
        >
          <FileText size={14} />
          {settings.onePageMode ? '一页模式（已开启）' : '一页模式'}
        </button>

        {/* 行高滑块 */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <Rows size={12} /> 行高
            </label>
            <span className="text-xs font-mono text-emerald-700">{settings.lineHeight.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={1.2}
            max={2.0}
            step={0.05}
            value={settings.lineHeight}
            onChange={(e) => setLineHeight(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>紧凑</span>
            <span>默认 1.6</span>
            <span>舒展</span>
          </div>
        </div>

        {/* 模块间距滑块 */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">模块间距</label>
            <span className="text-xs font-mono text-emerald-700">{settings.sectionGap}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={40}
            step={1}
            value={settings.sectionGap}
            onChange={(e) => setSectionGap(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>紧凑</span>
            <span>默认 22</span>
            <span>宽松</span>
          </div>
        </div>
      </section>

        {/* ========= 简历模板：神器式二级 Tab + 分类筛选 ========= */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
          <Shapes size={15} />
          简历模板
        </h3>

        {/* 二级 Tab：职类模板 / 风格模板 */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTplTab('job')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              tplTab === 'job'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            💼 职类模板
          </button>
          <button
            onClick={() => setTplTab('style')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              tplTab === 'style'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            🎨 风格模板
          </button>
        </div>

        {/* 分类筛选胶囊 */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setTplCategory(c.id)}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                tplCategory === c.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* 模板缩略卡片 */}
        <div className="grid grid-cols-2 gap-2">
          {filteredTemplates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setTemplate(tpl.id as TemplateId)}
              className={`group relative flex flex-col items-stretch p-0 rounded-xl border-2 overflow-hidden text-left transition-all ${
                settings.templateId === tpl.id
                  ? 'border-emerald-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* 顶部色条缩略（模拟模板配色） */}
              <div
                style={{ backgroundColor: tpl.accent }}
                className="h-8 flex items-end px-2 pb-1"
              >
                <div className="h-1 w-8 bg-white/80 rounded-full" />
              </div>
              {/* 内容模拟 */}
              <div className="p-2 bg-white">
                <div className="h-1 w-2/3 bg-gray-300 rounded mb-1" />
                <div className="h-1 w-full bg-gray-200 rounded mb-1" />
                <div className="h-1 w-4/5 bg-gray-200 rounded mb-2" />
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      settings.templateId === tpl.id ? 'text-emerald-700' : 'text-gray-700'
                    }`}
                  >
                    {tpl.name}
                  </span>
                  {settings.templateId === tpl.id && (
                    <span className="text-[10px] text-white bg-emerald-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check size={9} /> 使用中
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight truncate">
                  {tpl.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ========= 颜色主题 ========= */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
          <Palette size={15} />
          颜色主题
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setColorTheme(theme)}
              title={theme.name}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 transition-all ${
                settings.colorTheme.id === theme.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-[10px] text-gray-600 leading-tight truncate w-full text-center">
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ========= 字体设置 ========= */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
          <Type size={15} />
          字体设置
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">字体风格</label>
            <div className="grid grid-cols-3 gap-2">
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id as FontFamily)}
                  className={`py-2 px-2 text-xs rounded-lg border-2 font-medium transition-all flex flex-col items-center gap-0.5 ${
                    settings.fontFamily === f.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  title={f.label}
                >
                  <span className="text-[11px] leading-tight" style={{ fontFamily: f.css }}>
                    {f.sample}
                  </span>
                  <span className="text-[10px] text-gray-400 leading-tight">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">字体大小</label>
              <span className="text-xs font-mono text-emerald-700">
                {settings.fontSize.toFixed(1)}px
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={18}
              step={0.5}
              value={settings.fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>小</span>
              <span>默认 12</span>
              <span>大</span>
            </div>
            <button
              onClick={() => setFontSize(12)}
              className="mt-1 text-[10px] text-gray-400 hover:text-emerald-600 transition-colors"
            >
              恢复默认
            </button>
          </div>
        </div>
      </section>

      {/* ========= 自定义预设 ========= */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
          <Bookmark size={15} />
          自定义预设
          <span className="text-[10px] font-normal text-gray-400 ml-auto">
            保存 · 应用 · 分享当前外观
          </span>
        </h3>

        {/* 保存当前配置 */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="预设名称（可选）"
            className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSavePreset();
            }}
          />
          <button
            onClick={handleSavePreset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            title="将当前模板+颜色+字体+模块显示状态保存为预设"
          >
            <Save size={12} />
            保存
          </button>
        </div>

        {/* 预设列表 */}
        {presets.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
            尚未保存任何预设
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {presets.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: p.settings.colorTheme.primary }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {TEMPLATE_LIST.find((t) => t.id === p.settings.templateId)?.name || p.settings.templateId}
                    {' · '}
                    {typeof p.settings.fontSize === 'number' ? p.settings.fontSize : 12}px
                  </p>
                </div>
                <button
                  onClick={() => applyPreset(p.id)}
                  className="flex items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                  title="应用此预设"
                >
                  <Check size={11} />
                  应用
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`确定删除预设「${p.name}」？`)) deletePreset(p.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 导入导出 */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleExport}
            disabled={presets.length === 0}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="导出为 JSON 文件"
          >
            <Download size={12} />
            导出
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            title="从 JSON 文件导入预设"
          >
            <Upload size={12} />
            导入
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
        {importMsg && (
          <p className={`mt-2 text-[11px] ${importMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
            {importMsg.text}
          </p>
        )}
      </section>

      {/* ========= 其他设置 ========= */}
      <section>
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles size={15} />
          其他设置
        </h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">显示头像</span>
            <div
              onClick={toggleShowAvatar}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                settings.showAvatar ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  settings.showAvatar ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </div>
          </label>
        </div>
      </section>
    </div>
  );
};
