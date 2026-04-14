# BVP CRM — Product Roadmap & Ideas

_Last updated: 2026-04-08_

---

## 🔴 In Progress (Next Release)

- [x] Activity log / timestamped notes per client
- [x] Drag-to-stage on Kanban pipeline
- [x] Mobile layout fix (bottom nav, responsive cards)

---

## 🟡 High Impact — Build Soon

### Recurring Revenue Tracker
For industries like landscaping, barber/salon, law firms. Track "last job date + average visit frequency" and auto-flag clients who are due for a return visit. A "Due for Service" filter on the client list.

### Client-Facing Mini-Portal
One-click shareable link showing a client their job status and invoice total. No login required. Simple read-only page. Major wow moment — competitors (Jobber, HoneyBook) charge $100+/mo for this.

### SMS / Email Dispatch to Clients
Reminders currently only notify the owner. Real value = sending the reminder *to the client* ("Your appointment is tomorrow at 2pm"). Integrate Resend (already in stack) for email and optionally Twilio for SMS. Especially valuable for barber/salon, HVAC.

---

## 🟢 AI Features

### Multi-AI Provider Support
Let users bring their own API key from any provider:
| Provider | Model | Notes |
|----------|-------|-------|
| Anthropic | claude-sonnet-4 | Current default |
| OpenAI | gpt-4o | Most recognized brand |
| Google | gemini-1.5-flash | Free tier option |
| Groq | llama-3 | Fast + free, good hook |

Simple dropdown in Settings → AI section. Already using raw fetch() calls so swapping endpoints is ~20 lines.

### Natural Language Client Import ⭐ Premium
User pastes raw text (text thread, voicemail transcript, Facebook DM, email) and AI extracts structured client data — name, phone, job type, estimated value — and creates the CRM record automatically.

**Example:**
> User pastes: "hey its mike from 555-1234, need my furnace looked at, been making noise 2 weeks, im in scottsdale"
> AI creates: Name: Mike | Phone: 555-1234 | Job: Furnace Repair | Stage: New Lead | City: Scottsdale

Low friction to build, high perceived value. Demo-able in 15 seconds.

---

## 🔵 Premium / Agency Features

### MCP Server Integration ⭐⭐ Moat Feature
Build a BVP CRM MCP server. Users connect it to Claude Desktop or any MCP-compatible AI. Their AI assistant can then:
- Read pipeline ("what jobs are outstanding this week?")
- Create clients ("add John Smith, new HVAC estimate, $3,400")
- Update stages ("mark Mike's job as completed")
- Pull reports ("what's my pending revenue this month?")

Turns the CRM into a voice/AI-native tool. No other small-business CRM does this. Legitimate moat. Charge $150+/mo for Agency tier with MCP access.

### Webhook / Zapier Integration
Expose a per-user inbound webhook. When a lead comes in from a website form, Facebook Lead Ad, or any automation — auto-creates a client in the right pipeline stage. Lowest dev effort with broadest appeal.

---

## 📋 Priority Order

1. ~~Activity log / notes on clients~~ ✅
2. ~~Drag-to-stage on pipeline~~ ✅
3. ~~Mobile layout fix~~ ✅
4. Natural language client import (AI paste-to-create)
5. Multi-AI provider dropdown
6. Recurring client / "due for service" tracker
7. MCP server (Agency tier gate)
8. Client-facing job status link
9. SMS/email dispatch to clients via Resend
10. Webhook / Zapier inbound leads

---

## 💰 Gumroad Products Needed

- `botvaultpro.gumroad.com/l/crm-starter` → $25/mo Starter plan
- `botvaultpro.gumroad.com/l/crm-pro` → $50/mo Pro plan
- `botvaultpro.gumroad.com/l/crm-enterprise` → $200/mo Enterprise plan

Plans overview:
| Plan | Price | Clients | AI Drafts | MCP |
|------|-------|---------|-----------|-----|
| Free | $0 | 5 | — | — |
| Starter | $25/mo | 20 | 15/mo | — |
| Pro | $50/mo | 50 | Unlimited | — |
| Enterprise | $200/mo | 250 | Unlimited | ✅ |
