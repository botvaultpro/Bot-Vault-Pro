export type Tier = "free" | "starter" | "growth" | "enterprise";

export interface TierLimits {
  name: string;
  price: number | null;
  leadgen: {
    leadsPerRun: number;
    aiQualification: boolean;
    emailSteps: number;
  };
  contentblast: {
    platforms: string[];
    blastsPerMonth: number;
    cronScheduling: boolean;
  };
  supportdesk: {
    ticketsPerMonth: number;
    imapPolling: boolean;
    knowledgeBaseFiles: number;
    escalationEmails: boolean;
  };
  sitebuilder: {
    prospectsPerMonth: number;
    aiScoring: boolean;
    demoGeneration: boolean;
    proposalSteps: number;
    pipelineCRM: boolean;
  };
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    name: "Free",
    price: 0,
    leadgen: { leadsPerRun: 1, aiQualification: false, emailSteps: 0 },
    contentblast: { platforms: ["blog"], blastsPerMonth: 1, cronScheduling: false },
    supportdesk: { ticketsPerMonth: 1, imapPolling: false, knowledgeBaseFiles: 1, escalationEmails: false },
    sitebuilder: { prospectsPerMonth: 1, aiScoring: false, demoGeneration: false, proposalSteps: 0, pipelineCRM: false },
  },
  starter: {
    name: "Starter",
    price: 49,
    leadgen: { leadsPerRun: 25, aiQualification: false, emailSteps: 1 },
    contentblast: { platforms: ["blog"], blastsPerMonth: 10, cronScheduling: false },
    supportdesk: { ticketsPerMonth: 50, imapPolling: false, knowledgeBaseFiles: 1, escalationEmails: false },
    sitebuilder: { prospectsPerMonth: 10, aiScoring: false, demoGeneration: true, proposalSteps: 1, pipelineCRM: false },
  },
  growth: {
    name: "Growth",
    price: 149,
    leadgen: { leadsPerRun: 250, aiQualification: true, emailSteps: 3 },
    contentblast: { platforms: ["blog", "twitter", "linkedin"], blastsPerMonth: 100, cronScheduling: true },
    supportdesk: { ticketsPerMonth: 500, imapPolling: true, knowledgeBaseFiles: 10, escalationEmails: true },
    sitebuilder: { prospectsPerMonth: 100, aiScoring: true, demoGeneration: true, proposalSteps: 3, pipelineCRM: true },
  },
  enterprise: {
    name: "Enterprise",
    price: null,
    leadgen: { leadsPerRun: 999999, aiQualification: true, emailSteps: 3 },
    contentblast: { platforms: ["blog", "twitter", "linkedin", "email"], blastsPerMonth: 999999, cronScheduling: true },
    supportdesk: { ticketsPerMonth: 999999, imapPolling: true, knowledgeBaseFiles: 999999, escalationEmails: true },
    sitebuilder: { prospectsPerMonth: 999999, aiScoring: true, demoGeneration: true, proposalSteps: 3, pipelineCRM: true },
  },
};

export function getTierFromPriceId(priceId: string): Tier {
  const map: Record<string, Tier> = {
    "price_1TBb4MEXeLLfaSZwYsdSKkAi": "starter",
    "price_1TBb4cEXeLLfaSZwqE6EwbYx": "growth",
    "price_1TBb59EXeLLfaSZwSCYLcBVa": "enterprise",
  };
  return map[priceId] ?? "free";
}
