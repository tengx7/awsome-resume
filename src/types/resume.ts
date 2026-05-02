export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  avatar: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  languages: Language[];
  customSections: CustomSection[];
}

export type TemplateId =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'creative'
  | 'tech'
  | 'elegant'
  | 'hello'
  | 'gradient';

export type FontFamily =
  | 'sans'
  | 'serif'
  | 'mono'
  | 'inter'
  | 'georgia'
  | 'system'
  | 'pingfang'
  | 'songti'
  | 'kaiti';

export type ColorTheme = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
};

export interface ResumeSettings {
  templateId: TemplateId;
  colorTheme: ColorTheme;
  /** 基准字号，单位 px。默认 12，范围 10~18，步进 0.5。模板内部按比例缩放 */
  fontSize: number;
  fontFamily: FontFamily;
  showAvatar: boolean;
  pageFormat: 'A4' | 'Letter';
  sectionOrder: string[];
  /** 被隐藏的模块 key 列表（不参与渲染，但仍然保留在 sectionOrder 中保持位置） */
  hiddenSections: string[];
  /** 自定义栏目标题：key -> 用户自定义的显示名 */
  sectionTitles: Record<string, string>;
  /** 行高倍率，范围 1.2 ~ 2.0，默认 1.6（"行高"滑块） */
  lineHeight: number;
  /** 模块之间的垂直间距，单位 px，默认 22（"模块间距"滑块） */
  sectionGap: number;
  /** 是否强制压缩为一页（启用时渲染层会尝试使用更紧凑的行高/模块间距） */
  onePageMode: boolean;
}

/** 自定义模板预设：一份完整的外观配置快照 */
export interface CustomPreset {
  id: string;
  name: string;
  createdAt: number;
  settings: Omit<ResumeSettings, 'sectionOrder' | 'hiddenSections' | 'sectionTitles'> & {
    sectionOrder: string[];
    hiddenSections: string[];
    sectionTitles: Record<string, string>;
  };
}

export type SectionKey =
  | 'personal'
  | 'workExperience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certificates'
  | 'languages'
  | 'customSections';
