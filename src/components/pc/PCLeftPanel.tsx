import React, { useState } from 'react';
import {
  Trash2,
  GripVertical,
  FileText,
} from 'lucide-react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  DroppableProps,
  Droppable,
} from 'react-beautiful-dnd';
import { useResumeStore } from '../../store/resumeStore';
import { EditorPanel } from '../editor/EditorPanel';
import { SettingsPanel } from '../SettingsPanel';
import { TEMPLATE_LIST } from '../../templates';
import { TemplateId } from '../../types/resume';

type Tab = 'template' | 'edit' | 'layout';

// React 18 StrictMode 兼容
const StrictModeDroppable: React.FC<DroppableProps> = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  React.useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

const MODULE_LABELS: Record<string, string> = {
  personal: '基本信息',
  education: '教育经历',
  workExperience: '工作经历',
  projects: '项目经历',
  skills: '掌握技能',
  summary: '个人优势',
  certificates: '证书荣誉',
  languages: '语言能力',
  customSections: '自定义模块',
};

/**
 * 3 个 Tab 自定义图标（贴近参考图：点阵、文件、方格网格）
 */
const IconTplGrid: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <circle cx="3" cy="3" r="1.4" />
    <circle cx="8" cy="3" r="1.4" />
    <circle cx="13" cy="3" r="1.4" />
    <circle cx="3" cy="8" r="1.4" />
    <circle cx="8" cy="8" r="1.4" />
    <circle cx="13" cy="8" r="1.4" />
    <circle cx="3" cy="13" r="1.4" />
    <circle cx="8" cy="13" r="1.4" />
    <circle cx="13" cy="13" r="1.4" />
  </svg>
);

const IconEdit: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 3h7l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M10 3v3h3" />
    <path d="m6.5 11.5 3.8-3.8a.9.9 0 0 1 1.3 1.3L7.8 12.8l-1.7.4.4-1.7Z" />
  </svg>
);

const IconLayout: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="2" width="12" height="12" rx="1.5" />
    <path d="M2 6h12M6 6v8" />
  </svg>
);

/**
 * 三段 Tab 胶囊组
 */
const TabSegment: React.FC<{
  value: Tab;
  onChange: (v: Tab) => void;
}> = ({ value, onChange }) => (
  <div className="flex items-center gap-1 p-1 bg-[#F3F4F3] rounded-full w-full">
    {([
      { id: 'template', label: '简历模版', Icon: IconTplGrid },
      { id: 'edit', label: '简历编辑', Icon: IconEdit },
      { id: 'layout', label: '页面布局', Icon: IconLayout },
    ] as { id: Tab; label: string; Icon: React.FC<{ size?: number }> }[]).map(({ id, label, Icon }) => {
      const active = value === id;
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-full text-[13px] transition-all ${
            active
              ? 'bg-white text-gray-900 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Icon size={13} />
          <span>{label}</span>
        </button>
      );
    })}
  </div>
);

/**
 * TemplateThumb —— 每个模板的专属微缩预览
 * 根据模板 id 画出与效果图一致的骨架，让用户一眼能分辨出 12 款模板
 */
