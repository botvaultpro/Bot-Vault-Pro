'use strict';
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// ─── Tier definitions ─────────────────────────────────────────────────────────

const TIERS = {
  starter: {
    label: 'Starter',
    price: '$49/mo',
    leadgen: {
      maxLeadsPerRun: 25,
      aiQualification: false,
      emailSequenceSteps: 1,      // intro email only
    },
    contentblast: {
      platforms: ['blog'],        // no social posting
      maxBlastsPerMonth: 10,
      scheduling: false,
    },
    supportdesk: {
      imapPolling: false,         // manual reply only
      maxTicketsPerMonth: 50,
      maxKnowledgeFiles: 1,
      escalationEmail: false,
      minConfidenceFixed: 0.8,    // not configurable
    },
  },

  growth: {
    label: 'Growth',
    price: '$149/mo',
    leadgen: {
      maxLeadsPerRun: 250,
      aiQualification: true,
      emailSequenceSteps: 3,
    },
    contentblast: {
      platforms: ['twitter', 'linkedin', 'blog'],
      maxBlastsPerMonth: 100,
      scheduling: true,
    },
    supportdesk: {
      imapPolling: true,
      maxTicketsPerMonth: 500,
      maxKnowledgeFiles: 10,
      escalationEmail: true,
      minConfidenceFixed: null,   // user-configurable
    },
  },

  enterprise: {
    label: 'Enterprise',
    price: 'Custom',
    leadgen: {
      maxLeadsPerRun: Infinity,
      aiQualification: true,
      emailSequenceSteps: 3,
    },
    contentblast: {
      platforms: ['twitter', 'linkedin', 'blog'],
      maxBlastsPerMonth: Infinity,
      scheduling: true,
    },
    supportdesk: {
      imapPolling: true,
      maxTicketsPerMonth: Infinity,
      maxKnowledgeFiles: Infinity,
      escalationEmail: true,
      minConfidenceFixed: null,
    },
  },
};

// ─── Usage tracking ───────────────────────────────────────────────────────────

const USAGE_FILE = path.join(__dirname, '../.usage.json');

function loadUsage() {
  const monthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  if (fs.existsSync(USAGE_FILE)) {
    const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    if (data.month === monthKey) return data;
  }
  // New month or first run — reset counters
  return { month: monthKey, leadgen: 0, contentblast: 0, supportdesk: 0 };
}

function saveUsage(usage) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2));
}

function incrementUsage(bot, amount = 1) {
  const usage = loadUsage();
  usage[bot] = (usage[bot] || 0) + amount;
  saveUsage(usage);
  return usage[bot];
}

function getUsage(bot) {
  return loadUsage()[bot] || 0;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get the active tier from environment.
 * Defaults to 'starter' if not set or invalid.
 */
function getTier() {
  const raw = (process.env.SUBSCRIPTION_TIER || 'starter').toLowerCase().trim();
  if (!TIERS[raw]) {
    console.warn(chalk.yellow(`[WARN] Unknown SUBSCRIPTION_TIER "${raw}". Defaulting to "starter".`));
    return TIERS.starter;
  }
  return TIERS[raw];
}

function getTierName() {
  const raw = (process.env.SUBSCRIPTION_TIER || 'starter').toLowerCase().trim();
  return TIERS[raw] ? raw : 'starter';
}

/**
 * Print a styled tier banner at bot startup.
 */
function printTierBanner(botName) {
  const tier = getTier();
  const tierName = getTierName();

  const colors = { starter: chalk.cyan, growth: chalk.magenta, enterprise: chalk.yellow };
  const color = colors[tierName] || chalk.white;

  console.log(chalk.gray('─'.repeat(60)));
  console.log(
    `  ${chalk.bold('Bot Vault Pro')} — ${chalk.bold(botName)}  ${color(`[ ${tier.label} — ${tier.price} ]`)}`
  );
  console.log(chalk.gray('─'.repeat(60)));
}

/**
 * Check a monthly usage quota. Exits with upgrade message if exceeded.
 * @param {string} bot  'leadgen' | 'contentblast' | 'supportdesk'
 * @param {number} limit
 * @param {string} unitLabel  e.g. 'leads', 'blasts', 'tickets'
 */
function checkMonthlyQuota(bot, limit, unitLabel) {
  if (limit === Infinity) return; // enterprise — no limit
  const used = getUsage(bot);
  if (used >= limit) {
    const tier = getTier();
    const tierName = getTierName();
    console.error(chalk.red(`\n[LIMIT REACHED] You have used ${used}/${limit} ${unitLabel} this month on the ${tier.label} plan.`));
    console.error(chalk.yellow(`Upgrade to unlock more ${unitLabel}:`));
    printUpgradeTable(tierName, bot, unitLabel);
    process.exit(1);
  }
}

/**
 * Check a feature gate. Exits with upgrade message if not allowed.
 * @param {boolean} allowed
 * @param {string} featureName
 */
function requireFeature(allowed, featureName) {
  if (!allowed) {
    const tierName = getTierName();
    const tier = getTier();
    console.error(chalk.red(`\n[UPGRADE REQUIRED] "${featureName}" is not available on the ${tier.label} plan.`));
    console.error(chalk.yellow('Upgrade your plan to unlock this feature:'));
    printUpgradeOptions(tierName);
    process.exit(1);
  }
}

/**
 * Print a simple upgrade comparison table.
 */
function printUpgradeTable(currentTierName, bot, unitLabel) {
  const rows = Object.entries(TIERS)
    .filter(([name]) => name !== currentTierName)
    .map(([name, tier]) => {
      const botLimits = tier[bot];
      const limit = bot === 'leadgen' ? botLimits.maxLeadsPerRun
        : bot === 'contentblast' ? botLimits.maxBlastsPerMonth
        : botLimits.maxTicketsPerMonth;
      return {
        Plan: tier.label,
        Price: tier.price,
        [`${unitLabel}/month`]: limit === Infinity ? 'Unlimited' : limit,
      };
    });
  console.table(rows);
  console.error(chalk.gray('Set SUBSCRIPTION_TIER=growth or SUBSCRIPTION_TIER=enterprise in your .env\n'));
}

function printUpgradeOptions(currentTierName) {
  const rows = Object.entries(TIERS)
    .filter(([name]) => name !== currentTierName)
    .map(([, tier]) => ({ Plan: tier.label, Price: tier.price }));
  console.table(rows);
  console.error(chalk.gray('Set SUBSCRIPTION_TIER=growth or SUBSCRIPTION_TIER=enterprise in your .env\n'));
}

module.exports = {
  getTier,
  getTierName,
  printTierBanner,
  checkMonthlyQuota,
  requireFeature,
  incrementUsage,
  getUsage,
  TIERS,
};
