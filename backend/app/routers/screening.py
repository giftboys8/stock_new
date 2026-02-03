"""
筛选相关API路由 - 异步并发版本
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
from datetime import datetime
import asyncio

from app.services.data_fetcher import data_fetcher
from app.services.task_manager import task_manager, TaskStatus
from app.services.pe_pb_calculator import pe_pb_calculator

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/screen",
    tags=["筛选"]
)


# ==================== Pydantic模型 ====================

class ScreeningCriteria(BaseModel):
    """筛选条件"""
    strategy: str = Field(description="策略类型: 稳健型/平衡型/成长型")
    industry: Optional[str] = Field("全部", description="行业筛选")
    peMin: Optional[float] = Field(None, description="最小市盈率")
    peMax: Optional[float] = Field(None, description="最大市盈率")
    pbMin: Optional[float] = Field(None, description="最小市净率")
    pbMax: Optional[float] = Field(None, description="最大市净率")
    marketCapMin: Optional[float] = Field(None, description="最小市值（亿）")
    changeType: Optional[str] = Field("all", description="涨跌幅类型: all/up/down")


class ScreeningResult(BaseModel):
    """筛选结果项"""
    id: int
    code: str
    name: str
    price: float
    change: float
    volume: str
    pe: Optional[float] = None
    pb: Optional[float] = None
    market_cap: str
    industry: str


class ScreeningResponse(BaseModel):
    """筛选响应"""
    taskId: str
    status: str
    message: str


class TaskStatusResponse(BaseModel):
    """任务状态响应"""
    taskId: str
    status: str
    total: int
    processed: int
    progress: float
    resultCount: int
    error: Optional[str] = None
    results: Optional[List[ScreeningResult]] = None


# ==================== 策略配置 ====================

STRATEGY_CONFIGS = {
    "稳健型": {
        "description": "适合熊市或保守投资",
        "peMin": 15,
        "peMax": 30,
        "pbMin": 1.0,
        "pbMax": 3.0,
        "marketCapMin": 50,  # 亿
        "changeType": "all",
        "note": "严格筛选，追求防守"
    },
    "平衡型": {
        "description": "适合震荡市，均衡配置",
        "peMin": 10,
        "peMax": 40,
        "pbMin": 0.8,
        "pbMax": 5.0,
        "marketCapMin": 50,  # 亿
        "changeType": "all",
        "note": "适中筛选，风险收益平衡"
    },
    "成长型": {
        "description": "适合牛市或激进投资",
        "peMin": 0,
        "peMax": 50,
        "pbMin": 0,
        "pbMax": 10.0,
        "marketCapMin": 30,  # 亿
        "changeType": "all",
        "note": "宽松筛选，追求进攻"
    }
}


# ==================== 异步筛选核心逻辑 ====================

async def fetch_stock_data(stock: dict) -> Optional[dict]:
    """
    异步获取单只股票的完整数据（行情 + 指标）

    简化版本：只获取最新一天的数据，使用baostock稳定接口

    Args:
        stock: 股票基本信息 {code, name, industry, market}

    Returns:
        完整股票数据或None
    """
    code = stock['code']
    try:
        # 直接获取最新一天行情（不使用预热缓存）
        quote_data = await asyncio.to_thread(data_fetcher.get_stock_quote_latest, code)

        if not quote_data:
            return None  # 静默失败

        price = quote_data.get('price', 0)

        # 计算PE（使用baostock的epsTTM）
        pe = None
        if price and price > 0:
            pe = await asyncio.to_thread(pe_pb_calculator.get_stock_pe, code, price)

        # PB暂时不可用
        pb = None

        # 合并数据
        return {
            **stock,
            'price': price,
            'change': quote_data.get('change', 0),
            'volume': quote_data.get('volume', '0'),
            'pe': pe,  # 基于epsTTM计算
            'pb': pb,  # 暂时不可用
            'market_cap': '未知',  # 历史数据中没有市值
            'market_cap_value': 0
        }

    except Exception:
        return None  # 静默失败，不输出日志


def filter_stock(stock: dict, criteria: dict) -> bool:
    """
    根据条件筛选股票

    Args:
        stock: 股票数据
        criteria: 筛选条件

    Returns:
        是否符合条件
    """
    # PE筛选（如果PE为None或0，跳过PE筛选）
    pe_min = criteria.get('peMin')
    pe_max = criteria.get('peMax')
    pe = stock.get('pe')

    # 只有 PE 有效值（大于0）时才进行筛选
    if pe is not None and pe > 0:
        if pe_min is not None and pe < pe_min:
            return False
        if pe_max is not None and pe > pe_max:
            return False

    # PB筛选（暂时跳过，因为PB数据不可用）
    # pb_min = criteria.get('pbMin')
    # pb_max = criteria.get('pbMax')
    # pb = stock.get('pb')

    # 市值筛选（暂时跳过，因为市值数据不可用）
    # market_cap_min = criteria.get('marketCapMin')
    # market_cap_value = stock.get('market_cap_value', 0)
    # if market_cap_min is not None and market_cap_value < market_cap_min:
    #     return False

    # 涨跌幅筛选
    change_type = criteria.get('changeType', 'all')
    change = stock.get('change', 0)

    if change_type == 'up' and change <= 0:
        return False
    if change_type == 'down' and change >= 0:
        return False

    # 行业筛选
    industry = criteria.get('industry')
    if industry and industry != '全部':
        if stock.get('industry') != industry:
            return False

    return True


async def process_screening_task(task_id: str, criteria: ScreeningCriteria, final_criteria: dict):
    """
    异步处理筛选任务

    Args:
        task_id: 任务ID
        criteria: 原始筛选条件
        final_criteria: 应用策略后的最终筛选条件
    """
    try:
        logger.info(f"🚀 开始异步筛选任务: {task_id}")

        # 更新任务状态为处理中
        task = task_manager.get_task(task_id)
        if not task:
            logger.error(f"任务不存在: {task_id}")
            return

        task_manager.update_task(task_id, status=TaskStatus.PROCESSING)

        # 1. 获取股票列表
        all_stocks = data_fetcher.get_stock_list()
        if not all_stocks:
            raise Exception("获取股票列表失败")

        total = len(all_stocks)
        task_manager.update_task(task_id, total=total)

        logger.info(f"📊 开始筛选 {total} 只股票")

        # 2. 完全串行获取股票数据（避免触发接口限流）
        # 去掉所有并行，一次只处理一只股票
        BATCH_SIZE = 50
        all_results = []

        # 串行处理函数
        async def fetch_serial(stock, index):
            try:
                # 每次请求间隔0.3秒，避免触发限流
                if index > 0:
                    await asyncio.sleep(0.3)
                return await asyncio.wait_for(fetch_stock_data(stock), timeout=15.0)
            except asyncio.TimeoutError:
                return None  # 超时返回None，继续处理下一个

        # 不再预热全市场缓存，直接按需获取每只股票数据

        # 统计变量
        success_count = 0
        fail_count = 0

        for i in range(0, total, BATCH_SIZE):
            batch = all_stocks[i:i + BATCH_SIZE]
            batch_num = i // BATCH_SIZE + 1
            total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

            # 每5批次打印一次日志
            if batch_num % 5 == 0 or batch_num == 1:
                logger.info(f"处理批次 {batch_num}/{total_batches}")

            # 串行处理批次内的每只股票
            batch_results = []
            for idx, stock in enumerate(batch):
                result = await fetch_serial(stock, i + idx)
                if result is not None:
                    batch_results.append(result)
                    success_count += 1
                else:
                    fail_count += 1

            all_results.extend(batch_results)

            # 更新进度
            processed = min(i + BATCH_SIZE, total)
            task_manager.update_task(task_id, processed=processed)

            # 每5批次打印一次进度
            if batch_num % 5 == 0 or batch_num == total_batches:
                logger.info(f"✅ 已完成 {processed}/{total} ({processed*100//total}%) - 成功: {success_count}, 失败: {fail_count}")

        # 3. 打印数据获取汇总
        logger.info(f"📊 数据获取完成: 总计 {total} 只股票, 成功获取 {success_count} 只, 失败 {fail_count} 只")
        logger.info(f"💡 提示: 失败的 {fail_count} 只股票可能是退市、停牌或无近期数据")

        # 4. 应用筛选条件
        logger.info(f"🔍 开始应用筛选条件")
        filtered_stocks = [
            stock for stock in all_results
            if filter_stock(stock, final_criteria)
        ]

        logger.info(f"✅ 筛选完成: {len(filtered_stocks)}/{success_count} 只股票符合条件")

        # 5. 排序（按涨跌幅降序）
        filtered_stocks.sort(key=lambda x: x.get('change', 0), reverse=True)

        # 6. 添加ID
        for idx, stock in enumerate(filtered_stocks):
            stock['id'] = idx + 1

        # 7. 更新任务状态为完成
        task_manager.update_task(
            task_id,
            status=TaskStatus.COMPLETED,
            results=filtered_stocks
        )

        logger.info(f"🎉 筛选任务完成: {task_id}")

    except Exception as e:
        logger.error(f"❌ 筛选任务失败: {e}")
        task_manager.update_task(
            task_id,
            status=TaskStatus.FAILED,
            error=str(e)
        )


# ==================== API接口 ====================

@router.post("", response_model=ScreeningResponse)
async def screen_stocks(criteria: ScreeningCriteria):
    """
    执行股票筛选（异步）

    根据用户指定的策略和条件筛选股票

    - **strategy**: 策略类型（稳健型/平衡型/成长型）
    - **industry**: 行业筛选
    - **peMin/peMax**: 市盈率范围
    - **pbMin/pbMax**: 市净率范围
    - **marketCapMin**: 最小市值（亿）
    - **changeType**: 涨跌幅类型

    返回任务ID，通过 GET /screen/task/{task_id} 查询进度和结果
    """
    try:
        logger.info(f"📥 收到筛选请求: 策略={criteria.strategy}")

        # 应用策略预设值
        strategy_config = STRATEGY_CONFIGS.get(criteria.strategy, STRATEGY_CONFIGS["平衡型"])

        # 合并用户自定义条件
        final_criteria = {
            "peMin": criteria.peMin if criteria.peMin is not None else strategy_config["peMin"],
            "peMax": criteria.peMax if criteria.peMax is not None else strategy_config["peMax"],
            "pbMin": criteria.pbMin if criteria.pbMin is not None else strategy_config["pbMin"],
            "pbMax": criteria.pbMax if criteria.pbMax is not None else strategy_config["pbMax"],
            "marketCapMin": criteria.marketCapMin if criteria.marketCapMin is not None else strategy_config["marketCapMin"],
            "changeType": criteria.changeType if criteria.changeType != "all" else strategy_config["changeType"],
            "industry": criteria.industry if criteria.industry != "全部" else None
        }

        logger.info(f"筛选条件: {final_criteria}")

        # 生成任务ID
        task_id = f"screen_{int(datetime.now().timestamp())}"

        # 创建任务（立即返回，不等待）
        task_manager.create_task(task_id, final_criteria)

        # 使用asyncio.create_task启动真正的异步任务（不会阻塞响应）
        asyncio.create_task(
            process_screening_task(
                task_id,
                criteria,
                final_criteria
            )
        )

        logger.info(f"✅ 筛选任务已创建: {task_id}")

        # 立即返回响应
        return ScreeningResponse(
            taskId=task_id,
            status="pending",
            message=f"筛选任务已创建，任务ID: {task_id}"
        )

    except Exception as e:
        logger.error(f"创建筛选任务失败: {e}")
        raise HTTPException(status_code=500, detail=f"创建筛选任务失败: {str(e)}")


@router.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    查询筛选任务状态和结果

    - **task_id**: 任务ID

    返回任务进度、状态和结果（如果完成）
    """
    try:
        task = task_manager.get_task(task_id)

        if not task:
            raise HTTPException(status_code=404, detail=f"任务不存在: {task_id}")

        task_dict = task.to_dict()

        # 如果任务完成，返回结果
        results = None
        if task.status == TaskStatus.COMPLETED:
            results = [ScreeningResult(**r) for r in task.results]

        return TaskStatusResponse(
            taskId=task_dict['task_id'],
            status=task_dict['status'],
            total=task_dict['total'],
            processed=task_dict['processed'],
            progress=task_dict['progress'],
            resultCount=task_dict['result_count'],
            error=task_dict.get('error'),
            results=results
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"查询任务状态失败: {e}")
        raise HTTPException(status_code=500, detail=f"查询任务状态失败: {str(e)}")


