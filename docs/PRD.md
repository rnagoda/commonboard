# CommonBoard — Product Requirements Document

**Version:** 1.0
**Last Updated:** 2026-03-21
**Domain:** commonboard.org

---

## 1. Vision & Purpose

CommonBoard is a free, public-facing platform that helps people find community resources — food assistance, housing, shelters, legal aid, disaster/emergency info, volunteer opportunities, and more.

It draws on social media conventions (following orgs, personalized feeds) but deliberately closes the engagement loop. There are no comments, no individual user posting, no likes, no algorithmic manipulation. The platform exists to connect people to help — nothing more.

**This is not a profit-driven venture.** No one ever pays to use or be listed on CommonBoard. Sustainability comes from grants, municipal partnerships, and ethical sponsorship — never from the users or the organizations that serve them.

### Starting Point

Fremont County, Colorado is the MVP test bed — small, manageable, real community need. The platform will expand in geographic segments from there, ultimately serving communities nationwide.

---

## 2. Core Principles

These are non-negotiable and must inform every design and engineering decision:

1. **No paywall, ever.** No one pays to use or be listed.
2. **Org-controlled profiles.** Only verified org representatives post content. No public commenting. No user-generated content beyond follows and preferences.
3. **No login required to view.** The full directory is publicly accessible to anyone.
4. **Privacy-first.** This app serves vulnerable populations. Anonymous user location is never logged server-side. Local user data never leaves their device unless they explicitly export it.
5. **No engagement loops.** No likes, comments, shares-for-clout, or algorithmic feeds. Information flows one direction: from orgs to people who need it.
6. **Accessible from Day 1.** WCAG 2.1 AA compliance is not a phase or a polish item — it is a foundational requirement built into every screen, component, and interaction from the first line of code. Our users include people with disabilities, people in crisis using assistive technology, and people on older or limited devices. Accessibility cannot be an afterthought.

---

## 3. User Types

### 3.1 Anonymous Visitor

- **Auth:** None
- **Storage:** None (client-side session only)
- **Capabilities:** Browse, search, view org profiles, see emergency alerts
- **Location:** Manual entry (county/city/ZIP), in-session only, processed client-side, never transmitted to server
- **Use case:** Someone who finds the app through a search, a flyer, or word of mouth and needs information right now

### 3.2 Local User

- **Auth:** None
- **Storage:** localStorage on their device
- **Capabilities:** Everything anonymous can do, plus: follow orgs, personalized feed, saved location preference
- **Location:** Chosen specificity level (county, city, ZIP, or GPS — with clear privacy warning for GPS)
- **Data portability:** JSON export/import for backup and device switching
- **Incognito handling:** App detects private browsing and warns that nothing will be saved
- **Cache clear:** Local data is lost unless exported — communicated clearly to user
- **Use case:** Regular user who wants a personalized experience but doesn't want to create an account

### 3.3 Registered User

- **Auth:** Account-based (Supabase Auth — email/password, potentially magic link)
- **Storage:** Server-side
- **Capabilities:** Everything local user can do, plus: synced follows and preferences across devices
- **Location:** Chosen specificity level (county, city, ZIP, or GPS — same options as local user). Even though data is stored server-side, the user controls what level of specificity is shared. Their data is sacrosanct.
- **Upgrade path:** Local user → registered account migrates their saved follows seamlessly
- **Use case:** User who accesses CommonBoard from multiple devices and wants consistency

### 3.4 Org Representative

- **Auth:** Login-gated (Supabase Auth). **MFA required (post-MVP).**
- **Storage:** Server-side
- **Capabilities:** Manage their organization's profile, post updates, set hours, post Tier 2 alerts, view org analytics (visit numbers, trending, follower count — details TBD for MVP vs post-MVP)
- **Onboarding:** Org claims an existing seeded profile, admin approves the claim
- **Use case:** Staff or volunteer at a community organization who keeps their listing current

### 3.5 Platform Admin

- **Auth:** Login-gated (Supabase Auth, admin role). **MFA required (post-MVP).**
- **Storage:** Server-side
- **Capabilities:** Seed org data, approve org account claims, manage system-level alerts, manage categories
- **Use case:** Platform operator (initially just the founder)

---

## 4. Information Architecture

### 4.1 Screen Map

**Public (all users):**

