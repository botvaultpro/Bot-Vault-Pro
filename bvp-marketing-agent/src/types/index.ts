export type Platform = 'instagram' | 'linkedin' | 'blog' | 'youtube' | 'email' | 'twitter' | 'facebook';
export type ContentType = 'post' | 'video' | 'blog' | 'email' | 'story' | 'reel' | 'newsletter';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type ContentGoal = 'awareness' | 'engagement' | 'conversion' | 'retention';
export type CampaignStage = 'ideation' | 'creation' | 'review' | 'scheduled' | 'published';
export type Priority = 'high' | 'medium' | 'low';
export type NavView = 'dashboard' | 'calendar' | 'pipeline' | 'analytics' | 'grader' | 'settings';

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;
  contentType: ContentType;
  status: ContentStatus;
  goal: ContentGoal;
  scheduledDate: string; // ISO string
  notes: string;
  engagementScore?: number; // 0-100, seeded from metadata
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  goal: ContentGoal;
  targetAudience: string;
  budget?: number;
  startDate: string;
  endDate: string;
  stage: CampaignStage;
  priority: Priority;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  businessName: string;
  industry: string;
  targetAudience: string;
  primaryGoal: ContentGoal;
  activePlatforms: Platform[];
  defaultPlatform: Platform;
  defaultGoal: ContentGoal;
  preferredTimes: Record<Platform, string>;
}

export interface GraderResponses {
  responses: Record<number, number>; // question index → 1-5 score
  completedAt?: string;
}

export interface AppState {
  contentItems: ContentItem[];
  campaigns: Campaign[];
  settings: AppSettings;
  graderResponses: GraderResponses;
  activeView: NavView;
  sidebarCollapsed: boolean;
}

export type AppAction =
  | { type: 'SET_VIEW'; payload: NavView }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_CONTENT'; payload: ContentItem }
  | { type: 'UPDATE_CONTENT'; payload: ContentItem }
  | { type: 'DELETE_CONTENT'; payload: string }
  | { type: 'ADD_CAMPAIGN'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: Campaign }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'MOVE_CAMPAIGN'; payload: { id: string; stage: CampaignStage } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SAVE_GRADER'; payload: GraderResponses }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

export interface PlatformConfig {
  label: string;
  color: string;
  dotColor: string;
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  instagram: { label: 'Instagram', color: '#F97316', dotColor: 'bg-orange-500' },
  linkedin: { label: 'LinkedIn', color: '#3B82F6', dotColor: 'bg-blue-500' },
  blog: { label: 'Blog', color: '#22C55E', dotColor: 'bg-green-500' },
  youtube: { label: 'YouTube', color: '#A855F7', dotColor: 'bg-purple-500' },
  email: { label: 'Email', color: '#6B7280', dotColor: 'bg-gray-500' },
  twitter: { label: 'Twitter / X', color: '#06B6D4', dotColor: 'bg-cyan-500' },
  facebook: { label: 'Facebook', color: '#818CF8', dotColor: 'bg-indigo-400' },
};

export const GOAL_CONFIG: Record<ContentGoal, { label: string; color: string }> = {
  awareness: { label: 'Awareness', color: '#3B82F6' },
  engagement: { label: 'Engagement', color: '#F97316' },
  conversion: { label: 'Conversion', color: '#22C55E' },
  retention: { label: 'Retention', color: '#A855F7' },
};

export const STAGE_CONFIG: Record<CampaignStage, { label: string }> = {
  ideation: { label: 'Ideation' },
  creation: { label: 'Creation' },
  review: { label: 'Review' },
  scheduled: { label: 'Scheduled' },
  published: { label: 'Published' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: 'High', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  medium: { label: 'Medium', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  low: { label: 'Low', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};
