<div align="center">

# 🌸 HaNA — Social Companionship Marketplace & Companion Operating System

<p align="center">
  <strong>Curated Platonic Connections • Real-Time Hospitality • Autonomous Companion OS • Guardian Safety Shield</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://orm.drizzle.team"><img src="https://img.shields.io/badge/Drizzle_ORM-0.44-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Realtime_%26_Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="https://upstash.com"><img src="https://img.shields.io/badge/Upstash_Redis-Rate_Limit_%26_Presence-00E699?style=for-the-badge&logo=redis&logoColor=white" alt="Upstash Redis" /></a>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Playfair+Display&weight=600&size=22&duration=3000&pause=1000&color=E84A7F&center=true&vCenter=true&width=750&lines=Discover+people+worth+knowing.;Warm%2C+verified+social+companionship.;Real-time+chat%2C+synced+sessions+%26+live+extensions.;Built+with+Next.js+16%2C+Drizzle+ORM+%26+Supabase." alt="HaNA Typing Tagline" />
</p>

---

<p align="center">
  <a href="#-project-overview">Overview</a> •
  <a href="#-visual-showcase--ui-gallery">UI Showcase</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-end-to-end-user-flows--state-machines">User Flows</a> •
  <a href="#-ml-recommendation-engine">ML Engine</a> •
  <a href="#%EF%B8%8F-guardian-safety--emergency-protocol">Guardian Safety</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-database-schema--data-model">Database Schema</a> •
  <a href="#-project-directory-tree">Directory Tree</a> •
  <a href="#-environment-variables">Environment</a> •
  <a href="#-quickstart--local-development">Quickstart</a> •
  <a href="#-production-deployment">Deployment</a>
</p>

---

</div>

<br />

## 🌟 Project Overview

**HaNA** is a full-stack, two-sided social companionship marketplace designed to eliminate isolation, curate meaningful platonic memories, and empower freelance social guides. Inspired by Tokyo's premium companionship culture and engineered with the trust infrastructure of **Airbnb**, the effortless discovery of modern social apps, and the disciplined security of modern fintech.

### 🎯 The Core Philosophy: "Two Products, One Soul"

| Persona | Platform Experience | Mental Model | Core Mission |
| :--- | :--- | :--- | :--- |
| **Client / Customer** | **Social Lifestyle Discovery App** | *Airbnb Guest / Curated Social Club* | Discover verified companions for coffee, art walks, food tours, or events with transparent pricing and zero ambiguity about boundaries. |
| **Companion / Guide** | **Business Management OS** | *Airbnb Host / Executive Studio* | Manage availability, evaluate booking requests, track real-time earnings, handle session extensions, and operate under emergency safety shields. |
| **Safety Administrator** | **Guardian Control Center** | *Trust & Safety Incident Response* | Monitor automated codeword panic triggers, decrypt high-risk evidence logs, and enforce strict community age/trust policies. |

---

## 📸 Visual Showcase & UI Gallery

Experience the thoughtful aesthetics of HaNA: soft creams, blush tones (`#E8A598`), deep charcoal typography (`Playfair Display` + `DM Sans`), and zero corporate bloat.

### 1. Desktop Experience & Lifestyle Discovery Hero
<div align="center">
  <img src="docs/screenshots/desktop-home-hero.png" alt="HaNA Desktop Home & Hero Banner" width="100%" />
  <p><em>Curated hero banner, activity filter pills (Coffee, Creative, City Walk, Foodie, Bookworm), personalized recommendation feed, and sticky navigation.</em></p>
</div>

<br />

### 2. Mobile Experience: Discovery, Companion Profile & Real-Time Chat

