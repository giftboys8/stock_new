import baostock as bs
import pandas as pd
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_baostock():
    lg = bs.login()
    print(f"Login code: {lg.error_code}, msg: {lg.error_msg}")

    code = "sh.600519" # Moutai
    
    # Logic from data_fetcher.py
    current_date = datetime.now()
    end_date = current_date.strftime("%Y-%m-%d")
    start_date = (current_date - timedelta(days=10)).strftime("%Y-%m-%d")
    
    print(f"Querying {code} from {start_date} to {end_date} (System year: {current_date.year})")
    
    rs = bs.query_history_k_data_plus(
        code,
        "date,code,open,high,low,close,preclose,volume,amount,pctChg",
        start_date=start_date,
        end_date=end_date,
        frequency="d",
        adjustflag="2"
    )
    
    data_list = []
    while (rs.error_code == '0') & rs.next():
        data_list.append(rs.get_row_data())
        
    print(f"Result count: {len(data_list)}")
    
    if not data_list and current_date.year > 2025:
        print("Empty result and year > 2025, trying 2025 fallback...")
        end_date_2025 = "2025-12-31"
        start_date_2025 = "2025-12-01"
        rs = bs.query_history_k_data_plus(
            code,
            "date,code,open,high,low,close,preclose,volume,amount,pctChg",
            start_date=start_date_2025,
            end_date=end_date_2025,
            frequency="d",
            adjustflag="2"
        )
        while (rs.error_code == '0') & rs.next():
            data_list.append(rs.get_row_data())
        print(f"Fallback result count: {len(data_list)}")

    if data_list:
        print("Last row:", data_list[-1])
    else:
        print("Still empty!")

    bs.logout()

if __name__ == "__main__":
    test_baostock()
