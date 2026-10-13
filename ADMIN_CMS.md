# TechQuo News — Administrative Content Management System (CMS) & Backend

Complete, production-ready Full-Stack Administrative Content Management System (CMS), Node.js API, MongoDB database models, and Cloudinary media pipeline for **TechQuo News**.

---

## 🏗️ Architecture Overview

The TechQuo News platform comprises three unified tiers:

1. **Admin Portal Frontend (`admin/`)**:
   - Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Lucide React**, **Recharts**, and **Axios**.
   - Faithful recreation of the TechQuo News split-screen authentication and black-sidebar editorial administrative dashboard.
   - Comprehensive CRUD workstations for stories, categories, authors, Cloudinary media assets, comments moderation, and team access roles.

2. **Backend API (`backend/`)**:
   - Built with **Node.js**, **Express**, **TypeScript**, **Mongoose** (MongoDB), **Cloudinary SDK**, **Multer**, **JWT**, **Bcrypt.js**, and **Zod**.
   - Hardened security with Helmet, rate limiting, audit logging, role-based authorization, and short-lived HTTP-only cookies.
   - Background scheduler powered by `node-cron` for automated publishing of scheduled articles.

3. **Public Mobile App (`src/`)**:
   - Native mobile application built with **Expo SDK 57**, **React Native**, and **Expo Router**.
   - Editorial serif aesthetics, offline bookmarks, typography scale controls, and reading history.

---

## 🔐 Default Administrator Credentials

Upon first startup, the database auto-initializes the Super Administrator account:

| Field | Value |
| :--- | :--- |
| **Email** | `admin@techquo.news` |
| **Password** | `AdminPass123!` |
| **Role** | `super_admin` |

*(Can also be initialized explicitly via `npm run backend:init-admin`)*

---

## 🚀 Quick Start Guide

### 1. Start the Backend API

```bash
# From repository root
npm run backend:dev

# Or inside backend/
cd backend
npm run dev
```

*The API server will listen on `http://localhost:5000`.*
- Seed initial editorial data: `npm run backend:seed`
- Run test suite: `npm run backend:test` (11/11 tests passing)
- Build TypeScript bundle: `npm run backend:build`

### 2. Start the Admin CMS Frontend

```bash
# From repository root
npm run admin:dev

# Or inside admin/
cd admin
npm run dev
```

*The Admin Portal will launch on `http://localhost:5173`.*
- Automatically proxies `/api` requests to `http://localhost:5000`.
- Production build: `npm run admin:build` (compiled into `admin/dist`).

### 3. Start the Mobile Application

```bash
npm start
```

---

## 🎨 Design System & Branding

- **Background Surfaces**: Pure white `#FFFFFF` cards on `#F5F6F7` soft canvas.
- **Sidebar & Primary Actions**: Deep obsidian `#050505` and `#111111`.
- **Typography**: Editorial serif headings (*Playfair Display*) paired with modern sans-serif body (*Inter*).
- **Subtle Accent**: Brand blue `#2563EB` used sparingly for wordmark dots and active signals.
- **Status Indicators**: Soft emerald for published/active, amber for drafts/pending, blue for scheduled, and rose for flagged/inactive.

---

## 🛠️ Modules & Features Implemented

### 1. Admin Authentication (`admin/src/pages/LoginPage.tsx`)
- Desktop split-screen layout:
  - Left hero with editorial manifesto: *"The power to inform Africa's tech future"*, subtitle, and three value propositions (*Create & Publish*, *Track Performance*, *Manage Content*).
  - Right floating card with email, password show/hide toggle, remember me checkbox, validation feedback, and credential prefill button.
- JWT session management with localStorage sync and 401 interceptor redirection.

### 2. Dashboard (`admin/src/pages/DashboardPage.tsx`)
- 4 real-time KPI cards: Total Articles, Unique Views, Comments with pending moderation count, and Active Authors.
- Responsive **Views Over Time** area chart with gradient fills.
- **Content Overview** interactive donut chart displaying story distribution across tech verticals.
- Recent Articles table with quick edit links, views count, and publication badges.
- Live **Audit Activity Feed** tracking team publication milestones.
- **Quick Action** widget shortcuts for composing stories, uploading assets, and moderating discussions.