<table align="center" width="100%">
  <tr>
    <th width="33%" align="center">✨ Discover Companions</th>
    <th width="33%" align="center">👤 Verified Companion Profile</th>
    <th width="33%" align="center">💬 Live Real-Time Chat</th>
  </tr>
  <tr>
    <td align="center" valign="top">
      <img src="docs/screenshots/discover-cards.png" alt="Discover People & New Faces" width="100%" />
      <br />
      <sub><b>Nearby Discovery Stack</b><br />Distance radar, tags, rating breakdown & instant booking triggers.</sub>
    </td>
    <td align="center" valign="top">
      <img src="docs/screenshots/companion-profile.png" alt="Companion Profile Details" width="100%" />
      <br />
      <sub><b>Curated Profile & Rates</b><br />Rich bios, photo gallery, vetted interest pills & transparent hourly menus.</sub>
    </td>
    <td align="center" valign="top">
      <img src="docs/screenshots/realtime-chat.png" alt="Realtime Messaging" width="100%" />
      <br />
      <sub><b>Realtime WebSocket Chat</b><br />Online badges, typing indicator dots, emoji reactions & session coordination.</sub>
    </td>
  </tr>
</table>

<br />

### 3. The 3-Step Seamless Booking Journey

<div align="center">
  <img src="docs/screenshots/booking-flow-steps.png" alt="3-Step Booking Journey" width="100%" />
  <p><em>Step 1: Choose Experience Menu & Add Notes &bull; Step 2: Live Calendar & Time Slot Picker &bull; Step 3: Transparent Summary & Payment Confirmation</em></p>
</div>

<table align="center" width="100%">
  <tr>
    <th width="50%" align="center">📅 Interactive Date, Slot & Duration Engine</th>
    <th width="50%" align="center">🛡️ Active In-Session & Extension Management</th>
  </tr>
  <tr>
    <td align="center" valign="top">
      <img src="docs/screenshots/booking-datetime.png" alt="Booking DateTime & Duration Selection" width="85%" />
      <br />
      <sub>Dynamic slot availability validation with real-time subtotal computation.</sub>
    </td>
    <td align="left" valign="middle">
      <h4>⚡ Operational Highlights in Session</h4>
      <ul>
        <li><b>Meeting Code Handshake:</b> A 4-digit mutual verification code guarantees physical identity validation at meeting start.</li>
        <li><b>Synchronized In-Session Timer:</b> Real-time timer counts elapsed vs booked time across both client and companion devices.</li>
        <li><b>Live Session Extensions:</b> Companion or client can trigger 30m / 60m extensions with immediate approval and differential billing.</li>
        <li><b>Automatic Booking Expiration:</b> Unaccepted requests expire cleanly after configurable countdown windows via background cron.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏗️ System Architecture

HaNA is constructed as a modern, high-concurrency cloud native application leveraging Next.js App Router for server-rendered speed, Drizzle ORM for type-safe database queries, Supabase for WebSocket pub/sub and storage, and Upstash Redis for presence heartbeats and rate limiting.

### 🌐 High-Level Architecture Diagram

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  CLIENT APPLICATIONS                   │
                                  │  Next.js 16 (App Router) • React 19 • Tailwind CSS v4  │
                                  │   Zustand Store • TanStack Query • Framer Motion 12    │
                                  └───────────────▲────────────────────────▲───────────────┘
                                                  │                        │
                             HTTP / Server Actions│                        │Supabase Realtime (WSS)
                                                  │                        │
                                  ┌───────────────▼────────────────────────┴───────────────┐
                                  │                 NEXT.JS BACKEND ENGINE                 │
                                  │  • Auth.js v5 (Google OAuth & JWT Sessions)            │
                                  │  • Server Actions (Bookings, Companions, Users)        │
                                  │  • Age Verification Engine (>= 18 Policy Constraint)   │
                                  │  • Guardian Emergency Trigger & Codeword Evaluator     │
                                  └───────────────┬────────────────────────┬───────────────┘
                                                  │                        │
                           Drizzle ORM (Postgres) │                        │REST API / Pipelines
                                                  │                        │
                  ┌───────────────────────────────▼────────┐      ┌────────▼───────────────────────┐
                  │       SUPABASE POSTGRESQL DB           │      │         UPSTASH REDIS          │
                  │  • Users, Companions, Bookings         │      │  • Online Presence (30s TTL)   │
                  │  • Evidence Logs & Encrypted Location  │      │  • Rate Limiting Protection    │
                  │  • Row-Level Security (RLS) Policies   │      │  • Session & Search Cache      │
                  └───────────────▲────────────────────────┘      └────────────────────────────────┘
                                  │
                 ┌────────────────┴────────────────────────┐
                 │             AUXILIARY MICROSERVICES     │
                 │  • Python SVD Recommendation Engine     │
                 │  • Resend Transactional Email Delivery  │
                 │  • Vercel Edge Cron Booking Expirer     │
                 └─────────────────────────────────────────┘
