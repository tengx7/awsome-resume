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
 * ClassicTemplate —— 「沉稳」
 * 对标 pdf_7：深藏青顶栏 + 白色姓名 + 极简白底正文。
 */
export const ClassicTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const ctx = useTemplateCtx(data, settings);
  const { personal } = data;
  const { fs, lh, gap } = ctx;
  const { updatePersonal } = useResumeStore();

  const bannerColor = '#1F2A44'; // 深藏青

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section style={{ marginBottom: `${gap}px` }}>
      <h2 style={{
        margin: '0 0 10px 0', fontSize: fs(14), fontWeight: 700, color: '#0F172A',
        lineHeight: 1, paddingTop: 2, paddingBottom: 8,
        borderBottom: '1px solid #E5E7EB',
      }}>
        <span style={{ display: 'inline-block', lineHeight: 1 }}>{title}</span>
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
      {/* 深色顶栏 */}
      <header style={{ background: bannerColor, color: '#FFFFFF', padding: '18mm 18mm 14mm' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <EditableText as="h1" value={personal.name} placeholder="姓名"
              onCommit={(v) => updatePersonal({ name: v })}
              style={{ margin: 0, fontSize: fs(30), fontWeight: 800, color: '#FFFFFF',
                letterSpacing: 2, lineHeight: 1.1, display: 'block' }} />
            <div style={{ marginTop: 10, fontSize: fs(11.5), color: '#CBD5E1',
              display: 'flex', flexWrap: 'wrap', gap: '4px 16px', alignItems: 'center', lineHeight: 1.6 }}>
              {personal.phone && <span style={{ whiteSpace: 'nowrap' }}>
                <CommonIcon type="phone" color="#CBD5E1" size={13} /><span style={{ marginLeft: 5 }}>{personal.phone}</span></span>}
              {personal.email && <span style={{ whiteSpace: 'nowrap' }}>
                <CommonIcon type="mail" color="#CBD5E1" size={13} /><span style={{ marginLeft: 5 }}>{personal.email}</span></span>}
              {personal.location && <span style={{ whiteSpace: 'nowrap' }}>
                <CommonIcon type="pin" color="#CBD5E1" size={13} /><span style={{ marginLeft: 5 }}>{personal.location}</span></span>}
            </div>
            <div style={{ marginTop: 6, fontSize: fs(11), color: '#94A3B8' }}>
              {[
                personal.title && `求职意向：${personal.title}`,
                personal.location && `期望城市：${personal.location}`,
              ].filter(Boolean).join(' | ')}
            </div>
          </div>
          {settings.showAvatar && personal.avatar && (
            <img src={personal.avatar} alt={personal.name}
              style={{ width: 80, height: 100, borderRadius: 4, objectFit: 'cover',
                flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }} />
          )}
        </div>
      </header>

      <main style={{ padding: '12mm 18mm 20mm 18mm' }}>
        {order.map((k) => renderers[k]?.())}
      </main>
    </div>
  );
};