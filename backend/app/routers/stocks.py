"""
股票相关API路由
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List
import logging

from app.database import get_db
from app.models import Stock, StockQuote
from app.services.data_fetcher import data_fetcher

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/stocks",
    tags=["股票"]
)


# ==================== Pydantic模型 ====================

class StockListItem(BaseModel):
    """股票列表项"""
    id: int
    code: str
    name: str
    industry: str
    market: str
    price: Optional[float] = None
    change: Optional[float] = None
    volume: Optional[str] = None
    pe: Optional[float] = None
    pb: Optional[float] = None
    market_cap: Optional[str] = None
    date: Optional[str] = None

    class Config:
        from_attributes = True


class StockListResponse(BaseModel):
    """股票列表响应"""
    stocks: List[StockListItem]
    total: int
    page: int
    pageSize: int
    totalPages: int


class StockDetail(BaseModel):
    """股票详情"""
    code: str
    name: str
    industry: str
    market: str
    description: Optional[str] = None
    price: float
    change: float
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    volume: str
    turnover: str
    date: str
    is_realtime: bool
    delay: str
    high52w: Optional[float] = None
    low52w: Optional[float] = None


# ==================== API接口 ====================

@router.get("", response_model=StockListResponse)
async def get_stocks(
    page: int = Query(1, ge=1, description="页码"),
    pageSize: int = Query(20, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词（股票代码或名称）"),
    market: Optional[str] = Query(None, description="市场筛选"),
    with_quote: bool = Query(False, description="是否包含实时行情（较慢）"),
    db: Session = Depends(get_db)
):
    """
    获取股票列表（支持分页和筛选）

    - **page**: 页码（从1开始）
    - **pageSize**: 每页数量（1-100）
    - **search**: 搜索关键词（匹配股票代码或名称）
    - **market**: 市场筛选（沪市主板/深市主板/创业板/科创板）
    - **with_quote**: 是否包含实时行情（默认False，因为较慢）

    返回分页的股票列表
    """
    try:
        logger.info(f"获取股票列表: page={page}, pageSize={pageSize}, search={search}, market={market}")

        # 从数据获取服务获取股票列表
        all_stocks = data_fetcher.get_stock_list()

        if not all_stocks:
            raise HTTPException(status_code=500, detail="获取股票列表失败")

        # 筛选
        filtered_stocks = all_stocks

        # 搜索筛选
        if search:
            search_lower = search.lower()
            filtered_stocks = [
                s for s in filtered_stocks
                if search_lower in s['code'].lower() or search_lower in s['name'].lower()
            ]

        # 市场筛选
        if market:
            filtered_stocks = [s for s in filtered_stocks if s['market'] == market]

        # 分页
        total = len(filtered_stocks)
        start = (page - 1) * pageSize
        end = start + pageSize
        paginated_stocks = filtered_stocks[start:end]

        # 添加ID字段
        for i, stock in enumerate(paginated_stocks):
            stock['id'] = start + i + 1

        # 仅在请求时添加实时行情数据（为每只股票获取最新行情）
        if with_quote:
            logger.info(f"获取实时行情数据，共 {len(paginated_stocks)} 只股票")
            for stock in paginated_stocks:
                try:
                    quote = data_fetcher.get_stock_quote(stock['code'])
                    if quote:
                        stock.update({
                            'price': quote.get('price'),
                            'change': quote.get('change'),
                            'volume': quote.get('volume'),
                            'date': quote.get('date')
                        })
                except Exception as e:
                    logger.warning(f"获取股票 {stock['code']} 行情失败: {e}")
                    # 保持原值不变

        logger.info(f"✅ 返回 {len(paginated_stocks)} 只股票，总计 {total} 只")

        return StockListResponse(
            stocks=paginated_stocks,
            total=total,
            page=page,
            pageSize=pageSize,
            totalPages=(total + pageSize - 1) // pageSize
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取股票列表API错误: {e}")
        raise HTTPException(status_code=500, detail=f"获取股票列表失败: {str(e)}")


@router.get("/{code}", response_model=StockDetail)
async def get_stock_by_code(
    code: str,
    db: Session = Depends(get_db)
):
    """
    获取单只股票详情

    - **code**: 股票代码（如 "600519"）

    返回股票的详细信息，包括实时行情和52周高低点
    """
    try:
        logger.info(f"获取股票详情: {code}")

        # 获取实时行情
        quote = data_fetcher.get_stock_quote(code)

        if not quote:
            raise HTTPException(status_code=404, detail=f"股票 {code} 不存在或无法获取数据")

        # 获取历史数据（用于计算52周高低点）
        history_df = data_fetcher.get_stock_history(code, period="weekly", start_date=(datetime.now() - timedelta(days=365)).strftime("%Y%m%d"))

        # 计算52周高低点
        high52w = None
        low52w = None
        if not history_df.empty:
            high52w = float(history_df['最高'].max())
            low52w = float(history_df['最低'].min())

        # 获取股票详细信息
        info = data_fetcher.get_stock_info(code)

        return StockDetail(
            code=quote['code'],
            name=quote['name'],
            industry='未知',  # 暂时固定，后续可以添加行业分类
            market=info.get('市场类型', '未知') if info else '未知',
            description=info.get('公司简介') if info else None,
            price=quote['price'],
            change=quote['change'],
            open=quote.get('open'),
            high=quote.get('high'),
            low=quote.get('low'),
            volume=quote['volume'],
            turnover=quote['turnover'],
            date=quote['date'],
            is_realtime=quote['is_realtime'],
            delay=quote['delay'],
            high52w=high52w,
            low52w=low52w
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取股票 {code} 详情API错误: {e}")
        raise HTTPException(status_code=500, detail=f"获取股票详情失败: {str(e)}")


@router.get("/{code}/history")
async def get_stock_history(
    code: str,
    period: str = Query("daily", regex="^(daily|weekly|monthly)$", description="周期"),
    start_date: Optional[str] = Query(None, description="开始日期 (YYYYMMDD)"),
    end_date: Optional[str] = Query(None, description="结束日期 (YYYYMMDD)"),
    db: Session = Depends(get_db)
):
    """
    获取股票历史K线数据

    - **code**: 股票代码
    - **period**: 周期（daily/weekly/monthly）
    - **start_date**: 开始日期（可选）
    - **end_date**: 结束日期（可选）

    返回历史K线数据，用于前端图表展示
    """
    try:
        logger.info(f"获取股票 {code} 历史K线: period={period}")

        # 获取历史数据
        df = data_fetcher.get_stock_history(code, period=period, start_date=start_date, end_date=end_date)

        if df.empty:
            raise HTTPException(status_code=404, detail=f"股票 {code} 暂无历史数据")

        # 转换为JSON友好的格式
        history = []
        for _, row in df.iterrows():
            history.append({
                'date': str(row['日期']),
                'open': float(row['开盘']),
                'close': float(row['收盘']),
                'high': float(row['最高']),
                'low': float(row['最低']),
                'volume': int(row['成交量']),
                'amount': float(row['成交额']),
                'change_pct': float(row['涨跌幅']),
                'change_amt': float(row['涨跌额']),
                'turnover': float(row['换手率'])
            })

        logger.info(f"✅ 返回 {len(history)} 条历史数据")

        return {
            'code': code,
            'period': period,
            'data': history
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取股票 {code} 历史数据API错误: {e}")
        raise HTTPException(status_code=500, detail=f"获取历史数据失败: {str(e)}")


@router.get("/cache/stats")
async def get_cache_stats():
    """
    获取缓存统计信息

    返回缓存大小、键列表等统计信息
    """
    try:
        stats = data_fetcher.get_cache_stats()
        logger.info(f"缓存统计: {stats}")
        return stats
    except Exception as e:
        logger.error(f"获取缓存统计失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取缓存统计失败: {str(e)}")


@router.post("/cache/clear")
async def clear_cache():
    """
    清空所有缓存

    清空所有数据缓存，强制下次从API重新获取数据
    """
    try:
        data_fetcher.clear_cache()
        logger.info("缓存已清空")
        return {
            "message": "缓存已清空",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"清空缓存失败: {e}")
        raise HTTPException(status_code=500, detail=f"清空缓存失败: {str(e)}")


# 导入datetime（用于上面的函数）
from datetime import datetime, timedelta