```

### 🧬 Mermaid Architectural Interaction Map

```mermaid
graph TD
    subgraph ClientLayer["🖥️ Frontend Client Layer"]
        C_Web["Client Web / Mobile Viewport"]
        C_Store["Zustand State & Auth Context"]
        C_Realtime["Supabase Realtime Client"]
    end

    subgraph ServerLayer["⚙️ Next.js 16 Application Server"]
        AuthRoute["Auth.js v5 (OAuth & JWT Session)"]
        ServerActions["Server Actions (/app/actions/*)"]
        GuardEngine["Guardian Safety & Codeword Shield"]
        CronExp["Cron Worker: Expire Bookings"]
    end

    subgraph DataLayer["🗄️ Persistence & State Layer"]
        Drizzle["Drizzle ORM Engine"]
        Postgres["Supabase PostgreSQL (Tables & Enums)"]
        Redis["Upstash Redis (Presence & Rate Limits)"]
    end

    subgraph AILayer["🤖 Intelligence & Notifications"]
        PythonML["Python SVD Matrix Recommendation Engine"]
        ResendMail["Resend Email Dispatcher"]
    end

    C_Web -->|Server Actions| ServerActions
    C_Web -->|OAuth Login| AuthRoute
    C_Realtime <-->|WebSocket Pub/Sub| Postgres
    ServerActions --> Drizzle
    Drizzle --> Postgres
    ServerActions --> Redis
    GuardEngine -->|AES-256 Encrypted Evidence| Postgres
    CronExp --> Drizzle
    PythonML -->|SVD Recommendations Matrix| ServerActions
    ServerActions --> ResendMail
```

---

## 🔄 End-to-End User Flows & State Machines

### 1. Booking Lifecycle State Machine

Every booking transitions through deterministic states enforcing financial clarity, physical safety, and mutual consent:

```mermaid
stateDiagram-v2
    [*] --> PENDING_ACCEPTANCE: Client Submits Booking Request
    
    PENDING_ACCEPTANCE --> REJECTED: Companion Declines Request
    PENDING_ACCEPTANCE --> EXPIRED: 24h Auto-Expiration (Cron)
    PENDING_ACCEPTANCE --> AWAITING_PAYMENT: Companion Accepts Request
    
    AWAITING_PAYMENT --> CANCELLED: Client Cancels
    AWAITING_PAYMENT --> CONFIRMED: Payment / Authorization Completed
    
    CONFIRMED --> IN_PROGRESS: Meeting Code Verified On-Site
    CONFIRMED --> CANCELLED: Cancellation (Strict Policy Window)
    
    IN_PROGRESS --> COMPLETED: Synced Timer Concludes & Confirmed
    IN_PROGRESS --> IN_PROGRESS: Extension Requested & Approved
    
    COMPLETED --> [*]: Reviews & Trust Scores Updated
    REJECTED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]
```

### 2. In-Session Meeting Verification & Live Extension Flow

```
Client App                                                    Companion App
    │                                                               │
    ├───────── Displays Unique 4-Digit Meeting Code ───────────────►│
    │                                                               │
    │                                              [Inputs Code in Companion App]
    │                                                               │
    │◄────── Handshake Confirmed: Status -> IN_PROGRESS ────────────┤
    │                                                               │
    ├───────── [Synced Session Timer Active on Both Screens] ───────┤
    │                                                               │
    │─── Tap: "Request +30 Mins Extension" ────────────────────────►│
    │                                                               │
    │                                             [Review Rate & Time Extension]
    │                                             [Companion Accepts Extension]
    │◄──────── Extension Approved (Status: PAID/CONFIRMED) ─────────┤
    │                                                               │
    ├───────── [Timer Dynamically Increments Duration] ─────────────┤
    │                                                               │
    └───────── Session Concludes -> Review & Rating Prompt ─────────┘
