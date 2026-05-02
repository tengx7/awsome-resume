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
 * ElegantTemplate —— 「标准」
 * 对标 pdf_4：姓名左上 + 无头像 + 青色胶囊标题（左小色条 + 黑色文字）。
 */
export const ElegantTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const ctx = useTemplateCtx(data, settings);
  const { personal } = data;
  const { fs, lh, gap, primary } = ctx;
  const { updatePersonal } = useResumeStore();

  /** 标题 —— 文字 + 右侧延伸灰线
   * 方案：用 display:table 布局（html2canvas 对 table 支持最稳定），
   * 左 cell 放文字，右 cell 放灰线，vertical-align:middle 让两者垂直居中。
   */
  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section style={{ marginBottom: `${gap}px` }}>
      <div style={{
        display: 'table', width: '100%', marginBottom: 10,
      }}>
        <h2 style={{
          display: 'table-cell', verticalAlign: 'middle',
          margin: 0, fontSize: fs(14.5), fontWeight: 800, color: '#0F172A',
          letterSpacing: 1, whiteSpace: 'nowrap', lineHeight: '26px',
          paddingRight: 12,
        }}>
          {title}
        </h2>
        <span style={{
          display: 'table-cell', verticalAlign: 'middle',
          width: '100%',
        }}>
          <span style={{ display: 'block', height: 1, background: '#E2E8F0' }} />
        </span>
      </div>
      <div>{children}</div>
    </section>
  );

  const renderers = buildContentRenderers(ctx, Section);
  const order = visibleKeys(ctx, Object.keys(renderers));

  return (
    <div id="resume-preview" style={{
      width: '210mm', minHeight: '297mm', background: '#FFFFFF',
      padding: '20mm 20mm 20mm 20mm', boxSizing: 'border-box',
      fontFamily: FONT_FAMILY_CSS[settings.fontFamily],
      fontSize: fs(12), color: settings.colorTheme.text, lineHeight: lh,
    }}>
      {/* 姓名 + 基本行 */}
      <header style={{ marginBottom: 20 }}>
        <EditableText as="h1" value={personal.name} placeholder="姓名"
          onCommit={(v) => updatePersonal({ name: v })}
          style={{ margin: 0, fontSize: fs(34), fontWeight: 800, color: '#0F172A',
            letterSpacing: 3, lineHeight: 1.1, display: 'block' }} />
        <div style={{ marginTop: 12, fontSize: fs(11.5), color: '#475569',
          display: 'flex', flexWrap: 'wrap', gap: '4px 18px', alignItems: 'center',
          lineHeight: 1.6 }}>
          <span>男</span><span style={{ color: '#CBD5E1' }}>|</span>
          <span>生日：2026/01</span>
          {personal.phone && <span style={{ whiteSpace: 'nowrap' }}>
            <CommonIcon type="phone" color="#64748B" size={13} /><span style={{ marginLeft: 5 }}>{personal.phone}</span></span>}
          {personal.email && <span style={{ whiteSpace: 'nowrap' }}>
            <CommonIcon type="mail" color="#64748B" size={13} /><span style={{ marginLeft: 5 }}>{personal.email}</span></span>}
        </div>
      </header>

      {order.map((k) => renderers[k]?.())}
    </div>
  );
};
