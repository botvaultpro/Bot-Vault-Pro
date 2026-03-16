'use strict';
const fs = require('fs');
const path = require('path');
const { chat } = require('../lib/claude');
const logger = require('../lib/logger');

const OUTPUT_DIR = path.join(__dirname, 'output');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function saveOutput(filename, content) {
  ensureOutputDir();
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

const PLATFORM_PROMPTS = {
  twitter: {
    system: `You are an expert social media copywriter. Write viral Twitter/X content. Return ONLY a JSON object with "thread" (array of tweet strings, each ≤280 chars) and "hashtags" (array of strings without #). First tweet must hook the reader. Last tweet must have a CTA.`,
    maxTokens: 1024,
    format: (data) => {
      const lines = data.thread.map((t, i) => `${i + 1}/ ${t}`);
      return lines.join('\n\n') + '\n\n' + data.hashtags.map((h) => `#${h}`).join(' ');
    },
    ext: 'txt',
  },
  linkedin: {
    system: `You are an expert LinkedIn content strategist. Write professional, insight-driven LinkedIn posts that get high engagement. Return ONLY a JSON object with "post" (the full post text, 200-400 words, with line breaks) and "hashtags" (array of strings without #).`,
    maxTokens: 1024,
    format: (data) => data.post + '\n\n' + data.hashtags.map((h) => `#${h}`).join(' '),
    ext: 'txt',
  },
  blog: {
    system: `You are an expert blog writer and SEO specialist. Write a full, well-structured blog post in Markdown. Return ONLY a JSON object with "title", "metaDescription" (max 160 chars), "content" (full Markdown body, 600-900 words with ## headings, bullet points, and a clear CTA at the end).`,
    maxTokens: 2048,
    format: (data) => `# ${data.title}\n\n> ${data.metaDescription}\n\n---\n\n${data.content}`,
    ext: 'md',
  },
};

/**
 * Generate content for a single platform.
 * @param {string} topic
 * @param {string} brandVoice
 * @param {string} platform  'twitter' | 'linkedin' | 'blog'
 * @returns {Promise<{raw: object, formatted: string, filePath: string}>}
 */
async function generateForPlatform(topic, brandVoice, platform) {
  const config = PLATFORM_PROMPTS[platform];
  if (!config) throw new Error(`Unknown platform: ${platform}. Choose twitter, linkedin, or blog.`);

  logger.info(`  Generating ${platform} content for: "${topic}"...`);

  const userMessage = `Topic: ${topic}\nBrand Voice: ${brandVoice}\n\nGenerate ${platform} content now.`;
  const raw = JSON.parse(await chat(config.system, userMessage, config.maxTokens));
  const formatted = config.format(raw);

  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const filename = `${timestamp()}-${platform}-${slug}.${config.ext}`;
  const filePath = saveOutput(filename, formatted);

  logger.success(`  Saved ${platform} content → ${filePath}`);
  return { raw, formatted, filePath };
}

/**
 * Generate content for multiple platforms.
 * @param {string} topic
 * @param {string} brandVoice
 * @param {string[]} platforms
 * @returns {Promise<object>}  keyed by platform
 */
async function generateContent(topic, brandVoice, platforms) {
  const results = {};
  for (const platform of platforms) {
    try {
      results[platform] = await generateForPlatform(topic, brandVoice, platform);
    } catch (err) {
      logger.error(`  Failed to generate ${platform} content: ${err.message}`);
      results[platform] = null;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return results;
}

module.exports = { generateContent };
