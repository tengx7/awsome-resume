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
 * GradientTemplate —— 「深蓝」
 * 对标 pdf_9：纯深蓝顶栏 + 白姓名 + 白底正文。与 Classic 近似但色调更蓝、顶栏更薄。
 */
export const GradientTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const ctx = useTemplateCtx(data, settings);
  const { personal } = data;
  const { fs, lh, gap } = ctx;
  const { updatePersonal } = useResumeStore();

  const bannerColor = '#1F4A8F'; // 深蓝（pdf_9）

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section style={{ marginBottom: `${gap}px` }}>
      <h2 style={{
        display: 'inline-block',
        margin: '0 0 10px 0', height: 26,
        fontSize: fs(13.5), fontWeight: 700, lineHeight: '26px',
        color: '#FFFFFF', background: bannerColor,
        padding: '0 14px', borderRadius: 4,
      }}>
        {title}
      </h2>
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
      <header style={{ background: bannerColor, color: '#FFFFFF', padding: '16mm 18mm 14mm' }}>
        <EditableText as="h1" value={personal.name} placeholder="姓名"
          onCommit={(v) => updatePersonal({ name: v })}
          style={{ margin: 0, fontSize: fs(30), fontWeight: 800, color: '#FFFFFF',
            letterSpacing: 2, lineHeight: 1.1, display: 'block' }} />
        <div style={{ marginTop: 10, fontSize: fs(11.5), color: 'rgba(255,255,255,0.85)',
          display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'center', lineHeight: 1.6 }}>
          <span>男</span><span style={{ opacity: 0.6 }}>|</span>
          <span>生日：2026/01</span>
          {personal.phone && <span style={{ whiteSpace: 'nowrap' }}>
            <CommonIcon type="phone" color="#FFFFFF" size={13} /><span style={{ marginLeft: 5 }}>{personal.phone}</span></span>}
        </div>
      </header>

      <main style={{ padding: '14mm 18mm 18mm 18mm' }}>
        {order.map((k) => renderers[k]?.())}
      </main>
    </div>
  );
};