```

---

## 🤖 ML Recommendation Engine

HaNA features a dedicated collaborative filtering recommendation pipeline powered by Python, SciPy, and NumPy (`/ml/recommend.py`).

```
                    ┌──────────────────────────────────────────┐
                    │  Client Interactions Endpoint            │
                    │  /api/ml/interactions (Weighted Signals) │
                    └─────────────────────┬────────────────────┘
                                          │
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │  Build Sparse User-Item Interaction Matrix│
                    │  Rows: User IDs | Columns: Companion IDs │
                    └─────────────────────┬────────────────────┘
                                          │
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │  Singular Value Decomposition (SVD)      │
                    │  scipy.sparse.linalg.svds (k=5 factors)  │
                    └─────────────────────┬────────────────────┘
                                          │
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │  Predicted Rating Matrix Reconstruction  │
                    │  R_pred = U_k × Σ_k × V_k^T              │
                    └─────────────────────┬────────────────────┘
                                          │
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │  Cosine Similarity + Cold-Start Blending │
                    │  Push to /api/ml/recommendations         │
                    └──────────────────────────────────────────┘
```

- **Behavioral Signal Weighting:** Views (1x), Profile Dwells (2x), Saved Favorites (5x), Completed Bookings (10x), 5-Star Reviews (15x).
- **Matrix Factorization:** Resolves latent taste affinities (e.g. cultural deep-dives vs casual coffee dates).
- **Graceful Fallback:** Cold-start users automatically receive high-trust, top-rated companions in their geographical area.

---

## 🛡️ Guardian Safety & Emergency Protocol

Safety is not an afterthought in HaNA; it is mathematically and architecturally enforced from Day 0.

```
       Companion in Distress               In-Chat Trigger / Panic Button
                 │                                        │
                 ▼                                        ▼
      [Speaks / Sends Secret Codeword]        [Discrete 3-Tap SOS Gesture]
                 │                                        │
                 └──────────────────┬─────────────────────┘
                                    │
                                    ▼
                 ┌────────────────────────────────────────┐
                 │  Real-Time Hash & Fingerprint Engine   │
                 │  HMAC-SHA256 & Bcrypt Verification     │
                 └──────────────────┬─────────────────────┘
                                    │ (Match Confirmed)
                                    ▼
                 ┌────────────────────────────────────────┐
                 │       GUARDIAN LOCKDOWN SEQUENCE       │
                 │  1. GPS Location Encrypted (AES-256)   │
                 │  2. Silent Snapshot of Chat Transcript │
                 │  3. Stored in Tamper-Proof EvidenceLog │
                 │  4. Priority Incident Created in Admin │
                 │  5. Instant Alert Dispatched to Team   │
                 └──────────────────┬─────────────────────┘
                                    │
                                    ▼
                 ┌────────────────────────────────────────┐
                 │   /admin/alerts (Admin Safety Deck)    │
                 │   • Decrypt Location on Authenticated  │
                 │   • Rapid Emergency Services Dispatch  │
                 └────────────────────────────────────────┘
```

- **Codeword Security:** Companions set a private emergency word. Words are validated against a blocklist, hashed with bcrypt (salt 12), and cached in Redis with strict rate limiting.
- **AES-256 Encryption:** Live device coordinates are encrypted before entering the database via `lib/encrypt.js`.
- **Adult Eligibility Constraint:** Hard SQL check constraint (`users_age_adult_check`) prevents underage registration across the platform.

---

## 🛠️ Tech Stack

### Frontend & Client Tier
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.2.6` | App Router, Server Actions, Server-Side Rendering (SSR), API routes |
| **React** | `19.2.4` | Server Components, Concurrent Features, Modern hooks |
| **Tailwind CSS** | `v4.0` | Next-gen CSS-first styling engine with native token support |
| **Framer Motion** | `^12.40.0` | Fluid card transitions, swipe physics, modal sheets, micro-interactions |
| **Lucide React** | `^1.17.0` | Clean, accessible SVG iconography |
| **Zustand** | `^5.0.14` | Minimalist client-side UI and session stores |
| **TanStack Query** | `^5.100.14`| Asynchronous server state caching and optimistic updates |
| **Lenis** | `1.3.25` | Silky-smooth inertial scrolling experience |

