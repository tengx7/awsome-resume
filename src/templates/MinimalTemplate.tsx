import React from 'react';
import { ResumeData, ResumeSettings } from '../types/resume';
import { FONT_FAMILY_CSS } from './_utils';
import { EditableText } from '../components/editable/EditableText';
import { useResumeStore } from '../store/resumeStore';
import {
  useTemplateCtx,
  buildContentRenderers,
  visibleKeys,
} from './_common';

interface TemplateProps {
  data: ResumeData;
  settings: ResumeSettings;
}

/**
 * MinimalTemplate —— 「极简」
 * 对标 pdf_1：姓名居中 + 基本信息单行 + 纯黑模块标题（无装饰色条）+ bullet 列表。
 */
export const MinimalTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const ctx = useTemplateCtx(data, settings);
  const { personal } = data;
  const { fs, lh, gap } = ctx;
  const { updatePersonal } = useResumeStore();

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section style={{ marginBottom: `${gap}px` }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: fs(14), fontWeight: 800, color: '#0F172A' }}>
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
      padding: '22mm 22mm', boxSizing: 'border-box',
      fontFamily: FONT_FAMILY_CSS[settings.fontFamily],
      fontSize: fs(12), color: settings.colorTheme.text, lineHeight: lh,
    }}>
      {/* 姓名居中 */}
      <header style={{ textAlign: 'center', marginBottom: 20 }}>
        <EditableText as="h1" value={personal.name} placeholder="姓名"
          onCommit={(v) => updatePersonal({ name: v })}
          style={{ margin: 0, fontSize: fs(30), fontWeight: 800, color: '#0F172A',
            letterSpacing: 3, lineHeight: 1.1, display: 'block' }} />
        <div style={{ marginTop: 10, fontSize: fs(11.5), color: '#475569',
          display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px' }}>
          <span>男</span><span style={{ color: '#CBD5E1' }}>|</span>
          <span>生日：2026/01</span>
          {personal.phone && <><span style={{ color: '#CBD5E1' }}>|</span><span>{personal.phone}</span></>}
          {personal.email && <><span style={{ color: '#CBD5E1' }}>|</span><span>{personal.email}</span></>}
        </div>
      </header>

      {order.map((k) => renderers[k]?.())}
    </div>
  );
};