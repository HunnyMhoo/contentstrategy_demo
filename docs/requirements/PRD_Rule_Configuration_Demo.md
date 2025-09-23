# PRD — Rule Configuration Demo UI (Overview)
**Product:** KPlus ▸ Home ▸ “For You” — Rule Configuration (Demo)  
**Owner:** Principal Technical Product Manager  
**Audience:** AI coder (frontend-focused), Designer, Demo Presenter  
**Version:** v0.2 (Overview) — **Date:** 2025-09-23 (Asia/Bangkok)

---

## 1) Summary
A high-fidelity **demo UI** to showcase how business users configure **IF (Audience) → THEN (Content)** rules for a 5-tile “For You” placement. The demo runs fully **offline with fixtures**, supports **Boolean targeting** (depth ≤5), **Targeted Lead** as a customer attribute, a **single Fallback Plan** with reason-aware branches, **UTC scheduling with local display**, **simulation by User ID**, **visual dedupe/backfill**, **Explain-Why** copy with lightweight lint, and a **read-only JSON preview**.

> **Goal:** A polished, click-through presentation tool that makes the logic and outcomes understandable at a glance—**no backend**.

---

## 2) Objectives & Non-Goals
### Objectives
- Make stakeholders **visualize**: how rules are authored, scheduled, and produce a 5-tile slate.
- Demonstrate **Targeted Lead** as a customer attribute in Audience conditions.
- Allow **simulation by User ID**, show Explain-Why per tile, and expose a simple eval trace.
- Provide **JSON preview** reflecting what an exportable configuration might look like.

### Non-Goals (v0)
- Real data pipelines, real ranking, or real supply integrations.
- Saved condition templates (future).
- Telemetry dashboarding (only event names as placeholders).
- Multi-placement orchestration.

---

## 3) Personas & Primary Use Cases
- **Marketing Manager (Author):** creates/edits rules using a visual condition builder.
- **Product/Exec (Reviewer):** quickly scans rule list and simulates outcome for a sample user.
- **Presenter (Demo):** toggles demo mode, runs scripted simulations, copies JSON preview.

**Key use cases**
1. Create a new rule with **Targeted Lead = true** and risk band filter, bind to a content template, set `max_yield`, configure **Fallback Plan** by reason, add schedule, and simulate.
2. Duplicate a rule, tweak Audience, re-simulate, and observe visual **dedupe/backfill**.
3. Show **JSON Preview** and a lightweight **Eval Trace** to explain results.

---

## 4) Definitions
- **Audience (IF):** Boolean tree (AND/OR with optional NOT; max depth 5) built from fields in three groups: **Customer Attributes** (incl. `targeted_lead`), **User Activity**, **Custom Data**.
- **Targeted Lead:** **Boolean** customer attribute indicating the user **has an eligible targeted lead** (true/false).
- **THEN:** Content binding: **Source** (Targeted Lead / Product Recommend / CMS), **Template** (visual), **Max Yield** (1–5), **Tokenized copy** with fallback (`{{lead.title|Our pick}}`).
- **Fallback Plan (single control):** Two reason-aware branches:  
  `on_ineligible_audience` and `on_empty_supply` → each can render **CMS**, **Default Tile**, or **None**.
- **Schedule:** Stored **UTC**; displayed with timezone `Asia/Bangkok`.
- **Simulation:** Enter User ID → render slate (≤5 tiles), show Explain-Why, and **Eval Trace** (read-only).
- **Dedupe/Backfill (visual-only):** Drop duplicate `product_id`, strike-through duplicates, and visually backfill from next eligible items.

---

## 5) Success Criteria (Demo Quality)
- Stakeholders can **author a rule end-to-end** without confusion (no dead ends).
- Simulation produces a **coherent, explainable** slate with visible sources & templates.
- **Explain-Why** appears for each tile (40–120 chars) with basic lint (✅/⚠️).
- **JSON Preview** validates against mock schema and is copyable.
- **No backend calls**; all flows are responsive (≤150ms UI interactions).