### Backend, Database & Infrastructure
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **PostgreSQL** | `v15+` | Relational storage hosted on Supabase Cloud |
| **Drizzle ORM** | `^0.44.0` | High-performance, type-safe SQL query generation and schema migrations |
| **Drizzle Kit** | `^0.31.0` | Database schema diffing, migrations, and Drizzle Studio GUI |
| **Supabase Realtime**| `^2.106.2` | WebSocket channel subscriptions for instant messaging & notifications |
| **Upstash Redis** | `^1.38.0` | Low-latency presence heartbeats (30s TTL), user session caching |
| **Upstash Ratelimit**| `^2.0.8` | Token-bucket sliding window rate limiting for public endpoints |
| **Auth.js / NextAuth**| `5.0-beta` | OAuth 2.0 (Google), JWT cookie sessions, session verification |
| **Bcryptjs & Jose** | Latest | Password hashing, HMAC generation, and JWT token crypto |
| **Resend** | `^6.12.4` | Transactional email delivery for bookings and safety notifications |
| **Zod** | `^4.4.3` | Runtime type validation for input contracts and server actions |

### Machine Learning Tier
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Python** | `3.10+` | Machine learning runtime environment |
| **NumPy & Pandas** | Latest | Data manipulation, sparse matrix construction |
| **SciPy** | Latest | Sparse SVD matrix factorization (`scipy.sparse.linalg.svds`) |
| **Requests** | Latest | Secure authenticated REST data exchange with Next.js ML API |

---

## 🗄️ Database Schema & Data Model

The database is defined declaratively using **Drizzle ORM** (`db/schema.js`):

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│              users              │ 1       1 │           companions            │
├─────────────────────────────────┤───────────├─────────────────────────────────┤
│ id (PK, CUID)                   │           │ id (PK, CUID)                   │
│ email (Unique)                  │           │ userId (FK -> users.id)         │
│ name, image, banner, password   │           │ displayName, age, city, bio     │
│ role (CLIENT/COMPANION/ADMIN)   │           │ hourlyRate, minimumHours        │
│ age (CHECK: age >= 18)          │           │ tags, languages, photos         │
│ trustScore, cancellationCount   │           │ averageRating, totalReviews     │
│ onboarded (Boolean)             │           │ isFeatured, verificationStatus  │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │ 1                                           │ 1
                 │                                             │
                 │ N                                           │ N
┌────────────────▼────────────────┐           ┌────────────────▼────────────────┐
│            bookings             │           │          experiences            │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ id (PK)                         │           │ id (PK)                         │
│ clientId (FK -> users.id)       │           │ companionId (FK -> companions)  │
│ companionId (FK -> companions)  │           │ name, emoji, description        │
│ date, startTime, endTime        │           └─────────────────────────────────┘
│ durationHours, activityType     │
│ hourlyRate, subtotal, total     │           ┌─────────────────────────────────┐
│ status (BookingStatus Enum)     │           │         code_words (SOS)        │
│ meetingCode (4 digits)          │           ├─────────────────────────────────┤
└────────────────┬────────────────┘           │ id (PK)                         │
                 │ 1                          │ companionId (FK -> users.id)    │
                 │                            │ wordHash, wordFingerprint       │
                 │ N                          └─────────────────────────────────┘
┌────────────────▼────────────────┐
│       booking_extensions        │           ┌─────────────────────────────────┐
│ status, addedMinutes, amount    │           │          evidence_log           │
└─────────────────────────────────┘           ├─────────────────────────────────┤
                                              │ id (PK), bookingId, companionId │
