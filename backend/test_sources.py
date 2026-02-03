
import akshare as ak
import baostock as bs
import pandas as pd
from datetime import datetime, timedelta
import os
import time

def test_akshare_spot():
    print("Testing akshare stock_zh_a_spot...")
    try:
        # Disable proxy
        for k in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']:
            if k in os.environ:
                del os.environ[k]
        
        start = time.time()
        df = ak.stock_zh_a_spot()
        print(f"Success! Got {len(df)} rows in {time.time() - start:.2f}s")
        if not df.empty:
            print("Sample row:", df.iloc[0].to_dict())
    except Exception as e:
        print(f"Failed: {e}")

def test_baostock_history(code="sz.000895"):
    print(f"Testing baostock history for {code}...")
    lg = bs.login()
    print(f"Login: {lg.error_code} {lg.error_msg}")
    
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d")
    print(f"Date range: {start_date} to {end_date}")
    
    rs = bs.query_history_k_data_plus(
        code,
        "date,code,open,high,low,close,preclose,volume,amount,pctChg",
        start_date=start_date,
        end_date=end_date,
        frequency="d",
        adjustflag="2"
    )
    
    print(f"Query Error: {rs.error_code} {rs.error_msg}")
    data_list = []
    while (rs.error_code == '0') & rs.next():
        data_list.append(rs.get_row_data())
        
    print(f"Got {len(data_list)} rows")
    if data_list:
        print("Last row:", data_list[-1])
    else:
        print("No data found!")
        
    bs.logout()

if __name__ == "__main__":
    test_akshare_spot()
    print("-" * 20)
    test_baostock_history()
