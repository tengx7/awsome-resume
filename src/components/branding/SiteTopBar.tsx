import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Smile, ArrowRight, Github, X } from 'lucide-react';
import { ZhipinLogo } from './ZhipinLogo';

/**
 * SiteTopBar —— 首页 / 模板大厅 等落地页共享的顶栏
 *
 * 统一：
 *  · 左：Logo + 主导航（首页 / 简历模板 / 简历分析 / 我的简历 / 发现）
 *  · 右：AI助手 + 关于/小程序 + 头像
 *
 * transparent=true 时（首页）：背景透明、融入 hero 渐变
 * transparent=false 时（模板页）：粘性 + 毛玻璃 + 底分隔线
 */
const NAV_LINKS: { label: string; to?: string; match?: string[] }[] = [
  { label: '首页', to: '/', match: ['/'] },
  { label: '简历模板', to: '/templates', match: ['/templates'] },
  { label: '简历分析' },
  { label: '我的简历', to: '/editor', match: ['/editor'] },
  { label: '发现' },
];

export interface SiteTopBarProps {
  /** 是否为透明贴合 hero 的形态（首页=true，模板页=false） */
  transparent?: boolean;
}

export const SiteTopBar: React.FC<SiteTopBarProps> = ({ transparent = false }) => {
  const location = useLocation();
  const [showQr, setShowQr] = useState(false);

  const wrapperCls = transparent
    ? 'relative z-20'
    : 'sticky top-0 z-30 backdrop-blur-md bg-[#05110B]/75 border-b border-white/5';

  return (
    <>
      <header className={wrapperCls}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 h-16">
          {/* 左：Logo + 主导航 */}
          <div className="flex items-center gap-10">
            <Link to="/">
              <ZhipinLogo tone="light" text="简历神器" />
            </Link>
            <nav className="flex items-center gap-7 text-sm">
              {NAV_LINKS.map((l) => {
                const active =
                  !!l.match && l.match.some((m) => (m === '/' ? location.pathname === '/' : location.pathname.startsWith(m)));
                const inner = (
                  <span
                    className={`relative py-1 font-medium transition-colors ${
                      active ? 'text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {l.label}
                    {active && (
                      <span className="absolute left-1/2 -bottom-1.5 w-6 h-[3px] -translate-x-1/2 rounded-full bg-zp-primary shadow-[0_0_8px_rgba(0,166,126,0.75)]" />
                    )}
                  </span>
                );
                return l.to ? (
                  <Link key={l.label} to={l.to}>
                    {inner}
                  </Link>
                ) : (
                  <button key={l.label}>{inner}</button>
                );
              })}
            </nav>
          </div>

          {/* 右：AI助手 / 关于 / 小程序 / 头像 */}
          <div className="flex items-center gap-3">
            <Link
              to="/editor"
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-zp-primary text-white text-[12px] font-medium shadow-[0_4px_14px_rgba(0,166,126,0.5)] hover:bg-[#00B589] transition-colors"
            >
              AI简历助手
              <ArrowRight size={12} />
            </Link>
            <a
              href="https://github.com/tengx7/awsome-resume"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white text-[12px] font-medium transition-all"
              title="程序员腾哥 · GitHub"
            >
              <Github size={14} />
              <span>程序员腾哥</span>
            </a>
            <button className="hidden lg:block text-white/80 hover:text-white text-[13px]" onClick={() => setShowQr(true)}>关于我们</button>
            <button className="hidden lg:block text-white/80 hover:text-white text-[13px]" onClick={() => setShowQr(true)}>小程序</button>
            <button className="flex items-center gap-1 pl-1 pr-2 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-300 to-amber-300 flex items-center justify-center text-white">
                <Smile size={16} />
              </div>
              <ChevronDown size={12} className="text-white/70" />
            </button>
          </div>
        </div>
      </header>

      {/* 二维码弹窗 */}
      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowQr(false)}
        >
          <div
            className="relative bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowQr(false)}
            >
              <X size={18} />
            </button>
            <img
              src="/wechat-qr.png"
              alt="程序员腾哥微信二维码"
              className="w-48 rounded-xl object-contain"
            />
            <p className="text-gray-500 text-[13px]">扫码添加程序员腾哥</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteTopBar;