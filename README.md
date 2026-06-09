# AjoGuard Frontend

> Collector dashboard for the AjoGuard savings group management system

A web dashboard built with SvelteKit 5 that connects to the AjoGuard backend API. Collectors use this interface to manage their savings group, record contributions, view financial reports, and download verifiable export documents.

---

## What it does

AjoGuard is a trust layer for informal Nigerian savings groups (Ajo/Esusu). This frontend gives collectors a clean interface to:

- Register and set up their savings group
- Log in securely using email OTP — no password required
- Record member contributions through a web form
- View contribution history and group balance
- Monitor group health and payment compliance
- Verify the tamper-evident audit chain
- Download group and member reports as JSON, PDF, or CSV

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **SvelteKit 5** | Frontend framework with file-based routing |
| **Svelte 5 Runes** | Reactive state (`$state`, `$derived`, `$effect`) |
| **TypeScript** | Type safety across all components and API calls |
| **Tailwind CSS** | Utility-first styling via Vite plugin |
| **Google Fonts** | Syne (headings), DM Sans (body), DM Mono (labels) |

---

## Prerequisites

- Node.js v20+
- The AjoGuard backend running at `http://localhost:3000`
- npm

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/ajoguard-frontend.git
cd ajoguard-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser at `http://localhost:5173`.

Make sure the AjoGuard backend is running at `http://localhost:3000` before using the app.

---

## Environment

The backend API base URL is configured directly in `src/lib/api.ts`:

```typescript
const BASE_URL = 'http://localhost:3000';
```

Change this value when deploying to production.

---

## Project Structure

```
AjoGuard-frontend
├─ .npmrc
├─ .prettierignore
├─ .prettierrc
├─ eslint.config.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ src
│  ├─ app.css
│  ├─ app.d.ts
│  ├─ app.html
│  ├─ lib
│  │  ├─ api.ts
│  │  ├─ assets
│  │  │  └─ favicon.svg
│  │  ├─ auth.ts
│  │  ├─ components
│  │  │  ├─ Avatar.svelte
│  │  │  ├─ Badge.svelte
│  │  │  ├─ EmptyState.svelte
│  │  │  ├─ Modal.svelte
│  │  │  └─ Toast.svelte
│  │  ├─ index.ts
│  │  ├─ nav.ts
│  │  ├─ stores
│  │  │  └─ toast.store.ts
│  │  └─ utils.ts
│  └─ routes
│     ├─ (dashboard)
│     │  ├─ +layout.svelte
│     │  ├─ +layout.ts
│     │  ├─ +page.svelte
│     │  ├─ audit
│     │  │  └─ +page.svelte
│     │  ├─ contribute
│     │  │  └─ +page.svelte
│     │  ├─ contributions
│     │  │  └─ +page.svelte
│     │  ├─ export
│     │  │  └─ +page.svelte
│     │  ├─ layout.txt
│     │  ├─ members
│     │  │  └─ +page.svelte
│     │  └─ reconciliation
│     │     └─ +page.svelte
│     ├─ +error.svelte
│     ├─ +layout.svelte
│     ├─ login
│     │  ├─ +page.svelte
│     │  └─ +page.ts
│     └─ register
│        ├─ +page.svelte
│        └─ +page.ts
├─ static
│  ├─ apple-touch-icon.png
│  ├─ favicon-32x32.png
│  ├─ favicon-512x512.png
│  └─ robots.txt
├─ svelte.config.js
├─ tsconfig.json
└─ vite.config.ts

```

---

## Pages

### `/login` — Login
Two-step OTP authentication:
1. Collector enters their email address
2. A 6-digit code is sent to that email
3. Collector enters the code and receives a JWT access token
4. Token is stored in localStorage and used on every subsequent request

Features individual digit input boxes with auto-focus, auto-submit on completion, paste support, and a 60-second resend cooldown.

### `/register` — Register
Two-step registration for new collectors:
1. Personal details — name, email, optional phone number
2. Group setup — group name, contribution amount, cycle interval (weekly/monthly)

Creates both the collector account and their savings group in a single API call.

### `/` — Dashboard
Overview of the savings group showing:
- Four stat cards: total collected, current balance, active members, total contributions
- Recent contributions table (last 8)
- Member overview with individual totals
- Group health progress bar with payment compliance percentage

### `/members` — Members
Full member list with add and deactivate functionality. The add member modal collects name, phone, email, role, and payout order. Collectors can only add members to their own group.

### `/contribute` — Log Contribution
Web form channel for recording payments. Loads active regular members in a dropdown, pre-fills the cycle amount, and lets the collector select the input channel (Web, SMS, WhatsApp). Recent activity panel shows contributions logged in the current session.

### `/contributions` — Contributions
Full contribution history with status and channel filters. Member names are resolved from a pre-built lookup map for performance. Supports manual refresh.

### `/reconciliation` — Reconciliation
Group financial health overview showing expected vs collected totals, compliance rate, and a progress bar. Missing members are highlighted with a warning alert. Member payment status table shows who has paid, who is missing, and payout rotation order.

### `/audit` — Audit Trail
Hash chain integrity verification and full audit history. The verify button runs a fresh cryptographic check across all entries. The chain visual shows each entry linked to the next with hash values and event details.

### `/export` — Export Reports
One-click downloads for group reports (JSON, PDF, CSV) and individual member reports. All exports include an embedded audit integrity proof. Member reports are designed for loan applications.

---

## Authentication Flow

```
Register → creates collector + group in database
         ↓
Login Step 1 → POST /auth/request-otp with email
         ↓
Login Step 2 → POST /auth/verify-otp with email + OTP
         ↓
Receive JWT access token (valid 8 hours)
         ↓
Store token + collector in localStorage
         ↓
All protected API calls include Authorization: Bearer <token>
         ↓
On 401 response → clear localStorage → redirect to /login
         ↓
On logout → clear localStorage → redirect to /login
```

---

## API Integration

All backend communication goes through `src/lib/api.ts`. The `request()` function handles:

- Automatic `Authorization: Bearer <token>` header injection
- JSON parsing and error extraction
- 401 detection with automatic logout and redirect
- TypeScript generics for typed responses

The `download()` function handles file exports by fetching a blob, creating a temporary object URL, and triggering a browser download.

```typescript
// Example usage in a page
import { groups, members, contributions } from '$lib/api';

const summary = await groups.summary(collector.groupId);
const memberList = await members.byGroup(collector.groupId);
await exports.groupPdf(collector.groupId); // triggers file download
```

---

## State Management

**Auth state** — managed in `src/lib/auth.ts` using localStorage. Helper functions abstract all localStorage access so they can be swapped for another storage mechanism without touching any pages.

**Toast notifications** — managed in `src/lib/stores/toast.store.ts` using a plain subscriber pattern. Any page or component calls `addToast()` to show a notification. The `Toast.svelte` component subscribes and displays them.

**Page state** — managed locally in each page using Svelte 5 `$state` runes. No global state store is needed beyond auth and toasts.

---

## Responsive Design

The layout adapts between mobile and desktop:

```
Desktop (lg+):  Fixed sidebar always visible, content beside it
Mobile:         Sidebar hidden behind hamburger menu
                Tap hamburger to open sidebar as overlay
                Tap nav item or backdrop to close sidebar
```

Grid layouts collapse from multi-column to single column on mobile. Tables become horizontally scrollable with a minimum width to preserve readability.

---

## Design System

Colors are defined as CSS variables in `src/app.css` and used throughout:

```css
--ink:        #0a0a0f   /* Dark backgrounds */
--accent:     #c8f03c   /* Lime green — primary accent */
--accent-2:   #3cf0a0   /* Mint — secondary accent */
--accent-3:   #f0a03c   /* Amber — warning */
--danger:     #f03c3c   /* Red — errors */
--surface:    #f4f3ef   /* Main page background */
--text-muted: #7a7a96   /* Secondary text */
```

Typography uses three Google Fonts:
- **Syne** — headings and display text (weights 700, 800)
- **DM Sans** — body text and UI copy (weights 300, 400, 500)
- **DM Mono** — labels, table headers, reference IDs, amounts

---

## Building for Production

```bash
npm run build
npm run preview
```

Update `BASE_URL` in `src/lib/api.ts` to point to your production backend before building.

---

## Related

- [AjoGuard Backend](../ajoguard-backend) — NestJS API, PostgreSQL, Redis, BullMQ
