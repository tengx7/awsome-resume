import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  ArrowRight,
  Smile,
} from 'lucide-react';
import { SiteTopBar } from '../components/branding/SiteTopBar';

type TopTab = 'job' | 'style' | 'custom';
type RoleLevel =
  | 'all'
  | 'intern'
  | 'fresh'
  | 'junior'
  | 'middle'
  | 'senior'
  | 'expert';
type Category =
  | 'all'
  | 'tech'
  | 'design'
  | 'market'
  | 'sales'
  | 'finance'
  | 'estate'
  | 'law';
type Style = 'all' | 'modern' | 'creative' | 'classic' | 'pro';

const ROLE_OPTIONS: { id: RoleLevel; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'intern', label: '实习生[零经验]' },
  { id: 'fresh', label: '应届生[<1年]' },
  { id: 'junior', label: '初级[1-3年]' },
  { id: 'middle', label: '中级[3-5年]' },
  { id: 'senior', label: '高级[5-10年]' },
  { id: 'expert', label: '资深[10+年]' },
];

const CAT_OPTIONS: { id: Category; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'tech', label: '技术' },
  { id: 'design', label: '设计' },
  { id: 'market', label: '市场' },
  { id: 'sales', label: '销售' },
  { id: 'finance', label: '金融' },
  { id: 'estate', label: '房地产/建筑' },
  { id: 'law', label: '咨询/翻译/法律' },
];

const STYLE_OPTIONS: { id: Style; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'modern', label: '现代' },
  { id: 'creative', label: '创意' },
  { id: 'classic', label: '经典' },
  { id: 'pro', label: '专业' },
];

/** 模板数据（职类） */
type Card = {
  id: string;
  name: string;
  role: RoleLevel;
  cat: Category;
  style: Style;
  accent: string; // 顶栏色带
  theme: 'green' | 'blue' | 'gray' | 'rose' | 'teal' | 'purple' | 'dark';
};

const JOB_CARDS: Card[] = [
  { id: 'java-bingqing', name: '初级Java冰清简历模板', role: 'junior', cat: 'tech', style: 'classic', accent: '#D8E4E0', theme: 'gray' },
  { id: 'java-chenwen', name: '实习生Java沉稳简历模板', role: 'intern', cat: 'tech', style: 'classic', accent: '#2B3642', theme: 'dark' },
  { id: 'java-suya', name: '高级Java素雅简历模板', role: 'senior', cat: 'tech', style: 'pro', accent: '#E6E6E6', theme: 'gray' },
  { id: 'java-qinglan', name: '中级Java青蓝简历模板', role: 'middle', cat: 'tech', style: 'modern', accent: '#4AB3A3', theme: 'teal' },
  { id: 'pm-shuguang', name: '产品经理曙光简历模板', role: 'middle', cat: 'market', style: 'modern', accent: '#F4C7A8', theme: 'rose' },
  { id: 'pm-heiying', name: '产品经理黑影简历模板', role: 'senior', cat: 'market', style: 'pro', accent: '#212B33', theme: 'dark' },
  { id: 'de-qingfeng', name: '设计师清风简历模板', role: 'middle', cat: 'design', style: 'creative', accent: '#B6C8D8', theme: 'blue' },
  { id: 'op-xuyang', name: '运营旭阳简历模板', role: 'junior', cat: 'market', style: 'modern', accent: '#F4E3AB', theme: 'gray' },
];

const STYLE_CARDS: Card[] = [
  { id: 'jike', name: '极客', role: 'all', cat: 'tech', style: 'creative', accent: '#6E62F2', theme: 'purple' },
  { id: 'xingchun', name: '醒春', role: 'all', cat: 'design', style: 'creative', accent: '#D1F078', theme: 'green' },
  { id: 'muchen', name: '暮沉', role: 'all', cat: 'pro' as any, style: 'pro', accent: '#1F2530', theme: 'dark' },
  { id: 'qianxun', name: '浅熏', role: 'all', cat: 'pro' as any, style: 'pro', accent: '#C43D62', theme: 'rose' },
];

