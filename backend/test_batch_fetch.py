
import akshare as ak
import pandas as pd
import time
import os

# Disable proxy
for k in ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']:
    if k in os.environ:
        del os.environ[k]

print("\n=== Testing Akshare Batch (Old) ===")
try:
    start = time.time()
    df = ak.stock_zh_a_spot()
    print(f"Success! Got {len(df)} rows in {time.time() - start:.2f}s")
    print("Columns:", df.columns.tolist())
    if not df.empty:
        print("First row:", df.iloc[0].to_dict())
except Exception as e:
    print(f"Failed: {e}")