---

## 6) Information Architecture & Navigation
- **Routes**
  - `/rules` — Rule List (table)
  - `/rules/new` — New Rule (editor tabs)
  - `/rules/:id` — Edit Rule (same editor)
- **Editor Tabs/Sections**
  1. **Audience (IF)**
  2. **Then (Content Binding)**
  3. **Fallback Plan**
  4. **Schedule**
  5. **Preview (Simulation)**
  6. **JSON (Read-only)**

**Persistent actions:** Save Draft, Duplicate, Activate (disabled in demo), Run Simulation (visible in Preview).

---

## 7) Data Contracts (Mock)

### 7.1 JSON Fixtures (examples)
```json
// fixtures/attributes.json
{
  "customer_attributes": [
    { "key": "targeted_lead", "type": "boolean", "label": "Targeted Lead" },
    { "key": "aum_band", "type": "enum", "values": ["<1M","1–5M","5–20M","20M+"] },
    { "key": "risk_band", "type": "enum", "values": ["Cautious","Balanced","Aggressive"] }
  ],
  "user_activity": [{ "key": "last_click_days", "type": "number" }],
  "custom_data": [{ "key": "persona", "type": "enum", "values": ["Beginner","Builder","HNWI"] }]
}
```

```json
// fixtures/rule_draft.json (single rule)
{
  "id": "rule_001",
  "name": "Show TL first",
  "status": "Draft",
  "audience": {
    "op": "AND",
    "children": [
      { "field": "customer.targeted_lead", "op": "EQ", "value": true },
      { "field": "customer.risk_band", "op": "IN", "value": ["Balanced","Aggressive"] }
    ]
  },
  "then": {
    "source": "TargetedLead",
    "template_id": "tile.tl.standard",
    "max_yield": 3,
    "copy": {
      "title": "{{lead.title|Our pick}}",
      "subtitle": "{{lead.score|Don’t miss this}}"
    }
  },
  "fallback_plan": {
    "on_ineligible": { "type": "DefaultTile", "id": "tile.default.educate" },
    "on_empty": { "type": "CMS", "cms_slot": "wealth.education" }
  },
  "schedule": {
    "start_utc": "2025-09-23T00:00:00Z",
    "end_utc": "2025-12-31T23:59:59Z",
    "days_of_week": [1,2,3,4,5,6,7],
    "hours_local": { "start": "08:00", "end": "22:00", "timezone": "Asia/Bangkok" }
  }
}
```

```json
// fixtures/sim_users.json (two example users)
[
  {
    "user_id": "u123",
    "customer": { "targeted_lead": true, "risk_band": "Balanced", "aum_band": "1–5M" },
    "activity": { "last_click_days": 2 },
    "custom": { "persona": "Builder" }
  },
  {
    "user_id": "u999",
    "customer": { "targeted_lead": false, "risk_band": "Cautious", "aum_band": "<1M" },
    "activity": { "last_click_days": 45 },
    "custom": { "persona": "Beginner" }
  }
]
```

---

## 8) Simulation Logic (UI-only)
1. **Load user fixture** by User ID.
2. Evaluate Audience tree (pure JS) with **depth guard** (error if >5).
3. If Audience **fails** → render **Fallback on_ineligible**.
4. If Audience **passes** → “fetch” (mock) items by source (TL/PR/CMS) from fixtures:
   - Take up to `max_yield`.
   - **Dedupe visual-only** by `product_id`: mark duplicates as struck-through and fill with next items (if available).
5. For each rendered tile, resolve tokenized copy with defaults; if unresolved, use fallback pipe.
6. Produce **Eval Trace** (JSON-ish): `audience_pass`, `selected_items`, `deduped_items`, `fallback_reason`, `final_slate`.

---

