/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '"PingFang SC"',
          '"Source Han Sans CN"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // 神器主色体系
        zp: {
          // 主品牌绿（神器签名色）
          primary: '#00A67E',
          'primary-hover': '#00B589',
          'primary-light': '#34D399',
          'primary-dark': '#008F6B',
          // 模板大厅深色背景色板
          'dark-900': '#05110B', // 最深处
          'dark-800': '#0A1A12',
          'dark-700': '#0E221A',
          'dark-600': '#13301F',
          'dark-500': '#1A3A28',
          // 卡片 / 下拉 / 毛玻璃
          'card-dark': '#152921',
          'card-hover': '#1F3A2E',
          // 高亮手绘波浪（LOGO 下划线）
          highlight: '#D4F97A',
          // 次按钮黑底
          btn: '#1A2B24',
          // VIP 金色
          vip: '#F7C95C',
          // 信息标签橘
          tag: '#FF7A3D',
        },
      },
      boxShadow: {
        'zp-card': '0 8px 32px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)',
        'zp-card-hover': '0 14px 48px rgba(0, 166, 126, 0.25), 0 4px 12px rgba(0, 0, 0, 0.3)',
        'zp-btn-primary': '0 4px 18px rgba(0, 166, 126, 0.45)',
        'zp-float': '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        // 首页：墨绿夜景 + 两束神器绿氛围光（比模板页更亮、留白更多）
        'zp-hero':
          'radial-gradient(1200px 700px at 20% 30%, rgba(0, 166, 126, 0.28) 0%, transparent 65%),' +
          'radial-gradient(900px 600px at 85% 15%, rgba(79, 215, 175, 0.18) 0%, transparent 65%),' +
          'radial-gradient(700px 500px at 70% 90%, rgba(0, 120, 92, 0.22) 0%, transparent 60%),' +
          'linear-gradient(180deg, #0A1F17 0%, #07170F 55%, #050F0A 100%)',
        // 模板大厅：与首页同色系、略深（营造"进入内容区"的层次感）
        'zp-templates':
          'radial-gradient(900px 500px at 20% 10%, rgba(0, 166, 126, 0.22) 0%, transparent 62%),' +
          'radial-gradient(700px 500px at 85% 90%, rgba(0, 130, 100, 0.18) 0%, transparent 62%),' +
          'linear-gradient(180deg, #07170F 0%, #05110B 55%, #030A06 100%)',
        'zp-btn-primary':
          'linear-gradient(135deg, #34D399 0%, #00A67E 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'fadeIn': {
          '0%': { opacity: '0', transform: 'translateY(4px) translateX(-50%)' },
          '100%': { opacity: '1', transform: 'translateY(0) translateX(-50%)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'shimmer': 'shimmer 2.4s infinite linear',
        'fadeIn': 'fadeIn 0.12s ease-out both',
        'blink': 'blink 0.8s step-end infinite',
      },
    },
  },
  plugins: [],
}
