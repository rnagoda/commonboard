# CommonBoard

**Community resources, all in one place.**

CommonBoard is a free, open platform connecting people to food assistance, housing, shelters, legal aid, emergency info, volunteer opportunities, and more. No paywalls, no engagement loops, no tracking — just information for people who need it.

**Status:** Early development
**MVP:** Fremont County, Colorado
**Website:** [commonboard.org](https://commonboard.org)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native + Expo (iOS, Android, Web) |
| Frontend Hosting | Cloudflare Pages |
| Backend / API / Auth | Supabase (Postgres, Auth, Realtime) |
| Domain | commonboard.org |

## Project Structure

```
commonboard/
├── app/                       # Expo/React Native app (iOS, Android, Web)
│   ├── assets/                # App icons, splash screen
│   ├── App.tsx                # Root component
│   ├── app.json               # Expo config
│   ├── package.json           # App dependencies and scripts
│   ├── tsconfig.json          # TypeScript config (strict mode)
│   └── .eslintrc.json         # ESLint + accessibility rules
├── docs/
│   └── PRD.md                 # Product requirements document
├── tools/                     # Scraping/data pipeline (future)
├── index.html                 # Landing page (deployed to Cloudflare Pages)
├── CLAUDE.md                  # Development guide and coding standards
├── TODO.md                    # Project to-do list
├── README.md                  # This file
└── .gitignore
```

## Core Principles

- **No paywall, ever.** No one pays to use or be listed.
- **Org-controlled profiles.** Only verified org reps post content. No public commenting.
- **No login required to view.** The full directory is publicly accessible.
- **Privacy-first.** Anonymous user location is never logged server-side.
- **Accessible from Day 1.** WCAG 2.1 AA compliance is foundational, not a polish phase.
- **No engagement loops.** No likes, comments, or algorithmic feeds.

## User Types

| Type | Description |
|------|-------------|
| Anonymous visitor | Browse everything, no account needed |
| Local user | Follows and preferences saved locally on device |
| Registered user | Synced across devices with an account |
| Org representative | Manages their organization's profile |
| Platform admin | Seeds data, approves orgs, manages alerts |

## Development

### Prerequisites

- Node.js 20.19+ (required by React Native / Metro)
- Expo CLI (`npx expo` — no global install needed)
- Supabase account (free tier)

### Getting Started

```bash
# Install app dependencies
cd app && npm install

# Start the dev server
npm start

# Or start for a specific platform
npm run ios
npm run android
npm run web

# Linting and type checking
npm run lint
npm run typecheck
```

### Git Workflow

All changes go through feature branches and pull requests. See [CLAUDE.md](CLAUDE.md) for the full workflow, coding standards, and PR checklist.

## Documentation

- [PRD](docs/PRD.md) — Product requirements, user types, features, data models, phased rollout
- [CLAUDE.md](CLAUDE.md) — Development guide, git workflow, security, coding standards
- [TODO.md](TODO.md) — Project to-do list

## License

TBD

## Contact

TBD
