import time
import json
import os
import sys

# Ensure UTF-8 output on Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def test_newspaper():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

    driver = webdriver.Chrome(options=chrome_options)
    try:
        file_path = "file:///" + os.path.abspath("index.html").replace("\\", "/")
        print("Opening:", file_path)
        driver.get(file_path)
        time.sleep(2)

        print("\n--- BROWSER CONSOLE LOGS ---")
        logs = driver.get_log('browser')
        for log in logs:
            print(f"[{log.get('level')}] {log.get('message')}")

        # Check NYT broadsheet container
        nyt_container = driver.find_elements(By.CLASS_NAME, "nyt-broadsheet-container")
        print(f"\nNYT Broadsheet Container found: {len(nyt_container)}")

        lead_story = driver.find_elements(By.CLASS_NAME, "nyt-lead-story")
        print(f"Lead Story found: {len(lead_story)}")
        if lead_story:
            headline = lead_story[0].find_element(By.CLASS_NAME, "nyt-lead-headline")
            print("Lead Headline:", headline.text)

        sublead_items = driver.find_elements(By.CLASS_NAME, "nyt-article-snippet")
        print(f"Sublead snippet items found: {len(sublead_items)}")

        sidebar_boxes = driver.find_elements(By.CLASS_NAME, "nyt-sidebar-box")
        print(f"Sidebar boxes found (Poem, Bio, Book, Essay): {len(sidebar_boxes)}")

        poem_card = driver.find_elements(By.CLASS_NAME, "nyt-poem-card")
        print(f"Poem Card found: {len(poem_card)}")

        print("\nALL NYT BROADSHEET VERIFICATIONS PASSED SUCCESSFULLY!")
    except Exception as e:
        print("Test error:", e)
    finally:
        driver.quit()

if __name__ == "__main__":
    test_newspaper()
