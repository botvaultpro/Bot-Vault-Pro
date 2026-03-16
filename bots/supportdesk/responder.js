'use strict';
const fs = require('fs');
const path = require('path');
const { chat } = require('../lib/claude');
const logger = require('../lib/logger');

const KNOWLEDGE_DIR = path.join(__dirname, 'knowledge');

/**
 * Load all .md and .txt files from the knowledge/ directory.
 * @returns {string}
 */
function loadKnowledgeBase() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    logger.warn(`Knowledge directory not found: ${KNOWLEDGE_DIR}`);
    return '';
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.txt'));

  if (files.length === 0) {
    logger.warn('No knowledge base files found. Add .md or .txt files to supportdesk/knowledge/');
    return '';
  }

  const parts = files.map((file) => {
    const filePath = path.join(KNOWLEDGE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    logger.info(`  Loaded knowledge base: ${file} (${content.length} chars)`);
    return `=== ${file} ===\n${content}`;
  });

  return parts.join('\n\n');
}

/**
 * Generate a support reply using Claude, grounded in the knowledge base.
 * @param {string} customerMessage
 * @param {string} knowledgeBase
 * @param {string} companyName
 * @returns {Promise<{subject: string, body: string, confidence: number}>}
 */
async function generateReply(customerMessage, knowledgeBase, companyName) {
  const systemPrompt = `You are a friendly, professional customer support agent for ${companyName}.

RULES:
1. Answer ONLY using the knowledge base provided below. Do not make up information.
2. If the answer is not in the knowledge base, politely say you're not sure and offer to escalate.
3. Be warm, concise, and helpful. Avoid corporate-speak.
4. Return ONLY a valid JSON object with:
   - "subject": reply email subject (e.g. "Re: Your question about billing")
   - "body": full plain-text reply body (2-5 sentences, include a friendly sign-off)
   - "confidence": float 0.0–1.0 (how confident you are the answer is correct and complete)

KNOWLEDGE BASE:
${knowledgeBase}`;

  const userMessage = `Customer message:\n"""\n${customerMessage}\n"""`;
  const raw = await chat(systemPrompt, userMessage, 1024);

  try {
    return JSON.parse(raw);
  } catch {
    // Fallback if Claude returns non-JSON
    return {
      subject: 'Re: Your support request',
      body: raw,
      confidence: 0.5,
    };
  }
}

module.exports = { loadKnowledgeBase, generateReply };
