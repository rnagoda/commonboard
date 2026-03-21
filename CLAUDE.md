# CLAUDE.md - CommonBoard Development Guide

## Project Overview

CommonBoard is a public-facing web and mobile app that helps people find community resources — food assistance, housing, shelters, legal aid, disaster/emergency info, volunteer opportunities, and more. It draws on social media conventions (following, feeds) but deliberately closes no engagement loop — no comments, no individual user posting.

**Domain:** commonboard.org
**MVP Test Bed:** Fremont County, Colorado (will expand geographically)
**Frontend:** React Native with Expo (iOS + Android + Web from single codebase)
**Backend/Database:** TBD — to be determined during planning
**Hosting:** Cloudflare Pages (landing page + future static assets). Backend hosting TBD.

### Core Principles

- **No paywall, ever.** No one pays to use or be listed.
- **Org-controlled profiles.** Only verified org reps post content. No public commenting.
- **No login required to view.** The full directory is publicly accessible.
- **Privacy-first.** Anonymous user location is never logged server-side. Local user data never leaves their device unless they export it.

### User Types (All in MVP)

| Type | Auth | Storage | Capabilities |
|------|------|---------|-------------|
| Anonymous visitor | None | None (client-side session only) | Browse, search, view org profiles, see emergency alerts |
| Local user | None | localStorage + JSON export/import | Follow orgs, personalized feed, location preference |
| Registered follower | Account | Server-side | Synced follows/preferences across devices |
| Org representative | Login-gated | Server-side | Manage org profile, post updates, post alerts |
| Platform admin | Login-gated | Server-side | Seed org data, approve org accounts, system alerts |

---

## Git Workflow (CRITICAL)

### Branch Policy

**NEVER commit directly to the `main` branch.** All changes must follow this workflow:

1. **Create a feature branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<feature-name>
   # or
   git checkout -b fix/<bug-description>
   # or
   git checkout -b docs/<documentation-change>
   ```

2. **Branch naming conventions:**
   - `feature/` - New features (e.g., `feature/emergency-alerts-api`)
   - `fix/` - Bug fixes (e.g., `fix/location-privacy`)
   - `docs/` - Documentation only (e.g., `docs/api-readme-update`)
   - `refactor/` - Code refactoring (e.g., `refactor/org-profile-service`)
   - `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

3. **Commit frequently** with clear, descriptive messages:
   ```bash
   git commit -m "feat(alerts): add NWS API integration"
   git commit -m "fix(privacy): ensure anonymous location never persists"
   git commit -m "docs: update API endpoint documentation"
   ```

4. **Push to remote** and create a Pull Request:
   ```bash
   git push origin feature/<feature-name>
   ```

5. **Admin will review and merge** - Do not merge your own PRs

### Commit Message Format

