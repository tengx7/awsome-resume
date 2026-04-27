import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIConfig, JDAnalysis, ChatMessageItem, GuidancePhase } from '../services/ai/types';
import { DEFAULT_AI_CONFIG, getProviderPreset } from '../services/ai/providers';

interface AIStore {
  config: AIConfig;
  setConfig: (patch: Partial<AIConfig>) => void;
  /** 切换 provider：自动填充该 provider 的默认 baseURL/model */
  setProvider: (provider: AIConfig['provider']) => void;

  /** 当前粘贴的 JD */
  jd: string;
  setJD: (jd: string) => void;

  /** 最近一次 JD 分析结果 */
  lastAnalysis: JDAnalysis | null;
  analyzing: boolean;
  setLastAnalysis: (a: JDAnalysis | null) => void;
  setAnalyzing: (b: boolean) => void;

  /** 助手抽屉开关 */
  assistantOpen: boolean;
  setAssistantOpen: (b: boolean) => void;

  /** 设置弹窗开关 */
  settingsOpen: boolean;
  setSettingsOpen: (b: boolean) => void;

  // ========== 一键成稿（Auto-Fill）状态 ==========
  /** 一键成稿面板开关 */
  autoFillOpen: boolean;
  setAutoFillOpen: (b: boolean) => void;

  /** 是否已配置好（可用） */
  isReady: () => boolean;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_AI_CONFIG },
      setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
      setProvider: (provider) => {
        const preset = getProviderPreset(provider);
        set((s) => ({
          config: {
            ...s.config,
            provider,
            baseURL: preset?.baseURL || s.config.baseURL,
            model: preset?.defaultModel || s.config.model,
          },
        }));
      },

      jd: '',
      setJD: (jd) => set({ jd }),

      lastAnalysis: null,
      analyzing: false,
      setLastAnalysis: (a) => set({ lastAnalysis: a }),
      setAnalyzing: (b) => set({ analyzing: b }),

      assistantOpen: false,
      setAssistantOpen: (b) => set({ assistantOpen: b }),

      settingsOpen: false,
      setSettingsOpen: (b) => set({ settingsOpen: b }),

      // 一键成稿
      autoFillOpen: false,
      setAutoFillOpen: (b) => set({ autoFillOpen: b }),

      isReady: () => {
        const { config } = get();
        if (!config.baseURL || !config.model) return false;
        const preset = getProviderPreset(config.provider);
        if (preset?.requiresKey && !config.apiKey) return false;
        return true;
      },
    }),
    {
      name: 'resume-ai-storage',
      partialize: (state) => ({
        config: state.config,
        jd: state.jd,
        lastAnalysis: state.lastAnalysis,
      }),
    },
  ),
);
