# ✨ StyleMatch AI

> **Your Wardrobe, Reimagined by AI.**  
> Digitize your closet, generate personalized outfits, recreate inspiration looks from photos, and plan weather-aware travel wardrobes.

---

## 🚀 Features

- **Digital Wardrobe:** Upload and organize tops, bottoms, dresses, outerwear, and shoes by color, category, and style tag.
- **Hybrid Outfit Generator:** Combines rule-based filtering (two-piece & dress silhouettes + cold-weather layering) with LLM aesthetic re-ranking across occasions (*Casual, College, Office, Formal, Party, Date, Gym, Travel*).
- **Inspiration Matcher:** Upload Pinterest/Instagram screenshots or test runway moodboards to extract garment palettes and recreate the look from your own closet with one-click item swapping.
- **AI Stylist Chat:** Conversational styling assistant aware of your real wardrobe, preferred/avoided colors, sizing, and style bio.
- **Style DNA:** Live analytics displaying your versatility score, color palette breakdown, closet proportions, and style pillars.
- **Travel Mode & Saved Looks:** Weather-aware packing recommendations and bookmarking for favorite outfits.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Motion, Lucide React (`pnpm`)
- **Backend:** FastAPI, Uvicorn, SQLAlchemy, Alembic, Pillow
- **AI Models (Groq Cloud):** `qwen/qwen3.8-27b` (Vision Matcher & Stylist Chat), `openai/gpt-oss-120b` (Outfit Re-ranking)

---

## 📁 Structure

```text
StyleMatch_AI/
├── backend/    # FastAPI app (routes, schemas, services, database, alembic)
└── frontend/   # React + Vite TypeScript app (pages, components, lib)
```

---

## ⚙️ Quick Start

### 1. Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_database_url
SECRET_KEY=your_jwt_secret
```

Run migrations and start the API (`http://127.0.0.1:8000`):
```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```
Open **`http://localhost:3000`**.