Follow conventional commits:
```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Security Requirements (CRITICAL)

### API Keys and Secrets

- **NEVER commit API keys, secrets, or credentials to the repository**
- **NEVER hardcode sensitive values in source code**
- All secrets must be in environment variables
- Use `.env` files locally (already in `.gitignore`)
- Use platform secrets management for deployment

### User Privacy (CRITICAL)

This application serves vulnerable populations. Privacy is non-negotiable:

- **Anonymous users:** Location data is processed client-side ONLY. Never logged, stored, or transmitted to the server.
- **Local users:** All data (follows, preferences, location) stored in localStorage only. Never sent to server. JSON export/import for portability.
- **Registered users:** Minimal data stored server-side. Only what's needed for sync functionality.
- **No tracking:** No analytics that identify individuals. No IP logging. No behavioral tracking.
- **Incognito detection:** App detects private browsing and warns user that nothing will be saved.

### Authentication Security

- Rate limit all endpoints (see Rate Limiting section)
- Validate all inputs with schemas
- Use parameterized queries (ORM handles this)
- HTTPS only in production
- CORS restricted to production domain

### Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public endpoints | 100 requests | Per minute per IP |
| Authenticated endpoints | 200 requests | Per minute per user |
| Org update operations | 30 requests | Per hour per user |

### Input Validation

Validate ALL user input on both client and server. Use schema validation (e.g., Zod) on the server for all incoming data.

---

## SOLID Coding Principles

Apply SOLID principles throughout the codebase:

### Single Responsibility Principle (SRP)

Each module/class/function should have one reason to change.

### Open/Closed Principle (OCP)

Open for extension, closed for modification. Design services and providers so new functionality can be added without modifying existing code.

### Liskov Substitution Principle (LSP)

Subtypes must be substitutable for their base types.

### Interface Segregation Principle (ISP)

Don't force clients to depend on interfaces they don't use.

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions. Use dependency injection for external services.

---

## Emergency Alert System

Three-tier approach, all included in MVP:

| Tier | Source | Behavior |
|------|--------|----------|
| Tier 1 | Public APIs: NWS, FEMA, Colorado OEM, county emergency management | Pulled automatically, surfaced by user location |
| Tier 2 | Org-posted time-sensitive notices | Pinned to top of their category |
| Tier 3 | Category shortcuts ("I see smoke" → fire resources) | Direct routing to relevant resources |

Alerts are surfaced above everything else on the home screen when active in the user's area.

---

## Location Handling

| User Type | Method | Retention |
|-----------|--------|-----------|
| Anonymous | Manual entry (county/city/ZIP), in-session only | Never — client-side only |
| Local user | Chosen specificity (county → city → ZIP → GPS) | localStorage only, never server |
| Registered | Standard preference | Server-side, privacy policy |

**GPS Warning:** When a local user selects GPS-level specificity, display a clear privacy warning.

---

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Explicit return types on functions
- No `any` types (use `unknown` if truly unknown)
- Prefer interfaces over type aliases for objects
- Use enums sparingly; prefer union types

### React Native
- Functional components only
- Custom hooks for reusable logic
- Props interfaces defined above component
- Destructure props in function signature
- Memoize expensive computations

### File Naming
- React components: PascalCase (`OrgProfile.tsx`)
- Utilities/hooks: camelCase (`useEmergencyAlerts.ts`)
- Types: PascalCase (`OrgProfile.ts`)
- Routes/controllers: kebab-case with suffix (`org.routes.ts`)

### Imports Order
1. External packages
2. Internal absolute imports
3. Relative imports
4. Styles/assets

---

## Testing Requirements

- Unit tests for all utility functions
- Unit tests for all business logic
- Integration tests for API endpoints
- Component tests for critical UI flows
- Minimum 80% code coverage target

---

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- ARIA labels on icons and interactive elements
- Color contrast minimum 4.5:1
- Focus indicators visible
- Screen reader compatible
- No reliance on color alone to convey information

**Note:** Accessibility is especially important for this app — users may be in crisis situations, using older devices, or have disabilities.

---

## Error Handling

### API Errors
All API errors return consistent format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

### Client Error Handling
- Display user-friendly error messages
- Log errors to console in development
- Implement error boundaries for React components
- Graceful degradation when APIs fail

---

## Checklist Before Creating PR

- [ ] Code follows SOLID principles
- [ ] No hardcoded secrets or API keys
- [ ] No personal user data being stored beyond what's specified
- [ ] Privacy requirements verified (anonymous location never server-side, local user data stays local)
- [ ] All inputs validated (client and server)
- [ ] TypeScript strict mode passes
- [ ] Linting passes with no warnings
- [ ] Tests written and passing
- [ ] Responsive design tested (mobile + desktop)
- [ ] Accessibility checked
- [ ] Feature branch is up to date with main
- [ ] Commit messages follow conventional format
- [ ] PR description explains changes clearly
- [ ] **TEST STEPS PROVIDED TO USER** (see below)

---

## MANDATORY: Test Steps Before PR (CRITICAL)

**BEFORE creating any PR, you MUST provide the user with manual test steps to verify the work.**

This is NON-NEGOTIABLE. Every PR must be preceded by:

1. **Prerequisites** - What needs to be running (server, client, database)
2. **Test Commands** - Exact commands or UI steps to test each feature
3. **Expected Results** - What the user should see for each test
4. **Error Case Tests** - How to verify error handling works

**DO NOT create a PR until the user has had the opportunity to run these tests and confirm the work is correct.**

---

## Work Session Documentation

When pausing or completing a work session, always provide a summary that includes:

### Testable Items
List all new functionality that can be tested:
- New endpoints (with example commands)
- New UI components (with navigation paths)
- New scripts or commands
- Database changes

### How to Test
Provide step-by-step instructions for testing the work with expected outputs and success criteria.