@router.get("/tasks")
async def get_all_tasks():
    """
    获取所有任务列表

    返回所有筛选任务的列表
    """
    try:
        tasks = task_manager.get_all_tasks()
        return {"tasks": tasks}

    except Exception as e:
        logger.error(f"获取任务列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取任务列表失败: {str(e)}")


@router.get("/active")
async def get_active_task():
    """
    获取当前正在执行的任务

    返回最近一个未完成的任务，用于恢复页面时检查
    """
    try:
        task = task_manager.get_active_task()
        if not task:
            return {"active": False, "task": None}

        return {
            "active": True,
            "task": task.to_dict()
        }

    except Exception as e:
        logger.error(f"获取活动任务失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取活动任务失败: {str(e)}")


@router.post("/task/{task_id}/cancel")
async def cancel_task(task_id: str):
    """
    取消正在执行的任务

    - **task_id**: 任务ID

    用户离开筛选页面时可以选择取消任务
    """
    try:
        success = task_manager.cancel_task(task_id)

        if not success:
            raise HTTPException(status_code=404, detail=f"任务不存在: {task_id}")

        logger.info(f"✅ 用户取消任务: {task_id}")
        return {
            "message": "任务已取消",
            "taskId": task_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"取消任务失败: {e}")
        raise HTTPException(status_code=500, detail=f"取消任务失败: {str(e)}")


