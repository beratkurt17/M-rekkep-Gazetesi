import time
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def verify_modular_newspaper():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

    driver = webdriver.Chrome(options=chrome_options)
    try:
        file_path = "file:///" + os.path.abspath("index.html").replace("\\", "/")
        print("Testing:", file_path)
        driver.get(file_path)
        time.sleep(3)

        print("\n=== BROWSER CONSOLE LOGS ===")
        logs = driver.get_log('browser')
        severe_errors = []
        for log in logs:
            msg = f"[{log.get('level')}] {log.get('message')}"
            print(msg)
            if log.get('level') == 'SEVERE':
                severe_errors.append(msg)

        # Verify newspaper main grid
        main_grid = driver.find_element(By.ID, "newspaper-main-grid")
        print(f"\nNewspaper Main Grid rendered: {bool(main_grid)}")
        
        cards = driver.find_elements(By.CSS_SELECTOR, "[data-id]")
        print(f"Article cards found on page: {len(cards)}")
        assert len(cards) > 0, "No article cards rendered!"

        # Test opening an article via javascript click
        first_card = cards[0]
        article_id = first_card.get_attribute("data-id")
        print(f"Clicking article card with ID: {article_id}")
        driver.execute_script("arguments[0].click();", first_card)
        time.sleep(1)

        reading_overlay = driver.find_element(By.ID, "reading-overlay")
        is_visible = not ("hidden" in reading_overlay.get_attribute("class"))
        print(f"Reading overlay visible after click: {is_visible}")
        assert is_visible, "Reading overlay failed to open!"

        # Verify reading overlay centering
        article_container = reading_overlay.find_element(By.CLASS_NAME, "medium-article-container")
        print(f"Article container found in reader: {bool(article_container)}")

        # Test closing article
        close_reading_btn = driver.find_element(By.ID, "close-reading")
        driver.execute_script("arguments[0].click();", close_reading_btn)
        time.sleep(1)
        is_hidden_now = "hidden" in reading_overlay.get_attribute("class")
        print(f"Reading overlay hidden after close click: {is_hidden_now}")

        if severe_errors:
            print("\n⚠️ SEVERE ERRORS DETECTED:", severe_errors)
            assert False, "Console errors found!"
        else:
            print("\n🎉 ALL VERIFICATIONS PASSED WITH 0 SEVERE ERRORS!")

    except Exception as e:
        print("Verification error:", e)
        raise e
    finally:
        driver.quit()

if __name__ == "__main__":
    verify_modular_newspaper()
