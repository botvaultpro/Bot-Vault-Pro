'use strict';
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const PIPELINE_FILE = path.join(__dirname, 'pipeline.json');

// Valid stages in order
const STAGES = ['new', 'analyzed', 'demo_ready', 'contacted', 'followed_up', 'replied', 'closed_won', 'closed_lost'];

const STAGE_COLORS = {
  new:          chalk.gray,
  analyzed:     chalk.blue,
  demo_ready:   chalk.cyan,
  contacted:    chalk.yellow,
  followed_up:  chalk.magenta,
  replied:      chalk.green,
  closed_won:   chalk.bgGreen.black,
  closed_lost:  chalk.bgRed.white,
};

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadPipeline() {
  if (fs.existsSync(PIPELINE_FILE)) {
    return JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));
  }
  return { prospects: [] };
}

function savePipeline(data) {
  fs.writeFileSync(PIPELINE_FILE, JSON.stringify(data, null, 2));
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Upsert a prospect by email (unique key). Returns the saved record.
 */
function upsertProspect(prospect) {
  const db = loadPipeline();
  const key = (prospect.email || prospect.name || '').toLowerCase();

  const idx = db.prospects.findIndex(
    (p) => (p.email || p.name || '').toLowerCase() === key
  );

  const now = new Date().toISOString();
  const record = {
    email: prospect.email || '',
    name: prospect.name || '',
    location: prospect.location || '',
    business_type: prospect.business_type || '',
    resolvedUrl: prospect.resolvedUrl || '',
    needsWebsite: prospect.needsWebsite || false,
    siteScore: prospect.siteScore ?? null,
    weaknesses: prospect.weaknesses || [],
    opportunity: prospect.opportunity || '',
    estimatedValue: prospect.estimatedValue || 0,
    demoPath: prospect.demoPath || '',
    stage: prospect.stage || 'new',
    emailsSent: prospect.emailsSent || [],
    notes: prospect.notes || '',
    discoveredAt: prospect.discoveredAt || now,
    updatedAt: now,
  };

  if (idx >= 0) {
    db.prospects[idx] = { ...db.prospects[idx], ...record };
  } else {
    db.prospects.push(record);
  }

  savePipeline(db);
  return record;
}

/**
 * Move a prospect to a new stage by email.
 */
function moveStage(email, newStage) {
  if (!STAGES.includes(newStage)) throw new Error(`Invalid stage: ${newStage}. Valid: ${STAGES.join(', ')}`);
  const db = loadPipeline();
  const p = db.prospects.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (!p) throw new Error(`Prospect not found: ${email}`);
  p.stage = newStage;
  p.updatedAt = new Date().toISOString();
  savePipeline(db);
  return p;
}

/**
 * Add a note to a prospect.
 */
function addNote(email, note) {
  const db = loadPipeline();
  const p = db.prospects.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (!p) throw new Error(`Prospect not found: ${email}`);
  const timestamp = new Date().toISOString().slice(0, 10);
  p.notes = p.notes ? `${p.notes}\n[${timestamp}] ${note}` : `[${timestamp}] ${note}`;
  p.updatedAt = new Date().toISOString();
  savePipeline(db);
  return p;
}

/**
 * Record that an email was sent.
 */
function recordEmail(email, type) {
  const db = loadPipeline();
  const p = db.prospects.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (!p) return;
  if (!p.emailsSent) p.emailsSent = [];
  p.emailsSent.push({ type, sentAt: new Date().toISOString() });
  p.updatedAt = new Date().toISOString();
  savePipeline(db);
}

/**
 * Get all prospects at a given stage (or all if no filter).
 */
function getProspects(stage = null) {
  const db = loadPipeline();
  return stage ? db.prospects.filter((p) => p.stage === stage) : db.prospects;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function printDashboard() {
  const db = loadPipeline();
  const all = db.prospects;

  if (all.length === 0) {
    console.log(chalk.yellow('\n  No prospects in pipeline yet. Run: node sitebuilder/index.js run\n'));
    return;
  }

  console.log('\n' + chalk.bold('  ═══ SiteBuilder Pro — Prospect Pipeline ═══') + '\n');

  // Stage summary
  console.log(chalk.bold('  Pipeline Overview:'));
  for (const stage of STAGES) {
    const count = all.filter((p) => p.stage === stage).length;
    if (count === 0) continue;
    const color = STAGE_COLORS[stage] || chalk.white;
    const bar = '█'.repeat(Math.min(count, 30));
    console.log(`    ${color(stage.padEnd(14))}  ${bar}  ${chalk.bold(count)}`);
  }

  // Revenue pipeline
  const activeRevenue = all
    .filter((p) => !['closed_lost', 'new'].includes(p.stage))
    .reduce((s, p) => s + (p.estimatedValue || 0), 0);
  const wonRevenue = all
    .filter((p) => p.stage === 'closed_won')
    .reduce((s, p) => s + (p.estimatedValue || 0), 0);

  console.log();
  console.log(`  ${chalk.bold('Total prospects:')}   ${all.length}`);
  console.log(`  ${chalk.bold('Pipeline value:')}    ${chalk.green('$' + activeRevenue.toLocaleString())}`);
  console.log(`  ${chalk.bold('Won revenue:')}       ${chalk.bgGreen.black(' $' + wonRevenue.toLocaleString() + ' ')}`);

  // Recent prospects table
  console.log('\n' + chalk.bold('  Recent Prospects:'));
  console.log(chalk.gray('  ' + '─'.repeat(90)));
  console.log(chalk.bold(`  ${'Name'.padEnd(24)} ${'Stage'.padEnd(14)} ${'Score'.padEnd(7)} ${'Value'.padEnd(10)} ${'Email'}`));
  console.log(chalk.gray('  ' + '─'.repeat(90)));

  const sorted = [...all].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 15);
  for (const p of sorted) {
    const color = STAGE_COLORS[p.stage] || chalk.white;
    const score = p.siteScore === 0 ? 'NO SITE' : p.siteScore !== null ? `${p.siteScore}/10` : 'N/A';
    console.log(
      `  ${p.name.slice(0, 23).padEnd(24)} ${color(p.stage.padEnd(14))} ${score.padEnd(7)} ${'$' + (p.estimatedValue || 0).toLocaleString().padEnd(9)} ${p.email}`
    );
  }
  console.log(chalk.gray('  ' + '─'.repeat(90)));
  console.log();
}

module.exports = { upsertProspect, moveStage, addNote, recordEmail, getProspects, printDashboard, STAGES };
