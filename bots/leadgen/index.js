#!/usr/bin/env node
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { program } = require('commander');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const logger = require('../lib/logger');
const { getTier, printTierBanner, checkMonthlyQuota, requireFeature, incrementUsage } = require('../lib/tiers');
const { scrapeFromFile } = require('./scraper');
const { qualifyLeads } = require('./qualifier');
const { sendToAllQualified } = require('./emailer');

const DEFAULT_DOMAINS_FILE = path.join(__dirname, 'knowledge/sample-targets.txt');
const DEFAULT_OUTPUT_CSV = path.join(__dirname, 'leads-output.csv');

program
  .name('leadgen')
  .description('LeadGen Pro Bot — scrape, qualify, and email leads automatically')
  .version('1.0.0');

program
  .command('run')
  .description('Full pipeline: scrape → qualify → email')
  .option('-d, --domains <file>', 'Path to domains file (one per line)', DEFAULT_DOMAINS_FILE)
  .option('-o, --output <csv>', 'Output CSV file for leads', DEFAULT_OUTPUT_CSV)
  .option('--dry-run', 'Preview everything without sending emails', false)
  .action(async (opts) => {
    printTierBanner('LeadGen Pro Bot');

    const tier = getTier();
    const limits = tier.leadgen;

    // Show active tier limits
    logger.info(`Tier limits: max ${limits.maxLeadsPerRun === Infinity ? 'unlimited' : limits.maxLeadsPerRun} leads/run | AI qualification: ${limits.aiQualification ? 'ON' : 'OFF'} | Email steps: ${limits.emailSequenceSteps}`);
    logger.blank();

    // ── PHASE 1: Scrape ─────────────────────────────────────────────────────
    logger.step('PHASE 1: Scraping target domains...');
    let rawLeads = await scrapeFromFile(opts.domains);
    logger.success(`Scraped ${rawLeads.length} total lead(s)`);

    // Enforce per-run lead cap
    if (rawLeads.length > limits.maxLeadsPerRun) {
      logger.warn(`Starter/Growth cap: trimming to ${limits.maxLeadsPerRun} leads (upgrade for more)`);
      rawLeads = rawLeads.slice(0, limits.maxLeadsPerRun);
    }
    logger.blank();

    if (rawLeads.length === 0) {
      logger.warn('No leads found. Check your domains file and try again.');
      process.exit(0);
    }

    // ── PHASE 2: Qualify ────────────────────────────────────────────────────
    let qualifiedLeads;
    if (limits.aiQualification) {
      logger.step('PHASE 2: Qualifying leads with AI...');
      const icpDescription = process.env.ICP_DESCRIPTION || 'B2B companies with 10-500 employees';
      qualifiedLeads = await qualifyLeads(rawLeads, icpDescription);
      const passing = qualifiedLeads.filter((l) => l.isQualified);
      logger.success(`${passing.length} of ${qualifiedLeads.length} lead(s) qualified`);
    } else {
      // Starter: no AI qualification — mark all as qualified with score 0
      logger.warn('PHASE 2: AI qualification not available on Starter plan — all leads included.');
      logger.warn('         Upgrade to Growth or Enterprise to enable AI lead scoring.');
      qualifiedLeads = rawLeads.map((l) => ({ ...l, score: null, reason: 'Not qualified (Starter plan)', isQualified: true }));
    }
    logger.blank();

    // ── PHASE 3: Export CSV ─────────────────────────────────────────────────
    logger.step('PHASE 3: Exporting to CSV...');
    const csvWriter = createObjectCsvWriter({
      path: opts.output,
      header: [
        { id: 'domain', title: 'Domain' },
        { id: 'email', title: 'Email' },
        { id: 'score', title: 'Score' },
        { id: 'isQualified', title: 'Qualified' },
        { id: 'reason', title: 'Reason' },
        { id: 'context', title: 'Context' },
      ],
    });
    await csvWriter.writeRecords(qualifiedLeads);
    logger.success(`Saved ${qualifiedLeads.length} lead(s) to ${opts.output}`);
    logger.blank();

    // Print summary table
    logger.step('Lead Summary:');
    logger.table(
      qualifiedLeads.map((l) => ({
        Email: l.email,
        Score: l.score ?? 'N/A',
        Qualified: l.isQualified ? '✓' : '✗',
        Reason: l.reason,
      }))
    );
    logger.blank();

    // ── PHASE 4: Email sequences ────────────────────────────────────────────
    if (opts.dryRun) {
      logger.warn('DRY RUN — Email sequences will be previewed but not sent');
    }
    logger.step(`PHASE 4: Sending email sequences (${limits.emailSequenceSteps}-step on ${tier.label} plan)...`);

    // Pass sequence step limit to emailer
    await sendToAllQualified(qualifiedLeads, opts.dryRun, limits.emailSequenceSteps);

    // Track usage
    incrementUsage('leadgen', qualifiedLeads.length);

    logger.divider();
    logger.success('LeadGen Pro Bot — Pipeline complete!');
    logger.divider();
  });

