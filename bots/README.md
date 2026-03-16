# Bot Vault Pro — Automation Bots

Three production-ready automation bots built with Node.js and the Claude AI API.

---

## Quick Start

```bash
cd bots
npm install
cp .env.example .env
# Edit .env: set ANTHROPIC_API_KEY and SUBSCRIPTION_TIER
```

The only required credential is `ANTHROPIC_API_KEY`. All other integrations (email, Twitter, LinkedIn) are optional — the bots degrade gracefully and log output locally if credentials are missing.

---

## Subscription Tiers

Set `SUBSCRIPTION_TIER` in your `.env` file to `starter`, `growth`, or `enterprise`.

| Feature | Starter ($49/mo) | Growth ($149/mo) | Enterprise (Custom) |
|---------|:---:|:---:|:---:|
| **LeadGen — Leads per run** | 25 | 250 | Unlimited |
| **LeadGen — AI qualification** | — | ✓ | ✓ |
| **LeadGen — Email sequence steps** | 1 (intro) | 3 (full drip) | 3 (full drip) |
| **ContentBlast — Platforms** | Blog only | Twitter, LinkedIn, Blog | All |
| **ContentBlast — Blasts per month** | 10 | 100 | Unlimited |
| **ContentBlast — Cron scheduling** | — | ✓ | ✓ |
| **SupportDesk — IMAP inbox polling** | — | ✓ | ✓ |
| **SupportDesk — Tickets per month** | 50 | 500 | Unlimited |
| **SupportDesk — Knowledge base files** | 1 | 10 | Unlimited |
| **SupportDesk — Escalation emails** | — | ✓ | ✓ |
| **SiteBuilder — Prospects/month** | 10 | 100 | Unlimited |
| **SiteBuilder — AI site scoring** | — | ✓ | ✓ |
| **SiteBuilder — Demo generation** | ✓ | ✓ | ✓ |
| **SiteBuilder — Proposal email steps** | 1 (intro) | 3 (full drip) | 3 |
| **SiteBuilder — Pipeline CRM** | — | ✓ | ✓ |

### View your current tier and usage

```bash
node leadgen/index.js tier
```

This shows your active plan, all feature limits, and how many leads/blasts/tickets you've used this month.

### Monthly usage resets automatically at the start of each calendar month.

---

## Bot 1: LeadGen Pro Bot

Scrapes contact emails from target company websites, qualifies them with AI against your Ideal Customer Profile, exports to CSV, and sends personalized 3-email drip sequences.

### Usage

```bash
# Full pipeline (scrape → qualify → email)
node leadgen/index.js run

# Dry run (no emails sent, just preview)
node leadgen/index.js run --dry-run

# Scrape only (no AI, no email)
node leadgen/index.js scrape

# Custom domains file and output path
node leadgen/index.js run --domains /path/to/domains.txt --output /path/to/leads.csv
```

### Setup

1. Edit `leadgen/knowledge/sample-targets.txt` — add one domain per line
2. Set `ICP_DESCRIPTION` in `.env` (describe your ideal customer)
3. Set SMTP credentials in `.env` to enable email sequences
4. Run: `node leadgen/index.js run --dry-run` to preview first

### Output

- `leadgen/leads-output.csv` — all leads with AI scores and qualification status
- `leadgen/sent-leads.json` — tracks which email sequences have been sent

---

## Bot 2: ContentBlast Bot

Generates AI-written content for Twitter/X, LinkedIn, and blog — then posts it automatically. Can run on a cron schedule.

### Usage

```bash
# Generate and post to all platforms
node contentblast/index.js blast --topic "5 ways AI is changing customer support in 2025"

# Generate specific platforms only
node contentblast/index.js blast --topic "How to automate your sales pipeline" --platforms twitter,linkedin

# Dry run (generate and save to output/, don't post)
node contentblast/index.js blast --topic "My topic" --dry-run

# Schedule (runs every Monday at 9am)
node contentblast/index.js schedule --topic "Weekly automation tips" --cron "0 9 * * 1"
```

### Setup

1. Set `BRAND_VOICE` in `.env` to match your writing style
2. For posting: add Twitter API keys and/or LinkedIn access token to `.env`
3. Without social credentials: content is saved to `contentblast/output/` only

### Output

All generated content is saved to `contentblast/output/`:
- `*-twitter-*.txt` — tweet thread
- `*-linkedin-*.txt` — LinkedIn post
- `*-blog-*.md` — blog post in Markdown

---

## Bot 3: SupportDesk Bot

Monitors your support inbox via IMAP, generates AI replies grounded in your knowledge base, and sends them automatically. Low-confidence responses are escalated to a human.

### Usage

```bash
# Test a single message (no email credentials needed)
node supportdesk/index.js reply --message "What is your refund policy?"

# Start polling inbox (checks every 60 seconds)
node supportdesk/index.js start

# Polling with custom interval and dry run
node supportdesk/index.js start --interval 30 --dry-run
```

### Setup

1. Add your knowledge base: drop `.md` or `.txt` files into `supportdesk/knowledge/`
2. A sample FAQ is already included — edit it to match your business
3. Set IMAP + SMTP credentials in `.env`
4. Set `COMPANY_NAME` and `AUTO_REPLY_MIN_CONFIDENCE` in `.env`
5. Run: `node supportdesk/index.js reply --message "test question"` to verify

### Knowledge Base

