#!/usr/bin/env node
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const logger = require('../lib/logger');
const { sendEmail } = require('../lib/emailer');
const { loadKnowledgeBase, generateReply } = require('./responder');
const { pollInbox } = require('./imap-listener');

const TICKETS_LOG = path.join(__dirname, 'tickets.log');

function logTicket(from, subject, status, confidence) {
  const line = `[${new Date().toISOString()}] FROM: ${from} | SUBJECT: ${subject} | STATUS: ${status} | CONFIDENCE: ${confidence}\n`;
  fs.appendFileSync(TICKETS_LOG, line, 'utf8');
}

async function handleEmail(email, knowledgeBase, companyName, dryRun, minConfidence) {
  logger.step(`Processing email from ${email.from}: "${email.subject}"`);

  const { subject, body, confidence } = await generateReply(email.text, knowledgeBase, companyName);

  logger.info(`  AI confidence: ${(confidence * 100).toFixed(0)}% (threshold: ${(minConfidence * 100).toFixed(0)}%)`);

  if (confidence < minConfidence) {
    logger.warn(`  Low confidence — escalating to human agent`);
    logTicket(email.from, email.subject, 'escalated', confidence);

    if (!dryRun) {
      // Notify the human support inbox about the escalation
      const supportInbox = process.env.ESCALATION_EMAIL || process.env.SMTP_USER;
      if (supportInbox) {
        await sendEmail({
          to: supportInbox,
          subject: `[ESCALATION NEEDED] ${email.subject}`,
          text: `This ticket requires human review.\n\nFrom: ${email.from}\nSubject: ${email.subject}\n\nOriginal message:\n${email.text}\n\n---\nAI draft (confidence ${(confidence * 100).toFixed(0)}%):\n${body}`,
        });
      }
    }
    return;
  }

  // Extract sender email address
  const toMatch = email.from.match(/<(.+?)>/) || [null, email.from.trim()];
  const toEmail = toMatch[1];

  if (dryRun) {
    logger.data('\n--- DRY RUN REPLY PREVIEW ---');
    logger.data(`To:      ${toEmail}`);
    logger.data(`Subject: ${subject}`);
    logger.data(`Body:\n${body}`);
    logger.data('---\n');
  } else {
    await sendEmail({ to: toEmail, subject, text: body });
    logger.success(`  Reply sent to ${toEmail}`);
  }

  logTicket(email.from, email.subject, dryRun ? 'dry-run' : 'replied', confidence);
}

// ─── Commands ────────────────────────────────────────────────────────────────

program
  .name('supportdesk')
  .description('SupportDesk Bot — AI-powered email support with knowledge base')
  .version('1.0.0');

program
  .command('reply')
  .description('Answer a one-off customer message (pipe or --message flag)')
  .option('-m, --message <text>', 'Customer message text')
  .option('--dry-run', 'Print reply to console, do not send', true)
  .action(async (opts) => {
    const message = opts.message || '';
    if (!message) {
      logger.error('Please provide a message with --message "..."');
      process.exit(1);
    }

    logger.divider();
    logger.step('SupportDesk Bot — One-shot reply mode');
    logger.divider();

    logger.step('Loading knowledge base...');
    const knowledgeBase = loadKnowledgeBase();
    const companyName = process.env.COMPANY_NAME || 'Bot Vault Pro';

    logger.step('Generating AI reply...');
    const { subject, body, confidence } = await generateReply(message, knowledgeBase, companyName);

    logger.blank();
    logger.data(`Subject: ${subject}`);
    logger.data(`Confidence: ${(confidence * 100).toFixed(0)}%`);
    logger.data('Reply:');
    console.log('\n' + body + '\n');
    logger.divider();
  });

program
  .command('start')
  .description('Start polling inbox for new emails and auto-reply')
  .option('-i, --interval <seconds>', 'Poll interval in seconds', '60')
  .option('--dry-run', 'Generate replies but do not send them', false)
  .action(async (opts) => {
    const intervalMs = parseInt(opts.interval, 10) * 1000;
    const minConfidence = parseFloat(process.env.AUTO_REPLY_MIN_CONFIDENCE || '0.7');
    const companyName = process.env.COMPANY_NAME || 'Bot Vault Pro';

    logger.divider();
    logger.step('SupportDesk Bot — Starting inbox polling');
    logger.step(`Poll interval: ${opts.interval}s | Dry run: ${opts.dryRun} | Min confidence: ${(minConfidence * 100).toFixed(0)}%`);
    logger.divider();

    logger.step('Loading knowledge base...');
    const knowledgeBase = loadKnowledgeBase();

    if (!knowledgeBase) {
      logger.warn('Knowledge base is empty. Add .md files to supportdesk/knowledge/');
    }

    const tick = async () => {
      logger.step('Polling inbox...');
      try {
        await pollInbox((email) =>
          handleEmail(email, knowledgeBase, companyName, opts.dryRun, minConfidence)
        );
      } catch (err) {
        logger.error(`Inbox poll failed: ${err.message}`);
      }
    };

    // Run immediately, then on interval
    await tick();
    setInterval(tick, intervalMs);

    logger.info(`Next poll in ${opts.interval}s... (Press Ctrl+C to stop)`);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
