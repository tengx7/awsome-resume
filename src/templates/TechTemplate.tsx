import React from 'react';
import { ResumeData, ResumeSettings } from '../types/resume';
import { FONT_FAMILY_CSS } from './_utils';
import { EditableText } from '../components/editable/EditableText';
import { useResumeStore } from '../store/resumeStore';
import {
  useTemplateCtx,
  buildContentRenderers,
  visibleKeys,
  CommonIcon,
} from './_common';

interface TemplateProps {
  data: ResumeData;
  settings: ResumeSettings;
}

/**
 * TechTemplate —— 「湛青」
 * 对标 pdf_5：顶部深青曲面 banner（无头像）+ 下方正文 + 内容标题下加细线。
 */
export const TechTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const ctx = useTemplateCtx(data, settings);
  const { personal } = data;
  const { fs, lh, gap } = ctx;
  const { updatePersonal } = useResumeStore();

  const bannerColor = '#1E5766'; // 深青（参考 pdf_5）

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section style={{ marginBottom: `${gap}px` }}>
      <div style={{
        display: 'table', width: '100%', margin: '0 0 8px 0',
      }}>
        <h2 style={{
          display: 'table-cell', verticalAlign: 'middle',
          margin: 0, fontSize: fs(14), fontWeight: 700, color: '#0F172A',
          whiteSpace: 'nowrap', lineHeight: '24px', paddingRight: 10,
        }}>
          {title}
        </h2>
        <span style={{
          display: 'table-cell', verticalAlign: 'middle', width: '100%',
        }}>
          <span style={{ display: 'block', height: 1, background: '#CBD5E1' }} />
        </span>
      </div>
      {children}
    </section>
  );

  const renderers = buildContentRenderers(ctx, Section);
  const order = visibleKeys(ctx, Object.keys(renderers));

  return (
    <div id="resume-preview" style={{
      width: '210mm', minHeight: '297mm', background: '#FFFFFF',
      fontFamily: FONT_FAMILY_CSS[settings.fontFamily],
      fontSize: fs(12), color: settings.colorTheme.text, lineHeight: lh, boxSizing: 'border-box',
    }}>
      {/* 曲面青色顶栏 */}
      <header style={{ position: 'relative', height: 100 }}>
        <svg width="100%" height="100" viewBox="0 0 800 100" preserveAspectRatio="none"
          style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 100 }}>
          <path d="M0,0 L800,0 L800,70 Q400,105 0,70 Z" fill={bannerColor} />
        </svg>
      </header>

      <div style={{ padding: '0 18mm' }}>
        <div style={{ marginTop: -10, marginBottom: 16 }}>
          <EditableText as="h1" value={personal.name} placeholder="姓名"
            onCommit={(v) => updatePersonal({ name: v })}
            style={{ margin: 0, fontSize: fs(30), fontWeight: 800, color: '#0F172A',
              letterSpacing: 2, lineHeight: 1.1, display: 'block' }} />
          <div style={{ marginTop: 10, fontSize: fs(11.5), color: '#475569',
            display: 'flex', flexWrap: 'wrap', gap: '4px 18px', alignItems: 'center',
            lineHeight: 1.6 }}>
            {personal.phone && <span style={{ whiteSpace: 'nowrap' }}>
              男 | 生日：2026/01 <CommonIcon type="phone" color="#64748B" size={13} /><span style={{ marginLeft: 5 }}>{personal.phone}</span></span>}
            {personal.email && <span style={{ whiteSpace: 'nowrap' }}>
              <CommonIcon type="mail" color="#64748B" size={13} /><span style={{ marginLeft: 5 }}>{personal.email}</span></span>}
          </div>
        </div>
        <main style={{ paddingBottom: '16mm' }}>
          {order.map((k) => renderers[k]?.())}
        </main>
      </div>
    </div>
  );
};