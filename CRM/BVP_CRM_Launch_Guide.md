# BVP CRM — Launch & Operations Guide

---

## Overview

**BVP CRM** is a single-file SaaS CRM sold via Gumroad monthly subscriptions, hosted on GitHub Pages, with Supabase as the backend.

| Resource | URL / Value |
|---|---|
| Live App | https://botvaultpro.github.io/BVP-CRM |
| GitHub Repo | https://github.com/botvaultpro/BVP-CRM |
| Supabase Project | https://supabase.com/dashboard/project/qqewwlcowmalbhfbcvgx |
| Supabase URL | `https://qqewwlcowmalbhfbcvgx.supabase.co` |
| Supabase Publishable Key | `sb_publishable_AZG8nkyLVVd1qaWbCK69oQ_LWmQhrHv` |
| Gumroad Profile | https://botvaultpro.gumroad.com |

---

## Architecture

- **Frontend:** Single HTML file (`index.html`) — vanilla HTML/CSS/JS, no build process, no Node.js
- **Backend:** Supabase (Postgres + Auth + Row Level Security)
- **Hosting:** GitHub Pages — deploy from `main` branch, `/ (root)` folder
- **Payments:** Gumroad monthly subscriptions with license key generation
- **AI:** User's own Anthropic API key (they pay Anthropic directly)

---

## Subscription Tiers

| Plan | Price | Clients | Pipeline | Reminders | Daily Report | AI Generator | CSV Export |
|---|---|---|---|---|---|---|---|
| Free | $0 | 5 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Starter | $25/mo | 20 | ✅ | ✅ | ✅ | ✅ 15/mo | ❌ |
| Pro | $50/mo | 50 | ✅ | ✅ unlimited | ✅ | ✅ unlimited | ✅ |
| Enterprise | $200/mo | 250 | ✅ | ✅ unlimited | ✅ | ✅ unlimited | ✅ |

---

## Supabase Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User account, business info, industry, AI API key, plan, usage tracking |
| `customers` | All CRM client data (name, phone, email, stage, pipeline value, notes, custom fields) |
| `reminders` | Per-customer reminders with `remind_at` timestamp |
| `email_drafts` | AI-generated email drafts saved per customer |
| `activity_log` | Action tracking per customer |
| `license_keys` | Gumroad license key management — `license_key`, `user_id`, `plan`, `status`, `activated_at` |

All tables have Row Level Security enabled. Users only see their own data.

### Key columns added for subscriptions

- `profiles.plan` — `free` | `starter` | `pro` | `enterprise` (default: `free`)
- `profiles.ai_generations_used` — monthly AI usage counter
- `profiles.ai_generations_reset_at` — tracks the monthly reset window
- `license_keys.plan` — determines what tier a key grants when activated

---

## Deploying Updates

The CRM is a single file. To deploy any change:

1. Edit `CRM/index.html` locally
2. Run these commands (replace token if expired):

```bash
rm -rf /tmp/bvp-crm-deploy && mkdir /tmp/bvp-crm-deploy
cd /tmp/bvp-crm-deploy
git init && git checkout -b main
cp "/path/to/Bot-Vault-Pro/CRM/index.html" .
git config user.email "deploy@botvaultpro.com"
git config user.name "Bot Vault Pro"
git add index.html
git commit -m "your commit message"
git remote add origin "https://YOUR_GITHUB_TOKEN@github.com/botvaultpro/BVP-CRM.git"
git push -f origin main
rm -rf /tmp/bvp-crm-deploy
```

GitHub Pages rebuilds automatically within ~60 seconds.

### GitHub Pages Settings

- Repo: `botvaultpro/BVP-CRM`
- Settings → Pages → Source: **Deploy from branch**
- Branch: `main` | Folder: `/ (root)`

---

## Gumroad Setup

### Creating the 3 Products

Go to **Gumroad Dashboard → New Product → Membership** for each:

**Starter — $25/mo**
- Name: `BVP CRM — Starter`
- Custom permalink: `crm-starter`
- Direct URL: https://botvaultpro.gumroad.com/l/crm-starter

**Pro — $50/mo**
- Name: `BVP CRM — Pro`
- Custom permalink: `crm-pro`
- Direct URL: https://botvaultpro.gumroad.com/l/crm-pro

**Enterprise — $200/mo**
- Name: `BVP CRM — Enterprise`
- Custom permalink: `crm-enterprise`
- Direct URL: https://botvaultpro.gumroad.com/l/crm-enterprise

### Enable License Keys (required on every product)

In each product: **Edit Product → Content tab → License Keys → Enable license key generation → Save**

Gumroad auto-generates a unique key (`XXXX-XXXX-XXXX-XXXX`) on every purchase and includes it in the customer's receipt email.

### Receipt Message Template

Add this to **Edit Product → Receipt tab** for each product (adjust tier name):

