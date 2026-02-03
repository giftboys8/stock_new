"""
任务状态管理服务

用于管理异步筛选任务的状态和结果
"""
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class TaskStatus(str, Enum):
    """任务状态枚举"""
    PENDING = "pending"        # 待处理
    PROCESSING = "processing"  # 处理中
    COMPLETED = "completed"    # 已完成
    FAILED = "failed"          # 失败


class TaskInfo:
    """任务信息"""
    def __init__(
        self,
        task_id: str,
        criteria: dict,
        total: int = 0,
        status: TaskStatus = TaskStatus.PENDING
    ):
        self.task_id = task_id
        self.criteria = criteria
        self.total = total
        self.processed = 0
        self.status = status
        self.results = []
        self.error: Optional[str] = None
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "taskId": self.task_id,  # 使用驼峰格式，与前端保持一致
            "task_id": self.task_id,  # 保留下划线格式，兼容旧代码
            "criteria": self.criteria,
            "total": self.total,
            "processed": self.processed,
            "status": self.status.value,
            "result_count": len(self.results),
            "error": self.error,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "progress": round(self.processed / self.total * 100, 2) if self.total > 0 else 0
        }


class TaskManager:
    """任务管理器"""

    def __init__(self):
        self.tasks: Dict[str, TaskInfo] = {}
        self.max_tasks = 100  # 最多保存100个任务

    def create_task(self, task_id: str, criteria: dict, total: int = 0) -> TaskInfo:
        """
        创建新任务

        Args:
            task_id: 任务ID
            criteria: 筛选条件
            total: 总数

        Returns:
            TaskInfo对象
        """
        task = TaskInfo(task_id, criteria, total)
        self.tasks[task_id] = task

        # 清理旧任务（保持最多max_tasks个）
        if len(self.tasks) > self.max_tasks:
            oldest_key = min(self.tasks.keys(), key=lambda k: self.tasks[k].created_at)
            del self.tasks[oldest_key]
            logger.info(f"清理旧任务: {oldest_key}")

        logger.info(f"创建任务: {task_id}, 总数: {total}")
        return task

    def get_task(self, task_id: str) -> Optional[TaskInfo]:
        """获取任务信息"""
        return self.tasks.get(task_id)

    def update_task(
        self,
        task_id: str,
        processed: Optional[int] = None,
        total: Optional[int] = None,
        status: Optional[TaskStatus] = None,
        results: Optional[List] = None,
        error: Optional[str] = None
    ) -> bool:
        """
        更新任务状态

        Args:
            task_id: 任务ID
            processed: 已处理数量
            total: 总数
            status: 任务状态
            results: 结果列表
            error: 错误信息

        Returns:
            是否更新成功
        """
        task = self.tasks.get(task_id)
        if not task:
            logger.warning(f"任务不存在: {task_id}")
            return False

        if processed is not None:
            task.processed = processed
        if total is not None:
            task.total = total
        if status is not None:
            task.status = status
        if results is not None:
            task.results = results
        if error is not None:
            task.error = error

        task.updated_at = datetime.now()

        logger.debug(
            f"更新任务: {task_id}, "
            f"进度: {task.processed}/{task.total}, "
            f"状态: {task.status.value}"
        )
        return True

    def delete_task(self, task_id: str) -> bool:
        """删除任务"""
        if task_id in self.tasks:
            del self.tasks[task_id]
            logger.info(f"删除任务: {task_id}")
            return True
        return False

    def cancel_task(self, task_id: str) -> bool:
        """
        取消正在执行的任务

        Args:
            task_id: 任务ID

        Returns:
            是否取消成功
        """
        task = self.tasks.get(task_id)
        if not task:
            return False

        # 标记任务为已取消
        task.status = TaskStatus.FAILED
        task.error = "用户取消任务"
        task.updated_at = datetime.now()

        logger.info(f"任务已取消: {task_id}")
        return True

    def get_active_task(self) -> Optional[TaskInfo]:
        """
        获取当前正在执行的任务

        Returns:
            正在执行的任务，如果没有则返回None
        """
        for task in self.tasks.values():
            if task.status in [TaskStatus.PENDING, TaskStatus.PROCESSING]:
                return task
        return None

    def get_all_tasks(self) -> List[dict]:
        """获取所有任务"""
        return [task.to_dict() for task in sorted(
            self.tasks.values(),
            key=lambda t: t.created_at,
            reverse=True
        )]


# 创建全局实例
task_manager = TaskManager()
