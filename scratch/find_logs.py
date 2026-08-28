import subprocess
import sys

def test_imports():
    try:
        import selenium
        print("selenium is installed")
    except ImportError:
        print("selenium is NOT installed")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "selenium"])

test_imports()