| Screen              | Purpose                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Home (Web)          | Emergency alert banner (if active) + search bar + My Feed subset + category grid                                                |
| Home (Native App)   | My Feed is the home screen (think Instagram). Emergency alert banner overlays at top when active. Search and categories accessible via tabs. |
| Search Results      | Filtered by category, keyword, and/or location                                                                                  |
| Category View       | All orgs in a category, Tier 2 alerts pinned at top                                                                             |
| Org Profile         | Full org details: services, hours, eligibility, contact, location, languages, last-verified date, recent updates, follow button |
| Emergency Shortcuts | "I need help with..." quick-action cards (Tier 3) routing to relevant resources                                                 |
| About               | What CommonBoard is, how it works, how orgs can get listed                                                                      |

**Local + Registered users:**

| Screen   | Purpose                                                              |
| -------- | -------------------------------------------------------------------- |
| My Feed  | Chronological updates from followed orgs (home screen on native app) |
| Settings | Manage location preference, category interests, export/import (local) or account/sync preferences (registered) |

**Org representatives:**

| Screen        | Purpose                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| Org Dashboard | Edit profile, post update, post alert, view analytics (visits, followers, trending — scope TBD for MVP vs post-MVP) |

**Platform admin:**

| Screen      | Purpose                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| Admin Panel | Seed/manage orgs, approve org claims, post system-level alerts, manage categories |

### 4.2 Navigation (Mobile)

```
Bottom tabs (native app):
├── Feed (home screen — My Feed for local/registered, discovery for anonymous)
├── Search
├── Categories
└── More (about, settings, org dashboard if org rep, admin if admin)
```

### 4.3 User Flow

**Design goal:** Minimize the number of taps between a user and their chosen resources. My Feed is the primary surface — users should land on relevant information, not navigate to it.

```
Native App:
  Entry Point → Emergency Alert Banner (overlays if active)
    └── My Feed (home screen)
         ├── Updates from followed orgs (local/registered)
         ├── Discovery feed (anonymous — popular/recent org updates)
         └── Tap any update → Org Profile Page

  Bottom tabs provide parallel access to:
    ├── Search (category / keyword / location)
    ├── Categories (Food · Housing · Legal · Disaster · etc.)
    │    └── Emergency Shortcuts integrated here ("I see smoke" → fire resources)
    └── More (about, settings, org dashboard, admin)

  All paths lead to → Org Profile Page
    ├── Services, hours, contact, updates
    ├── Follow / Unfollow
    └── Share (deep link)

Web:
  Entry Point → Emergency Alert Banner (if active)
    └── Home
         ├── Search bar
         ├── My Feed subset (recent updates from follows, or discovery)
         ├── Category grid
         └── Emergency Shortcuts
```

User capability increases across tiers: browse only → local follows/feed/settings → synced account → org management.

---

## 5. Emergency Alert System

Three-tier approach, all included in MVP:

### Tier 1 — External API Alerts

- **Sources:** NWS (National Weather Service), FEMA IPAWS, Colorado OEM, county emergency management
- **Behavior:** Pulled automatically on a schedule, surfaced based on user's location
- **Display:** Full-width banner above all content on Home screen when active
- **Data:** Title, description, severity, urgency, affected area, source, expiration

### Tier 2 — Org-Posted Alerts

- **Sources:** Verified org representatives
- **Behavior:** Time-sensitive notices pinned to top of their category
- **Examples:** "Food bank at capacity today," "Shelter closed for maintenance through Friday"
- **Expiration:** Org sets expiration; auto-unpins when expired
- **Moderation:** Only verified org reps can post; admin can remove

### Tier 3 — Category Shortcuts

- **Concept:** Plain-language trigger phrases that route directly to relevant resources
- **Examples:**
  - "I see smoke" → Fire resources + NWS fire alerts
  - "I need food tonight" → Food assistance orgs, filtered by open-now
  - "I need a place to stay" → Shelters with availability
  - "I'm in danger" → Domestic violence resources + emergency services
- **Display:** Quick-action cards on Home screen and dedicated Emergency Shortcuts screen
- **Implementation:** Curated mapping of phrases to categories + optional filters

### Alert Priority

Alerts surface above all other content. Priority order:

1. Tier 1 (external emergency alerts — highest severity first)
2. Tier 2 (org-posted time-sensitive notices)
3. Tier 3 shortcuts are always available but not intrusive

---

## 6. Location Handling

