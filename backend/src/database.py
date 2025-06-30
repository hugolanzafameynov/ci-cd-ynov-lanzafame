import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# Fonctions utilitaires
async def init_db():
    """Initialiser la base de données"""
    try:
        from src.models.user import User
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Connected to MySQL database and tables created")
    except Exception as e:
        print(f"Database connection error: {e}")
        raise e

async def close_db():
    """Fermer la connexion à la base de données"""
    await engine.dispose()

async def get_async_session():
    """Obtenir une session async SQLAlchemy"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