program
  .command('scrape')
  .description('Scrape domains only (no AI, no email)')
  .option('-d, --domains <file>', 'Domains file', DEFAULT_DOMAINS_FILE)
  .option('-o, --output <csv>', 'Output CSV', DEFAULT_OUTPUT_CSV)
  .action(async (opts) => {
    printTierBanner('LeadGen Pro Bot');
    const limits = getTier().leadgen;

    logger.step('Scraping mode only...');
    let leads = await scrapeFromFile(opts.domains);

    if (leads.length > limits.maxLeadsPerRun) {
      logger.warn(`Capping at ${limits.maxLeadsPerRun} leads (${tier.label} plan limit)`);
      leads = leads.slice(0, limits.maxLeadsPerRun);
    }

    const csvWriter = createObjectCsvWriter({
      path: opts.output,
      header: [
        { id: 'domain', title: 'Domain' },
        { id: 'email', title: 'Email' },
        { id: 'context', title: 'Context' },
      ],
    });
    await csvWriter.writeRecords(leads);
    logger.success(`Done. ${leads.length} lead(s) saved to ${opts.output}`);
  });

program
  .command('tier')
  .description('Show your current subscription tier and limits')
  .action(() => {
    const { getTierName, TIERS } = require('../lib/tiers');
    const { getUsage } = require('../lib/tiers');
    const tierName = getTierName();
    const tier = TIERS[tierName];
    const chalk = require('chalk');

    console.log('\n' + chalk.bold('Bot Vault Pro — Subscription Tier') + '\n');
    console.log(`  Plan:   ${chalk.cyan(tier.label)} (${tier.price})`);
    console.log(`  Month:  ${new Date().toISOString().slice(0, 7)}\n`);

    const used = { leadgen: getUsage('leadgen'), contentblast: getUsage('contentblast'), supportdesk: getUsage('supportdesk') };

    console.log(chalk.bold('  LeadGen Pro Bot'));
    console.log(`    Leads/run:        ${tier.leadgen.maxLeadsPerRun === Infinity ? 'Unlimited' : tier.leadgen.maxLeadsPerRun}`);
    console.log(`    AI qualification: ${tier.leadgen.aiQualification ? 'Yes' : 'No'}`);
    console.log(`    Email steps:      ${tier.leadgen.emailSequenceSteps}`);
    console.log(`    Used this month:  ${used.leadgen} leads\n`);

    console.log(chalk.bold('  ContentBlast Bot'));
    console.log(`    Platforms:        ${tier.contentblast.platforms.join(', ')}`);
    console.log(`    Blasts/month:     ${tier.contentblast.maxBlastsPerMonth === Infinity ? 'Unlimited' : tier.contentblast.maxBlastsPerMonth}`);
    console.log(`    Scheduling:       ${tier.contentblast.scheduling ? 'Yes' : 'No'}`);
    console.log(`    Used this month:  ${used.contentblast} blasts\n`);

    console.log(chalk.bold('  SupportDesk Bot'));
    console.log(`    IMAP polling:     ${tier.supportdesk.imapPolling ? 'Yes' : 'No'}`);
    console.log(`    Tickets/month:    ${tier.supportdesk.maxTicketsPerMonth === Infinity ? 'Unlimited' : tier.supportdesk.maxTicketsPerMonth}`);
    console.log(`    Knowledge files:  ${tier.supportdesk.maxKnowledgeFiles === Infinity ? 'Unlimited' : tier.supportdesk.maxKnowledgeFiles}`);
    console.log(`    Used this month:  ${used.supportdesk} tickets\n`);

    if (tierName !== 'enterprise') {
      console.log(chalk.yellow('  Upgrade: set SUBSCRIPTION_TIER=growth or SUBSCRIPTION_TIER=enterprise in .env'));
    }
    console.log();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
