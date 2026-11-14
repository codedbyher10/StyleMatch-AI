# ✨ StyleMatch AI

> **Your Wardrobe, Reimagined by AI.**  
> Turn the clothes you already own into outfits you'll actually want to wear. Digitize your closet, chat with an AI stylist, recreate Pinterest/Instagram inspiration looks, and plan weather-aware travel wardrobes.

---

## 🚀 Features

- **🗄️ Digital Wardrobe Management**  
  Upload, categorize, and organize your tops, bottoms, dresses/one-pieces, outerwear, and shoes with color, brand, and style metadata.
- **🪄 Hybrid AI Outfit Generator**  
  Two-stage recommendation engine combining fast rule-based filtering (supporting both **two-piece** and **one-piece/dress** silhouettes plus temperature-aware outerwear) with LLM aesthetic re-ranking across occasions (*Casual, College, Office, Formal, Party, Date, Gym, Travel*).
- **📸 Inspiration Matcher (Pin-to-Outfit Vision AI)**  
  Upload any outfit screenshot from Pinterest, Instagram, or TikTok—or try the built-in **Editorial Runway Moodboards**. Vision AI extracts garment details and color palette DNA, recreates the look using pieces from your real closet, and lets you swap alternative items in one click.
- **💬 Aria — AI Couture Stylist**  
  Multi-turn conversational stylist powered by Groq Cloud that understands your real wardrobe inventory, preferred/avoided colors, sizing, and personal style motto.
- **🧬 Style DNA Matrix**  
  Live-synchronized analytics dashboard showing your **Versatility Index**, **Live Color Palette DNA**, **Closet Proportions**, **Style Composition Pillars**, and **AI Evolution Insights**, with instant sizing & motto editing.
- **✈️ Travel Mode & Weather Sync**  
  Destination- and weather-aware outfit & packing coordination (`weather_service.py` / `weather.ts`).
- **❤️ Saved Looks & Profile Customization**  
  Save favorite generated or recreated outfits and customize your profile with HD avatar uploads and quick-edit style preferences.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + TypeScript + Vite (`v6`)
- **Routing:** React Router DOM
- **Styling & Animation:** Tailwind CSS, Motion (`motion/react`), Lucide React icons
- **Package Manager:** `pnpm`

### Backend
- **Framework:** FastAPI (Python) + Uvicorn
- **Database & Migrations:** SQLAlchemy ORM + Alembic
- **AI / Vision Models (via Groq Cloud API):**
  - `qwen/qwen3.8-27b` — Multimodal Inspiration Vision Matcher & Aria AI Stylist Chat
  - `openai/gpt-oss-120b` — Stage-2 Hybrid Outfit Aesthetic Re-ranking
- **Image Processing:** Pillow (`PIL`)

---

## 📁 Project Structure

```text
StyleMatch_AI/
├── backend/
│   ├── alembic/                    # Database migration scripts
│   ├── app/
│   │   ├── core/                   # Auth dependencies & configuration
│   │   ├── database/
│   │   │   ├── connection.py       # SQLAlchemy DB session & engine
│   │   │   └── models.py           # User, ClothingItem, Outfit, SavedLook, StylePreference
│   │   ├── routes/
│   │   │   ├── auth.py             # Authentication & /api/auth/me
│   │   │   ├── clothing.py         # Wardrobe CRUD & image handling
│   │   │   ├── outfits.py          # Outfit generation, saved looks & vision matcher
│   │   │   ├── preferences.py      # Style preferences & /api/preferences/dna
│   │   │   ├── stylist.py          # Aria AI Stylist (/api/stylist/chat)
│   │   │   └── travel.py           # Travel mode endpoints
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── outfit_engine.py    # Two-stage hybrid outfit recommender
│   │   │   ├── travel_engine.py    # Travel wardrobe packing engine
│   │   │   └── weather_service.py  # Weather API integration
│   │   └── main.py                 # FastAPI entry point
│   └── venv/
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── layout/             # DashboardLayout, Navbar, Footer
    │   │   └── ui/                 # Reusable UI primitives
    │   ├── lib/                    # utils.ts, weather.ts
    │   ├── pages/
    │   │   ├── LandingPage.tsx
    │   │   ├── GetStartedPage.tsx
    │   │   ├── AuthPage.tsx
    │   │   ├── OnboardingPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── WardrobePage.tsx
    │   │   ├── AddClothingPage.tsx
    │   │   ├── GenerateOutfitPage.tsx
    │   │   ├── InspirationMatcherPage.tsx
    │   │   ├── AIStylistPage.tsx
    │   │   ├── SavedOutfitsPage.tsx
    │   │   ├── StyleProfilePage.tsx
    │   │   └── TravelModePage.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    └── package.json
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- **Node.js** (v18+) & **pnpm**
- **Python** (3.10+)
- **Groq API Key** ([console.groq.com](https://console.groq.com))

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` with your environment variables (adjust database/JWT keys to match your `core` & `database/connection.py` settings):

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=your_database_url_here
SECRET_KEY=your_jwt_secret_key_here
```

Run database migrations (if using Alembic) and start the FastAPI server:

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Backend will be live at **`http://127.0.0.1:8000`** (Swagger docs at **`http://127.0.0.1:8000/docs`**).

---

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install packages
pnpm install

# Start Vite development server
pnpm run dev
```

Frontend will be live at **`http://localhost:3000`**.

---

## 🔌 Core API Endpoints

| Module | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/me` | `GET` | Fetch current authenticated user profile |
| **Outfits** | `/api/outfits/generate` | `POST` | Generate hybrid AI outfit recommendations |
| **Outfits** | `/api/outfits/match-inspiration` | `POST` | Match uploaded inspo photo against user wardrobe |
| **Outfits** | `/api/outfits/save` | `POST` | Save an outfit to Saved Looks |
| **Outfits** | `/api/outfits/saved` | `GET` | Retrieve all saved looks |
| **Outfits** | `/api/outfits/saved/{outfit_id}` | `DELETE` | Remove an outfit from Saved Looks |
| **Stylist** | `/api/stylist/chat` | `POST` | Chat with Aria AI Couture Consultant |
| **Preferences** | `/api/preferences` | `PUT` | Update sizing, style preferences, and motto |
| **Preferences** | `/api/preferences/dna` | `GET` | Compute live Style DNA metrics & color palette |

