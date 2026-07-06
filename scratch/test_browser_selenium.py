import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

# Enable browser logging
chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

try:
    driver = webdriver.Chrome(options=chrome_options)
    print("Navigating to http://localhost:8080/ ...")
    driver.get("http://localhost:8080/")
    
    # Wait for page scripts to run
    time.sleep(5)
    
    print("=== Browser Console Logs ===")
    for entry in driver.get_log('browser'):
        print(f"[{entry['level']}] {entry['message']}")
        
    print("=== HTML of main grid ===")
    grid = driver.find_element("id", "newspaper-main-grid")
    print("HTML length:", len(grid.get_attribute('innerHTML')))
    print(grid.get_attribute('innerHTML')[:500])
    
    driver.quit()
except Exception as e:
    print("Error running selenium:", e)