- Put `.md` or `.txt` files in `supportdesk/knowledge/`
- All files are loaded automatically on startup
- The AI only answers based on these files — it won't make up information
- Low confidence triggers escalation email to `ESCALATION_EMAIL`

### Output

- `supportdesk/tickets.log` — log of all processed tickets with status and confidence

---

## Gmail Setup (Recommended for SMTP + IMAP)

1. Enable 2-Factor Authentication on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Create an App Password for "Mail"
4. Use that 16-character password as `SMTP_PASS` and `IMAP_PASS`
5. Use `smtp.gmail.com:587` for SMTP and `imap.gmail.com:993` for IMAP

---

## Architecture

```
bots/
├── lib/
│   ├── claude.js      — Shared Anthropic API client (claude-sonnet-4-6)
│   ├── emailer.js     — Shared SMTP email sender (Nodemailer)
│   └── logger.js      — Colored terminal logger
├── leadgen/
│   ├── index.js       — CLI entry point (commander)
│   ├── scraper.js     — Web scraper (axios + cheerio)
│   ├── qualifier.js   — AI lead qualification
│   └── emailer.js     — Drip email sequences
├── contentblast/
│   ├── index.js       — CLI entry point
│   ├── generator.js   — AI content generation (all platforms)
│   └── poster.js      — Twitter + LinkedIn posting
└── supportdesk/
    ├── index.js       — CLI entry point
    ├── responder.js   — AI reply generation + knowledge base loader
    └── imap-listener.js — IMAP inbox polling
```

---

## Bot 4: SiteBuilder Pro Bot

Finds local businesses with weak or missing websites, generates a custom demo site for each one using AI, then sends personalized proposals with a 3-email follow-up sequence. Includes a built-in pipeline CRM to track every prospect from discovery to close.

### Full Pipeline

```
Discover → Analyze → Generate Demo → Propose → Track in Pipeline
```

1. **Discover** — Reads a CSV of target businesses. Probes their website (or finds one). Flags businesses with no site as highest priority.
2. **Analyze** — Scores site quality 1-10. Identifies specific weaknesses (no SSL, not mobile, outdated design, etc.). AI-powered on Growth/Enterprise.
3. **Demo** — Generates a complete, modern single-page HTML website tailored to the business type and location using Claude AI.
4. **Propose** — Sends an AI-written email referencing their site's specific weaknesses and your demo. Growth/Enterprise get a 3-email drip.
5. **Pipeline** — Tracks every prospect through stages: `new → analyzed → demo_ready → contacted → followed_up → replied → closed_won / closed_lost`.

### Usage

```bash
# Full pipeline (discover → analyze → demo → propose)
node sitebuilder/index.js run

# Dry run (no emails sent)
node sitebuilder/index.js run --dry-run

# Step by step
node sitebuilder/index.js discover           # Find + classify sites
node sitebuilder/index.js analyze            # Score all 'new' prospects
node sitebuilder/index.js demo joe@acme.com  # Generate demo for one prospect
node sitebuilder/index.js propose joe@acme.com --dry-run

# Pipeline CRM
node sitebuilder/index.js pipeline                         # Dashboard
node sitebuilder/index.js stage joe@acme.com replied       # Update stage
node sitebuilder/index.js note joe@acme.com "Called, interested in $2k package"

# View tier limits
node sitebuilder/index.js tier
```

### Setup

1. Edit `sitebuilder/knowledge/sample-prospects.csv` with your target businesses
   - Required columns: `name, location, email, website, business_type`
   - Leave `website` blank — bot will find it automatically
2. Set `FREELANCER_NAME` in `.env` (appears in demo banner and proposal emails)
3. Set SMTP credentials in `.env` to send proposals
4. Run: `node sitebuilder/index.js run --dry-run` to preview

### Prospect CSV Format

```csv
name,location,email,website,business_type
Joe's Plumbing,Austin TX,joe@joesplumbing.com,,plumbing
Maria's Bakery,Chicago IL,maria@mariasbakery.com,http://mariasbakery.com,bakery
```

- Leave `website` blank to let the bot find it
- `business_type` helps the AI generate relevant demo content and site copy

### Pipeline Stages

| Stage | Meaning |
|-------|---------|
| `new` | Just discovered |
| `analyzed` | Site scored |
| `demo_ready` | Demo HTML generated |
| `contacted` | Intro email sent |
| `followed_up` | Follow-up email(s) sent |
| `replied` | Prospect responded (set manually) |
| `closed_won` | Converted to paying client |
| `closed_lost` | No longer pursuing |

### Output

- `sitebuilder/output/{business-slug}/index.html` — generated demo websites
- `sitebuilder/pipeline.json` — full CRM data for all prospects

---

## Troubleshooting

**"ANTHROPIC_API_KEY is not set"** — Copy `.env.example` to `.env` and add your key.

**LeadGen finds 0 leads** — Many sites block scrapers. Try adding more domains to the targets file, or check that the domains have publicly listed contact emails.

**ContentBlast won't post to Twitter** — Ensure your Twitter app has "Read and Write" permissions. Regenerate tokens after changing permissions.

**SupportDesk IMAP error** — For Gmail, ensure you're using an App Password (not your main password) and that IMAP is enabled in Gmail settings.

**Low AI confidence** — Expand your knowledge base in `supportdesk/knowledge/`. The more comprehensive, the better.
