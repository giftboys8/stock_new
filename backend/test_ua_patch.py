import requests
import logging
from app.services.data_fetcher import patch_requests_user_agent
import akshare as ak

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_patch_and_fetch():
    print("Testing User-Agent Patch...")
    
    # 1. Verify Patch
    s = requests.Session()
    # We can't easily check the header inside the session object without making a request
    # But we can check if requests.Session.request is patched
    print(f"requests.Session.request: {requests.Session.request}")
    
    # 2. Test akshare spot interface (which failed before)
    print("\nTesting ak.stock_zh_a_spot_em()...")
    try:
        df = ak.stock_zh_a_spot_em()
        print(f"Success! Got {len(df)} rows.")
        print(df.head(1))
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_patch_and_fetch()
