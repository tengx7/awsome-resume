import React from 'react';
import { TemplateId } from '../types/resume';
import { ResumeData, ResumeSettings } from '../types/resume';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { TechTemplate } from './TechTemplate';
import { ElegantTemplate } from './ElegantTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { HelloTemplate } from './HelloTemplate';
import { GradientTemplate } from './GradientTemplate';

/**
 * 模板列表 —— 当前启用的 8 套模板。
 */
export const TEMPLATE_LIST: {
  id: TemplateId;
  name: string;
  desc: string;
  category: 'basic' | 'classic' | 'modern' | 'pro';
  accent: string;
}[] = [
  { id: 'elegant',  name: '标准',   desc: '青色色条 · 无头像',       category: 'basic',   accent: '#1E5766' },
  { id: 'modern',   name: '青蓝',   desc: '胶囊标题 · 淡底框',       category: 'modern',  accent: '#2E86A6' },
  { id: 'classic',  name: '沉稳',   desc: '深藏青顶栏 · 白姓名',     category: 'classic', accent: '#1F2A44' },
  { id: 'tech',     name: '湛青',   desc: '深青曲面顶栏',            category: 'pro',     accent: '#1E5766' },
  { id: 'creative', name: '幸运红', desc: '深红顶栏 · 圆角白卡',     category: 'modern',  accent: '#A6192E' },
  { id: 'hello',    name: 'HELLO',  desc: '深蓝左栏 · 技能置左',     category: 'pro',     accent: '#1F4A8F' },
  { id: 'minimal',  name: '极简',   desc: '居中姓名 · 黑色标题',     category: 'classic', accent: '#0F172A' },
  { id: 'gradient', name: '深蓝',   desc: '深蓝顶栏 · 白姓名',       category: 'classic', accent: '#1F4A8F' },
];

interface TemplateRendererProps {
  data: ResumeData;
  settings: ResumeSettings;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ data, settings }) => {
  const templateMap: Record<TemplateId, React.FC<TemplateRendererProps>> = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    minimal: MinimalTemplate,
    tech: TechTemplate,
    elegant: ElegantTemplate,
    creative: CreativeTemplate,
    hello: HelloTemplate,
    gradient: GradientTemplate,
  };

  const Template = templateMap[settings.templateId] || ElegantTemplate;
  return <Template data={data} settings={settings} />;
};
