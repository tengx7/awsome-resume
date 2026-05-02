import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Calendar,
  User,
  Pencil,
  LayoutGrid,
  PenLine,
  LayoutList,
} from 'lucide-react';
import { useResumeStore } from '../store/resumeStore';
import { ZhipinLogo } from '../components/branding/ZhipinLogo';
import { TemplateRenderer } from '../templates';

type Tab = 'template' | 'edit' | 'layout';

/** 折叠 Section 包装 */
const FoldSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2"
      >
        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        {open ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>
      {open && <div className="space-y-3 mt-2">{children}</div>}
    </section>
  );
};

/** 移动端表单输入（label 内嵌） */
const MField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ label, required, children, className }) => (
  <div
    className={`flex items-center bg-white border border-gray-200 rounded-lg px-3 h-12 ${className || ''}`}
  >
    <span className="text-[13px] text-gray-700 flex items-center gap-0.5 w-14 flex-shrink-0">
      {label}
      {required && <span className="text-red-500">*</span>}
    </span>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

/** 简历编辑 — 基础信息 & 教育经历 */
const MobileEditForm: React.FC = () => {
  const { data, updatePersonal } = useResumeStore();
  const p = data.personal;
  const edu = data.education[0];

  return (
    <div className="p-4">
      <FoldSection title="基础信息">
        {/* 头像 + 姓名/性别/生日 网格 */}
        <div className="flex gap-3">
          <button className="w-[110px] h-[110px] flex-shrink-0 rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-zp-primary transition-colors">
            <User size={32} strokeWidth={1.2} />
            <span className="mt-2 text-[11px] flex items-center gap-0.5">
              上传头像 <Pencil size={10} />
            </span>
          </button>

          <div className="flex-1 space-y-2">
            <MField label="姓名" required>
              <input
                className="w-full bg-transparent outline-none text-[14px] text-gray-900"
                value={p.name || ''}
                onChange={(e) => updatePersonal({ name: e.target.value })}
                placeholder="请输入"
              />
            </MField>
            <MField label="性别" required>
              <select
                className="w-full bg-transparent outline-none text-[14px] text-gray-900 appearance-none"
                value={(p as any).gender || ''}
                onChange={(e) => updatePersonal({ gender: e.target.value } as any)}
              >
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </MField>
            <MField label="生日" required>
              <div className="flex items-center justify-between w-full">
                <input
                  type="text"
                  placeholder="YYYY-MM"
                  className="flex-1 bg-transparent outline-none text-[14px] text-gray-900"
                  value={(p as any).birthday || ''}
                  onChange={(e) => updatePersonal({ birthday: e.target.value } as any)}
                />
                <Calendar size={15} className="text-gray-400" />
              </div>
            </MField>
          </div>
        </div>

        {/* 电话 */}
        <MField label="电话">
          <input
            className="w-full bg-transparent outline-none text-[14px]"
            value={p.phone || ''}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
          />
        </MField>

        {/* 微信 */}
        <MField label="微信">
          <input
            className="w-full bg-transparent outline-none text-[14px]"
            value={(p as any).wechat || ''}
            onChange={(e) => updatePersonal({ wechat: e.target.value } as any)}
            placeholder="请输入"
          />
        </MField>

        {/* 邮箱 */}
        <MField label="邮箱">
          <input
            className="w-full bg-transparent outline-none text-[14px]"
            value={p.email || ''}
            onChange={(e) => updatePersonal({ email: e.target.value })}
          />
        </MField>

        {/* 籍贯 */}
        <MField label="籍贯">
          <div className="flex items-center justify-between">
            <input
              className="flex-1 bg-transparent outline-none text-[14px] text-gray-400"
              placeholder="请选择籍贯城市"
              value={(p as any).hometown || ''}
              onChange={(e) => updatePersonal({ hometown: e.target.value } as any)}
            />
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </MField>

        {/* 自定义标签 */}
        <MField label="自定义标签">
          <input
            className="w-full bg-transparent outline-none text-[14px] placeholder:text-gray-400"
            placeholder="请输入标签，输入后回车添加"
          />
        </MField>
      </FoldSection>

      <FoldSection title="教育经历">
        <MField label="学校">
          <div className="flex items-center justify-between w-full">
            <input
              className="flex-1 bg-transparent outline-none text-[14px]"
              value={edu?.school || ''}
              placeholder="请输入学校"
              readOnly
            />
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </MField>

        <MField label="学历">
          <div className="flex items-center justify-between w-full">
            <span className="flex-1 text-[14px]">{edu?.degree || '本科'}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </MField>

        <MField label="学制">
          <div className="flex items-center justify-between w-full">
            <span className="flex-1 text-[14px] text-gray-400">请选择学制类型</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </MField>
      </FoldSection>
    </div>
  );
};

/** 简历模版 — 缩略图九宫格 */
const MobileTemplateList: React.FC = () => {
  const { data, settings, setTemplate } = useResumeStore();
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {['standard', 'qinglan', 'chenwen', 'jianyue', 'zhanqing', 'xingyunhong'].map(
        (id, i) => {
          const active = i === 0;
          return (
            <div
              key={id}
              className={`relative rounded-lg overflow-hidden border-2 transition-all bg-white ${
                active ? 'border-zp-primary shadow-md' : 'border-gray-200'
              }`}
            >
              {/* 缩略画布（缩放渲染当前模板） */}
              <div className="h-[220px] overflow-hidden relative">
                <div
                  style={{ transform: 'scale(0.22)', transformOrigin: 'top left' }}
                  className="w-[210mm]"
                >
                  <TemplateRenderer data={data} settings={settings} />
                </div>
              </div>
              <p
                className={`text-center py-2 text-[12px] ${
                  active ? 'text-zp-primary font-medium' : 'text-gray-600'
                }`}
              >
                {['标准', '青蓝', '沉稳', '简约', '湛青', '幸运红'][i]}
              </p>
            </div>
          );
        },
      )}
    </div>
  );
};

