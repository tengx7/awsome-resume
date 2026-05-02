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
 * HelloTemplate —— 「HELLO」
 * 对标 pdf_11：深蓝实心左侧栏 + 右侧白底主内容，左侧"掌握技能"，右侧姓名+模块。
 */
export const HelloTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const ctx = useTemplateCtx(data, settings);
  const { personal } = data;
  const { fs, lh, gap } = ctx;
  const { updatePersonal } = useResumeStore();

  const sidebarBg = '#1F4A8F'; // 深蓝
  const sidebarTxt = '#DDE7F5';

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section style={{ marginBottom: `${gap}px` }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: fs(14), fontWeight: 700, color: '#0F172A' }}>
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
      fontSize: fs(12), color: settings.colorTheme.text, lineHeight: lh,
      display: 'flex', boxSizing: 'border-box',
    }}>
      {/* 左深蓝栏 */}
      <aside style={{
        width: '32%', background: sidebarBg, color: sidebarTxt,
        padding: '20mm 12mm', boxSizing: 'border-box',
      }}>
        {data.skills.length > 0 && (
          <>
            <h3 style={{
              margin: '0 0 12px 0', fontSize: fs(13.5), fontWeight: 700,
              color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF' }} />
              </span>
              掌握技能
            </h3>
            <ul style={{ margin: 0, paddingLeft: 14, fontSize: fs(11), color: sidebarTxt, lineHeight: lh }}>
              {data.skills.map((s) => (
                <li key={s.id} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{s.category}：</span>
                  <span>{s.items.join(' / ')}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      {/* 右主内容 */}
      <main style={{ flex: 1, padding: '18mm 14mm 18mm 16mm', boxSizing: 'border-box' }}>
        <header style={{ marginBottom: 18 }}>
          <EditableText as="h1" value={personal.name} placeholder="姓名"
            onCommit={(v) => updatePersonal({ name: v })}
            style={{ margin: 0, fontSize: fs(30), fontWeight: 800, color: '#0F172A',
              letterSpacing: 2, lineHeight: 1.1, display: 'block' }} />
          <div style={{ marginTop: 8, fontSize: fs(11.5), color: '#475569',
            display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'center', lineHeight: 1.6 }}>
            <span>男</span><span style={{ color: '#CBD5E1' }}>|</span>
            <span>生日：2026/01</span>
            {personal.phone && <span style={{ whiteSpace: 'nowrap' }}>
              <CommonIcon type="phone" color="#64748B" size={13} /><span style={{ marginLeft: 5 }}>{personal.phone}</span></span>}
          </div>
        </header>
        {order.filter((k) => k !== 'skills').map((k) => renderers[k]?.())}
      </main>
    </div>
  );
};
