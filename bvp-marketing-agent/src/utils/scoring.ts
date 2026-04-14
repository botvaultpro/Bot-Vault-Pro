import type { ContentItem, Campaign, GraderResponses } from '../types';
import { subDays, parseISO, isWithinInterval, isValid } from './dateHelpers';

export interface ScoreBreakdown {
  consistency: number;      // 0-25
  platformDiversity: number; // 0-25
  goalCoverage: number;     // 0-25
  pipelineHealth: number;   // 0-25
  selfAssessment: number;   // 0-100 (normalized later)
  total: number;            // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function scoreConsistency(items: ContentItem[]): number {
  if (items.length === 0) return 0;
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const recent = items.filter((item) => {
    try {
      const d = parseISO(item.scheduledDate);
      if (!isValid(d)) return false;
      return isWithinInterval(d, { start: thirtyDaysAgo, end: now });
    } catch {
      return false;
    }
  });
  // 12+ posts in 30 days = full score, scale down linearly
  const score = Math.min(recent.length / 12, 1) * 25;
  return Math.round(score);
}

function scorePlatformDiversity(items: ContentItem[]): number {
  const platforms = new Set(items.map((i) => i.platform));
  if (platforms.size >= 3) return 25;
  if (platforms.size === 2) return 15;
  if (platforms.size === 1) return 8;
  return 0;
}

function scoreGoalCoverage(items: ContentItem[]): number {
  const goals = new Set(items.map((i) => i.goal));
  return Math.round((goals.size / 4) * 25);
}

function scorePipelineHealth(campaigns: Campaign[]): number {
  if (campaigns.length === 0) return 0;
  const stages = new Set(campaigns.map((c) => c.stage));
  if (stages.size >= 4) return 25;
  if (stages.size === 3) return 18;
  if (stages.size === 2) return 12;
  return 6;
}

function scoreSelfAssessment(responses: GraderResponses): number {
  const entries = Object.values(responses.responses);
  if (entries.length === 0) return 50; // neutral if not completed
  const total = entries.reduce((sum, v) => sum + v, 0);
  const max = entries.length * 5;
  return Math.round((total / max) * 100);
}

function letterGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function buildRecommendations(
  items: ContentItem[],
  campaigns: Campaign[],
  responses: GraderResponses,
  consistency: number,
  platformDiversity: number,
  goalCoverage: number,
  pipelineHealth: number
): string[] {
  const recs: string[] = [];

  if (consistency < 10) {
    recs.push(
      'Your posting frequency is very low. Aim for at least 3 posts per week across your active platforms — consistency signals credibility to audiences and algorithms alike.'
    );
  } else if (consistency < 18) {
    recs.push(
      'Increase posting cadence to 4–5x per week. Batch-create content every Sunday and schedule the week in advance to maintain momentum without daily effort.'
    );
  }

  if (platformDiversity < 15) {
    const platforms = new Set(items.map((i) => i.platform));
    if (platforms.size < 2) {
      recs.push(
        'You are only active on 1 platform. Adding LinkedIn for B2B lead generation or an email newsletter typically increases lead quality and reduces algorithm dependency.'
      );
    } else if (platforms.size < 3) {
      recs.push(
        'You are on 2 platforms — consider adding a 3rd channel (email list or blog) to own your audience instead of renting attention from social platforms.'
      );
    }
  }

  if (goalCoverage < 20) {
    const goals = new Set(items.map((i) => i.goal));
    if (!goals.has('conversion')) {
      recs.push(
        'Your content has zero Conversion-goal pieces. Add at least 1 CTA-driven post per week — a direct offer, testimonial, or case study. Awareness without conversion is just brand awareness, not revenue.'
      );
    }
    if (!goals.has('retention')) {
      recs.push(
        'You have no Retention content. Re-engagement posts, client wins, and behind-the-scenes content keep warm leads from going cold. Add 1–2 per month.'
      );
    }
  }

  if (pipelineHealth < 12) {
    if (campaigns.length === 0) {
      recs.push(
        'You have no campaigns set up. Create at least 1 active campaign to organize your content around a specific goal or offer — campaigns with defined goals convert 3x better than ad-hoc posting.'
      );
    } else {
      recs.push(
        'All your campaigns are in the same stage. Move content through the pipeline regularly — having campaigns in Ideation, Creation, and Scheduled simultaneously keeps your content engine running.'
      );
    }
  }

  const r = responses.responses;
  if ((r[3] ?? 3) <= 2) {
    recs.push(
      'You rarely repurpose content. One blog post can become 5 social posts, 1 email, and 2 short-form videos. Repurposing multiplies your output without multiplying your effort.'
    );
  }
  if ((r[8] ?? 3) <= 2) {
    recs.push(
      'You are not reviewing analytics monthly. Set a 30-minute monthly review to identify your top 3 performing posts and double down on those content formats and topics.'
    );
  }

  return recs.slice(0, 5);
}

export function calculateScore(
  items: ContentItem[],
  campaigns: Campaign[],
  responses: GraderResponses
): ScoreBreakdown {
  const consistency = scoreConsistency(items);
  const platformDiversity = scorePlatformDiversity(items);
  const goalCoverage = scoreGoalCoverage(items);
  const pipelineHealth = scorePipelineHealth(campaigns);
  const selfRaw = scoreSelfAssessment(responses);

  // Auto-score is out of 100 (4 categories × 25)
  const autoScore = consistency + platformDiversity + goalCoverage + pipelineHealth;
  // Blend: 60% auto-data, 40% self-assessment
  const total = clamp(Math.round(autoScore * 0.6 + selfRaw * 0.4), 0, 100);

  const recommendations = buildRecommendations(
    items,
    campaigns,
    responses,
    consistency,
    platformDiversity,
    goalCoverage,
    pipelineHealth
  );

  return {
    consistency,
    platformDiversity,
    goalCoverage,
    pipelineHealth,
    selfAssessment: selfRaw,
    total,
    grade: letterGrade(total),
    recommendations,
  };
}

/**
 * Seed a deterministic engagement score for a content item based on its metadata.
 * Used for analytics display since we have no real social API.
 */
export function seedEngagementScore(item: ContentItem): number {
  const baseByGoal: Record<string, number> = {
    engagement: 72,
    awareness: 58,
    conversion: 45,
    retention: 61,
  };
  const baseByType: Record<string, number> = {
    video: 15,
    reel: 18,
    story: 8,
    blog: 10,
    post: 5,
    email: 12,
    newsletter: 14,
  };
  const base = (baseByGoal[item.goal] ?? 55) + (baseByType[item.contentType] ?? 5);
  // Deterministic jitter from id
  const jitter = (item.id.charCodeAt(0) % 20) - 10;
  return clamp(base + jitter, 10, 99);
}
