
import baostock as bs
import pandas as pd
import datetime

print(f"System date: {datetime.datetime.now()}")

try:
    lg = bs.login()
    print(f"Login code: {lg.error_code}, msg: {lg.error_msg}")
    
    if lg.error_code == '0':
        # Test 1: Query for 2026 (System "Now")
        print("\n--- Testing 2026 Data (System 'Now') ---")
        rs_2026 = bs.query_history_k_data_plus(
            "sh.600519",
            "date,code,close",
            start_date="2026-01-01",
            end_date="2026-01-30",
            frequency="d",
            adjustflag="3"
        )
        data_2026 = []
        while (rs_2026.error_code == '0') & rs_2026.next():
            data_2026.append(rs_2026.get_row_data())
        print(f"2026 Rows: {len(data_2026)}")
        
        # Test 2: Query for 2025 (Real "Now"?)
        print("\n--- Testing 2025 Data ---")
        rs_2025 = bs.query_history_k_data_plus(
            "sh.600519",
            "date,code,close",
            start_date="2025-01-01",
            end_date="2025-01-30",
            frequency="d",
            adjustflag="3"
        )
        data_2025 = []
        while (rs_2025.error_code == '0') & rs_2025.next():
            data_2025.append(rs_2025.get_row_data())
        print(f"2025 Rows: {len(data_2025)}")
        if data_2025:
            print(f"Sample 2025 data: {data_2025[0]}")

    bs.logout()
except Exception as e:
    print(f"Error: {e}")
