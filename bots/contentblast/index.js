#!/usr/bin/env node
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { program } = require('commander');
const cron = require('node-cron');
const logger = require('../lib/logger');
const { getTier, printTierBanner, checkMonthlyQuota, requireFeature, incrementUsage } = require('../lib/tiers');
const { generateContent } = require('./generator');
const { postToTwitter, postToLinkedIn } = require('./poster');

const VALID_PLATFORMS = ['twitter', 'linkedin', 'blog'];

async function runBlast(topic, requestedPlatforms, dryRun) {
  const tier = getTier();
  const limits = tier.contentblast;

  // Enforce monthly blast quota
  checkMonthlyQuota('contentblast', limits.maxBlastsPerMonth, 'blasts');

  // Filter platforms to only those allowed on this tier
  const platforms = requestedPlatforms.filter((p) => {
    if (!limits.platforms.includes(p)) {
      logger.warn(`Platform "${p}" is not available on the ${tier.label} plan — skipping.`);
      if (p === 'twitter' || p === 'linkedin') {
        logger.warn(`  Social posting requires Growth or Enterprise. Upgrade: set SUBSCRIPTION_TIER=growth in .env`);
      }
      return false;
    }
    return true;
  });

  if (platforms.length === 0) {
    logger.error('No allowed platforms remain after tier filtering. Upgrade to access more platforms.');
    process.exit(1);
  }

  const brandVoice = process.env.BRAND_VOICE || 'Professional but approachable. Data-driven, no jargon. Conversational tone.';

  logger.divider();
  logger.step(`ContentBlast Bot — Topic: "${topic}"`);
  logger.step(`Platforms: ${platforms.join(', ')} | Tier: ${tier.label} | Dry Run: ${dryRun}`);
  logger.divider();

  // Generate content
  logger.step('PHASE 1: Generating content with AI...');
  const results = await generateContent(topic, brandVoice, platforms);
  logger.blank();

  // Post to platforms
  if (!dryRun) {
    logger.step('PHASE 2: Publishing to platforms...');

    if (results.twitter?.raw?.thread) {
      try {
        await postToTwitter(results.twitter.raw.thread);
      } catch (err) {
        logger.error(`Twitter posting failed: ${err.message}`);
      }
    }

    if (results.linkedin?.formatted) {
      try {
        await postToLinkedIn(results.linkedin.formatted);
      } catch (err) {
        logger.error(`LinkedIn posting failed: ${err.message}`);
      }
    }

    if (results.blog) {
      logger.info('Blog post saved to output/ — upload to your CMS manually or integrate a blog API.');
    }
  } else {
    logger.warn('DRY RUN — Content generated and saved to output/, but NOT posted to any platform.');
    logger.blank();

    for (const [platform, result] of Object.entries(results)) {
      if (!result) continue;
      logger.data(`\n--- ${platform.toUpperCase()} PREVIEW ---`);
      console.log(result.formatted.slice(0, 600) + (result.formatted.length > 600 ? '\n...' : ''));
    }
  }

  // Track usage
  incrementUsage('contentblast');

  logger.blank();
  logger.divider();
  logger.success('ContentBlast Bot — Done!');
  logger.divider();
}

program
  .name('contentblast')
  .description('ContentBlast Bot — AI-powered multi-platform content generation and posting')
  .version('1.0.0');

program
  .command('blast')
  .description('Generate and post content now')
  .requiredOption('-t, --topic <topic>', 'The topic or angle for the content')
  .option('-p, --platforms <list>', 'Comma-separated platforms: twitter,linkedin,blog', 'twitter,linkedin,blog')
  .option('--dry-run', 'Generate content but do not post', false)
  .action(async (opts) => {
    printTierBanner('ContentBlast Bot');

    const requested = opts.platforms
      .split(',')
      .map((p) => p.trim().toLowerCase())
      .filter((p) => {
        if (!VALID_PLATFORMS.includes(p)) {
          logger.warn(`Unknown platform "${p}" — skipping`);
          return false;
        }
        return true;
      });

    if (requested.length === 0) {
      logger.error('No valid platforms specified.');
      process.exit(1);
    }

    await runBlast(opts.topic, requested, opts.dryRun);
  });

program
  .command('schedule')
  .description('Run on a cron schedule (Growth/Enterprise only)')
  .requiredOption('-t, --topic <topic>', 'Topic (supports {date} placeholder)')
  .option('-p, --platforms <list>', 'Platforms', 'twitter,linkedin,blog')
  .option('-c, --cron <expression>', 'Cron expression', '0 9 * * 1')
  .action((opts) => {
    printTierBanner('ContentBlast Bot');

    // Gate: scheduling requires Growth or Enterprise
    requireFeature(getTier().contentblast.scheduling, 'Scheduled content posting');

    const requested = opts.platforms.split(',').map((p) => p.trim().toLowerCase());
    logger.step(`Scheduling ContentBlast: "${opts.cron}" — topic: "${opts.topic}"`);
    logger.info('Press Ctrl+C to stop.');

    cron.schedule(opts.cron, async () => {
      const topic = opts.topic.replace('{date}', new Date().toLocaleDateString());
      await runBlast(topic, requested, false);
    });
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