## 9) Validation Rules (UI)
- **Audience:** no always-false expressions; max depth ≤5.
- **Then:** require `source` and `template_id`; `max_yield` 1–5.
- **Fallback Plan:** both branches must have a selection (CMS/Default/None).
- **Schedule:** `start_utc < end_utc`; local hours valid; display tz note.
- **Explain-Why:** 40–120 chars recommended; lint ⚠️ when PII-like tokens are detected (non-blocking).

---

## 10) Tech Approach (suggested)
- **Framework:** React + TypeScript
- **UI:** Tailwind + Headless UI (or Material UI if preferred)
- **State:** Zustand or Redux Toolkit (small store OK)
- **Routing:** React Router
- **Validation:** Zod (for JSON schema & form guards)
- **Fixtures:** `/fixtures/*.json` loaded at boot; demo toggle via `?demo=1`
- **Time:** date-fns or luxon for UTC↔local conversion
- **Build/QA:** ESLint + Prettier; simple Vitest/Jest for pure functions (audience eval)

**Folder sketch**
```
/src
  /components (builder, tiles, fallback, schedule, jsonPreview, trace)
  /features/rules (list, editor, state)
  /hooks
  /lib (audienceEval.ts, tokens.ts, dedupe.ts, schedule.ts)
  /pages (RulesList.tsx, RuleEditor.tsx)
  /styles
/fixtures (attributes.json, rule_draft.json, sim_users.json, catalogs.json)
```
---

## 11) Accessibility & Performance
- Keyboard navigation for builder controls; focus outlines; aria labels on chips.
- Target ≤150 ms interaction latency (no blocking network).
- High-contrast badges for Source/Template in Preview.

---

## 12) Telemetry (names only, console-logged in demo)
- `rule_saved`, `rule_duplicated`, `simulation_run`, `audience_failed`, `fallback_applied`, `tile_deduped`, `json_copied`.

---

## 13) QA Acceptance Checklist (Gherkin)
```
Scenario: Create & simulate TL rule
  Given I open /rules/new in demo mode
  When I add Audience: customer.targeted_lead == true AND risk_band IN ["Balanced","Aggressive"]
  And I set Then: source=TargetedLead, template=tile.tl.standard, max_yield=3
  And I configure Fallback Plan: on_ineligible=DefaultTile(tile.default.educate), on_empty=CMS(wealth.education)
  And I set Schedule to active now (Asia/Bangkok)
  And I simulate with user_id "u123"
  Then I see up to 5 tiles with Source/Template badges and Explain-Why
  And the JSON Preview validates (✅) and is copyable
```

```
Scenario: Dedupe visual & backfill
  Given selected items contain duplicate product_id
  When Preview renders
  Then duplicates are struck-through with "deduped"
  And next eligible items are labeled "backfill"
```
---

## 14) Open Decisions (tracked)
- **Saved Conditions/Templates:** out of scope v0; leave “Coming soon” affordance in UI.
- **Explain-Why lint catalog:** v0 simple heuristics; v1 can load rules from config.

---

## 15) Deliverables (v0 Demo)
1. **Rule List** page with sample rows.  
2. **Rule Editor** with 6 sections (Audience, Then, Fallback Plan, Schedule, Preview, JSON).  
3. **Simulation** experience (User ID input → slate + trace).  
4. **Fixtures** for attributes, rules, content catalogs, and users.  
5. **Read-only JSON Preview** with validation and copy.

---

### Appendix — Example Content Catalog (optional)
```json
// fixtures/catalogs.json
{
  "targeted_leads": [
    { "product_id": "TL-001", "lead": { "title": "Upgrade Your Portfolio", "score": "High" }, "template": "tile.tl.standard" },
    { "product_id": "TL-002", "lead": { "title": "Income Booster Fund", "score": "Med" }, "template": "tile.tl.standard" }
  ],
  "product_recos": [
    { "product_id": "MF-ABC", "product": { "name": "Alpha Balanced Fund" }, "template": "tile.pr.standard" }
  ],
  "cms": {
    "wealth.education": [
      { "content_id": "ART-1001", "title": "Why diversify?", "template": "tile.cms.article" }
    ]
  }
}
```
