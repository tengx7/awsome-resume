<div align="center">

# 🚀 简历神器 · Awsome Resume

**AI 驱动的专业简历制作工具 —— 从模板到 Offer，一站搞定**

一款基于 **React 18 + TypeScript + Vite** 构建的开源简历工具。支持多模板切换、岗位定向匹配度分析、AI 一键改写 / 量化 / STAR 化、高质量 PDF 导出，**零后端、零注册、开箱即用**。

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/tengx7/awsome-resume?style=social)](https://github.com/tengx7/awsome-resume)

[🌐 在线体验](#快速开始) · [📖 功能特性](#功能特性) · [🗺️ 路线图](#路线图--roadmap) · [🤝 参与贡献](https://github.com/tengx7/awsome-resume/issues)

</div>
<img width="1719" height="973" alt="image" src="https://github.com/user-attachments/assets/d446c72c-fba1-41a6-8abf-1d4366a1449d" />

---

## ✨ 功能特性

### 🤖 AI 助手

完全由用户自带 Key、浏览器直连，**零后端、零隐私泄露**：

- **字段级改写**：每个关键字段旁 ✨ 按钮，支持 **润色 / 量化 / STAR 化 / 压缩 / 扩写 / 译为英文** 6 种模式，流式生成、一键采纳
- **岗位定向（JD 对齐）**：粘贴目标岗位 JD，自动计算 **匹配度评分**、**命中 / 缺失关键词**、分版块改写建议
- **多 Provider 支持**：OpenAI / DeepSeek / OpenRouter / Kimi / Ollama 本地 / 自定义，一键切换
- **隐私友好**：API Key 仅存本地 `localStorage`，不经任何中间服务器

### 🎨 简历模板

内置 **7 套** 专业模板，覆盖不同求职场景：

| 模板 | 风格 | 适用场景 |
|------|------|---------|
| **现代** | 彩色页眉 + 标签式技能 | 互联网、产品、设计岗位 |
| **经典** | 居中对齐、传统排版 | 金融、行政、管培生 |
| **极简** | 大量留白、轻量字重 | 设计师、创意行业 |
| **技术** | 深色左侧栏 + 双栏布局 | 研发工程师、技术岗位 |
| **创意** | 不对称布局 + 强色块 | 设计、品牌、内容岗位 |
| **优雅** | 细衬线 + 留白 | 咨询、法律、高端管理 |
| **紧凑** | 单页高密度排版 | 多经历资深候选人 |

### 🎛️ 样式定制

- **颜色主题**：10+ 种配色一键切换
- **字体风格**：无衬线 / 衬线 / 等宽 + 国风字体（苹方 / 宋体 / 楷体）
- **字体大小**：进度条式精细调节（10–18px，步进 0.5px）
- **自定义预设**：把当前模板 + 颜色 + 字体 + 模块配置保存为预设，支持导入 / 导出 JSON，随时复用

### 📝 简历内容模块

支持以下 8 个独立可编辑模块，**可自由排序、隐藏、重命名**：

- 基本信息（姓名、职位、头像、联系方式、个人简介）
- 工作经历（公司、职务、时间段、工作描述、量化成就）
- 教育经历（学校、专业、学历、GPA）
- 专业技能（分类技能标签，支持批量添加 / 删除）
- 项目经历（项目名称、角色、描述、技术栈、链接）
- 证书 & 荣誉
- 语言能力
- 自定义模块（自由添加任意内容）

### 📦 其他功能

- **实时预览**：左侧编辑，右侧即时同步渲染，支持缩放（30%—120%）
- **PDF 导出**：高质量 A4 格式，导出效果与预览完全一致
- **JSON 备份 / 恢复**：将简历数据导出为 JSON 文件，随时导入恢复
- **浏览器打印**：一键调用系统打印功能
- **自动持久化**：数据实时保存至 `localStorage`，刷新页面不丢失
- **重置示例**：一键恢复为内置示例数据，方便快速体验

---

## 🚀 快速开始

### 环境要求

| 工具 | 版本要求 |
|------|---------|
| Node.js | ≥ 18 |
| pnpm | ≥ 8（推荐）|

> 也可以使用 `npm` 或 `yarn`，将下方命令中的 `pnpm` 替换即可。

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/tengx7/awsome-resume.git
cd awsome-resume

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
```

启动成功后，在浏览器打开 [http://localhost:5173](http://localhost:5173) 即可使用。

### 构建生产版本

```bash
# 构建产物输出至 dist/ 目录
pnpm build

# 本地预览构建结果
pnpm preview
```

---

## 📁 项目结构

```
awsome-resume/
├── public/
│   └── favicon.svg
├── src/
│   ├── types/
│   │   └── resume.ts              # 完整 TypeScript 类型定义
│   ├── data/
│   │   └── defaults.ts            # 默认数据 & 颜色主题 & 字体配置
│   ├── store/
│   │   ├── resumeStore.ts         # 简历数据 & 设置（Zustand + localStorage）
│   │   └── aiStore.ts             # AI 配置 & JD & 分析结果
│   ├── services/
│   │   └── ai/
│   │       ├── types.ts           # AI 服务层类型
│   │       ├── providers.ts       # 内置 Provider 预设
│   │       ├── prompts.ts         # 中英双版 Prompt 模板
│   │       └── index.ts           # 改写/打分/JD 分析统一 API（SSE 流式）
│   ├── templates/
│   │   ├── ModernTemplate.tsx     # 现代
│   │   ├── ClassicTemplate.tsx    # 经典
│   │   ├── MinimalTemplate.tsx    # 极简
│   │   ├── TechTemplate.tsx       # 技术双栏
│   │   ├── CreativeTemplate.tsx   # 创意
│   │   ├── ElegantTemplate.tsx    # 优雅
│   │   ├── CompactTemplate.tsx    # 紧凑
│   │   └── index.tsx              # 模板路由
│   ├── components/
│   │   ├── TopBar.tsx             # 顶部导航 / AI 助手入口 / 导出
│   │   ├── PreviewPanel.tsx       # 实时预览 & 缩放
│   │   ├── SettingsPanel.tsx      # 模板 / 颜色 / 字体 / 预设
│   │   ├── ai/
│   │   │   ├── AIFieldButton.tsx     # 字段旁 ✨ 按钮（流式改写）
│   │   │   ├── AIAssistantPanel.tsx  # 右侧抽屉：JD 匹配度分析
│   │   │   └── AISettingsModal.tsx   # AI 服务配置弹窗
│   │   └── editor/
│   │       ├── EditorPanel.tsx    # 编辑器主容器（可拖拽 / 隐藏 / 重命名）
│   │       ├── PersonalForm.tsx
│   │       ├── WorkExperienceForm.tsx
│   │       ├── EducationForm.tsx
│   │       ├── SkillsForm.tsx
│   │       ├── ProjectsForm.tsx
│   │       └── OtherForms.tsx
│   ├── utils/
│   │   └── export.ts              # PDF & JSON 导出工具函数
│   ├── App.tsx                    # 根组件 & 布局
│   ├── main.tsx                   # 入口文件
│   └── index.css                  # 全局样式 & Tailwind 引入
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 4 |
| 样式方案 | Tailwind CSS 3 |
| 状态管理 | Zustand 4（含 `persist` 中间件） |
| PDF 生成 | html2canvas + jsPDF |
| 图标库 | Lucide React |

---

## 🗺️ 路线图 / Roadmap

> 简历神器的愿景：**从"简历模板工具" → "AI 求职助理"**。下方功能按优先级排序，打勾表示已上线。

### 🚀 近期规划（Next Up）

#### 1. AI 一键成稿（Auto-Fill）⭐ 高优先

- [ ] **自由表述 → 结构化简历**：用户粘贴一段"自我介绍式"流水账，AI 自动解析并填充到所有模块，每条工作经历自动拆成 STAR 格式的成就点
- [ ] **支持从已有简历 / LinkedIn 导入**：上传旧版 PDF / DOCX 简历，AI 解析后按新模板重新组织内容
- [ ] **问答式引导**：对简历空白较多的用户，AI 以聊天形式逐项提问，边聊边自动填表
- [ ] **STAR 法则改造**：对每条已填的工作成就，一键检查 S/T/A/R 完整度，缺哪补哪

#### 2. JD 定向一键优化（One-Click Tailor）⭐ 高优先

- [ ] **一键对齐 JD**：点一个按钮，AI 基于 JD 自动改写简历中所有相关字段，不只是给建议
- [ ] **Diff 预览 + 多选采纳**：逐字段显示改动前后对比，用户可批量勾选接受 / 拒绝
- [ ] **多版本简历工作区**：同一份母版派生出"投字节版 / 投腾讯版"，互不干扰
- [ ] **关键词加粗提示**：在预览里高亮 JD 中要求但简历未覆盖的关键词

#### 3. 矢量 PDF 导出（ATS 友好）

- [ ] 用 `@react-pdf/renderer` 实现**真正的矢量 PDF**，替代现有 html2canvas 光栅化方案
- [ ] 文字可复制、可被 ATS（大厂简历筛选系统）正确解析
- [ ] 双轨导出：矢量版（机器读）+ 光栅版（100% 还原样式）

### 🔮 中期规划（Later）

#### 4. STAR 评分卡

- [ ] 对每条成就即时打分（0-100 分），标出短板维度并给针对性改写
- [ ] 整份简历一键体检，输出薄弱项报告

#### 5. 投递看板（Job Tracker）

- [ ] 看板式管理"投递 → 笔试 → 面试 → Offer"
- [ ] 每个岗位关联一份定向简历 + JD + 面试笔记
- [ ] 提醒跟进、面试倒计时、拒信分析

#### 6. 面试准备（Interview Coach）

- [ ] 基于简历 + JD，AI 生成高频面试题库
- [ ] 口述练习 + AI 点评（结合简历上的项目经历出题）
- [ ] 一键生成 Cover Letter / 自荐信

#### 7. 多模板体系扩展

- [ ] 行业专项模板：学术（CV）/ 海外（英文简历）/ 创意作品集型
- [ ] 自定义布局编辑器：用户自由拖拽生成新模板
- [ ] 模板市场：用户互相分享自定义预设

### 🌏 长期愿景（Vision）

- [ ] **多语言版本**：中文 / English / 日本語 / 한국어，对应不同国家简历习惯
- [ ] **团队版**：校招机构 / 求职辅导老师批量管理学生简历
- [ ] **浏览器插件**：在招聘网站上一键抓取 JD，直接推送到简历神器做定向优化
- [ ] **数据自托管**：支持对接用户自己的对象存储 / 私有仓库，云端同步但数据归你自己

### ✅ 已完成（Done）

- [x] 7 套专业模板 + 10+ 颜色主题 + 字体风格定制
- [x] 字体大小进度条精细调节（10—18px）
- [x] 模块拖拽排序 / 显隐切换 / 自由重命名
- [x] 自定义预设保存 · 导入 · 导出 · 一键应用
- [x] AI 字段级改写（润色 / 量化 / STAR / 压缩 / 扩写 / 翻译）流式响应
- [x] JD 匹配度分析 · 关键词命中高亮 · 分板块改写建议
- [x] 多 AI Provider 支持（OpenAI / DeepSeek / OpenRouter / Kimi / Ollama / 自定义）
- [x] 所有 AI 调用浏览器直连，密钥本地存储零后端

---

## 🤝 参与贡献

欢迎任何形式的贡献！

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feat/your-feature`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feat/your-feature`
5. 提交 Pull Request

> 💡 有想法或 Bug？欢迎在 [Issues](https://github.com/tengx7/awsome-resume/issues) 提出！

---

## 📬 联系作者

<div align="center">

**程序员腾哥** · 专注 AI 工具 & 求职效率提升

扫码添加微信，获取最新动态 👇

<img src="public/wechat-qr.png" width="160" alt="程序员腾哥微信二维码" />

[![GitHub](https://img.shields.io/badge/GitHub-tengx7-181717?logo=github)](https://github.com/tengx7/awsome-resume)

</div>

---

## 📄 开源协议

[MIT License](LICENSE) · 欢迎 Fork、Star ⭐ 和 PR 贡献。
