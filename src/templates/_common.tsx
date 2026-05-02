import React from 'react';
import { ResumeData, ResumeSettings } from '../types/resume';
import { EditableText } from '../components/editable/EditableText';
import { useResumeStore } from '../store/resumeStore';
import { makeFsScaler, getSectionTitle, getVisibleOrderedKeys } from './_utils';

export interface TemplateCtx {
  data: ResumeData;
  settings: ResumeSettings;
  /** 主题色（允许模板覆盖 colorTheme.primary） */
  primary: string;
  /** 字号缩放器 */
  fs: (n: number) => string;
  /** 最终行高（考虑一页模式） */
  lh: number;
  /** 最终模块间距（考虑一页模式） */
  gap: number;
}

/** SVG 细描边图标 */
export const CommonIcon: React.FC<{ type: string; size?: number; color?: string }> = ({
  type,
  size = 12,
  color = '#6B7280',
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { flexShrink: 0, verticalAlign: 'middle', display: 'inline-block' },
  };
  switch (type) {
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'link':
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'graduation':
      return (
        <svg {...common}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case 'folder':
      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'lang':
      return (
        <svg {...common}>
          <path d="M5 8h14M9 4v4M12 4c-3 4-3 10 0 14M12 4c3 4 3 10 0 14" />
          <circle cx="12" cy="11" r="9" />
        </svg>
      );
    case 'award':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="6" />
          <path d="m8.21 13.89-1.21 7.11 5-3 5 3-1.21-7.12" />
        </svg>
      );
    default:
      return null;
  }
};

/** 行内联系方式（小图标 + 文本）—— 不用 flex，用 inline + vertical-align 确保 PDF 导出一致 */
export const InfoInline: React.FC<{
  icon: string;
  children: React.ReactNode;
  color?: string;
  iconColor?: string;
  fontSize?: string | number;
}> = ({ icon, children, color = '#475569', iconColor, fontSize }) => (
  <span
    style={{
      display: 'inline',
      color,
      fontSize,
      whiteSpace: 'nowrap',
    }}
  >
    <CommonIcon type={icon} color={iconColor || color} size={parseFloat(String(fontSize || 12))} />
    <span style={{ marginLeft: 6 }}>{children}</span>
  </span>
);

/** 构造上下文 */
export const useTemplateCtx = (
  data: ResumeData,
  settings: ResumeSettings,
  primary?: string,
): TemplateCtx => {
  const fs = makeFsScaler(settings.fontSize);
  const lh = settings.onePageMode ? Math.min(settings.lineHeight, 1.45) : settings.lineHeight;
  const gap = settings.onePageMode ? Math.min(settings.sectionGap, 16) : settings.sectionGap;
  return {
    data,
    settings,
    primary: primary || settings.colorTheme.primary,
    fs,
    lh,
    gap,
  };
};

/**
 * 统一导出的"内容渲染器" —— 只负责把 summary/work/edu/... 这类主体模块渲染出来。
 * 不同模板通过自定义 Section 头部样式复用。
 */
