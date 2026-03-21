# CommonBoard — Project To-Do List

**Last Updated:** 2026-03-21

---

## Phase 1 — Foundation

### Project Setup
- [x] Register domain (commonboard.org)
- [x] Set up Cloudflare Pages hosting
- [x] Deploy landing page
- [x] Create project documentation (PRD, CLAUDE.md, README, TODO)
- [ ] Initialize Expo project
- [ ] Set up Supabase project (database, auth)
- [ ] Configure environment variables and .env.example
- [ ] Set up TypeScript strict mode and linting
- [ ] Create database schema (Supabase migrations)
- [ ] Set up CI (lint + type check on PR)
- [ ] Set up accessibility tooling (eslint-plugin-react-native-a11y or equivalent)
- [ ] Establish accessible component patterns (focus management, ARIA, touch targets)

### Org Data — Fremont County
- [ ] Research and compile list of community resource orgs
- [ ] Build or configure scraping pipeline for org data
- [ ] Seed initial org data into Supabase
- [ ] Verify and clean seeded data

### Core Screens
- [ ] Home screen (category grid, search bar, alert banner placeholder)
- [ ] Search results screen
- [ ] Category view screen
- [ ] Org profile screen
- [ ] About screen
- [ ] Bottom tab navigation

### Core Features
- [ ] Category browsing
- [ ] Keyword search
- [ ] Location-based filtering (client-side)
- [ ] Org profile display (services, hours, contact, etc.)

---

## Phase 2 — Local User + Follows

- [ ] localStorage persistence layer
- [ ] Follow / unfollow orgs
- [ ] My Feed screen (updates from followed orgs)
- [ ] JSON export / import for local data
- [ ] Location preference UI (county / city / ZIP / GPS)
- [ ] GPS privacy warning
- [ ] Incognito / private browsing detection + warning
- [ ] Cache clear warning messaging

---

## Phase 3 — Emergency Alerts

- [ ] Tier 1: NWS API integration
- [ ] Tier 1: FEMA IPAWS API integration
- [ ] Alert data model and storage
- [ ] Alert banner component (Home screen)
- [ ] Location-based alert filtering
- [ ] Tier 3: Category shortcuts ("I see smoke" → fire resources)
- [ ] Emergency shortcuts screen
- [ ] Alert expiration and auto-removal

---

## Phase 4 — Registered Users + Org Management

### Auth & Accounts
- [ ] Supabase Auth integration (email/password)
- [ ] Registration flow
- [ ] Login / logout flow
- [ ] Settings / account screen
- [ ] Local → registered data migration

### Org Management
- [ ] Org claim workflow (request + evidence)
- [ ] Admin approval flow for org claims
- [ ] Org dashboard (edit profile)
- [ ] Org dashboard (post updates)
- [ ] Org dashboard (post Tier 2 alerts)
- [ ] Tier 2: Alert pinning and expiration

---

## Phase 5 — Admin + Polish

### Admin Panel
- [ ] Admin role and access control
- [ ] Seed / manage orgs UI
- [ ] Approve / reject org claims
- [ ] System-level alert posting
- [ ] Category management

### Polish & Launch
- [ ] Performance optimization
- [ ] Full accessibility audit (verify WCAG 2.1 AA compliance across all screens — accessibility is built in from Day 1, this is final verification)
- [ ] Cross-device testing (iOS, Android, web)
- [ ] App store submissions
- [ ] Public launch for Fremont County

---

## Future / Post-Launch

- [ ] Geographic expansion beyond Fremont County
- [ ] Push notifications for registered users
- [ ] Additional Tier 1 alert sources (Colorado OEM, county-specific)
- [ ] Email signup on landing page
- [ ] 501(c)(3) formation
- [ ] Grant applications
- [ ] Ethical corporate sponsorship exploration
