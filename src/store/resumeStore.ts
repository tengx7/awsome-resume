import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ResumeData,
  ResumeSettings,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certificate,
  Language,
  CustomSection,
  ColorTheme,
  TemplateId,
  CustomPreset,
} from '../types/resume';
import { DEFAULT_RESUME_DATA, DEFAULT_SETTINGS } from '../data/defaults';

interface ResumeStore {
  data: ResumeData;
  settings: ResumeSettings;
  activeSection: string;
  setActiveSection: (section: string) => void;
  updatePersonal: (personal: Partial<ResumeData['personal']>) => void;
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, data: Partial<WorkExperience>) => void;
  deleteWorkExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  deleteEducation: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addCertificate: () => void;
  updateCertificate: (id: string, data: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, data: Partial<Language>) => void;
  deleteLanguage: (id: string) => void;
  addCustomSection: () => void;
  updateCustomSection: (id: string, data: Partial<CustomSection>) => void;
  deleteCustomSection: (id: string) => void;
  setTemplate: (templateId: TemplateId) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: ResumeSettings['fontFamily']) => void;
  toggleShowAvatar: () => void;
  setLineHeight: (lineHeight: number) => void;
  setSectionGap: (gap: number) => void;
  toggleOnePageMode: () => void;
  reorderSections: (sectionOrder: string[]) => void;
  toggleSectionVisible: (key: string) => void;
  renameSectionTitle: (key: string, title: string) => void;
  // 自定义预设
  presets: CustomPreset[];
  savePreset: (name: string) => void;
  applyPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  exportPresets: () => string;
  importPresets: (json: string) => { success: boolean; message: string };
  importData: (data: ResumeData) => void;
  resetToDefault: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      data: DEFAULT_RESUME_DATA,
      settings: DEFAULT_SETTINGS,
      presets: [],
      activeSection: 'personal',

      setActiveSection: (section) => set({ activeSection: section }),

      updatePersonal: (personal) =>
        set((state) => ({
          data: { ...state.data, personal: { ...state.data.personal, ...personal } },
        })),

      addWorkExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            workExperience: [
              ...state.data.workExperience,
              {
                id: generateId(),
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
                achievements: [],
              },
            ],
          },
        })),

      updateWorkExperience: (id, data) =>
        set((state) => ({
          data: {
            ...state.data,
            workExperience: state.data.workExperience.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          },
        })),

      deleteWorkExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            workExperience: state.data.workExperience.filter((item) => item.id !== id),
          },
        })),

      addEducation: () =>
        set((state) => ({
          data: {
            ...state.data,
            education: [
              ...state.data.education,
              {
                id: generateId(),
                school: '',
                degree: '',
                major: '',
                startDate: '',
                endDate: '',
                gpa: '',
                description: '',
              },
            ],
          },
        })),

      updateEducation: (id, data) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          },
        })),

      deleteEducation: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter((item) => item.id !== id),
          },
        })),

      addSkill: () =>
        set((state) => ({
          data: {
            ...state.data,
            skills: [
              ...state.data.skills,
              { id: generateId(), category: '', items: [] },
            ],
          },
        })),

      updateSkill: (id, data) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          },
        })),

      deleteSkill: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.filter((item) => item.id !== id),
          },
        })),

      addProject: () =>
        set((state) => ({
          data: {
            ...state.data,
            projects: [
              ...state.data.projects,
              {
                id: generateId(),
                name: '',
                role: '',
                startDate: '',
                endDate: '',
                description: '',
                technologies: [],
                link: '',
              },
            ],
          },
        })),

      updateProject: (id, data) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          },
        })),

      deleteProject: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.filter((item) => item.id !== id),
          },
        })),

      addCertificate: () =>
        set((state) => ({
          data: {
            ...state.data,
            certificates: [
              ...state.data.certificates,
              { id: generateId(), name: '', issuer: '', date: '', link: '' },
            ],
          },
        })),

      updateCertificate: (id, data) =>
        set((state) => ({
          data: {
            ...state.data,
            certificates: state.data.certificates.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          },
        })),

      deleteCertificate: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            certificates: state.data.certificates.filter((item) => item.id !== id),
          },
        })),

      addLanguage: () =>
        set((state) => ({
          data: {
            ...state.data,
            languages: [
              ...state.data.languages,
              { id: generateId(), name: '', level: '' },
            ],
          },
        })),

      updateLanguage: (id, data) =>
        set((state) => ({
          data: {
            ...state.data,
            languages: state.data.languages.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          },
        })),

      deleteLanguage: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            languages: state.data.languages.filter((item) => item.id !== id),
          },
        })),

      addCustomSection: () =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: [
              ...state.data.customSections,
              { id: generateId(), title: '自定义模块', content: '' },
            ],
          },
        })),

      updateCustomSection: (id, data) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((item) =>
              item.id === id ? { ...item, ...data } : item
            ),
          },
        })),

      deleteCustomSection: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.filter((item) => item.id !== id),
          },
        })),

      setTemplate: (templateId) =>
        set((state) => ({
          settings: { ...state.settings, templateId },
        })),

      setColorTheme: (colorTheme) =>
        set((state) => ({
          settings: { ...state.settings, colorTheme },
        })),

      setFontSize: (fontSize) =>
        set((state) => ({
          settings: { ...state.settings, fontSize },
        })),

      setFontFamily: (fontFamily) =>
        set((state) => ({
          settings: { ...state.settings, fontFamily },
        })),

      toggleShowAvatar: () =>
        set((state) => ({
          settings: { ...state.settings, showAvatar: !state.settings.showAvatar },
        })),

      setLineHeight: (lineHeight) =>
        set((state) => ({
          settings: { ...state.settings, lineHeight },
        })),

      setSectionGap: (sectionGap) =>
        set((state) => ({
          settings: { ...state.settings, sectionGap },
        })),

      toggleOnePageMode: () =>
        set((state) => ({
          settings: { ...state.settings, onePageMode: !state.settings.onePageMode },
        })),

      reorderSections: (sectionOrder) =>
        set((state) => ({
          settings: { ...state.settings, sectionOrder },
        })),

      toggleSectionVisible: (key) =>
        set((state) => {
          const hidden = state.settings.hiddenSections || [];
          const next = hidden.includes(key)
            ? hidden.filter((k) => k !== key)
            : [...hidden, key];
          return { settings: { ...state.settings, hiddenSections: next } };
        }),

      renameSectionTitle: (key, title) =>
        set((state) => {
          const titles = { ...(state.settings.sectionTitles || {}) };
          if (title.trim()) titles[key] = title.trim();
          else delete titles[key];
          return { settings: { ...state.settings, sectionTitles: titles } };
        }),

      savePreset: (name) =>
        set((state) => {
          const preset: CustomPreset = {
            id: generateId(),
            name: name.trim() || `自定义预设 ${(state.presets?.length || 0) + 1}`,
            createdAt: Date.now(),
            settings: {
              templateId: state.settings.templateId,
              colorTheme: state.settings.colorTheme,
              fontSize: state.settings.fontSize,
              fontFamily: state.settings.fontFamily,
              showAvatar: state.settings.showAvatar,
              pageFormat: state.settings.pageFormat,
              lineHeight: state.settings.lineHeight,
              sectionGap: state.settings.sectionGap,
              onePageMode: state.settings.onePageMode,
              sectionOrder: [...(state.settings.sectionOrder || [])],
              hiddenSections: [...(state.settings.hiddenSections || [])],
              sectionTitles: { ...(state.settings.sectionTitles || {}) },
            },
          };
          return { presets: [...(state.presets || []), preset] };
        }),

      applyPreset: (id) =>
        set((state) => {
          const preset = (state.presets || []).find((p) => p.id === id);
          if (!preset) return {} as any;
          return {
            settings: {
              ...state.settings,
              ...preset.settings,
              sectionOrder: [...preset.settings.sectionOrder],
              hiddenSections: [...preset.settings.hiddenSections],
              sectionTitles: { ...preset.settings.sectionTitles },
            },
          };
        }),

      deletePreset: (id) =>
        set((state) => ({
          presets: (state.presets || []).filter((p) => p.id !== id),
        })),

      exportPresets: () => {
        const { presets } = get();
        return JSON.stringify({ version: 1, presets: presets || [] }, null, 2);
      },

      importPresets: (json) => {
        try {
          const parsed = JSON.parse(json);
          const list = Array.isArray(parsed) ? parsed : parsed?.presets;
          if (!Array.isArray(list)) {
            return { success: false, message: 'JSON 格式不正确：缺少 presets 数组' };
          }
          // 简单校验
          const valid: CustomPreset[] = [];
          for (const item of list) {
            if (item && item.settings && item.settings.templateId && item.settings.colorTheme) {
              valid.push({
                id: item.id || generateId(),
                name: item.name || '未命名预设',
                createdAt: item.createdAt || Date.now(),
                settings: item.settings,
              });
            }
          }
          if (valid.length === 0) {
            return { success: false, message: '没有有效的预设可导入' };
          }
          set((state) => ({ presets: [...(state.presets || []), ...valid] }));
          return { success: true, message: `成功导入 ${valid.length} 个预设` };
        } catch (e) {
          return { success: false, message: 'JSON 解析失败，请检查格式' };
        }
      },

      importData: (data) => set({ data }),

      resetToDefault: () =>
        set({ data: DEFAULT_RESUME_DATA, settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'resume-storage',
      // 兼容旧版：fontSize 从字符串枚举迁移为数字
      migrate: (persistedState: any) => {
        if (!persistedState) return persistedState;
        const s = persistedState.settings || {};
        if (typeof s.fontSize === 'string') {
          const map: Record<string, number> = { small: 11, medium: 12, large: 13 };
          s.fontSize = map[s.fontSize] ?? 12;
        }
        if (!Array.isArray(s.hiddenSections)) s.hiddenSections = [];
        if (!s.sectionTitles || typeof s.sectionTitles !== 'object') s.sectionTitles = {};
        // v3 新增字段：行高 / 模块间距 / 一页模式
        if (typeof s.lineHeight !== 'number') s.lineHeight = 1.6;
        if (typeof s.sectionGap !== 'number') s.sectionGap = 22;
        if (typeof s.onePageMode !== 'boolean') s.onePageMode = false;
        persistedState.settings = s;
        if (!Array.isArray(persistedState.presets)) persistedState.presets = [];
        return persistedState;
      },
      version: 3,
    }
  )
);
