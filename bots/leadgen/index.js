#!/usr/bin/env node
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { program } = require('commander');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const logger = require('../lib/logger');
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
  .description('Full pipeline: scrape → qualify → email (default command)')
  .option('-d, --domains <file>', 'Path to domains file (one per line)', DEFAULT_DOMAINS_FILE)
  .option('-o, --output <csv>', 'Output CSV file for leads', DEFAULT_OUTPUT_CSV)
  .option('--dry-run', 'Preview everything without sending emails', false)
  .action(async (opts) => {
    logger.divider();
    logger.step('LeadGen Pro Bot — Starting full pipeline');
    logger.divider();

    // 1. Scrape
    logger.step('PHASE 1: Scraping target domains...');
    const rawLeads = await scrapeFromFile(opts.domains);
    logger.success(`Scraped ${rawLeads.length} total lead(s)`);
    logger.blank();

    if (rawLeads.length === 0) {
      logger.warn('No leads found. Check your domains file and try again.');
      process.exit(0);
    }

    // 2. Qualify
    logger.step('PHASE 2: Qualifying leads with AI...');
    const icpDescription = process.env.ICP_DESCRIPTION || 'B2B companies with 10-500 employees';
    const qualifiedLeads = await qualifyLeads(rawLeads, icpDescription);

    const passing = qualifiedLeads.filter((l) => l.isQualified);
    logger.success(`${passing.length} of ${qualifiedLeads.length} lead(s) qualified`);
    logger.blank();

    // 3. Export CSV
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
        Score: l.score,
        Qualified: l.isQualified ? '✓' : '✗',
        Reason: l.reason,
      }))
    );
    logger.blank();

    // 4. Email
    if (opts.dryRun) {
      logger.warn('DRY RUN — Email sequences will be previewed but not sent');
    }
    logger.step('PHASE 4: Sending email sequences...');
    await sendToAllQualified(qualifiedLeads, opts.dryRun);

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
    logger.step('Scraping mode only...');
    const leads = await scrapeFromFile(opts.domains);
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

program.parse(process.argv);

// Default to 'run' if no subcommand given
if (!process.argv.slice(2).length) {
  program.help();
}
