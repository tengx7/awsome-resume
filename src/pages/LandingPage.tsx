import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  QrCode,
  RefreshCw,
  Sparkles,
  Smile,
} from 'lucide-react';
import { SiteTopBar } from '../components/branding/SiteTopBar';

// ---- 打字机 Hook ----
function useTypewriter(lines: string[], speed = 80, pauseBetween = 500) {
  const [displayed, setDisplayed] = useState<string[]>(['', '']);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let lineIdx = 0;
    let charIdx = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (lineIdx >= lines.length) {
        setDone(true);
        return;
      }
      const line = lines[lineIdx];
      if (charIdx <= line.length) {
        setDisplayed(prev => {
          const next = [...prev];
          next[lineIdx] = line.slice(0, charIdx);
          return next;
        });
        charIdx++;
        timer = setTimeout(tick, speed);
      } else {
        // 当前行打完，停顿后换行
        lineIdx++;
        charIdx = 0;
        timer = setTimeout(tick, pauseBetween);
      }
    };

    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, []);

  return { displayed, done };
}

export const LandingPage: React.FC = () => {
  const { displayed, done } = useTypewriter(['找工作', '从一份好简历开始'], 90, 400);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-zp-hero">
      {/* ============ 背景层：夜景桌面氛围（CSS 模拟） ============ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 整体暗色蒙版 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E4050]/60 via-[#1A2A35]/70 to-[#0F1820]" />
        {/* 左侧氛围灯 */}
        <div
          className="absolute left-0 bottom-0 w-[480px] h-[480px] rounded-full blur-3xl opacity-60"
          style={{ background: 'radial-gradient(circle, #3CD0B0 0%, transparent 60%)' }}
        />
        {/* 右侧紫气 */}
        <div
          className="absolute right-[12%] top-[14%] w-[360px] h-[360px] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #8E7ACF 0%, transparent 60%)' }}
        />
        {/* 底部深色地平线 */}
        <div className="absolute left-0 right-0 bottom-0 h-[38%] bg-gradient-to-t from-[#0A1218] to-transparent" />

        {/* 桌面剪影 —— SVG 贴图模拟便签 / 时钟 / 植物 */}
        <svg
          className="absolute inset-0 w-full h-full opacity-90"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >

          {/* 底部装饰便签 */}
          <g transform="translate(300 780) rotate(-3)" opacity="0.75">
            <rect x="0" y="0" width="110" height="36" rx="4" fill="#F5E58A" />
            <text x="12" y="23" fontFamily="sans-serif" fontSize="13" fill="#4D4020" fontWeight="bold">简历加油站 ✨</text>
          </g>
          <g transform="translate(460 800) rotate(2)" opacity="0.7">
            <rect x="0" y="0" width="96" height="32" rx="4" fill="#9BE1D8" />
            <text x="10" y="21" fontFamily="sans-serif" fontSize="12" fill="#1A4A42">Offer 到手 🎉</text>
          </g>
          <g transform="translate(620 785) rotate(-1)" opacity="0.65">
            <rect x="0" y="0" width="88" height="32" rx="4" fill="#C4B5FD" />
            <text x="10" y="21" fontFamily="sans-serif" fontSize="12" fill="#3B1F6E">投递中... 📨</text>
          </g>

          {/* 左下角闹钟 */}
          <g transform="translate(80 620)" opacity="0.85">
            <rect x="0" y="0" width="120" height="150" rx="14" fill="#1A1F24" />
            <circle cx="60" cy="75" r="48" fill="#ECECEC" />
            <line x1="60" y1="75" x2="60" y2="40" stroke="#222" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="75" x2="86" y2="75" stroke="#222" strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="75" r="3" fill="#222" />
          </g>
          {/* 绿植叶 */}
          <g transform="translate(210 380)" opacity="0.9">
            <path
              d="M40 200 Q 20 100 50 20 Q 70 80 60 200 Z"
              fill="#6AA78C"
            />
            <path
              d="M40 200 Q 80 120 120 50 Q 100 140 70 200 Z"
              fill="#4E8A71"
            />
            <rect x="30" y="195" width="70" height="100" rx="8" fill="#5B7D6D" />
          </g>
          {/* 台灯 */}
          <g transform="translate(1260 560)" opacity="0.85">
            <path
              d="M 0 0 L 60 -80 L 80 -60 L 20 20 Z"
              fill="#7A8590"
            />
            <rect x="30" y="30" width="40" height="140" fill="#707A85" />
            <ellipse cx="50" cy="178" rx="70" ry="10" fill="#5A6670" />
          </g>
          {/* 多肉植物 */}
          <g transform="translate(1130 620)" opacity="0.92">
            <rect x="0" y="60" width="70" height="64" rx="4" fill="#D7D3C9" />
            <circle cx="35" cy="55" r="30" fill="#5A8D6A" />
            <circle cx="20" cy="45" r="16" fill="#6FA078" />
            <circle cx="50" cy="45" r="18" fill="#6FA078" />
          </g>
          {/* 椅背 */}
          <g transform="translate(540 700)" opacity="0.85">
            <path d="M 0 120 Q 150 -10 320 120 L 320 200 L 0 200 Z" fill="#4A5A68" />
            <path d="M 30 130 Q 160 30 290 130" stroke="#334250" strokeWidth="3" fill="none" />
          </g>
        </svg>
      </div>

      {/* ============ 统一顶栏（与模板大厅共享） ============ */}
      <SiteTopBar transparent />

      {/* ============ 主标题区 ============ */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-14 pb-28">
        <h1 className="font-display text-center font-black tracking-wide leading-[1.1]">
          {/* 第一行：打字中时显示光标，打完后光标移走 */}
          <span className="block text-zp-hero-gradient text-[80px] md:text-[108px]">
            {displayed[0]}
            {displayed[0].length > 0 && displayed[0] !== '找工作' && (
              <span className="inline-block w-[4px] ml-1 align-middle bg-[#3CD0B0] animate-blink" style={{ height: '0.85em' }} />
            )}
          </span>
          {/* 第二行：第一行打完后开始打，光标始终在第二行末尾 */}
          <span className="block text-zp-hero-gradient text-[80px] md:text-[108px]">
            {displayed[1]}
            {displayed[0] === '找工作' && (
              <span className="inline-block w-[4px] ml-1 align-middle bg-[#3CD0B0] animate-blink" style={{ height: '0.85em' }} />
            )}
          </span>
        </h1>
        <p
          className="mt-8 text-white/80 text-lg md:text-xl font-light tracking-wider animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          打动HR的专业简历，抓住每一个高薪机会
        </p>

        {/* 双按钮 */}
        <div
          className="mt-12 flex items-center gap-6 animate-fade-up"
          style={{ animationDelay: '0.35s' }}
        >
          <Link to="/editor" className="zp-btn-primary text-[17px]">
            立即制作
          </Link>
          <Link to="/editor" className="zp-btn-ghost-dark relative text-[17px]">
            <span className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-zp-highlight" />
              AI简历助手
            </span>
          </Link>
        </div>
      </main>

      {/* ============ 底部 Footer ============ */}
      <footer className="relative z-10 flex justify-center pb-10">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/wechat-qr.png"
            alt="程序员腾哥微信二维码"
            className="w-40 rounded-xl shadow-lg object-contain"
          />
          <p className="text-white/50 text-[12px]">扫码添加程序员腾哥</p>
        </div>
      </footer>

      {/* ============ 右侧悬浮按钮组（上方） ============ */}
      <div className="fixed right-4 top-[32%] z-30 flex flex-col gap-2">
        <button
          className="w-11 h-11 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center text-gray-600 shadow-md hover:bg-white"
          title="小程序码"
        >
          <QrCode size={19} />
        </button>
        <button
          className="w-11 h-11 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center text-gray-600 shadow-md hover:bg-white"
          title="刷新"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* ============ 右下悬浮按钮组 ============ */}
      <div className="fixed right-5 bottom-6 z-30 flex flex-col gap-3">
        <button
          className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:scale-105 transition-transform"
          title="联系客服"
        >
          <MessageCircle size={20} className="text-emerald-600" />
        </button>
        <button
          className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          title="意见反馈"
        >
          <Smile size={22} className="text-pink-500" />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;