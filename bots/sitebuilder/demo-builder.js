'use strict';
const fs = require('fs');
const path = require('path');
const { chat } = require('../lib/claude');
const logger = require('../lib/logger');

const OUTPUT_DIR = path.join(__dirname, 'output');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Prompt Claude to generate a complete single-page HTML website.
 */
async function generateHtml(prospect, freelancerName) {
  const weaknessList = (prospect.weaknesses || []).join(', ');

  const system = `You are an expert web designer. Generate a complete, modern, professional single-page HTML website for a local business.

REQUIREMENTS:
- All CSS must be inline in a <style> block — NO external CSS files
- Use Google Fonts CDN link (allowed) for typography
- Modern design: clean layout, good whitespace, professional color scheme suited to the business type
- Fully responsive — mobile-first with CSS media queries
- Sections: navigation, hero (with strong headline + CTA button), services/offerings, about/story, social proof (placeholder testimonials), contact section with address/phone/email placeholders, footer
- Use CSS gradients and subtle shadows — no placeholder images needed
- Add a discreet banner at the top: "This is a complimentary demo site by [FREELANCER_NAME]"
- Replace [FREELANCER_NAME] with the actual freelancer name provided
- Write realistic, industry-appropriate copy — not Lorem Ipsum
- Color palette: choose 2-3 colors that fit the business type (e.g. blue/white for plumbing, green/earth for landscaping)
- Return ONLY the complete HTML document starting with <!DOCTYPE html>. No markdown, no explanation.`;

  const user = `Business name: ${prospect.name}
Business type: ${prospect.business_type || 'local business'}
Location: ${prospect.location}
Current site weaknesses: ${weaknessList || 'no website'}
Freelancer name (for demo banner): ${freelancerName}

Generate the complete HTML website now.`;

  logger.info(`  Generating demo HTML for ${prospect.name}...`);
  const html = await chat(system, user, 4096);

  // Ensure it's valid HTML (Claude sometimes adds markdown fences)
  const cleaned = html.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
  return cleaned;
}

/**
 * Build and save a demo website for a prospect.
 * @param {object} prospect
 * @param {string} freelancerName
 * @returns {string} path to generated index.html
 */
async function buildDemo(prospect, freelancerName = 'Bot Vault Pro') {
  const slug = slugify(prospect.name);
  const dir = path.join(OUTPUT_DIR, slug);
  ensureDir(dir);

  const html = await generateHtml(prospect, freelancerName);

  const outPath = path.join(dir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  logger.success(`  Demo saved → ${outPath}`);

  return outPath;
}

module.exports = { buildDemo, slugify };