┌─────────────────────────────────┐           │ triggerType, locationEncrypted  │
│     conversations / messages    │           │ adminReviewed (Boolean)         │
├─────────────────────────────────┤           └─────────────────────────────────┘
│ senderId, content, reaction     │
│ type (TEXT/IMAGE/SYSTEM), isRead│
└─────────────────────────────────┘
```

---

## 📂 Project Directory Tree

```
HaNA-FullStack/
├── PRODUCT.md                    # Product specification & brand manifesto
├── docs/                         # Project documentation & visual assets
│   └── screenshots/              # High-resolution production app screenshots
│       ├── desktop-home-hero.png
│       ├── discover-cards.png
│       ├── companion-profile.png
│       ├── booking-datetime.png
│       ├── booking-flow-steps.png
│       └── realtime-chat.png
├── files/                        # Planning, TRD, PRD & Architecture manifests
│   ├── 01-PRD.md                 # Product Requirements Document
│   ├── 02-TRD.md                 # Technical Requirements Document
│   ├── 03-AppFlow.md             # Complete Screen Flow & Navigation Trees
│   ├── 04-UIUXBrief.md           # Design Tokens, Palettes & Typography Specs
│   ├── 05-BackendSchema.md       # Database Schema Specifications & RLS
│   └── 06-ImplementationPlan.md  # Engineering Roadmap & Milestones
└── hana/                         # Primary Next.js Full-Stack Application
    ├── app/                      # Next.js App Router
    │   ├── (auth)/               # Login, Register & Onboarding Flows
    │   ├── (client)/             # Client Experience: Home, Discover, Bookings, Messages, Profile
    │   ├── companion/            # Companion Experience: Studio, Calendar, Earnings, Profile
    │   ├── admin/                # Guardian Safety & Incident Response Center
    │   ├── actions/              # Secure Next.js Server Actions (Bookings, Companions, SOS)
    │   ├── api/                  # REST Endpoints: Auth, ML Pipeline, Presence, Crons
    │   ├── globals.css           # Tailwind v4 Global Styles & Design Tokens
    │   └── providers.js          # React Query, Session & Toast Providers
    ├── components/               # Modular UI Components
    │   ├── auth/                 # AuthGuard, OAuth Handlers & Role Selectors
    │   ├── booking/              # MeetingCodeCard, SyncedSessionTimer, ExtensionSheets
    │   ├── companion/            # CompanionCards, SwiperStrips, FilterSheets
    │   ├── layout/               # Dynamic TopNav, BottomNav & CompanionSidebar
    │   ├── recommendations/      # PersonalizedCompanionsSection
    │   ├── safety/               # GuardianSettingsCard & SOS Trigger Controls
    │   └── ui/                   # Reusable Primitive Components
    ├── db/                       # Drizzle ORM Database Tier
    │   ├── schema.js             # Declarative PostgreSQL Database Schema
    │   ├── index.js              # Connection Pooler & Drizzle Instance
    │   ├── seed.js               # Primary Database Seeder (Users, Companions, Reviews)
    │   └── migrations/           # SQL Migration Scripts & RLS Rules
    ├── lib/                      # Core Utilities & Service Integrations
    │   ├── auth.js               # NextAuth v5 Configurations & Callbacks
    │   ├── encrypt.js            # AES-256 Symmetric Encryption Engine
    │   ├── age-policy.js         # Regulatory Age Verification Validation
    │   ├── upstash.js            # Redis Cache & Sliding Window Rate Limiter
    │   └── supabase.js           # Supabase Client & Realtime WebSocket Config
    ├── ml/                       # Machine Learning Recommendation Engine
    │   ├── recommend.py          # Python SVD Matrix Factorization Script
    │   └── requirements.txt      # Python Dependencies (NumPy, SciPy, Pandas)
    ├── package.json              # Project Scripts & Node Dependencies
    └── drizzle.config.js         # Drizzle Kit Configuration
```

---

## 🔐 Environment Variables

Create a `.env` file in the `hana/` directory based on `.env.example`:

```bash
# ─────────────────────────────────────────────────────────────
# 1. DATABASE (Supabase PostgreSQL Connection Strings)
# ─────────────────────────────────────────────────────────────
# Serverless / Runtime Pooler (Transaction mode, port 6543)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
# Direct / Migration Pooler (Session mode, port 5432)
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# ─────────────────────────────────────────────────────────────
# 2. AUTHENTICATION (Auth.js v5)
# ─────────────────────────────────────────────────────────────
AUTH_URL="http://localhost:3000"
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-32-byte-base64-secret"
AUTH_TRUST_HOST=true

