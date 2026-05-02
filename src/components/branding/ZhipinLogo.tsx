import React from 'react';

/**
 * 简历神器 Logo —— 绿色渐变 "V" 字图标
 * 两种使用场景：浅色背景（落地页顶部） / 深色背景（模板大厅顶部）
 */
export const ZhipinLogo: React.FC<{
  size?: number;
  showText?: boolean;
  tone?: 'light' | 'dark' | 'brand';
  text?: string;
}> = ({ size = 28, showText = true, tone = 'light', text = '简历神器' }) => {
  const textColor =
    tone === 'light' ? 'text-white' : tone === 'dark' ? 'text-zp-primary' : 'text-gray-900';

  return (
    <div className="flex items-center gap-2 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="简历神器"
      >
        <defs>
          <linearGradient id="zp-logo-g" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6CE4B8" />
            <stop offset="55%" stopColor="#00C48F" />
            <stop offset="100%" stopColor="#009B73" />
          </linearGradient>
        </defs>
        {/* 圆角方底 */}
        <rect x="1" y="1" width="30" height="30" rx="8" fill="url(#zp-logo-g)" />
        {/* V 字缺口（白色剪影） */}
        <path
          d="M8 9 L15.5 23 L17.8 23 L25 9 L21.3 9 L16.6 18.4 L11.8 9 Z"
          fill="#FFFFFF"
          fillOpacity="0.98"
        />
        {/* 右上角小高光 */}
        <circle cx="25" cy="7" r="1.8" fill="#D4F97A" opacity="0.85" />
      </svg>
      {showText && (
        <span className={`text-[15px] font-semibold tracking-wide ${textColor}`}>{text}</span>
      )}
    </div>
  );
};

export default ZhipinLogo;
