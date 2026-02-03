"""
PE/PB数据更新服务

定时任务：每天收盘后批量更新所有股票的PE/PB数据到数据库
"""
import akshare as ak
import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import StockQuote
from app.services.data_fetcher import disable_proxy
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PEPBUpdater:
    """PE/PB数据更新器"""

    def __init__(self):
        self.db = SessionLocal()

    def __del__(self):
        """关闭数据库连接"""
        if self.db:
            self.db.close()

    def update_all_pe_pb(self) -> dict:
        """
        批量更新所有股票的PE/PB数据

        使用akshare的stock_zh_a_spot_em接口一次性获取所有股票数据

        Returns:
            更新统计: {success: 成功数量, failed: 失败数量, total: 总数}
        """
        try:
            logger.info("开始批量更新PE/PB数据...")

            with disable_proxy():
                # 获取所有股票的实时行情（包含PE/PB）
                df = ak.stock_zh_a_spot_em()

            if df.empty:
                logger.warning("获取PE/PB数据失败：返回数据为空")
                return {"success": 0, "failed": 0, "total": 0}

            # 统计信息
            success_count = 0
            failed_count = 0
            total = len(df)

            # 遍历所有股票
            for _, row in df.iterrows():
                try:
                    code = row['代码']
                    pe = row['市盈率-动态']
                    pb = row['市净率']
                    price = row['最新价']

                    # 清理数据
                    try:
                        pe_val = float(pe) if pd.notna(pe) and pe != '-' else None
                    except (ValueError, TypeError):
                        pe_val = None

                    try:
                        pb_val = float(pb) if pd.notna(pb) and pb != '-' else None
                    except (ValueError, TypeError):
                        pb_val = None

                    try:
                        price_val = float(price) if pd.notna(price) else None
                    except (ValueError, TypeError):
                        price_val = None

                    # 查找数据库中的最新记录
                    existing_quote = self.db.query(StockQuote).filter(
                        StockQuote.stock_code == code
                    ).order_by(StockQuote.timestamp.desc()).first()

                    if existing_quote:
                        # 更新现有记录
                        existing_quote.pe = pe_val
                        existing_quote.pb = pb_val
                        if price_val is not None:
                            existing_quote.price = price_val
                        existing_quote.timestamp = datetime.now()
                    else:
                        # 创建新记录
                        new_quote = StockQuote(
                            stock_code=code,
                            price=price_val or 0.0,
                            pe=pe_val,
                            pb=pb_val,
                            timestamp=datetime.now()
                        )
                        self.db.add(new_quote)

                    success_count += 1

                    # 每100条提交一次
                    if success_count % 100 == 0:
                        self.db.commit()
                        logger.info(f"已更新 {success_count}/{total} 只股票")

                except Exception as e:
                    logger.warning(f"更新股票 {row.get('代码', 'unknown')} PE/PB失败: {e}")
                    failed_count += 1
                    continue

            # 最终提交
            self.db.commit()

            logger.info(f"✅ PE/PB数据更新完成: 成功 {success_count}, 失败 {failed_count}, 总计 {total}")

            return {
                "success": success_count,
                "failed": failed_count,
                "total": total
            }

        except Exception as e:
            logger.error(f"批量更新PE/PB数据失败: {e}")
            self.db.rollback()
            return {
                "success": 0,
                "failed": 0,
                "total": 0,
                "error": str(e)
            }

    def get_stock_pe_pb(self, code: str) -> dict:
        """
        从数据库获取股票的PE/PB数据

        Args:
            code: 股票代码

        Returns:
            {pe: float, pb: float}
        """
        try:
            quote = self.db.query(StockQuote).filter(
                StockQuote.stock_code == code
            ).order_by(StockQuote.timestamp.desc()).first()

            if quote:
                return {
                    "pe": quote.pe,
                    "pb": quote.pb
                }
            else:
                return {"pe": None, "pb": None}

        except Exception as e:
            logger.error(f"获取股票 {code} PE/PB失败: {e}")
            return {"pe": None, "pb": None}


# 创建全局实例
pe_pb_updater = PEPBUpdater()


def manual_update():
    """手动触发更新（用于测试）"""
    result = pe_pb_updater.update_all_pe_pb()
    print(f"更新结果: {result}")
    return result


if __name__ == "__main__":
    # 测试运行
    print("开始更新PE/PB数据...")
    result = manual_update()
    print(f"更新完成: {result}")