/** 单张模板卡片 */
const TemplateCard: React.FC<{ card: Card }> = ({ card }) => {
  const themeMap: Record<Card['theme'], string> = {
    green: 'from-emerald-100 to-emerald-50',
    blue: 'from-sky-100 to-sky-50',
    gray: 'from-gray-100 to-gray-50',
    rose: 'from-rose-100 to-rose-50',
    teal: 'from-teal-100 to-teal-50',
    purple: 'from-purple-200 to-purple-100',
    dark: 'from-slate-800 to-slate-700',
  };
  const isDark = card.theme === 'dark' || card.theme === 'purple';

  return (
    <div className="zp-card-dark group cursor-pointer">
      {/* 顶部色带 */}
      <div className="h-1" style={{ backgroundColor: card.accent }} />

      {/* 缩略图：模拟简历内容 */}
      <div className={`relative h-[320px] bg-gradient-to-br ${themeMap[card.theme]} p-4`}>
        {/* 头像 + 姓名 */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              isDark ? 'bg-white/20 text-white' : 'bg-white shadow text-gray-700'
            }`}
          >
            <Smile size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              神器示例
            </p>
            <p className={`text-[10px] leading-tight ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
              男 | 24岁 | java | 硕士 · 北京
            </p>
          </div>
        </div>

        {/* 分段线 */}
        <div className={`h-px ${isDark ? 'bg-white/15' : 'bg-gray-300/70'} mb-2`} />

        {/* 模拟行 */}
        <div className="space-y-1.5">
          <div className={`h-1.5 w-1/3 rounded ${isDark ? 'bg-white/30' : 'bg-gray-300'}`} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded ${isDark ? 'bg-white/15' : 'bg-gray-300/70'}`}
              style={{ width: `${70 + ((i * 7) % 30)}%` }}
            />
          ))}
          <div className={`h-1.5 w-1/4 rounded mt-3 ${isDark ? 'bg-white/30' : 'bg-gray-300'}`} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`b-${i}`}
              className={`h-1 rounded ${isDark ? 'bg-white/15' : 'bg-gray-300/70'}`}
              style={{ width: `${60 + ((i * 11) % 40)}%` }}
            />
          ))}
        </div>

        {/* 预览按钮（hover 显示） */}
        <button className="absolute right-3 bottom-3 px-3 py-1 rounded-full bg-gray-800/80 text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
          预览
        </button>
      </div>

      {/* 卡片名称 */}
      <div className="px-3 py-2.5 bg-[#0E1A14]">
        <p className="text-[13px] text-white/90 font-medium truncate">{card.name}</p>
      </div>
    </div>
  );
};

/** 下拉筛选胶囊 */
const FilterDropdown: React.FC<{
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 pl-4 pr-3 py-2 rounded-full text-sm font-medium transition-all ${
          open
            ? 'bg-[#18342A] text-zp-primary border border-zp-primary/60'
            : 'bg-[#112821] text-white/85 border border-white/10 hover:border-white/25'
        }`}
      >
        <span className="text-zp-primary">{label}</span>
        <span className="text-white/40">|</span>
        <span>{current?.label || '全部'}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+6px)] w-52 z-40 zp-glass rounded-xl py-2 shadow-2xl scrollbar-dark max-h-[340px] overflow-y-auto">
            {options.map((opt) => {
              const active = opt.id === value;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${
                    active
                      ? 'bg-zp-primary/15 text-zp-primary font-semibold'
                      : 'text-white/85 hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-zp-primary" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [topTab, setTopTab] = useState<TopTab>('job');
  const [role, setRole] = useState<RoleLevel>('all');
  const [cat, setCat] = useState<Category>('all');
  const [style, setStyle] = useState<Style>('all');

  const cards = useMemo(() => {
    const list = topTab === 'style' ? STYLE_CARDS : JOB_CARDS;
    return list.filter((c) => {
      if (role !== 'all' && c.role !== role) return false;
      if (cat !== 'all' && c.cat !== cat) return false;
      if (style !== 'all' && c.style !== style) return false;
      return true;
    });
  }, [topTab, role, cat, style]);

  return (
    <div className="min-h-screen w-full bg-zp-templates text-white">
      {/* ============ 统一顶栏（与首页共享） ============ */}
      <SiteTopBar />

      {/* ============ 二级 Tab 行（3 个职类/风格/自定义） ============ */}
      <div className="max-w-[1440px] mx-auto px-8 pt-8 flex items-end justify-between">
        <div className="flex items-end gap-10">
          {([
            { id: 'job', label: '职类模板', emoji: '🧴' },
            { id: 'style', label: '风格模板', emoji: '🖌' },
            { id: 'custom', label: '自定义模板', emoji: '✨' },
          ] as { id: TopTab; label: string; emoji: string }[]).map((t) => {
            const active = topTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTopTab(t.id)}
                className={`relative flex items-center gap-2 pb-3 text-[18px] font-semibold transition-colors ${
                  active ? 'text-white' : 'text-white/55 hover:text-white/80'
                }`}
              >
                <span className="text-[22px]">{t.emoji}</span>
                <span>{t.label}</span>
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-3 zp-doodle-underline" />
                )}
              </button>
            );
          })}
        </div>

        {/* 右上：AI 智能简历生成胶囊 */}
        <button
          onClick={() => navigate('/editor')}
          className="group flex items-center gap-2 pl-3 pr-5 py-2 rounded-full text-sm font-semibold text-white transition-all"
          style={{
            background:
              'linear-gradient(135deg, rgba(102, 231, 180, 0.22) 0%, rgba(0, 166, 126, 0.45) 100%)',
            border: '1px solid rgba(102, 231, 180, 0.55)',
            boxShadow: '0 6px 22px rgba(0, 166, 126, 0.35)',
          }}
        >
          {/* 吉祥物小图标（简化） */}
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7BE9C6] to-[#009B73] flex items-center justify-center text-white">
            <Sparkles size={14} />
          </span>
          AI智能简历生成
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ============ 筛选条 ============ */}
      <div className="max-w-[1440px] mx-auto px-8 py-6 border-b border-white/5">
        {topTab === 'style' ? (
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm">风格:</span>
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`px-4 py-1 rounded-full text-sm transition-colors ${
                  style === s.id
                    ? 'bg-zp-primary text-white font-medium'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <span className="text-white/60 text-sm whitespace-nowrap">筛选条件</span>
            <FilterDropdown
              label="角色"
              value={role}
              options={ROLE_OPTIONS}
              onChange={(v) => setRole(v as RoleLevel)}
            />
            <FilterDropdown
              label="职类"
              value={cat}
              options={CAT_OPTIONS}
              onChange={(v) => setCat(v as Category)}
            />
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#112821] border border-white/10 w-64">
              <Search size={14} className="text-white/50" />
              <input
                placeholder="搜索模板"
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/35"
              />
            </div>
          </div>
        )}
      </div>

      {/* ============ 模板九宫格 ============ */}
      <main className="max-w-[1440px] mx-auto px-8 py-8">
        {cards.length === 0 ? (
          <p className="text-center text-white/50 py-24">暂无匹配的模板，换个筛选条件试试</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {cards.map((c) => (
              <Link key={c.id} to="/editor">
                <TemplateCard card={c} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TemplatesPage;
