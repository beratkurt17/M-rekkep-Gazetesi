import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def inspect_html():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=chrome_options)
    try:
        driver.get("http://localhost:8000/index.html")
        time.sleep(2)
        
        # Get grid innerHTML
        grid_html = driver.execute_script("return document.getElementById('newspaper-main-grid').innerHTML;")
        print("Length of grid HTML:", len(grid_html))
        
        with open("scratch/inspected_html.txt", "w", encoding="utf-8") as f:
            f.write(grid_html)
            
        print("HTML saved successfully.")
    except Exception as e:
        print("Error:", e)
    finally:
        driver.quit()

inspect_html()
