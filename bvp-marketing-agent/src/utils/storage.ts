import type { ContentItem, Campaign, AppSettings, GraderResponses } from '../types';

const KEYS = {
  CONTENT: 'bvp_content_items',
  CAMPAIGNS: 'bvp_campaigns',
  SETTINGS: 'bvp_settings',
  GRADER: 'bvp_grader_responses',
  SEEDED: 'bvp_seeded',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export const storage = {
  getContentItems: (): ContentItem[] => safeGet<ContentItem[]>(KEYS.CONTENT, []),
  setContentItems: (items: ContentItem[]) => safeSet(KEYS.CONTENT, items),

  getCampaigns: (): Campaign[] => safeGet<Campaign[]>(KEYS.CAMPAIGNS, []),
  setCampaigns: (campaigns: Campaign[]) => safeSet(KEYS.CAMPAIGNS, campaigns),

  getSettings: (): AppSettings | null => safeGet<AppSettings | null>(KEYS.SETTINGS, null),
  setSettings: (settings: AppSettings) => safeSet(KEYS.SETTINGS, settings),

  getGraderResponses: (): GraderResponses => safeGet<GraderResponses>(KEYS.GRADER, { responses: {} }),
  setGraderResponses: (responses: GraderResponses) => safeSet(KEYS.GRADER, responses),

  isSeeded: (): boolean => safeGet<boolean>(KEYS.SEEDED, false),
  markSeeded: () => safeSet(KEYS.SEEDED, true),

  clearAll: () => {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },

  exportAll: () => {
    return {
      contentItems: storage.getContentItems(),
      campaigns: storage.getCampaigns(),
      settings: storage.getSettings(),
      graderResponses: storage.getGraderResponses(),
      exportedAt: new Date().toISOString(),
    };
  },
};
