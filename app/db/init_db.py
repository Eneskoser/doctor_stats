from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine
from app.core.config import settings


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    Base.metadata.drop_all(bind=engine)


if __name__ == "__main__":
    print("Creating initial database...")
    init_db()
    print("Database initialization completed.")
