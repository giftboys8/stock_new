"""
PE/PB计算服务 - 基于baostock数据计算

由于akshare接口不稳定，使用baostock数据计算PE/PB
- PE = 股价 / epsTTM（每股收益TTM）
- PB暂时返回None（需要每股净资产数据）
"""
import baostock as bs
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class PEpbCalculator:
    """PE/PB计算器"""

    def __init__(self):
        self.bs_logged_in = False
        self._login()

    def _login(self):
        """登录baostock"""
        try:
            lg = bs.login()
            if lg.error_code == '0':
                self.bs_logged_in = True
                logger.info("✅ baostock登录成功 (PE/PB计算器)")
            else:
                logger.warning(f"⚠️ baostock登录失败: {lg.error_msg}")
        except Exception as e:
            logger.warning(f"⚠️ baostock初始化失败: {e}")

    def __del__(self):
        """登出baostock"""
        if self.bs_logged_in:
            try:
                bs.logout()
            except:
                pass

    def get_stock_pe(self, code: str, price: float) -> Optional[float]:
        """
        计算股票PE（市盈率）

        PE = 股价 / epsTTM

        Args:
            code: 股票代码（如 '600519'）
            price: 当前股价

        Returns:
            PE值，失败返回None
        """
        if not self.bs_logged_in:
            logger.warning("baostock未登录，无法计算PE")
            return None

        if not price or price <= 0:
            return None

        try:
            # 转换股票代码格式
            bs_code = self._convert_to_baostock_code(code)

            # 获取最近几个季度的数据（从最近的季度开始尝试）
            now = datetime.now()
            current_year = now.year
            current_quarter = (now.month - 1) // 3 + 1

            # 尝试最近4个季度
            quarters_to_try = []
            for i in range(4):
                q = current_quarter - i
                y = current_year
                if q <= 0:
                    q += 4
                    y -= 1
                quarters_to_try.append((y, q))

            # 遍历尝试，直到找到数据
            eps_ttm = None
            for year, quarter in quarters_to_try:
                rs = bs.query_profit_data(code=bs_code, year=year, quarter=quarter)

                if rs.error_code != '0':
                    continue

                # 读取数据
                data_list = []
                while (rs.error_code == '0') & rs.next():
                    data_list.append(rs.get_row_data())

                if data_list:
                    # epsTTM在索引7
                    eps_ttm_str = data_list[0][7]
                    if eps_ttm_str and eps_ttm_str != '' and eps_ttm_str != '-':
                        eps_ttm = float(eps_ttm_str)
                        logger.debug(f"找到{code}的epsTTM: {year}Q{quarter} = {eps_ttm}")
                        break

            if not eps_ttm:
                logger.debug(f"股票{code}没有epsTTM数据")
                return None

            if eps_ttm <= 0:
                logger.debug(f"股票{code}的epsTTM为负或零: {eps_ttm}")
                return None

            # 计算PE
            pe = price / eps_ttm

            logger.debug(f"股票{code}: 股价={price}, epsTTM={eps_ttm}, PE={pe:.2f}")
            return round(pe, 2)

        except Exception as e:
            logger.warning(f"计算股票{code}的PE失败: {e}")
            return None

    def get_stock_pb(self, code: str, price: float) -> Optional[float]:
        """
        计算股票PB（市净率）

        PB = 股价 / 每股净资产

        注意：baostock目前不提供每股净资产数据，所以暂时返回None

        Args:
            code: 股票代码
            price: 当前股价

        Returns:
            PB值（暂时返回None）
        """
        # TODO: 寻找每股净资产数据源
        return None

    def _convert_to_baostock_code(self, code: str) -> str:
        """转换股票代码为baostock格式"""
        if code.startswith('6'):
            return f"sh.{code}"
        elif code.startswith('0') or code.startswith('3'):
            return f"sz.{code}"
        else:
            return code


# 创建全局实例
pe_pb_calculator = PEpbCalculator()
