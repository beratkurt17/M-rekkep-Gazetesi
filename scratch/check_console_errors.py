import urllib.request
import json
import time

def check_console():
    print("Fetching http://localhost:8000/app.js to verify it loads...")
    try:
        req = urllib.request.urlopen("http://localhost:8000/app.js")
        print("app.js status:", req.status)
    except Exception as e:
        print("Error fetching app.js:", e)

check_console()
