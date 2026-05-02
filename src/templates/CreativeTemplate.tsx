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
 * CreativeTemplate —— 「幸运红」
 * 对标 pdf_6：深红顶栏 + 白姓名 + 右上角小圆点装饰 + 圆角白内容卡片。
 */
export const CreativeTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const ctx = useTemplateCtx(data, settings);
  const { personal } = data;
  const { fs, lh, gap } = ctx;
  const { updatePersonal } = useResumeStore();

  const bannerColor = '#A6192E'; // 深红（参考 PDF）
  const pageBg = '#FDF5F5';

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section style={{ marginBottom: `${gap}px` }}>
      <h2 style={{
        display: 'inline-block',
        margin: '0 0 10px 0', height: 26,
        fontSize: fs(13), fontWeight: 700, lineHeight: '26px',
        color: '#FFFFFF', background: bannerColor,
        padding: '0 14px', borderRadius: 999,
      }}>
        {title}
      </h2>
      <div style={{ paddingLeft: 2 }}>{children}</div>
    </section>
  );

  const renderers = buildContentRenderers(ctx, Section);
  const order = visibleKeys(ctx, Object.keys(renderers));

  // 右上角装饰小圆点
  const Dots = () => (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(255,255,255,0.65)', display: 'inline-block' }} />
      ))}
      <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.7)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
      </span>
    </div>
  );

  return (
    <div id="resume-preview" style={{
      width: '210mm', minHeight: '297mm', background: pageBg,
      fontFamily: FONT_FAMILY_CSS[settings.fontFamily],
      fontSize: fs(12), color: settings.colorTheme.text, lineHeight: lh, boxSizing: 'border-box',
    }}>
      {/* 顶部深红 banner */}
      <header style={{ background: bannerColor, color: '#FFFFFF', padding: '14mm 16mm 16mm', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, right: 16 }}><Dots /></div>
        <EditableText as="h1" value={personal.name} placeholder="姓名"
          onCommit={(v) => updatePersonal({ name: v })}
          style={{ margin: 0, fontSize: fs(30), fontWeight: 800, color: '#FFFFFF',
            letterSpacing: 2, lineHeight: 1.1, display: 'block' }} />
        <div style={{ marginTop: 10, fontSize: fs(11.5), color: 'rgba(255,255,255,0.85)',
          display: 'flex', flexWrap: 'wrap', gap: '4px 18px', alignItems: 'center', lineHeight: 1.6 }}>
          {personal.phone && <span>男 | {personal.phone}</span>}
          {personal.email && <span style={{ whiteSpace: 'nowrap' }}>
            <CommonIcon type="mail" color="#FFFFFF" size={13} /><span style={{ marginLeft: 5 }}>{personal.email}</span></span>}
        </div>
      </header>

      {/* 白色圆角主卡片 */}
      <div style={{
        margin: '-6mm 8mm 8mm 8mm', padding: '14mm 14mm 10mm 14mm',
        background: '#FFFFFF', borderRadius: 10, boxShadow: '0 1px 6px rgba(166,25,46,0.06)',
      }}>
        {order.map((k) => renderers[k]?.())}
      </div>
    </div>
  );
};
