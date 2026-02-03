"""
自选股CRUD API路由
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.database import get_db
from app.models import Watchlist
from app.services.data_fetcher import data_fetcher

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/watchlist",
    tags=["自选股"]
)


# ==================== Pydantic模型 ====================

class WatchlistCreate(BaseModel):
    """添加自选股请求"""
    stock_code: str = Field(..., min_length=6, max_length=6, description="股票代码")
    notes: Optional[str] = Field(None, description="备注")


class WatchlistItem(BaseModel):
    """自选股列表项"""
    id: int
    stock_code: str
    stock_name: str = Field(..., description="股票名称")
    notes: Optional[str] = None
    current_price: Optional[float] = Field(None, description="当前价格")
    change_percent: Optional[float] = Field(None, description="涨跌幅")
    created_at: datetime

    class Config:
        from_attributes = True


class WatchlistResponse(BaseModel):
    """自选股列表响应"""
    items: List[WatchlistItem]
    total: int
    page: int
    pageSize: int
    totalPages: int


# ==================== API接口 ====================

@router.post("", response_model=WatchlistItem, summary="添加自选股")
async def add_to_watchlist(
    item: WatchlistCreate,
    db: Session = Depends(get_db)
):
    """
    添加股票到自选股列表

    - **stock_code**: 股票代码（6位数字）
    - **notes**: 备注（可选）
    """
    try:
        logger.info(f"添加自选股: {item.stock_code}")

        # 检查是否已存在
        existing = db.query(Watchlist).filter(
            Watchlist.stock_code == item.stock_code,
            Watchlist.user_id == 1  # 默认用户ID
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail=f"股票 {item.stock_code} 已在自选股中")

        # 获取股票名称
        stock_list = data_fetcher.get_stock_list()
        stock_name = None
        for stock in stock_list:
            if stock['code'] == item.stock_code:
                stock_name = stock['name']
                break

        if not stock_name:
            raise HTTPException(status_code=404, detail=f"股票 {item.stock_code} 不存在")

        # 创建数据库记录
        db_item = Watchlist(
            user_id=1,  # 默认用户ID，后续可以集成认证系统
            stock_code=item.stock_code,
            notes=item.notes
        )

        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        # 补充股票名称
        result = WatchlistItem(
            id=db_item.id,
            stock_code=db_item.stock_code,
            stock_name=stock_name,
            notes=db_item.notes,
            current_price=None,
            change_percent=None,
            created_at=db_item.created_at
        )

        logger.info(f"✅ 自选股已添加: {item.stock_code} - {stock_name}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"添加自选股失败: {e}")
        raise HTTPException(status_code=500, detail=f"添加失败: {str(e)}")


@router.get("", response_model=WatchlistResponse, summary="获取自选股列表")
async def get_watchlist(
    page: int = Query(1, ge=1, description="页码"),
    pageSize: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    获取自选股列表（分页）

    - **page**: 页码（从1开始）
    - **pageSize**: 每页数量（1-100）

    返回包含实时行情的自选股列表
    """
    try:
        logger.info(f"获取自选股列表: page={page}, pageSize={pageSize}")

        # 查询总数
        total = db.query(Watchlist).filter(Watchlist.user_id == 1).count()

        # 分页查询
        offset = (page - 1) * pageSize
        watchlist_items = db.query(Watchlist)\
            .filter(Watchlist.user_id == 1)\
            .order_by(Watchlist.created_at.desc())\
            .offset(offset)\
            .limit(pageSize)\
            .all()

        total_pages = (total + pageSize - 1) // pageSize

        # 获取股票列表（用于查找名称）
        stock_list = data_fetcher.get_stock_list()
        stock_dict = {stock['code']: stock['name'] for stock in stock_list}

        # 获取实时行情
        items = []
        for item in watchlist_items:
            stock_name = stock_dict.get(item.stock_code, item.stock_code)

            # 获取实时行情
            current_price = None
            change_percent = None
            try:
                quote = data_fetcher.get_stock_quote(item.stock_code)
                if quote:
                    current_price = quote.get('price')
                    change_percent = quote.get('change')
            except Exception as e:
                logger.warning(f"获取股票 {item.stock_code} 行情失败: {e}")

            items.append(WatchlistItem(
                id=item.id,
                stock_code=item.stock_code,
                stock_name=stock_name,
                notes=item.notes,
                current_price=current_price,
                change_percent=change_percent,
                created_at=item.created_at
            ))

        logger.info(f"✅ 返回 {len(items)} 只自选股，总计 {total} 只")

        return WatchlistResponse(
            items=items,
            total=total,
            page=page,
            pageSize=pageSize,
            totalPages=total_pages
        )

    except Exception as e:
        logger.error(f"获取自选股列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取失败: {str(e)}")


@router.delete("/{item_id}", summary="删除自选股")
async def delete_from_watchlist(
    item_id: int,
    db: Session = Depends(get_db)
):
    """
    从自选股列表中删除股票

    - **item_id**: 自选股记录ID
    """
    try:
        logger.info(f"删除自选股: ID={item_id}")

        item = db.query(Watchlist).filter(
            Watchlist.id == item_id,
            Watchlist.user_id == 1
        ).first()

        if not item:
            raise HTTPException(status_code=404, detail=f"自选股 {item_id} 不存在")

        stock_code = item.stock_code
        db.delete(item)
        db.commit()

        logger.info(f"✅ 自选股已删除: ID={item_id}, 股票代码={stock_code}")

        return {
            "message": "删除成功",
            "id": item_id,
            "stock_code": stock_code
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"删除自选股失败: {e}")
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")


@router.get("/stock/{stock_code}", response_model=Optional[WatchlistItem], summary="检查股票是否在自选股中")
async def check_stock_in_watchlist(
    stock_code: str,
    db: Session = Depends(get_db)
):
    """
    检查指定股票是否在自选股列表中

    - **stock_code**: 股票代码
    """
    try:
        logger.info(f"检查自选股: {stock_code}")

        item = db.query(Watchlist).filter(
            Watchlist.stock_code == stock_code,
            Watchlist.user_id == 1
        ).first()

        if not item:
            return None

        # 获取股票名称和实时行情
        stock_list = data_fetcher.get_stock_list()
        stock_name = None
        for stock in stock_list:
            if stock['code'] == stock_code:
                stock_name = stock['name']
                break

        current_price = None
        change_percent = None
        try:
            quote = data_fetcher.get_stock_quote(stock_code)
            if quote:
                current_price = quote.get('price')
                change_percent = quote.get('change')
        except Exception as e:
            logger.warning(f"获取股票 {stock_code} 行情失败: {e}")

        return WatchlistItem(
            id=item.id,
            stock_code=item.stock_code,
            stock_name=stock_name or stock_code,
            notes=item.notes,
            current_price=current_price,
            change_percent=change_percent,
            created_at=item.created_at
        )

    except Exception as e:
        logger.error(f"检查自选股失败: {e}")
        raise HTTPException(status_code=500, detail=f"检查失败: {str(e)}")
