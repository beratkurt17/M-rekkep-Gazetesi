import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def inspect_page():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=chrome_options)
    try:
        driver.get("http://localhost:8000/index.html")
        time.sleep(2)
        
        # Execute script to inspect state
        state = driver.execute_script("""
            return {
                articlesCount: articles.length,
                articles: articles.map(a => ({ id: a.id, title: a.title, category: a.category })),
                layoutConfig: layoutConfig,
                slotArticleMap: _slotArticleMap,
                currentPage: currentPage,
                currentCategoryFilter: currentCategoryFilter
            };
        """)
        
        with open("scratch/inspected_state.json", "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
            
        print("Inspection state saved successfully.")
    except Exception as e:
        print("Error during inspection:", e)
    finally:
        driver.quit()

inspect_page()
