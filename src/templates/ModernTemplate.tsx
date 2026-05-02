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
 * ModernTemplate —— 「青蓝」
 * 对标 pdf_2/pdf_3：姓名居左 + 青色标题胶囊（带底色） + 内容左侧细竖线。
 */
export const ModernTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const ctx = useTemplateCtx(data, settings);
  const { personal } = data;
  const { fs, lh, gap } = ctx;
  const { updatePersonal } = useResumeStore();

  // 青蓝（类似 pdf_2 #2E86A6 / pdf_3 青色），用 primary 色驱动
  // 标题：胶囊底框 + 左侧竖色条，用 line-height = height 实现垂直居中（不依赖 flex）
  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section style={{ marginBottom: `${gap}px` }}>
      <h2 style={{
        display: 'block',
        margin: '0 0 12px 0',
        height: 34,
        fontSize: fs(13),
        fontWeight: 700,
        lineHeight: '34px',
        color: '#0F172A',
        padding: '0 14px',
        background: '#E6F0F4',
        borderRadius: 4,
        borderLeft: `3px solid ${ctx.primary}`,
        letterSpacing: 1,
        boxSizing: 'border-box',
        overflow: 'hidden',
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
      padding: '18mm 18mm', boxSizing: 'border-box',
      fontFamily: FONT_FAMILY_CSS[settings.fontFamily],
      fontSize: fs(12), color: settings.colorTheme.text, lineHeight: lh,
    }}>
      {/* Header：姓名 + 右上头像 */}
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <EditableText as="h1" value={personal.name} placeholder="姓名"
              onCommit={(v) => updatePersonal({ name: v })}
              style={{ margin: 0, fontSize: fs(32), fontWeight: 800, color: '#0F172A',
                letterSpacing: 2, lineHeight: 1.1, display: 'block' }} />
            <div style={{ marginTop: 10, fontSize: fs(11.5), color: '#475569',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 16px',
              lineHeight: 1.6 }}>
              <span>男</span><span style={{ color: '#CBD5E1' }}>|</span>
              <span>生日：2026/01</span>
              {personal.phone && <span style={{ whiteSpace: 'nowrap' }}>
                <CommonIcon type="phone" color="#64748B" size={13} /><span style={{ marginLeft: 5 }}>{personal.phone}</span></span>}
              {personal.email && <span style={{ whiteSpace: 'nowrap' }}>
                <CommonIcon type="mail" color="#64748B" size={13} /><span style={{ marginLeft: 5 }}>{personal.email}</span></span>}
            </div>
          </div>
          {settings.showAvatar && personal.avatar && (
            <img src={personal.avatar} alt={personal.name}
              style={{ width: 80, height: 100, borderRadius: 4, objectFit: 'cover',
                flexShrink: 0, border: '2px solid #F1F5F9' }} />
          )}
        </div>
      </header>

      {order.map((k) => renderers[k]?.())}
    </div>
  );
};