const TemplateThumb: React.FC<{ id: string; accent: string }> = ({ id, accent }) => {
  // 通用构件
  const Lines: React.FC<{ x: number; y: number; w: number; n?: number; gap?: number; color?: string; opacity?: number }> = ({
    x, y, w, n = 3, gap = 3, color = '#CBD5E1', opacity = 1,
  }) => (
    <g opacity={opacity}>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={x} y={y + i * gap} width={w - (i % 2) * 10} height="1.2" rx="0.6" fill={color} />
      ))}
    </g>
  );
  const Title: React.FC<{ x: number; y: number; color?: string; w?: number }> = ({
    x, y, color = accent, w = 12,
  }) => <rect x={x} y={y} width={w} height="2.2" rx="1" fill={color} />;

  const Avatar: React.FC<{ x: number; y: number; r?: number; square?: boolean; color?: string }> = ({
    x, y, r = 6, square, color = '#E2E8F0',
  }) =>
    square ? (
      <rect x={x - r} y={y - r} width={r * 2} height={r * 2 + 2} rx="1.5" fill={color} />
    ) : (
      <circle cx={x} cy={y} r={r} fill={color} />
    );

  // SVG 140×112，最大还原每个模板的主视觉
  switch (id) {
    case 'elegant': // 标准：大姓名左上 + 无头像 + 青小色条 + 横延长线
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#FFFFFF" />
          <rect x="10" y="10" width="30" height="5" rx="1" fill="#0F172A" />
          <rect x="10" y="20" width="72" height="1.6" rx="0.8" fill="#94A3B8" />
          {[38, 60, 82].map((y, i) => (
            <g key={i}>
              <rect x="10" y={y} width="6" height="1.6" rx="0.8" fill={accent} />
              <Title x={18} y={y - 0.5} color="#0F172A" w={16} />
              <rect x={36} y={y + 0.6} width={90} height={0.6} fill="#E2E8F0" />
              <Lines x={10} y={y + 6} w={118} n={3} gap={3} />
            </g>
          ))}
        </svg>
      );
    case 'modern': // 青蓝：头像右上 + 青色胶囊标题（淡底框+左侧色条）
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#FFFFFF" />
          <rect x="10" y="10" width="34" height="5" rx="1" fill="#0F172A" />
          <rect x="10" y="20" width="66" height="1.6" rx="0.8" fill="#94A3B8" />
          <rect x="114" y="8" width="16" height="20" rx="1" fill="#E2E8F0" />
          {[38, 62, 86].map((y, i) => (
            <g key={i}>
              <rect x={10} y={y} width={28} height={5} rx={1} fill="#E6F0F4" />
              <rect x={10} y={y} width={2} height={5} fill={accent} />
              <rect x={14} y={y + 1.2} width={14} height={2.4} rx="0.6" fill="#0F172A" />
              <Lines x={10} y={y + 8} w={118} n={2} gap={3} />
            </g>
          ))}
        </svg>
      );
    case 'classic': // 沉稳：深藏青顶栏 + 白姓名
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#FFFFFF" />
          <rect x="0" y="0" width="140" height="34" fill="#1F2A44" />
          <rect x="10" y="10" width="32" height="5" rx="1" fill="#FFFFFF" />
          <rect x="10" y="20" width="58" height="1.6" rx="0.8" fill="#CBD5E1" />
          <rect x="112" y="6" width="18" height="22" rx="1.5" fill="rgba(255,255,255,0.15)" />
          {[46, 70, 94].map((y, i) => (
            <g key={i}>
              <Title x={10} y={y} color="#0F172A" w={16} />
              <rect x={10} y={y + 3.2} width={118} height={0.6} fill="#E5E7EB" />
              <Lines x={10} y={y + 6} w={118} n={2} gap={3} />
            </g>
          ))}
        </svg>
      );
    case 'tech': // 湛青：顶部深青曲面 banner（无头像）
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#FFFFFF" />
          <path d="M0 0 H140 V16 Q70 30 0 16 Z" fill={accent} />
          <rect x="10" y="30" width="34" height="5" rx="1" fill="#0F172A" />
          <rect x="10" y="40" width="66" height="1.6" rx="0.8" fill="#94A3B8" />
          {[56, 78, 100].map((y, i) => (
            <g key={i}>
              <Title x={10} y={y} color="#0F172A" w={16} />
              <rect x={30} y={y + 1.3} width={98} height={0.6} fill="#CBD5E1" />
              <Lines x={10} y={y + 5} w={118} n={2} gap={3} />
            </g>
          ))}
        </svg>
      );
    case 'creative': // 幸运红：深红顶栏 + 白姓名 + 浮起的白圆角卡片
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#FDF5F5" />
          <rect x="0" y="0" width="140" height="36" fill={accent} />
          <rect x="10" y="10" width="32" height="5" rx="1" fill="#FFFFFF" />
          <rect x="10" y="20" width="56" height="1.6" rx="0.8" fill="rgba(255,255,255,0.8)" />
          <circle cx="118" cy="13" r="2.5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="124" cy="13" r="1" fill="#FFFFFF" />
          <circle cx="128" cy="13" r="1" fill="#FFFFFF" />
          <rect x="10" y="30" width="120" height="72" rx="3" fill="#FFFFFF" stroke="#FCDFE2" strokeWidth="0.5" />
          {[40, 62, 84].map((y, i) => (
            <g key={i}>
              <rect x={14} y={y} width={22} height={5} rx={2.5} fill={accent} />
              <rect x={18} y={y + 1.2} width={14} height={2.4} rx="0.6" fill="#FFFFFF" />
              <Lines x={14} y={y + 8} w={110} n={2} gap={3} />
            </g>
          ))}
        </svg>
      );
    case 'hello': // HELLO：深蓝实心左侧栏 + 右姓名
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#FFFFFF" />
          <rect x="0" y="0" width="46" height="112" fill="#1F4A8F" />
          <circle cx="12" cy="12" r="2.5" fill="rgba(255,255,255,0.2)" />
          <circle cx="12" cy="12" r="1" fill="#FFFFFF" />
          <rect x="18" y="10" width="22" height="2.6" rx="0.6" fill="#FFFFFF" />
          {[20, 32, 44, 56].map((y, i) => (
            <rect key={i} x="6" y={y} width={i % 2 === 0 ? 34 : 26} height="1.4" rx="0.7" fill="rgba(221,231,245,0.75)" />
          ))}
          <rect x="52" y="14" width="34" height="5" rx="1" fill="#0F172A" />
          <rect x="52" y="24" width="66" height="1.4" rx="0.7" fill="#94A3B8" />
          {[38, 60, 82].map((y, i) => (
            <g key={i}>
              <Title x={52} y={y} color="#0F172A" w={14} />
              <Lines x={52} y={y + 5} w={80} n={2} gap={3} />
            </g>
          ))}
        </svg>
      );
    case 'minimal': // 极简：居中姓名 + 无头像 + 黑加粗标题
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#FFFFFF" />
          <rect x="54" y="10" width="32" height="5" rx="1" fill="#0F172A" />
          <rect x="40" y="20" width="60" height="1.4" rx="0.7" fill="#94A3B8" />
          {[36, 60, 84].map((y, i) => (
            <g key={i}>
              <Title x={10} y={y} color="#0F172A" w={16} />
              <Lines x={10} y={y + 6} w={120} n={3} gap={3} />
            </g>
          ))}
        </svg>
      );
    case 'gradient': // 深蓝：深蓝顶栏 + 白姓名
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#FFFFFF" />
          <rect x="0" y="0" width="140" height="30" fill={accent} />
          <rect x="10" y="9" width="32" height="5" rx="1" fill="#FFFFFF" />
          <rect x="10" y="19" width="60" height="1.6" rx="0.8" fill="rgba(255,255,255,0.8)" />
          {[42, 64, 86].map((y, i) => (
            <g key={i}>
              <rect x={10} y={y} width={22} height={5} rx="1" fill={accent} />
              <rect x={13} y={y + 1.2} width={14} height={2.4} rx="0.6" fill="#FFFFFF" />
              <Lines x={10} y={y + 8} w={118} n={2} gap={3} />
            </g>
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 140 112" className="w-full h-full">
          <rect x="0" y="0" width="140" height="112" fill="#F8FAFC" />
          <rect x="0" y="0" width="140" height="3" fill={accent} />
        </svg>
      );
  }
};

