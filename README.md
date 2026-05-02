# Frugal

A web-based price comparison app for college students to find deals on textbooks, groceries, and clothing.

**Team:** Clayton Kimber, Andrew Kosy, Caleb Appiah-Dankwah

---

## Architecture

```
React Frontend (Vite) ──→ Firebase Auth       (login / register / logout)
                      ──→ Django REST API      (wishlist, marketplace listings)
                      ──→ Google Books API     (book search)
```

- **Firebase** handles authentication only — user profiles (name) are stored in Firestore
- **Django + SQLite** stores all app data: textbooks, marketplace listings, wishlist items
- **Google Books API** powers book search by title, author, or ISBN

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- Python 3.10 or higher
- npm (comes with Node)

---

## Frontend Setup

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

The `.env` file is gitignored. Create one in the project root with the following — get values from Clayton:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_GOOGLE_BOOKS_API_KEY=...
```

### 4. Start the frontend dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Backend Setup (Django)

### 1. Create and activate a virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Add the Firebase service account key

Get `serviceAccountKey.json` from Clayton and place it in the `backend/` folder. This file is gitignored and never committed.

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Start the Django server

```bash
export FIREBASE_CREDENTIALS=/path/to/frugal-frontend/backend/serviceAccountKey.json
python manage.py runserver
```

Django runs at `http://127.0.0.1:8000`.

> You need to run the `export` command each time you open a new terminal before starting the server.

---

## Running the Full Stack

You need **two terminals** running simultaneously:

| Terminal | Command |
|---|---|
| Frontend | `npm run dev` (from project root) |
| Backend | `source venv/bin/activate && export FIREBASE_CREDENTIALS=... && python manage.py runserver` (from `backend/`) |

---

## Project Structure

```
frugal-frontend/
├── src/
│   ├── components/
│   │   ├── layout/         # Navbar, Footer
│   │   └── ui/             # BookCard, ListingCard, PriceComparisonTable, etc.
│   ├── context/
│   │   └── AppContext.tsx  # Global state: auth, wishlist, navigation
│   ├── data/
│   │   └── mockData.ts     # Fallback mock data
│   ├── lib/
│   │   ├── api.ts          # Django REST API calls
│   │   ├── firebase.ts     # Firebase initialization
│   │   └── googleBooks.ts  # Google Books API + synthetic price generation
│   ├── pages/              # One file per route/page
│   └── types/
│       └── index.ts        # Shared TypeScript types
└── backend/
    ├── api/
    │   ├── models.py       # Product (abstract), Textbook, SaleListing, WishlistItem
    │   ├── views.py        # REST API views
    │   ├── serializers.py  # DRF serializers
    │   ├── urls.py         # API URL routing
    │   └── authentication.py  # Firebase token verification
    ├── frugal/
    │   ├── settings.py
    │   └── urls.py
    ├── requirements.txt
    └── manage.py
```

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/listings/` | Get all active listings | No |
| GET | `/api/listings/?isbn=...` | Get listings for a specific book | No |
| POST | `/api/listings/` | Create a listing | Yes |
| PATCH | `/api/listings/<id>/` | Update a listing (owner only) | Yes |
| DELETE | `/api/listings/<id>/` | Delete a listing (owner only) | Yes |
| GET | `/api/wishlist/` | Get current user's wishlist | Yes |
| POST | `/api/wishlist/` | Add book to wishlist | Yes |
| DELETE | `/api/wishlist/<id>/` | Remove from wishlist | Yes |
| GET | `/api/textbooks/` | List textbooks | No |
| POST | `/api/textbooks/` | Get or create a textbook | No |

---

## Available Frontend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production |
| `npm run typecheck` | Run TypeScript type check |
| `npm run lint` | Run ESLint |
