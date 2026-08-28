from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

def check_browser():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Enable browser logs
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

    print("Launching headless Chrome...")
    driver = webdriver.Chrome(options=chrome_options)
    try:
        print("Navigating to http://localhost:8000/index.html...")
        driver.get("http://localhost:8000/index.html")
        time.sleep(2)  # Wait for async loads
        
        print("\n--- Browser Console Logs ---")
        logs = driver.get_log('browser')
        for log in logs:
            print(f"[{log.get('level')}] {log.get('message')}")
            
        print("\n--- Page HTML Summary ---")
        body_text = driver.find_element(By.TAG_NAME, "body").text
        print("Body text snippet (first 500 chars):")
        print(body_text[:500])
        
        # Check if empty slot or articles are shown
        cards = driver.find_elements(By.CLASS_NAME, "article-card")
        print(f"\nNumber of article cards found: {len(cards)}")
        for idx, card in enumerate(cards[:5]):
            print(f"Card {idx}: {card.text[:100]}...")
            
    except Exception as e:
        print("Error during selenium check:", e)
    finally:
        driver.quit()

if __name__ == "__main__":
    check_browser()