```
Your license key is shown above.

To activate your [Starter / Pro / Enterprise] plan:
1. Go to https://botvaultpro.github.io/BVP-CRM
2. Click Sign Up (or sign in if you already have an account)
3. Paste your license key — your plan activates instantly

Questions? Email support@botvaultpro.com
```

---

## Customer License Key Flow

### New customer (no account yet)
1. Purchases on Gumroad → receives license key by email
2. Goes to the CRM → clicks Sign Up
3. Enters name, email, password, and pastes license key
4. Plan activates immediately — no manual steps

### Existing free user upgrading
1. Purchases on Gumroad → receives license key
2. Goes to CRM → Settings → pastes key in "Apply New License Key" field → clicks ACTIVATE
3. Plan upgrades instantly

### Free signup (no license key)
1. Goes to CRM → clicks Sign Up
2. Leaves license key blank → gets Free plan (5 clients)
3. Can upgrade later via Settings at any time

---

## Adding License Keys to Supabase

Every purchase needs a corresponding row in the `license_keys` table. Two ways to do this:

### Manual (for low volume / testing)

Go to **Supabase → Table Editor → license_keys → Insert row**:

| Field | Value |
|---|---|
| `license_key` | The key from Gumroad |
| `plan` | `starter` / `pro` / `enterprise` |
| `status` | `active` |
| `gumroad_sale_id` | (optional — paste from Gumroad) |

Leave `user_id` and `activated_at` blank — they get filled when the customer activates.

### Automated with Zapier (recommended at scale)

1. **Gumroad → Settings → Advanced → Webhooks** — add your webhook URL
2. In Zapier:
   - Trigger: `New Sale` in Gumroad
   - Action: `Insert Row` in Supabase → `license_keys` table
   - Map: `license_key` field, set `plan` based on product name, `status` = `active`

---

## Test License Keys

These are pre-loaded in Supabase for testing purposes. Each key can only be used once (single account activation).

| Key | Plan | Status |
|---|---|---|
| `BVP-FREE-TEST-001` | free | active |
| `BVP-FREE-TEST-002` | free | active |
| `BVP-STARTER-TEST-001` | starter | active |
| `BVP-STARTER-TEST-002` | starter | active |
| `BVP-STARTER-TEST-003` | starter | active |
| `BVP-PRO-TEST-001` | pro | active |
| `BVP-PRO-TEST-002` | pro | active |
| `BVP-PRO-TEST-003` | pro | active |
| `BVP-ENT-TEST-001` | enterprise | active |
| `BVP-ENT-TEST-002` | enterprise | active |

To add more test keys, run this SQL in Supabase → SQL Editor:

```sql
INSERT INTO license_keys (license_key, plan, status) VALUES
  ('BVP-PRO-TEST-004', 'pro', 'active');
```

---

## Supabase Auth Settings (Recommended)

Turn off email confirmation — the Gumroad license key IS the verification:

**Supabase Dashboard → Authentication → Settings → Email confirmations → OFF**

This gives customers instant access after signup with no email confirmation step.

If you keep email confirmation ON, the CRM handles it gracefully — it saves the license key to `localStorage` before the confirmation step and applies it automatically on first sign-in after confirmation.

---

## AI Generator Setup (Per User)

Each user must supply their own Anthropic API key:

1. User goes to **Settings → AI API Key**
2. Pastes their key from **console.anthropic.com**
3. Key is stored in their `profiles.ai_api_key` — encrypted at rest by Supabase, never exposed

The CRM uses `claude-haiku-4-5-20251001` for generation (fast, cheap, ideal for emails).

Usage limits by plan:
- Free: AI generator locked
- Starter: 15 generations/month (resets 1st of month)
- Pro / Enterprise: unlimited

---

## Supported Industries (12)

HVAC · Electrical · Plumbing · Roofing · Real Estate · Barber/Salon · Photography · Freelancer · Restaurant · General Contractor · Landscaping · Law Firm

Each industry has its own: client terminology, job types, pipeline stages, custom fields, and AI context.

---

## Ongoing Operations

### When a customer cancels on Gumroad
Go to Supabase → `license_keys` table → find their key → set `status` = `cancelled`

On next login, `loadProfileAndStart()` will detect the inactive status and sign them out with a reactivation message.

### When a customer upgrades (e.g. Starter → Pro)
Issue them a new Pro license key (insert into `license_keys` with `plan: 'pro'`).
They paste it in Settings → Activate. The old key stays in the table (harmless).

### Checking who is on what plan
```sql
SELECT email, plan, subscription_status, business_name, created_at
FROM profiles
ORDER BY created_at DESC;
```

### Checking active license keys
```sql
SELECT license_key, plan, activated_at, user_id
FROM license_keys
WHERE status = 'active'
ORDER BY activated_at DESC;
```
