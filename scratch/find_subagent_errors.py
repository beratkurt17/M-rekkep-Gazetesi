from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

def check_browser():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

    driver = webdriver.Chrome(options=chrome_options)
    try:
        driver.get("http://localhost:8000/index.html")
        time.sleep(2)
        
        logs = driver.get_log('browser')
        log_lines = []
        for log in logs:
            log_lines.append(f"[{log.get('level')}] {log.get('message')}")
            
        body_text = driver.find_element(By.TAG_NAME, "body").text
        
        with open("scratch/browser_debug_output.txt", "w", encoding="utf-8") as f:
            f.write("=== Console Logs ===\n")
            f.write("\n".join(log_lines))
            f.write("\n\n=== Body Text Snippet ===\n")
            f.write(body_text[:1000])
            
        print("Debug output saved successfully.")
    except Exception as e:
        print("Error:", e)
    finally:
        driver.quit()

check_browser()
