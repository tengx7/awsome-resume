import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Languages,
  LayoutDashboard,
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProps,
} from 'react-beautiful-dnd';
import { useResumeStore } from '../../store/resumeStore';
import { PersonalForm } from './PersonalForm';
import { WorkExperienceForm } from './WorkExperienceForm';
import { EducationForm } from './EducationForm';
import { SkillsForm } from './SkillsForm';
import { ProjectsForm } from './ProjectsForm';
import { CertificatesForm, LanguagesForm, CustomSectionsForm } from './OtherForms';

/**
 * 兼容 React 18 StrictMode 的 Droppable 包装组件。
 */
const StrictModeDroppable: React.FC<DroppableProps> = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

interface SectionMeta {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  form: React.FC;
}

// personal 单独配置，始终固定在顶部（不参与拖拽排序）
const PERSONAL_SECTION: SectionMeta = {
  key: 'personal',
  label: '基础信息',
  icon: User,
  form: PersonalForm,
};

// 可排序模块（顺序参考图2：教育/工作/项目/个人优势/技能/证书/语言/自定义）
const SORTABLE_SECTIONS: SectionMeta[] = [
  { key: 'education', label: '教育经历', icon: GraduationCap, form: EducationForm },
  { key: 'workExperience', label: '工作经历', icon: Briefcase, form: WorkExperienceForm },
  { key: 'projects', label: '项目经历', icon: FolderGit2, form: ProjectsForm },
  { key: 'skills', label: '掌握技能', icon: Code2, form: SkillsForm },
  { key: 'certificates', label: '证书荣誉', icon: Award, form: CertificatesForm },
  { key: 'languages', label: '语言能力', icon: Languages, form: LanguagesForm },
  { key: 'customSections', label: '自定义模块', icon: LayoutDashboard, form: CustomSectionsForm },
];

/**
 * 单个折叠模块卡片
 */
const CollapsibleSection: React.FC<{
  section: SectionMeta;
  expanded: boolean;
  onToggle: () => void;
  displayLabel: string;
  onRenameCommit?: (newLabel: string) => void;
  hidden?: boolean;
  onToggleHidden?: () => void;
  draggable?: boolean;
  dragHandleProps?: any;
}> = ({
  section,
  expanded,
  onToggle,
  displayLabel,
  onRenameCommit,
  hidden,
  onToggleHidden,
  draggable,
  dragHandleProps,
}) => {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(displayLabel);
  const Form = section.form;

  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(displayLabel);
    setRenaming(true);
  };
  const commit = () => {
    onRenameCommit?.(draft.trim());
    setRenaming(false);
  };

  return (
    <section
      className={`bg-white rounded-lg border border-gray-100 transition-all ${
        hidden ? 'opacity-60' : ''
      }`}
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}
    >
      {/* 头部：点击整个头部展开/收起 */}
      <div
        onClick={onToggle}
        className="group flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
      >
        {draggable && (
          <span
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
            title="拖动排序"
          >
            <GripVertical size={14} />
          </span>
        )}

        {renaming ? (
          <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setRenaming(false);
              }}
              onBlur={commit}
              className="flex-1 px-2 py-1 text-[14px] font-semibold text-gray-800 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={commit}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
            >
              <Check size={12} />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setRenaming(false)}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <h3 className="flex-1 text-[13px] font-semibold text-gray-800 truncate">
              {displayLabel}
            </h3>

            {/* hover 出现的小操作 */}
            {onRenameCommit && (
              <button
                onClick={startRename}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-opacity"
                title="重命名"
              >
                <Pencil size={12} />
              </button>
            )}
            {onToggleHidden && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHidden();
                }}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                  hidden
                    ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                    : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                }`}
                title={hidden ? '在简历中显示' : '在简历中隐藏'}
              >
                {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            )}

            {/* 折叠箭头 */}
            <span className="text-gray-400">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </>
        )}
      </div>

      {/* 内容 */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2.5">
          <Form />
        </div>
      )}
    </section>
  );
};

export const EditorPanel: React.FC = () => {
  const {
    settings,
    reorderSections,
    toggleSectionVisible,
    renameSectionTitle,
  } = useResumeStore();

  // 展开集合：默认全部展开
  const [expandedSet, setExpandedSet] = useState<Set<string>>(
    () => new Set(['personal', ...SORTABLE_SECTIONS.map((s) => s.key)]),
  );

  const toggleExpand = (key: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const orderedSortableSections = useMemo<SectionMeta[]>(() => {
    const keyToSection = SORTABLE_SECTIONS.reduce<Record<string, SectionMeta>>(
      (acc, s) => ({ ...acc, [s.key]: s }),
      {},
    );
    const seen = new Set<string>();
    const result: SectionMeta[] = [];
    (settings.sectionOrder || []).forEach((key) => {
      if (keyToSection[key] && !seen.has(key)) {
        result.push(keyToSection[key]);
        seen.add(key);
      }
    });
    SORTABLE_SECTIONS.forEach((s) => {
      if (!seen.has(s.key)) result.push(s);
    });
    return result;
  }, [settings.sectionOrder]);

  const getDisplayLabel = (section: SectionMeta): string => {
    const custom = settings.sectionTitles?.[section.key];
    return custom && custom.trim() ? custom : section.label;
  };

  const isHidden = (key: string) => (settings.hiddenSections || []).includes(key);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const newOrder = orderedSortableSections.map((s) => s.key);
    const [moved] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, moved);
    reorderSections(newOrder);
  };

  return (
    <div className="h-full overflow-y-auto px-2.5 py-2.5 space-y-2 bg-[#FAFBFA] scrollbar-thin">
      {/* 基础信息：固定置顶、不可拖拽、不可隐藏 */}
      <CollapsibleSection
        section={PERSONAL_SECTION}
        expanded={expandedSet.has(PERSONAL_SECTION.key)}
        onToggle={() => toggleExpand(PERSONAL_SECTION.key)}
        displayLabel={getDisplayLabel(PERSONAL_SECTION)}
      />

      {/* 可拖拽排序模块 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="editor-sections-v2">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {orderedSortableSections.map((section, index) => (
                <Draggable key={section.key} draggableId={section.key} index={index}>
                  {(dp, snap) => (
                    <div
                      ref={dp.innerRef}
                      {...dp.draggableProps}
                      style={{
                        ...dp.draggableProps.style,
                        // 拖拽时给个清晰的阴影
                        boxShadow: snap.isDragging
                          ? '0 10px 24px rgba(15,23,42,0.12)'
                          : undefined,
                        borderRadius: 12,
                      }}
                    >
                      <CollapsibleSection
                        section={section}
                        expanded={expandedSet.has(section.key)}
                        onToggle={() => toggleExpand(section.key)}
                        displayLabel={getDisplayLabel(section)}
                        hidden={isHidden(section.key)}
                        onToggleHidden={() => toggleSectionVisible(section.key)}
                        onRenameCommit={(label) => {
                          const orig = SORTABLE_SECTIONS.find((s) => s.key === section.key)
                            ?.label || '';
                          renameSectionTitle(section.key, label === orig ? '' : label);
                        }}
                        draggable
                        dragHandleProps={dp.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>
      </DragDropContext>

      {/* 底部操作提示 */}
      <p className="text-[10px] text-gray-400 text-center py-2">
        拖动 <GripVertical size={10} className="inline align-text-bottom" /> 调整模块顺序 ·
        悬停可 <Pencil size={10} className="inline align-text-bottom mx-0.5" /> 改名 ·
        <Eye size={10} className="inline align-text-bottom mx-0.5" /> 显隐
      </p>
    </div>
  );
};