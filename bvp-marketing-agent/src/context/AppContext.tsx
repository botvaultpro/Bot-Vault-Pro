import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { AppState, AppAction, ContentItem, Campaign } from '../types';
import { storage } from '../utils/storage';
import { generateId, nowISO, toISODate } from '../utils/dateHelpers';
import { seedEngagementScore } from '../utils/scoring';
import { format, addDays } from 'date-fns';

// ─── Seed Data ───────────────────────────────────────────────────────────────

function buildSeedData(): { contentItems: ContentItem[]; campaigns: Campaign[] } {
  const now = new Date();

  const contentItems: ContentItem[] = [
    {
      id: generateId(),
      title: '5 Signs Your Business Needs a Marketing Strategy',
      platform: 'blog',
      contentType: 'blog',
      status: 'published',
      goal: 'awareness',
      scheduledDate: format(addDays(now, -18), 'yyyy-MM-dd'),
      notes: 'Target keyword: marketing strategy for small businesses',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      title: 'How We Helped a Freelancer 3x Their Revenue',
      platform: 'linkedin',
      contentType: 'post',
      status: 'published',
      goal: 'conversion',
      scheduledDate: format(addDays(now, -14), 'yyyy-MM-dd'),
      notes: 'Case study format. Include testimonial quote.',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      title: 'Behind the Scenes: My Weekly Content Process',
      platform: 'instagram',
      contentType: 'reel',
      status: 'published',
      goal: 'engagement',
      scheduledDate: format(addDays(now, -10), 'yyyy-MM-dd'),
      notes: 'Show Notion setup, scheduling workflow',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      title: 'Q1 Newsletter: Wins, Lessons, and What\'s Coming',
      platform: 'email',
      contentType: 'newsletter',
      status: 'published',
      goal: 'retention',
      scheduledDate: format(addDays(now, -7), 'yyyy-MM-dd'),
      notes: 'Segment: existing clients',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      title: 'The Biggest Content Mistake Freelancers Make',
      platform: 'linkedin',
      contentType: 'post',
      status: 'scheduled',
      goal: 'awareness',
      scheduledDate: format(addDays(now, 2), 'yyyy-MM-dd'),
      notes: 'Hook: "I spent $2,000 learning this lesson so you don\'t have to"',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      title: 'Tutorial: Repurpose 1 Blog Post into 10 Pieces',
      platform: 'youtube',
      contentType: 'video',
      status: 'scheduled',
      goal: 'engagement',
      scheduledDate: format(addDays(now, 4), 'yyyy-MM-dd'),
      notes: 'Thumbnail: split-screen before/after',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      title: 'Free Audit: Is Your Marketing Working?',
      platform: 'instagram',
      contentType: 'story',
      status: 'scheduled',
      goal: 'conversion',
      scheduledDate: format(addDays(now, 6), 'yyyy-MM-dd'),
      notes: 'Link to Calendly booking page',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      title: 'Monthly Wrap: Top 3 Posts + What Worked',
      platform: 'email',
      contentType: 'newsletter',
      status: 'draft',
      goal: 'retention',
      scheduledDate: format(addDays(now, 12), 'yyyy-MM-dd'),
      notes: 'Pull top performing analytics from BVP Marketing Agent',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
  ].map((item) => ({ ...item, engagementScore: seedEngagementScore(item as ContentItem) })) as ContentItem[];

  const campaigns: Campaign[] = [
    {
      id: generateId(),
      name: 'Q2 Lead Generation Push',
      description: 'Drive 20 new qualified leads through LinkedIn and blog content over 6 weeks.',
      platforms: ['linkedin', 'blog'],
      goal: 'conversion',
      targetAudience: 'Small business owners, 10–50 employees, service-based industries',
      budget: 500,
      startDate: toISODate(now),
      endDate: format(addDays(now, 42), 'yyyy-MM-dd'),
      stage: 'creation',
      priority: 'high',
      notes: 'Align with spring promotion. Coordinate with email sequence.',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      name: 'Brand Awareness: Reels Series',
      description: '6-part Instagram Reels series showcasing client transformations.',
      platforms: ['instagram'],
      goal: 'awareness',
      targetAudience: 'Freelancers and solopreneurs, 25–45',
      startDate: format(addDays(now, -5), 'yyyy-MM-dd'),
      endDate: format(addDays(now, 30), 'yyyy-MM-dd'),
      stage: 'scheduled',
      priority: 'medium',
      notes: 'Episode 1 & 2 already live.',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      id: generateId(),
      name: 'Email Nurture Sequence — New Subscribers',
      description: '5-email onboarding sequence for new newsletter subscribers.',
      platforms: ['email'],
      goal: 'retention',
      targetAudience: 'New subscribers (last 30 days)',
      startDate: format(addDays(now, 14), 'yyyy-MM-dd'),
      endDate: format(addDays(now, 60), 'yyyy-MM-dd'),
      stage: 'ideation',
      priority: 'medium',
      notes: 'Map out email topics and cadence first. Research competitors.',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
  ];

  return { contentItems, campaigns };
}

// ─── Default State ────────────────────────────────────────────────────────────

const defaultSettings: AppState['settings'] = {
  businessName: 'My Business',
  industry: 'Freelance / Consulting',
  targetAudience: 'Small business owners and entrepreneurs',
  primaryGoal: 'conversion',
  activePlatforms: ['instagram', 'linkedin', 'email'],
  defaultPlatform: 'linkedin',
  defaultGoal: 'awareness',
  preferredTimes: {
    instagram: '09:00',
    linkedin: '08:00',
    blog: '10:00',
    youtube: '14:00',
    email: '07:00',
    twitter: '09:30',
    facebook: '11:00',
  },
};

function buildInitialState(): AppState {
  const savedContent = storage.getContentItems();
  const savedCampaigns = storage.getCampaigns();
  const savedSettings = storage.getSettings();
  const savedGrader = storage.getGraderResponses();

  let contentItems = savedContent;
  let campaigns = savedCampaigns;

  if (!storage.isSeeded()) {
    const seed = buildSeedData();
    contentItems = seed.contentItems;
    campaigns = seed.campaigns;
    storage.setContentItems(contentItems);
    storage.setCampaigns(campaigns);
    storage.markSeeded();
  }

  return {
    contentItems,
    campaigns,
    settings: savedSettings ?? defaultSettings,
    graderResponses: savedGrader,
    activeView: 'dashboard',
    sidebarCollapsed: false,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'ADD_CONTENT': {
      const updated = [...state.contentItems, action.payload];
      storage.setContentItems(updated);
      return { ...state, contentItems: updated };
    }

    case 'UPDATE_CONTENT': {
      const updated = state.contentItems.map((i) =>
        i.id === action.payload.id ? action.payload : i
      );
      storage.setContentItems(updated);
      return { ...state, contentItems: updated };
    }

    case 'DELETE_CONTENT': {
      const updated = state.contentItems.filter((i) => i.id !== action.payload);
      storage.setContentItems(updated);
      return { ...state, contentItems: updated };
    }

    case 'ADD_CAMPAIGN': {
      const updated = [...state.campaigns, action.payload];
      storage.setCampaigns(updated);
      return { ...state, campaigns: updated };
    }

    case 'UPDATE_CAMPAIGN': {
      const updated = state.campaigns.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
      storage.setCampaigns(updated);
      return { ...state, campaigns: updated };
    }

    case 'DELETE_CAMPAIGN': {
      const updated = state.campaigns.filter((c) => c.id !== action.payload);
      storage.setCampaigns(updated);
      return { ...state, campaigns: updated };
    }

    case 'MOVE_CAMPAIGN': {
      const updated = state.campaigns.map((c) =>
        c.id === action.payload.id
          ? { ...c, stage: action.payload.stage, updatedAt: nowISO() }
          : c
      );
      storage.setCampaigns(updated);
      return { ...state, campaigns: updated };
    }

    case 'UPDATE_SETTINGS': {
      const updated = { ...state.settings, ...action.payload };
      storage.setSettings(updated);
      return { ...state, settings: updated };
    }

    case 'SAVE_GRADER': {
      storage.setGraderResponses(action.payload);
      return { ...state, graderResponses: action.payload };
    }

    case 'CLEAR_ALL_DATA': {
      storage.clearAll();
      return { ...buildInitialState(), contentItems: [], campaigns: [] };
    }

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  // Persist settings whenever they change (already handled in reducer, this is belt-and-suspenders)
  useEffect(() => {
    storage.setSettings(state.settings);
  }, [state.settings]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}

export function useAppDispatch() {
  return useAppContext().dispatch;
}

export function useContentItems() {
  return useAppContext().state.contentItems;
}

export function useCampaigns() {
  return useAppContext().state.campaigns;
}

export function useSettings() {
  return useAppContext().state.settings;
}

export function useGraderResponses() {
  return useAppContext().state.graderResponses;
}

export { generateId, nowISO };
