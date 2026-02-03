"""
筛选历史CRUD API路由
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.database import get_db
from app.models import ScreeningHistory

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/screening-history",
    tags=["筛选历史"]
)


# ==================== Pydantic模型 ====================

class ScreeningHistoryCreate(BaseModel):
    """创建筛选历史请求"""
    criteria: Dict[str, Any] = Field(..., description="筛选条件")
    result_count: int = Field(..., description="结果数量")
    avg_change: float = Field(..., description="平均涨幅")
    top_stocks: List[str] = Field(default=[], description="前3只股票名称")
    results: List[Dict[str, Any]] = Field(default=[], description="筛选结果(前10条)")


class ScreeningHistoryResponse(BaseModel):
    """筛选历史响应"""
    id: int
    timestamp: datetime
    criteria: Dict[str, Any]
    result_count: int
    avg_change: float
    top_stocks: List[str]
    results: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class ScreeningHistoryListResponse(BaseModel):
    """筛选历史列表响应"""
    items: List[ScreeningHistoryResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int


# ==================== API接口 ====================

@router.post("", response_model=ScreeningHistoryResponse, summary="保存筛选历史")
async def create_screening_history(
    history: ScreeningHistoryCreate,
    db: Session = Depends(get_db)
):
    """
    保存筛选历史记录

    - **criteria**: 筛选条件（JSON格式）
    - **result_count**: 筛选结果数量
    - **avg_change**: 平均涨幅
    - **top_stocks**: 前3只股票名称
    - **results**: 筛选结果详情（保存前10条）
    """
    try:
        logger.info(f"保存筛选历史: {history.criteria}")

        # 创建数据库记录
        db_history = ScreeningHistory(
            user_id=1,  # 默认用户ID，后续可以集成认证系统
            criteria=history.criteria,
            result_count=history.result_count,
            avg_change=history.avg_change,
            top_stocks=history.top_stocks,
            results=history.results[:10]  # 只保存前10条
        )

        db.add(db_history)
        db.commit()
        db.refresh(db_history)

        logger.info(f"✅ 筛选历史已保存，ID: {db_history.id}")

        return db_history

    except Exception as e:
        db.rollback()
        logger.error(f"保存筛选历史失败: {e}")
        raise HTTPException(status_code=500, detail=f"保存失败: {str(e)}")


@router.get("", response_model=ScreeningHistoryListResponse, summary="获取筛选历史列表")
async def get_screening_histories(
    page: int = Query(1, ge=1, description="页码"),
    pageSize: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    获取筛选历史列表（分页）

    - **page**: 页码（从1开始）
    - **pageSize**: 每页数量（1-100）
    """
    try:
        logger.info(f"获取筛选历史列表: page={page}, pageSize={pageSize}")

        # 查询总数
        total = db.query(ScreeningHistory).count()

        # 分页查询
        offset = (page - 1) * pageSize
        histories = db.query(ScreeningHistory)\
            .order_by(ScreeningHistory.timestamp.desc())\
            .offset(offset)\
            .limit(pageSize)\
            .all()

        total_pages = (total + pageSize - 1) // pageSize

        logger.info(f"✅ 返回 {len(histories)} 条筛选历史，总计 {total} 条")

        return ScreeningHistoryListResponse(
            items=histories,
            total=total,
            page=page,
            pageSize=pageSize,
            totalPages=total_pages
        )

    except Exception as e:
        logger.error(f"获取筛选历史列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取失败: {str(e)}")


@router.get("/{history_id}", response_model=ScreeningHistoryResponse, summary="获取筛选历史详情")
async def get_screening_history(
    history_id: int,
    db: Session = Depends(get_db)
):
    """
    获取单条筛选历史详情

    - **history_id**: 筛选历史ID
    """
    try:
        logger.info(f"获取筛选历史详情: ID={history_id}")

        history = db.query(ScreeningHistory).filter(ScreeningHistory.id == history_id).first()

        if not history:
            raise HTTPException(status_code=404, detail=f"筛选历史 {history_id} 不存在")

        logger.info(f"✅ 返回筛选历史详情: ID={history_id}")

        return history

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取筛选历史详情失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取失败: {str(e)}")


@router.delete("/{history_id}", summary="删除筛选历史")
async def delete_screening_history(
    history_id: int,
    db: Session = Depends(get_db)
):
    """
    删除筛选历史记录

    - **history_id**: 筛选历史ID
    """
    try:
        logger.info(f"删除筛选历史: ID={history_id}")

        history = db.query(ScreeningHistory).filter(ScreeningHistory.id == history_id).first()

        if not history:
            raise HTTPException(status_code=404, detail=f"筛选历史 {history_id} 不存在")

        db.delete(history)
        db.commit()

        logger.info(f"✅ 筛选历史已删除: ID={history_id}")

        return {
            "message": "删除成功",
            "id": history_id
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"删除筛选历史失败: {e}")
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")


@router.delete("", summary="清空筛选历史")
async def clear_all_screening_history(
    db: Session = Depends(get_db)
):
    """
    清空所有筛选历史记录

    ⚠️ 警告：此操作会删除所有筛选历史，不可恢复
    """
    try:
        logger.info("清空所有筛选历史")

        # 查询总数
        count = db.query(ScreeningHistory).count()

        # 删除所有记录
        db.query(ScreeningHistory).delete()
        db.commit()

        logger.info(f"✅ 已清空 {count} 条筛选历史")

        return {
            "message": f"已清空 {count} 条筛选历史",
            "deleted_count": count
        }

    except Exception as e:
        db.rollback()
        logger.error(f"清空筛选历史失败: {e}")
        raise HTTPException(status_code=500, detail=f"清空失败: {str(e)}")