# Google OAuth Provider (Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ─────────────────────────────────────────────────────────────
# 3. SUPABASE (Storage & Realtime WebSocket Engine)
# ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-admin-key"

# ─────────────────────────────────────────────────────────────
# 4. UPSTASH REDIS (Presence & Rate Limiting)
# ─────────────────────────────────────────────────────────────
UPSTASH_REDIS_REST_URL="https://[YOUR-ENDPOINT].upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# ─────────────────────────────────────────────────────────────
# 5. ML RECOMMENDATION SERVICE
# ─────────────────────────────────────────────────────────────
APP_URL="http://localhost:3000"
ML_API_SECRET="replace-with-a-long-random-secret"
RECOMMENDATION_MODEL_VERSION="v1"

# ─────────────────────────────────────────────────────────────
# 6. TRANSACTIONAL EMAIL (Resend)
# ─────────────────────────────────────────────────────────────
RESEND_API_KEY="re_123456789"
RESEND_FROM_EMAIL="noreply@hana.app"

# ─────────────────────────────────────────────────────────────
# 7. GUARDIAN SAFETY & EMERGENCY ENCRYPTION
# ─────────────────────────────────────────────────────────────
# Generate 32-char key: node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
ENCRYPTION_KEY="your-32-character-encryption-key"
ADMIN_EMAIL="safety@hana.app"
```

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- **Python**: `3.10+` (optional, for ML model training)
- **PostgreSQL**: Local instance or Supabase account

### 2. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/xsid-69/HANA.git
cd HANA/hana

# Install dependencies
npm install

# Configure environment keys
cp .env.example .env
# (Populate your credentials in .env)
```

### 3. Database Migration & Seeding

```bash
# Push schema directly to your Supabase PostgreSQL instance
npm run db:push

# Seed initial users, verified companions, reviews, and test bookings
npm run db:seed

# Optional: Seed additional companion profiles and histories
npm run db:seed:companions
npm run db:seed:history

# Optional: Launch visual database inspector
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the ML Recommendation Worker (Optional)

```bash
cd ml
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python recommend.py
```

---

## 🚢 Production Deployment

### 1. Deploying on Vercel
1. Import the repository into your **Vercel Dashboard**.
2. Set Root Directory to `hana`.
3. Add all environment variables from `.env` in the Vercel Project Settings.
4. Set Build Command to: `npm run build` and Output Directory to `.next`.
5. Deploy!

### 2. Scheduled Cron Jobs
HaNA includes automated background maintenance routes configured in `app/api/cron/`:
- `GET /api/cron/expire-bookings`: Automatically marks stale pending bookings as `EXPIRED` and refunds deposits.
Configure this route in `vercel.json` or your external cron dispatcher to run hourly.

### 3. Verification & Health Check Checklist
- [x] Database connection pooling operational via Supabase IPv4 transaction pooler.
- [x] Upstash Redis responding with valid ping for online status heartbeats.
- [x] Google OAuth redirect URLs authorized for production domain (`https://your-domain.com/api/auth/callback/google`).
- [x] Supabase Storage buckets (`profile-images`, `companion-photos`) set to Public Read.

---

## 🛡️ Trust, Privacy & Community Standards

HaNA strictly upholds:
1. **Platonic Guarantee:** Strictly enforced non-sexual, platonic social experiences.
2. **Adult Verification:** Rigorous verification preventing participation by minors (< 18).
3. **Data Protection:** Zero selling of behavioral telemetry; encrypted location logging.
4. **Transparent Boundaries:** Mutual codes of conduct agreed upon prior to booking confirmation.

---

<div align="center">

### 🌸 HaNA — Connecting Humans in an Isolated World

<sub>Crafted with passion, modern engineering, and uncompromising care.</sub>

<br />

<p align="center">
  <a href="#-ha-na--social-companionship-marketplace--companion-operating-system">Back to Top ↑</a>
</p>

</div>