@router.get("/strategies")
async def get_strategies():
    """
    获取所有可用的筛选策略

    返回策略列表及其配置
    """
    try:
        strategies = []
        for name, config in STRATEGY_CONFIGS.items():
            strategies.append({
                "name": name,
                "description": config["description"],
                "config": {
                    "peMin": config["peMin"],
                    "peMax": config["peMax"],
                    "pbMin": config["pbMin"],
                    "pbMax": config["pbMax"],
                    "marketCapMin": config["marketCapMin"],
                    "changeType": config["changeType"],
                    "note": config["note"]
                }
            })

        logger.info(f"返回 {len(strategies)} 个策略")
        return {"strategies": strategies}

    except Exception as e:
        logger.error(f"获取策略列表失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取策略列表失败: {str(e)}")


@router.post("/update-pe-pb")
async def update_pe_pb_data(background_tasks: BackgroundTasks):
    """
    手动触发PE/PB数据批量更新

    更新所有股票的PE/PB数据到数据库（异步后台任务）

    返回任务ID，实际更新在后台进行
    """
    try:
        from app.services.pe_pb_updater import pe_pb_updater

        logger.info("收到PE/PB数据更新请求")

        # 使用后台任务异步执行
        def run_update():
            try:
                result = pe_pb_updater.update_all_pe_pb()
                logger.info(f"PE/PB数据更新完成: {result}")
                return result
            except Exception as e:
                logger.error(f"PE/PB数据更新失败: {e}")
                return {"error": str(e)}

        background_tasks.add_task(run_update)

        return {
            "message": "PE/PB数据更新任务已启动，正在后台执行",
            "note": "更新可能需要几分钟，请稍后查看结果"
        }

    except Exception as e:
        logger.error(f"启动PE/PB更新任务失败: {e}")
        raise HTTPException(status_code=500, detail=f"启动更新任务失败: {str(e)}")
