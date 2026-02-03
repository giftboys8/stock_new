"""
数据库连接配置
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.models import Base
import logging

logger = logging.getLogger(__name__)

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=False  # 设置为True可看到SQL语句
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """初始化数据库"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("数据库初始化成功")
    except Exception as e:
        logger.error(f"数据库初始化失败: {e}")
        raise


def get_db() -> Session:
    """
    获取数据库会话

    用法:
        @app.get("/stocks")
        def read_stocks(db: Session = Depends(get_db)):
            stocks = db.query(Stock).all()
            return stocks
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
