# Bot Vault Pro — Automation Bots

Three production-ready automation bots built with Node.js and the Claude AI API.

---

## Quick Start

```bash
cd bots
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY (required for all bots)
```

The only required credential is `ANTHROPIC_API_KEY`. All other integrations (email, Twitter, LinkedIn) are optional — the bots degrade gracefully and log output locally if credentials are missing.

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

## Troubleshooting

**"ANTHROPIC_API_KEY is not set"** — Copy `.env.example` to `.env` and add your key.

**LeadGen finds 0 leads** — Many sites block scrapers. Try adding more domains to the targets file, or check that the domains have publicly listed contact emails.

**ContentBlast won't post to Twitter** — Ensure your Twitter app has "Read and Write" permissions. Regenerate tokens after changing permissions.

**SupportDesk IMAP error** — For Gmail, ensure you're using an App Password (not your main password) and that IMAP is enabled in Gmail settings.

**Low AI confidence** — Expand your knowledge base in `supportdesk/knowledge/`. The more comprehensive, the better.