/** 页面布局 */
const MobileLayout: React.FC = () => {
  const { settings, toggleOnePageMode, setLineHeight, setSectionGap } = useResumeStore();
  return (
    <div className="p-4 space-y-4">
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <button
          onClick={toggleOnePageMode}
          className={`w-full py-2.5 rounded-lg border text-sm font-medium ${
            settings.onePageMode
              ? 'border-zp-primary bg-emerald-50 text-zp-primary'
              : 'border-gray-200 text-gray-700'
          }`}
        >
          {settings.onePageMode ? '一页模式（已开启）' : '一页模式'}
        </button>

        <div className="mt-4 flex items-center justify-between text-[12px] text-gray-600 mb-1">
          <span>行高</span>
          <span className="font-mono text-zp-primary">{settings.lineHeight.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={1.2}
          max={2}
          step={0.05}
          value={settings.lineHeight}
          onChange={(e) => setLineHeight(parseFloat(e.target.value))}
          className="w-full accent-zp-primary"
        />

        <div className="mt-3 flex items-center justify-between text-[12px] text-gray-600 mb-1">
          <span>模块间距</span>
          <span className="font-mono text-zp-primary">{settings.sectionGap}px</span>
        </div>
        <input
          type="range"
          min={10}
          max={40}
          value={settings.sectionGap}
          onChange={(e) => setSectionGap(parseInt(e.target.value, 10))}
          className="w-full accent-zp-primary"
        />
      </div>
    </div>
  );
};

/**
 * 移动端编辑器主页面（对标 img.png）
 */
export const MobileEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useResumeStore();
  const [tab, setTab] = useState<Tab>('edit');
  const title =
    data.personal.name && data.education?.[0]?.school
      ? `${data.personal.name}-${data.education[0].school}`
      : '简历神器-北京某某学院';

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col" data-lock-scroll="false">
      {/* 顶栏 */}
      <header className="h-[56px] bg-white flex items-center px-3 gap-2 border-b border-gray-100 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 text-gray-500">
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>
        <ZhipinLogo tone="brand" text="AI简历" size={22} />
        <span className="text-[14px] font-medium text-gray-900 ml-1 truncate flex-1">
          {title}
        </span>
        <span className="flex items-center px-2 py-0.5 rounded bg-gray-100 text-[11px] text-gray-600">
          共2页
        </span>
        <button className="p-1 text-gray-400">
          <HelpCircle size={16} />
        </button>
      </header>

      {/* 三段 Tab */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-full w-full">
          {([
            { id: 'template', label: '简历模版', Icon: LayoutGrid },
            { id: 'edit', label: '简历编辑', Icon: PenLine },
            { id: 'layout', label: '页面布局', Icon: LayoutList },
          ] as { id: Tab; label: string; Icon: any }[]).map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-[13px] transition-all ${
                  active
                    ? 'bg-white text-zp-primary font-medium shadow-sm border border-gray-200'
                    : 'text-gray-500'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'edit' && <MobileEditForm />}
        {tab === 'template' && <MobileTemplateList />}
        {tab === 'layout' && <MobileLayout />}
      </div>
    </div>
  );
};

export default MobileEditorPage;
