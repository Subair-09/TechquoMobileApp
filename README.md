# TechQuo News — Mobile Application

TechQuo News is a premium mobile application built with **Expo SDK 57**, **React Native**, and **TypeScript**, delivering an editorial reading experience inspired by high-end technology and business publications across the African digital economy.

---

## 📱 Features & Implemented Architecture

### 1. Launch & Branded Splash Screen (`src/app/index.tsx`)
- Full-screen pure white background with subtle abstract SVG background contours.
- Centered editorial serif **TECHQUO NEWS** wordmark with the signature blue dot.
- Subtitle: `TECH / INNOVATION / AFRICA`.
- Automatic navigation dispatching to **Onboarding** for new users or directly to **Home** for returning readers via `AsyncStorage`.

### 2. Onboarding Flow (`src/app/onboarding.tsx`)
- Three swipeable slides matching design specifications:
  - **Slide 1**: *"The Latest Tech News"* — featuring a monochrome illustration of human and robotic hands meeting (technological and human convergence).
  - **Slide 2**: *"Explore by Category"* — featuring an angled mobile device frame showcasing news categories.
  - **Slide 3**: *"Read, Save & Stay Updated"* — featuring an article reading interface with floating bookmark and typography badges.
- Page indicator displaying `1 / 3`, `2 / 3`, and `3 / 3`.
- Black pill-shaped primary action button (`Next →` / `Get Started →`).
- Skip and direct Sign In options.
- State persisted with `StorageService.setOnboardingCompleted(true)`.

### 3. Home Feed (`src/app/(tabs)/index.tsx`)
- Top editorial header with branded wordmark, Search shortcut, and Categories drawer.
- Horizontally scrollable category pills: `All`, `Technology`, `Business`, `FinTech`, `Startups`, `Innovation`, `Africa`.
- Featured hero story card with high-resolution imagery, bold serif headline, and metadata.
- Vertical editorial article cards with thumbnails, category tags, serif headlines, publication dates, and reading times.
- Pull-to-refresh and dynamic category filtering.

### 4. Explore & Categories Screen (`src/app/(tabs)/explore.tsx`)
- Dedicated search bar for topics and authors.
- Category rows with monochrome icon badges, titles, descriptions, and chevrons:
  - *Trending* (Popular and trending stories)
  - *Technology* (AI, Software, Gadgets & More)
  - *Business* (Markets, Economy, Startups)
  - *FinTech* (Payments, Banking, Web3)
  - *Startups* (Founders, Funding, Growth)
  - *Innovation* (Ideas Shaping Tomorrow)
  - *Africa* (African Tech & Impact)
  - *Lifestyle* (Work, Culture, Health)
- Direct navigation to `/category/[slug]`.

### 5. Article Detail & Reader (`src/app/article/[id].tsx`)
- Sticky editorial header with back navigation, bookmark toggle, typography controls (`Aa`), and native share sheet integration (`Share.share`).
- High-contrast editorial serif headlines scaling dynamically with user font preferences (`sm`, `md`, `lg`, `xl`).
- Author avatar, full byline, date, and reading time.
- Rich editorial layout with lead paragraphs, subheadings, and pull quotes.
- Fixed bottom interaction bar:
  - Like counter with toggleable heart.
  - Interactive comments bottom sheet with thread view and new comment submission.
  - Quick bookmarking.
  - Native share trigger.
- Curated *Related Editorials* section at the bottom.

### 6. Saved Articles (`src/app/(tabs)/saved.tsx`)
- Offline-ready reading list of bookmarked articles.
- One-tap removal or swipe deletion.
- Empty state with *"Your reading list is waiting"* and direct exploration call-to-action.

### 7. Profile & Menu Screen (`src/app/(tabs)/profile.tsx`)
- Editorial dark mode (`#0D0E12`) matching the design reference.
- Branded white serif wordmark with blue accent.
- User profile card for *Nurudeen Adewale* (`@nurudeen`).
- Menu navigation: `Home`, `Explore`, `Saved Articles`, `Reading History`, `Notifications` (with unread badge), and `Settings`.
- Bordered **Go Premium** promotional card with feature overview.
- Interactive Sign In / Sign Out actions.

### 8. Search Experience (`src/app/search.tsx`)
- Instant search by title, category, author, and keywords.
- Trending topic pills (`#ClimateTech`, `#LetPlant`, `#SnapVid`, `#Waivly`, `#AIAfrica`).
- Persistent recent searches with one-tap recall and clear history.

### 9. Notifications (`src/app/notifications.tsx`)
- Chronological alert list categorized into editorial briefs, trending alerts, and category updates.
- Filter between All and Unread notifications.
- One-tap "Mark all as read" action.

### 10. Settings & Preferences (`src/app/settings.tsx`)
- Reader typography picker (`Compact`, `Default`, `Large`, `Editorial Extra`).
- Offline reading toggle.
- Editorial notifications toggle.
- Haptic feedback toggle.
- Cache management (clear image cache).
- Reset onboarding walkthrough.
- Publication information and version specs.

### 11. Authentication & Premium (`src/app/auth/*`, `src/app/premium.tsx`)
- Sign In, Sign Up, and Forgot Password flows.
- Guest browsing support (public articles accessible without an account).
- Premium subscription modal with monthly and annual membership tiers.

---

## 🎨 Design System

| Element | Specification |
| :--- | :--- |
| **Background** | `#FFFFFF` (Light), `#0D0E12` (Dark Profile) |
| **Primary Typography** | `#000000` (Light), `#FFFFFF` (Dark) |
| **Surfaces** | `#F5F6F7` |
| **Muted Metadata** | `#77808C` |
| **Borders** | `#E5E7EB` |
| **Accent** | `#2563EB` (TechQuo Blue Dot) |
| **Headline Font** | `DMSerifDisplay_400Regular` (Bundled Google Font) |
| **Body & UI Font** | `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold` |

---

## 🚀 Running the Project

```bash
# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run on Web
npx expo start --web

# Typecheck
npx tsc --noEmit

# Lint
npx expo lint
```