### 3. Article CMS (`admin/src/pages/ArticlesPage.tsx` & `ArticleEditorPage.tsx`)
- Comprehensive list with search, category filtering, and status tabs (*All, Published, Draft, Scheduled, Archived*).
- Editorial Editor:
  - Title input with automatic URL slugification.
  - Excerpt lead paragraph input.
  - Rich Markdown formatting toolbar (Headings, Quotes, Lists, Bold, Italic, Links, Code) with a live split-screen preview tab.
  - Topic tags input with interactive chip removal.
  - Category and Author assignment.
  - Cloudinary Cover Image uploader with live preview and drag-and-drop.
  - Date & time picker for scheduling future articles.
  - Custom SEO meta title and description controls.

### 4. Category Management (`admin/src/pages/CategoriesPage.tsx`)
- Manage publication verticals (*Technology, FinTech, Business, Startups, Innovation, Africa*).
- Create, edit, and delete categories with article association protection.

### 5. Author Management (`admin/src/pages/AuthorsPage.tsx`)
- Journalist profiles with avatar photo upload, editorial title, bio, and social handles (Twitter/X, LinkedIn, Website).

### 6. Cloudinary Media Library (`admin/src/pages/MediaPage.tsx`)
- Drag-and-drop file uploader streaming image buffers to Cloudinary CDN.
- Media grid displaying image dimensions, formats, and file sizes.
- 1-click **Copy CDN URL** button with animated confirmation.
- Fullscreen asset inspection modal and deletion workflow.

### 7. Comments Moderation (`admin/src/pages/CommentsPage.tsx`)
- Moderation queue with *Pending*, *Approved*, and *Rejected* filter tabs.
- Review community remarks with 1-click Approve, Reject, or Delete actions.

### 8. User & Role Management (`admin/src/pages/UsersPage.tsx`)
- Super-admin role controls for granting permissions across `super_admin`, `editor`, `author`, and `moderator`.
- Account activation toggle and revocation modal.

### 9. Analytics & Reporting (`admin/src/pages/AnalyticsPage.tsx`)
- Historical traffic analytics with period filters (*7d, 30d, 90d*).
- Top 10 Performing Articles leaderboard ranked by readership.
- Average read time estimates and engagement metrics.

### 10. Platform Settings (`admin/src/pages/SettingsPage.tsx`)
- Global site metadata, contact email, and editorial defaults.
- Authenticated admin password change workstation.

---

## 📡 API Endpoint Reference

### Public API
- `GET /api/articles` — List published articles with category and search filters
- `GET /api/articles/:slug` — Fetch article by slug and record view
- `GET /api/categories` — List active categories with story counts
- `GET /api/authors` — List editorial journalists
- `POST /api/articles/:slug/comments` — Submit public comment for moderation

### Admin API (Protected by JWT)
- `POST /api/auth/login` — Administrator authentication
- `GET /api/auth/me` — Retrieve active admin session profile
- `GET /api/admin/articles` — List all articles (drafts, scheduled, published)
- `POST /api/admin/articles` — Create story
- `PUT /api/admin/articles/:id` — Update story
- `POST /api/admin/articles/:id/publish` — Publish story
- `POST /api/admin/articles/:id/unpublish` — Revert story to draft
- `DELETE /api/admin/articles/:id` — Remove story
- `POST /api/admin/media/upload` — Direct Cloudinary upload
- `GET /api/admin/media` — Query media library
- `DELETE /api/admin/media/:id` — Delete asset
- `GET /api/admin/analytics/dashboard` — Query KPIs, views curve, and donut breakdown
- `GET /api/admin/comments` — Moderate comments
- `PATCH /api/admin/users/:id/role` — Update permissions (Super Admin only)
