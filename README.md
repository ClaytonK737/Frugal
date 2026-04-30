# Frugal — Frontend

A web-based price comparison app for college students to find deals on textbooks, groceries, and clothing.

**Tech stack:** React, TypeScript, Vite, Tailwind CSS, Firebase (Auth + Firestore)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd frugal-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

The `.env` file is gitignored and not included in the repo. Create one in the project root:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Get these values from Clayton — they come from the Firebase console for the `frugal` project.

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
src/
├── components/
│   ├── layout/       # Navbar, Footer
│   └── ui/           # Reusable components (BookCard, ListingCard, etc.)
├── context/
│   └── AppContext.tsx  # Global state: auth, wishlist, navigation
├── data/
│   └── mockData.ts     # Mock data for search results (temporary)
├── lib/
│   └── firebase.ts     # Firebase initialization (auth, db, storage)
├── pages/              # One file per page/route
└── types/
    └── index.ts        # Shared TypeScript types
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production |
| `npm run typecheck` | Run TypeScript type check |
| `npm run lint` | Run ESLint |

---

## Notes

- Authentication and Firestore are live — create a real account to test
- Wishlist persists to Firestore per user
- Marketplace listings are stored in Firestore (`listings` collection)
- Search results still use mock data — pending backend API integration
