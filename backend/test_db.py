from app.database.connection import SessionLocal
from app.database.models import User, StylePreference

def test_connection():
    db = SessionLocal()
    try:
        # Create dummy user
        test_user = User(
            email="test_user@stylematch.ai",
            password_hash="hashed_secure_password",
            full_name="StyleMatch Tester"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        # Create preferences linked to dummy user
        preferences = StylePreference(
            user_id=test_user.id,
            styles=["Streetwear", "Casual"],
            preferred_colors=["Black", "White"]
        )
        db.add(preferences)
        db.commit()

        # Query and verify
        fetched_user = db.query(User).filter(User.email == "test_user@stylematch.ai").first()
        print(f"Successfully inserted user: {fetched_user.full_name} (ID: {fetched_user.id})")
        print(f"Associated styles: {fetched_user.style_preference.styles}")

    except Exception as e:
        print(f"Database error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_connection()