export const buildContentRenderers = (
  ctx: TemplateCtx,
  Section: React.FC<{ title: string; children: React.ReactNode; iconKey?: string }>,
): Record<string, () => React.ReactNode> => {
  const { data, settings, fs, lh } = ctx;
  const {
    personal, workExperience, education, skills, projects, certificates, languages, customSections,
  } = data;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const store = useResumeStore.getState();
  const {
    updatePersonal,
    updateWorkExperience,
    updateEducation,
    updateProject,
    updateCustomSection,
  } = store;

  const bold = { fontWeight: 700, color: '#0F172A' };
  const muted = { color: '#94A3B8' };
  const text = { color: '#475569' };

  return {
    summary: () =>
      personal.summary && (
        <Section key="summary" iconKey="star" title={getSectionTitle(settings, 'summary', '个人优势')}>
          <EditableText
            as="p"
            multiline
            value={personal.summary}
            placeholder="个人优势（点击编辑）"
            onCommit={(v) => updatePersonal({ summary: v })}
            style={{
              margin: 0, fontSize: fs(12), color: '#334155',
              lineHeight: lh, whiteSpace: 'pre-wrap', display: 'block',
            }}
          />
        </Section>
      ),
    workExperience: () =>
      workExperience.length > 0 && (
        <Section key="workExperience" iconKey="briefcase" title={getSectionTitle(settings, 'workExperience', '工作经历')}>
          {workExperience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                  <EditableText value={exp.company} placeholder="公司名称"
                    onCommit={(v) => updateWorkExperience(exp.id, { company: v })}
                    style={{ fontSize: fs(13), ...bold }} />
                  <EditableText value={exp.position} placeholder="职位"
                    onCommit={(v) => updateWorkExperience(exp.id, { position: v })}
                    style={{ fontSize: fs(12), color: '#334155', fontWeight: 500 }} />
                </div>
                <span style={{ fontSize: fs(11), ...muted, whiteSpace: 'nowrap' }}>
                  <EditableText value={exp.startDate} placeholder="开始"
                    onCommit={(v) => updateWorkExperience(exp.id, { startDate: v })} />
                  {'-'}
                  {exp.current ? '至今' : (
                    <EditableText value={exp.endDate} placeholder="结束"
                      onCommit={(v) => updateWorkExperience(exp.id, { endDate: v })} />
                  )}
                </span>
              </div>
              {exp.description && (
                <>
                  <p style={{ margin: '0 0 3px 0', fontSize: fs(11.5), fontWeight: 600, color: '#334155' }}>工作内容：</p>
                  <EditableText as="p" multiline value={exp.description} placeholder="工作描述"
                    onCommit={(v) => updateWorkExperience(exp.id, { description: v })}
                    style={{ margin: '0 0 6px 0', fontSize: fs(11.5), ...text, lineHeight: lh, whiteSpace: 'pre-wrap', display: 'block' }} />
                </>
              )}
              {exp.achievements?.length > 0 && (
                <>
                  <p style={{ margin: '2px 0 3px 0', fontSize: fs(11.5), fontWeight: 600, color: '#334155' }}>工作业绩：</p>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: fs(11.5), lineHeight: lh, ...text }}>
                    {exp.achievements.map((a, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>
                        <EditableText value={a} placeholder="成就条目"
                          onCommit={(v) => {
                            const next = [...exp.achievements];
                            if (v.trim()) next[i] = v;
                            else next.splice(i, 1);
                            updateWorkExperience(exp.id, { achievements: next });
                          }} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </Section>
      ),
    education: () =>
      education.length > 0 && (
        <Section key="education" iconKey="graduation" title={getSectionTitle(settings, 'education', '教育经历')}>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                  <EditableText value={edu.school} placeholder="学校"
                    onCommit={(v) => updateEducation(edu.id, { school: v })}
                    style={{ fontSize: fs(13), ...bold }} />
                  <span style={{ fontSize: fs(11.5), ...text }}>
                    <EditableText value={edu.degree} placeholder="学历"
                      onCommit={(v) => updateEducation(edu.id, { degree: v })} />
                    {edu.major && (
                      <>
                        {'  '}
                        <EditableText value={edu.major} placeholder="专业"
                          onCommit={(v) => updateEducation(edu.id, { major: v })} />
                      </>
                    )}
                  </span>
                </div>
                <span style={{ fontSize: fs(11), ...muted, whiteSpace: 'nowrap' }}>
                  <EditableText value={edu.startDate} placeholder="入学"
                    onCommit={(v) => updateEducation(edu.id, { startDate: v })} />
                  {'-'}
                  <EditableText value={edu.endDate} placeholder="毕业"
                    onCommit={(v) => updateEducation(edu.id, { endDate: v })} />
                </span>
              </div>
              {edu.gpa && <p style={{ margin: '3px 0', fontSize: fs(11), color: '#64748B' }}>GPA：{edu.gpa}</p>}
              {edu.description && (
                <EditableText as="p" multiline value={edu.description} placeholder="荣誉、核心课程"
                  onCommit={(v) => updateEducation(edu.id, { description: v })}
                  style={{ margin: '4px 0 0 0', fontSize: fs(11.5), ...text, lineHeight: lh, whiteSpace: 'pre-wrap', display: 'block' }} />
              )}
            </div>
          ))}
        </Section>
      ),
    skills: () =>
      skills.length > 0 && (
        <Section key="skills" iconKey="star" title={getSectionTitle(settings, 'skills', '专业技能')}>
          {skills.map((s) => (
            <div key={s.id} style={{ marginBottom: '6px', fontSize: fs(11.5), lineHeight: lh }}>
              <span style={{ ...bold }}>{s.category}：</span>
              <span style={text}>{s.items.join(' · ')}</span>
            </div>
          ))}
        </Section>
      ),
    projects: () =>
      projects.length > 0 && (
        <Section key="projects" iconKey="folder" title={getSectionTitle(settings, 'projects', '项目经历')}>
          {projects.map((p) => (
            <div key={p.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                  <EditableText value={p.name} placeholder="项目名称"
                    onCommit={(v) => updateProject(p.id, { name: v })}
                    style={{ fontSize: fs(13), ...bold }} />
                  {p.role && (
                    <EditableText value={p.role} placeholder="角色"
                      onCommit={(v) => updateProject(p.id, { role: v })}
                      style={{ fontSize: fs(12), color: '#334155' }} />
                  )}
                </div>
                <span style={{ fontSize: fs(11), ...muted, whiteSpace: 'nowrap' }}>
                  {p.startDate}{p.startDate && p.endDate ? '-' : ''}{p.endDate}
                </span>
              </div>
              {p.description && (
                <>
                  <p style={{ margin: '0 0 3px 0', fontSize: fs(11.5), fontWeight: 600, color: '#334155' }}>项目内容：</p>
                  <EditableText as="p" multiline value={p.description} placeholder="项目描述"
                    onCommit={(v) => updateProject(p.id, { description: v })}
                    style={{ margin: '0 0 4px 0', fontSize: fs(11.5), ...text, lineHeight: lh, whiteSpace: 'pre-wrap', display: 'block' }} />
                </>
              )}
              {p.technologies?.length > 0 && (
                <p style={{ margin: '2px 0 0 0', fontSize: fs(10.5), color: '#64748B' }}>
                  技术栈：{p.technologies.join(' / ')}
                </p>
              )}
            </div>
          ))}
        </Section>
      ),
    certificates: () =>
      certificates.length > 0 && (
        <Section key="certificates" iconKey="award" title={getSectionTitle(settings, 'certificates', '证书荣誉')}>
          {certificates.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs(11.5), marginBottom: '4px', lineHeight: lh }}>
              <span>
                <span style={bold}>{c.name}</span>
                {c.issuer && <span style={{ color: '#64748B' }}> — {c.issuer}</span>}
              </span>
              <span style={muted}>{c.date}</span>
            </div>
          ))}
        </Section>
      ),
    languages: () =>
      languages.length > 0 && (
        <Section key="languages" iconKey="lang" title={getSectionTitle(settings, 'languages', '语言能力')}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: fs(11.5) }}>
            {languages.map((l) => (
              <span key={l.id}>
                <span style={bold}>{l.name}</span>
                <span style={{ color: '#64748B' }}> · {l.level}</span>
              </span>
            ))}
          </div>
        </Section>
      ),
    customSections: () =>
      customSections.length > 0 && (
        <React.Fragment key="customSections">
          {customSections.map((s) => (
            <Section key={s.id} title={s.title}>
              <EditableText as="p" multiline value={s.content} placeholder="自定义内容..."
                onCommit={(v) => updateCustomSection(s.id, { content: v })}
                style={{ margin: 0, fontSize: fs(11.5), lineHeight: lh, whiteSpace: 'pre-wrap', ...text, display: 'block' }} />
            </Section>
          ))}
        </React.Fragment>
      ),
  };
};

export const visibleKeys = (ctx: TemplateCtx, all: string[]) =>
  getVisibleOrderedKeys(ctx.settings, all);