| User Type  | Method                                          | Retention         | Server-Side              |
| ---------- | ----------------------------------------------- | ----------------- | ------------------------ |
| Anonymous  | Manual entry (county/city/ZIP), in-session only | Never retained    | Never                    |
| Local user | Chosen specificity (county → city → ZIP → GPS)  | localStorage only | Never                    |
| Registered | Chosen specificity (county → city → ZIP → GPS)  | Server-side       | Yes, at user's chosen level only |

**All user data is sacrosanct.** Even registered users control exactly what level of location specificity is stored. We never infer, upgrade, or retain more location precision than the user has explicitly chosen.

### Privacy Requirements

- Anonymous location is processed entirely client-side — never transmitted to or logged by the server
- Local user location is stored in localStorage only — never sent to server
- GPS-level specificity triggers a clear privacy warning before saving
- No IP-based geolocation without explicit user consent

---

## 7. Content & Organizations

### 7.1 Org Data Lifecycle

1. **Seeded by platform:** Admin populates initial org data via web scraping and manual research so orgs are findable from day one
2. **Claimed by org:** An org representative claims the profile and verifies their identity
3. **Managed by org:** Once approved, org rep maintains their own profile, posts updates, and manages alerts

### 7.2 Org Profile Fields

| Field                | Required    | Notes                             |
| -------------------- | ----------- | --------------------------------- |
| Name                 | Yes         |                                   |
| Description          | Yes         | What the org does, who they serve |
| Categories           | Yes         | One or more from defined list     |
| Services offered     | Yes         | Structured list                   |
| Address              | Yes         | Physical location                 |
| Coordinates          | Yes         | For map/location features         |
| Service area         | No          | County/city/ZIP coverage area     |
| Hours                | Yes         | Structured hours with timezone    |
| Phone                | Recommended |                                   |
| Email                | Recommended |                                   |
| Website              | No          |                                   |
| Languages served     | No          | Defaults to English               |
| Eligibility criteria | No          | Who qualifies for services        |
| Target audience      | Recommended | Who this org primarily serves (e.g., women, veterans, families with children, seniors, youth, LGBTQ+, Spanish-speaking). Enables filtering so users find resources meant for them. |
| Last verified        | Auto        | Timestamp of last profile update  |
| Status               | Auto        | Active, inactive, pending         |
| Claimed              | Auto        | Whether an org rep manages it     |

### 7.3 Org Updates

Orgs can post temporary updates visible on their profile and in followers' feeds:

- **Types:** General, capacity, closure, hours-change
- **Pinning:** Capacity/closure updates can be pinned as Tier 2 alerts
- **Expiration:** Optional expiration date for auto-removal
- **History:** Updates remain visible in a timeline on the org profile

### 7.4 Resource Categories

Initial categories for MVP:

- Food Assistance
- Housing
- Shelters
- Legal Aid
- Emergency / Disaster
- Health & Mental Health
- Volunteer Opportunities
- Financial Assistance
- Transportation
- Education & Job Training
- Childcare & Family Services
- Substance Use & Recovery

Categories can be expanded by admin. Orgs may belong to multiple categories.

---

## 8. Local User Storage Design

### Working Layer

- **localStorage** — automatic, frictionless, no account needed
- Stores: followed org IDs, location preference (level + value), category interests, UI preferences

### Export / Import

- **Export:** Downloadable JSON file containing all local data
- **Import:** Restore from JSON file (device switching, browser clearing, etc.)
- **Format:** Versioned schema so future imports remain backward-compatible

### Registered Upgrade Path

- When a local user creates an account, their localStorage data (follows, preferences) is migrated to server-side storage
- Migration is automatic and seamless — no manual re-entry
- localStorage copy is retained as fallback until confirmed synced

### Edge Cases

- **Incognito/private browsing:** App detects and warns user that nothing will persist
- **Browser cache clear:** Data is lost unless exported — communicated clearly via UI
- **Multiple devices:** No sync without account — export/import is the manual bridge

---

## 9. Design Direction

### Aesthetic

- **Open and friendly** with a slightly artistic bent
- Not corporate, not clinical, not governmental
- Warm and approachable — people in crisis should feel welcomed, not processed

### Validated Design Language (from landing page)

- **Typography:** DM Serif Display (headings) + DM Sans (body) — warm but readable
- **Color palette:**
  - Background: warm cream (`#faf8f5`)
  - Text: dark warm gray (`#2d2a26`)
  - Accent: muted teal (`#3a7d6e`)
  - Warm accent: amber (`#e8a44a`)
  - Accent light: pale teal (`#e8f3f0`)
