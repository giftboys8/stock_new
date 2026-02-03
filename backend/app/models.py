"""
数据库模型定义
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Stock(Base):
    """股票基础信息表"""
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False, comment="股票代码")
    name = Column(String(50), nullable=False, comment="股票名称")
    industry = Column(String(30), comment="所属行业")
    market = Column(String(20), comment="市场类型(沪市/深市/创业板等)")
    description = Column(Text, comment="公司简介")
    created_at = Column(DateTime, default=datetime.now, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment="更新时间")


class StockQuote(Base):
    """股票行情表"""
    __tablename__ = "stock_quotes"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(10), index=True, nullable=False, comment="股票代码")
    price = Column(Float, comment="当前价格")
    change_percent = Column(Float, comment="涨跌幅(%)")
    volume = Column(String(20), comment="成交量")
    turnover = Column(String(20), comment="成交额")
    pe = Column(Float, comment="市盈率")
    pb = Column(Float, comment="市净率")
    market_cap = Column(String(20), comment="总市值")
    timestamp = Column(DateTime, default=datetime.now, index=True, comment="数据时间戳")


class ScreeningHistory(Base):
    """筛选历史表"""
    __tablename__ = "screening_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, comment="用户ID(预留)")
    timestamp = Column(DateTime, default=datetime.now, index=True, comment="筛选时间")
    criteria = Column(JSON, comment="筛选条件(JSON格式)")
    result_count = Column(Integer, comment="结果数量")
    avg_change = Column(Float, comment="平均涨幅")
    top_stocks = Column(JSON, comment="前3只股票名称")
    results = Column(JSON, comment="筛选结果(只保存前10条)")
    created_at = Column(DateTime, default=datetime.now, comment="创建时间")


class Watchlist(Base):
    """自选股表"""
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, comment="用户ID")
    stock_code = Column(String(10), index=True, nullable=False, comment="股票代码")
    notes = Column(Text, comment="备注")
    created_at = Column(DateTime, default=datetime.now, comment="添加时间")
