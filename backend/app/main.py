# backend/app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, clothing, outfits, stylist, preferences , travel # Import preferences
from app.core.deps import get_current_user
from app.database.models import User

app = FastAPI(
    title="StyleMatch AI API",
    description="Backend API services for StyleMatch AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(clothing.router)
app.include_router(outfits.router)
app.include_router(stylist.router)
app.include_router(preferences.router)  # Register preferences router
app.include_router(travel.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the StyleMatch AI API!"}

@app.get("/api/auth/me", response_model=None)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "message": f"Hello {current_user.full_name}! You have successfully accessed a secure route."
    }