- **Shape language:** Rounded corners, pill-shaped tags, soft dividers
- **Overall feel:** Community bulletin board — familiar, trustworthy, human

### Accessibility (CRITICAL — Day 1 Requirement)

Accessibility is a core principle, not a polish phase. Every component must be accessible from the moment it is built. Our users include people with visual, motor, cognitive, and other disabilities — often in crisis situations where accessibility barriers can mean the difference between getting help and not.

- **WCAG 2.1 AA compliance minimum** — enforced from Day 1, not retrofitted
- Color contrast 4.5:1 minimum (large text 3:1)
- Full keyboard navigation for all interactive elements
- Screen reader compatible with proper ARIA labels, roles, and live regions
- Focus indicators always visible
- No reliance on color alone to convey information
- Touch targets minimum 44x44px on mobile
- Accessible on older devices and slower connections
- All images and icons must have meaningful alt text or be marked decorative
- Form inputs must have associated labels
- Error messages must be programmatically associated with their fields
- Every new component must pass accessibility review before merge

---

## 10. Technology Stack

| Layer            | Technology          | Notes                                  |
| ---------------- | ------------------- | -------------------------------------- |
| Frontend         | React Native + Expo | iOS, Android, Web from single codebase |
| Frontend Hosting | Cloudflare Pages    | Free tier, global CDN                  |
| Backend / API    | Supabase            | Auto-generated REST, RPC functions     |
| Database         | Supabase Postgres   | Geospatial support, robust, free tier  |
| Auth             | Supabase Auth       | Email/password, potentially magic link |
| Realtime         | Supabase Realtime   | Live alert updates, org update feeds   |
| Domain           | commonboard.org     | Registered, DNS on Cloudflare          |

---

## 11. Data Models

### Organization

```
id, name, description, slug
categories[] (refs)
services[] (structured list)
target_audience[] (e.g., women, veterans, families, seniors, youth, LGBTQ+, general)
address, coordinates (lat/lng), service_area
hours (structured), timezone
phone, email, website
languages_served[]
eligibility_criteria
last_verified_at
status (active | inactive | pending)
claimed (boolean), claimed_by (user ref)
created_at, updated_at
```

### Org Update

```
id, org_id (ref)
title, body
type (general | capacity | closure | hours_change)
is_pinned (boolean, for Tier 2 alerts)
expires_at
created_at
```

### Emergency Alert (Tier 1)

```
id, source (nws | fema | colorado_oem | county)
external_id
title, description
severity (extreme | severe | moderate | minor)
urgency (immediate | expected | future)
affected_area (geo boundary or county/ZIP list)
active_from, expires_at
fetched_at
```

### Category Shortcut (Tier 3)

```
id, trigger_phrase
display_label
maps_to_category (ref)
additional_filters (JSON)
priority_order
is_active (boolean)
```

### User (registered)

```
id (Supabase auth ref)
email
location_preference_level (county | city | zip | gps)
location_preference_value
created_at
```

### User Follow

```
user_id (ref), org_id (ref)
created_at
```

### Org Claim

```
id, org_id (ref), user_id (ref)
status (pending | approved | rejected)
evidence (text — how they prove affiliation)
reviewed_by (admin user ref)
created_at, reviewed_at
```

---

## 12. Org Data Strategy

Building automated tooling for org data collection is a core part of the MVP — not just to seed Fremont County, but to enable efficient geographic expansion.

### Data Sources (priority order)

| Source | Type | What it provides |
|--------|------|-----------------|
| **211 Colorado** (211colorado.org) | Primary | Most comprehensive community resource directory in the state. Searchable by county. |
| **IRS 990 / Tax-exempt org data** | Supplementary | Every registered nonprofit in a county. Free downloadable BMF extract from IRS. |
| **Google Places API** | Enrichment | Contact info, hours, coordinates, reviews for validation. |
| **Colorado DOLA** (Dept of Local Affairs) | Supplementary | Housing, homelessness, community services data. |
| **FEMA / Colorado OEM** | Supplementary | Emergency resources, disaster preparedness orgs. |
| **County/city government websites** | Manual | Local services, departments, partner org listings. |
| **United Way local chapters** | Manual | Local resource referrals. |
| **Faith-based organizations** | Manual | Food pantries, clothing closets, shelter — often not in any database. |
| **Facebook community groups** | Manual | Resource info shared informally. |
| **Local newspapers** | Manual | Event listings, org announcements. |