/**
 * 模板缩略九宫格（简版，更多请切换大厅）
 */
const TemplateGrid: React.FC = () => {
  const { settings, setTemplate } = useResumeStore();
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-semibold text-gray-800">选择模版</h4>
        <span className="text-[11px] text-gray-400">共 {TEMPLATE_LIST.length} 套</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATE_LIST.map((tpl) => {
          const active = settings.templateId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => setTemplate(tpl.id as TemplateId)}
              className={`group relative rounded-xl overflow-hidden text-left bg-white border transition-all ${
                active
                  ? 'border-zp-primary shadow-[0_4px_14px_rgba(0,155,115,0.15)] ring-1 ring-zp-primary/30'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* 缩略图区域 —— 按模板类型绘制差异化 SVG 微缩预览 */}
              <div className="relative h-28 bg-white overflow-hidden border-b border-gray-100">
                <TemplateThumb id={tpl.id} accent={tpl.accent} />
              </div>

              {/* 文字区域 */}
              <div className="px-3 py-2 border-t border-gray-100">
                <p className={`text-[12px] font-medium truncate ${active ? 'text-zp-primary' : 'text-gray-800'}`}>
                  {tpl.name}
                </p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{tpl.desc}</p>
              </div>

              {/* 选中角标 */}
              {active && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-zp-primary text-white text-[10px] flex items-center justify-center shadow-sm">
                  ✓
                </span>
              )}
              {/* hover 遮罩小提示 */}
              {!active && (
                <span className="absolute inset-x-0 bottom-0 h-0 group-hover:h-6 bg-gradient-to-t from-black/5 to-transparent transition-all pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 页面布局：间距卡片 + 模块管理（可删可拖）
 */
const LayoutPage: React.FC = () => {
  const {
    settings,
    toggleOnePageMode,
    setFontSize,
    setLineHeight,
    setSectionGap,
    reorderSections,
    toggleSectionVisible,
  } = useResumeStore();

  const sortableKeys = (settings.sectionOrder || []).filter((k) => k !== 'personal');
  const hiddenSet = new Set(settings.hiddenSections || []);

  const handleDrag = (r: DropResult) => {
    if (!r.destination) return;
    const list = [...sortableKeys];
    const [moved] = list.splice(r.source.index, 1);
    list.splice(r.destination.index, 0, moved);
    reorderSections(list);
  };

  return (
    <div className="space-y-5">
      {/* 间距卡片 */}
      <section className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
        <h4 className="text-[13px] font-semibold text-gray-800 mb-3">间距</h4>
        <button
          onClick={toggleOnePageMode}
          className={`w-full py-2 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            settings.onePageMode
              ? 'border-zp-primary bg-emerald-50 text-zp-primary'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <FileText size={13} />
          一页模式
        </button>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] text-gray-600 mb-1">
            <span>字体大小</span>
            <span className="font-mono text-zp-primary">{settings.fontSize.toFixed(1)}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={16}
            step={0.5}
            value={settings.fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
            className="w-full accent-zp-primary cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>小</span>
            <span>标准</span>
            <span>大</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] text-gray-600 mb-1">
            <span>行高</span>
            <span className="font-mono text-zp-primary">{settings.lineHeight.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={1.2}
            max={2}
            step={0.05}
            value={settings.lineHeight}
            onChange={(e) => setLineHeight(parseFloat(e.target.value))}
            className="w-full accent-zp-primary cursor-pointer"
          />
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[12px] text-gray-600 mb-1">
            <span>模块间距</span>
            <span className="font-mono text-zp-primary">{settings.sectionGap}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={40}
            step={1}
            value={settings.sectionGap}
            onChange={(e) => setSectionGap(parseInt(e.target.value, 10))}
            className="w-full accent-zp-primary cursor-pointer"
          />
        </div>
      </section>

      {/* 模块管理 */}
      <section className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
        <h4 className="text-[13px] font-semibold text-gray-800 mb-3">模块管理</h4>

        {/* 基本信息固定项（禁删） */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-400 text-[13px] mb-1">
          <GripVertical size={14} className="opacity-30" />
          <span>基本信息</span>
          <span className="ml-auto text-[10px]">必填</span>
        </div>

        {/* 可拖列表 */}
        <DragDropContext onDragEnd={handleDrag}>
          <StrictModeDroppable droppableId="layout-sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                {sortableKeys.map((key, idx) => (
                  <Draggable key={key} draggableId={key} index={idx}>
                    {(dp, snap) => {
                      const hidden = hiddenSet.has(key);
                      return (
                        <div
                          ref={dp.innerRef}
                          {...dp.draggableProps}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] bg-white transition-all ${
                            snap.isDragging
                              ? 'shadow-lg border-zp-primary/60 bg-emerald-50/60'
                              : 'border-gray-100 hover:border-gray-200'
                          } ${hidden ? 'opacity-50' : ''}`}
                        >
                          <span
                            {...dp.dragHandleProps}
                            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical size={14} />
                          </span>
                          <span className="text-gray-700 flex-1">
                            {MODULE_LABELS[key] || key}
                          </span>
                          <button
                            onClick={() => toggleSectionVisible(key)}
                            className="p-1 text-gray-300 hover:text-red-500 rounded"
                            title={hidden ? '启用模块' : '删除模块（隐藏）'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      </section>
    </div>
  );
};

/**
 * 左栏主体
 */
export const PCLeftPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('edit');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 三段 Tab：充满整行，无底部分隔线 */}
      <div className="px-3 pt-3 pb-2 bg-white flex-shrink-0">
        <TabSegment value={tab} onChange={setTab} />
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-hidden bg-[#FAFBFA]">
        {tab === 'template' && (
          <div className="h-full overflow-y-auto p-4 scrollbar-thin">
            <TemplateGrid />
          </div>
        )}
        {tab === 'edit' && (
          <div className="h-full">
            <EditorPanel />
          </div>
        )}
        {tab === 'layout' && (
          <div className="h-full overflow-y-auto p-4 scrollbar-thin">
            <LayoutPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default PCLeftPanel;
