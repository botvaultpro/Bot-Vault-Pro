#!/usr/bin/env node
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { program } = require('commander');
const path = require('path');
const logger = require('../lib/logger');
const { getTier, printTierBanner, checkMonthlyQuota, requireFeature, incrementUsage } = require('../lib/tiers');
const { discoverProspects } = require('./discoverer');
const { analyzeProspect } = require('./analyzer');
const { buildDemo } = require('./demo-builder');
const { sendProposal } = require('./proposer');
const { upsertProspect, moveStage, addNote, getProspects, printDashboard, STAGES } = require('./pipeline');

const DEFAULT_CSV = path.join(__dirname, 'knowledge/sample-prospects.csv');

// ─── Full Pipeline ────────────────────────────────────────────────────────────

async function runFullPipeline(csvFile, opts) {
  const tier = getTier();
  const limits = tier.sitebuilder;
  const freelancerName = process.env.FREELANCER_NAME || 'Your Name';

  printTierBanner('SiteBuilder Pro Bot');
  logger.info(`Tier: ${tier.label} | Max prospects/month: ${limits.maxProspectsPerMonth === Infinity ? 'Unlimited' : limits.maxProspectsPerMonth} | AI analysis: ${limits.aiAnalysis ? 'ON' : 'OFF'} | Email steps: ${limits.emailSequenceSteps}`);
  logger.blank();

  // ── PHASE 1: Discover ──────────────────────────────────────────────────────
  logger.divider();
  logger.step('PHASE 1: Discovering prospects...');
  checkMonthlyQuota('sitebuilder', limits.maxProspectsPerMonth, 'prospects');

  let prospects = await discoverProspects(csvFile);

  // Cap to monthly quota remaining
  const used = require('../lib/tiers').getUsage('sitebuilder');
  const remaining = limits.maxProspectsPerMonth === Infinity ? Infinity : limits.maxProspectsPerMonth - used;
  if (prospects.length > remaining) {
    logger.warn(`Capping to ${remaining} prospects (monthly quota on ${tier.label} plan)`);
    prospects = prospects.slice(0, remaining);
  }

  logger.success(`Discovered ${prospects.length} prospect(s)`);
  logger.blank();

  // ── PHASE 2: Analyze ───────────────────────────────────────────────────────
  logger.step('PHASE 2: Analyzing websites...');
  const analyzed = [];
  for (const p of prospects) {
    const result = await analyzeProspect(p, limits.aiAnalysis);
    const saved = upsertProspect(result);
    analyzed.push(saved);
    await new Promise((r) => setTimeout(r, 500));
  }

  const goodLeads = analyzed.filter((p) => p.needsWebsite || p.isGoodLead !== false);
  logger.success(`${goodLeads.length} of ${analyzed.length} are actionable leads (score ≤ 6 or no website)`);
  logger.blank();

  // ── PHASE 3: Generate Demos ────────────────────────────────────────────────
  logger.step('PHASE 3: Generating demo websites...');
  const withDemos = [];

  for (const p of goodLeads) {
    try {
      logger.step(`  Building demo for ${p.name}...`);
      const demoPath = await buildDemo(p, freelancerName);
      const updated = upsertProspect({ ...p, demoPath, stage: 'demo_ready' });
      withDemos.push(updated);
    } catch (err) {
      logger.error(`  Demo failed for ${p.name}: ${err.message}`);
      withDemos.push(p);
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  logger.blank();

  // ── PHASE 4: Send Proposals ────────────────────────────────────────────────
  logger.step(`PHASE 4: Sending proposals (${limits.emailSequenceSteps}-step sequence)...`);
  if (opts.dryRun) logger.warn('DRY RUN — emails previewed but not sent');

  for (const p of withDemos) {
    if (!p.email) { logger.warn(`  No email for ${p.name} — skipping`); continue; }
    await sendProposal(p, {
      freelancerName,
      demoUrl: p.demoPath ? `[Demo attached — open ${path.basename(path.dirname(p.demoPath))}/index.html]` : 'available on request',
      maxSteps: limits.emailSequenceSteps,
      dryRun: opts.dryRun,
    });
    upsertProspect({ ...p, stage: 'contacted' });
    incrementUsage('sitebuilder');
    await new Promise((r) => setTimeout(r, 1000));
  }

  logger.blank();
  logger.divider();
  logger.success('SiteBuilder Pro Bot — Pipeline complete!');
  printDashboard();
}

// ─── Commands ─────────────────────────────────────────────────────────────────

program
  .name('sitebuilder')
  .description('SiteBuilder Pro Bot — find weak/missing sites, generate demos, send proposals')
  .version('1.0.0');

// run — full pipeline
program
  .command('run')
  .description('Full pipeline: discover → analyze → demo → propose')
  .option('-f, --file <csv>', 'Prospects CSV file', DEFAULT_CSV)
  .option('--dry-run', 'Preview without sending emails', false)
  .action(async (opts) => {
    await runFullPipeline(opts.file, opts);
  });

// discover — just find + classify sites
program
  .command('discover')
  .description('Discover and classify prospect websites only')
  .option('-f, --file <csv>', 'Prospects CSV file', DEFAULT_CSV)
  .action(async (opts) => {
    printTierBanner('SiteBuilder Pro Bot');
    const prospects = await discoverProspects(opts.file);
    for (const p of prospects) upsertProspect(p);
    logger.success(`Discovered ${prospects.length} prospect(s). Run 'analyze' next.`);
  });

// analyze — score sites
program
  .command('analyze')
  .description('Analyze sites for all prospects in the pipeline')
  .action(async () => {
    printTierBanner('SiteBuilder Pro Bot');
    const limits = getTier().sitebuilder;
    const prospects = getProspects('new');
    if (prospects.length === 0) { logger.warn('No new prospects. Run discover first.'); return; }
    for (const p of prospects) {
      const result = await analyzeProspect(p, limits.aiAnalysis);
      upsertProspect(result);
    }
    logger.success('Analysis complete.');
  });

// demo — generate demo for a single prospect by email
program
  .command('demo <email>')
  .description('Generate a demo website for a specific prospect')
  .action(async (email) => {
    printTierBanner('SiteBuilder Pro Bot');
    const freelancerName = process.env.FREELANCER_NAME || 'Your Name';
    const prospects = getProspects().filter((p) => p.email.toLowerCase() === email.toLowerCase());
    if (prospects.length === 0) { logger.error(`Prospect not found: ${email}`); process.exit(1); }
    const p = prospects[0];
    const demoPath = await buildDemo(p, freelancerName);
    upsertProspect({ ...p, demoPath, stage: 'demo_ready' });
    logger.success(`Demo built: ${demoPath}`);
  });

// propose — send proposal to a single prospect
program
  .command('propose <email>')
  .description('Send proposal email(s) to a specific prospect')
  .option('--dry-run', 'Preview without sending', false)
  .action(async (email, opts) => {
    printTierBanner('SiteBuilder Pro Bot');
    const limits = getTier().sitebuilder;
    const freelancerName = process.env.FREELANCER_NAME || 'Your Name';
    const prospects = getProspects().filter((p) => p.email.toLowerCase() === email.toLowerCase());
    if (prospects.length === 0) { logger.error(`Prospect not found: ${email}`); process.exit(1); }
    const p = prospects[0];
    await sendProposal(p, {
      freelancerName,
      demoUrl: p.demoPath || 'available on request',
      maxSteps: limits.emailSequenceSteps,
      dryRun: opts.dryRun,
    });
    upsertProspect({ ...p, stage: 'contacted' });
  });

// pipeline — view dashboard or update stages
program
  .command('pipeline')
  .description('View the prospect pipeline dashboard')
  .action(() => { printDashboard(); });

program
  .command('stage <email> <stage>')
  .description(`Move a prospect to a new stage. Valid stages: ${STAGES.join(', ')}`)
  .action((email, stage) => {
    try {
      const p = moveStage(email, stage);
      logger.success(`${p.name} moved to "${stage}"`);
    } catch (err) {
      logger.error(err.message);
      process.exit(1);
    }
  });

program
  .command('note <email> <note>')
  .description('Add a note to a prospect')
  .action((email, note) => {
    try {
      const p = addNote(email, note);
      logger.success(`Note added to ${p.name}`);
    } catch (err) {
      logger.error(err.message);
    }
  });

program
  .command('tier')
  .description('Show current subscription tier and SiteBuilder limits')
  .action(() => {
    const { getTierName, TIERS, getUsage } = require('../lib/tiers');
    const chalk = require('chalk');
    const tierName = getTierName();
    const tier = TIERS[tierName];
    console.log('\n' + chalk.bold('SiteBuilder Pro Bot — Subscription Tier') + '\n');
    console.log(`  Plan:   ${chalk.cyan(tier.label)} (${tier.price})`);
    console.log(`  Month:  ${new Date().toISOString().slice(0, 7)}\n`);
    const sb = tier.sitebuilder;
    console.log(`  Prospects/month: ${sb.maxProspectsPerMonth === Infinity ? 'Unlimited' : sb.maxProspectsPerMonth}`);
    console.log(`  AI site analysis: ${sb.aiAnalysis ? 'Yes' : 'No (heuristic only)'}`);
    console.log(`  Demo generation: ${sb.demoGeneration ? 'Yes' : 'No'}`);
    console.log(`  Proposal email steps: ${sb.emailSequenceSteps}`);
    console.log(`  Pipeline CRM: ${sb.pipelineTracking ? 'Yes' : 'No'}`);
    console.log(`  Used this month: ${getUsage('sitebuilder')} prospects\n`);
    if (tierName !== 'enterprise') {
      console.log(chalk.yellow('  Upgrade: set SUBSCRIPTION_TIER=growth or enterprise in .env'));
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