### Automated Scraping Tool

Build a reusable pipeline that can be pointed at a new geographic area:

1. **Scrape** — Pull org data from structured sources (211, IRS, Google Places)
2. **Normalize** — Map scraped fields to our org schema (name, categories, services, target audience, address, hours, contact, etc.)
3. **Deduplicate** — Match orgs across sources by name + address similarity
4. **Enrich** — Fill gaps (coordinates from address, hours from Google, etc.)
5. **Review** — Output a review file for manual verification before import
6. **Import** — Load verified data into Supabase

The tool should be designed so that adding a new county is as simple as specifying the geographic target and running the pipeline. Manual research supplements automated collection for orgs that don't appear in any database.

### Data Fields Collected Per Org

All fields from the org schema (Section 7.2), with special attention to:
- **Target audience** — scraped from service descriptions, eligibility info, or org names where possible (e.g., "Women's Shelter" → target audience: women)
- **Categories** — mapped from source categorizations to our category list
- **Services** — extracted and normalized into structured list

### Fremont County Seed (MVP)

Fremont County is the first target. Expected volume: 50–150 orgs across all categories. The automated tool handles the bulk; manual research fills gaps for faith-based orgs, informal community resources, and any orgs not in structured databases.

---

## 13. Sustainability Model

- **Grant funding:** Digital equity, civic tech, emergency preparedness — Colorado has strong options
- **Municipal/county partnerships:** Government agencies benefit from a well-maintained resource directory
- **Ethical corporate sponsorship:** Future consideration, strictly non-exploitative
- **501(c)(3):** Likely appropriate as the platform grows
- **Cost management:** Leverage free tiers (Supabase, Cloudflare, Expo), automate data gathering, keep infrastructure minimal

---

## 14. Phased Rollout

### Phase 1 — Foundation

- Project setup (Expo, Supabase, Cloudflare Pages)
- Database schema and seed data pipeline
- Org data scraping/research for Fremont County
- Core screens: Home, Search, Category View, Org Profile
- Anonymous browsing flow (no auth required)
- Basic search (category + keyword)

### Phase 2 — Local User + Follows

- localStorage persistence layer
- Follow/unfollow orgs
- My Feed screen
- JSON export/import
- Location preference (client-side)
- Incognito detection + warnings

### Phase 3 — Emergency Alerts

- Tier 1: NWS API integration
- Tier 1: FEMA API integration
- Alert banner on Home screen
- Location-based alert filtering (client-side for anonymous/local)
- Tier 3: Category shortcuts

### Phase 4 — Registered Users + Org Management

- Supabase Auth integration
- Registered user flow (signup, login, sync)
- Local → registered migration
- Org claim and approval workflow
- Org Dashboard (edit profile, post updates)
- Tier 2: Org-posted alerts

### Phase 5 — Admin + Polish

- Admin panel (seed orgs, approve claims, system alerts)
- Org data verification workflows
- Performance optimization
- Accessibility audit
- App store submissions (iOS + Android)
- Public launch for Fremont County

### Future Phases

- Geographic expansion beyond Fremont County
- Push notifications for registered users
- Additional Tier 1 alert sources (Colorado OEM, county-specific)
- Email signup on landing page (if traffic warrants)
- 501(c)(3) formation
- Grant applications

---

## 15. Success Metrics

### MVP Launch (Fremont County)

- All community resource orgs in Fremont County are listed and findable
- Emergency alerts from NWS/FEMA surface correctly for the area
- App is functional on iOS, Android, and web
- Page load under 3 seconds
- WCAG 2.1 AA compliance verified

### Post-Launch

- Number of orgs that claim their profiles
- Number of local/registered users
- Search usage patterns (what are people looking for?)
- Alert engagement (are people seeing and acting on alerts?)
- Org update frequency (are orgs keeping their info current?)

---

## Companion Documents

| Document                  | Purpose                                           |
| ------------------------- | ------------------------------------------------- |
| [CLAUDE.md](../CLAUDE.md) | Development guide, coding standards, git workflow |
| [README.md](../README.md) | Project overview, setup instructions              |
| [TODO.md](../TODO.md)     | Maintained project to-do list                     |
