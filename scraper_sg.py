import os
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime

# --- Helper Functions ---
def parse_promo_date_sg(date_text, competitor):
    """Parses date strings from different Singaporean websites."""
    try:
        if competitor == "Courts":
            cleaned_text = date_text.lower().replace("valid from", "").replace("valid till", "").strip()
            if ' - ' in cleaned_text:
                start_str, end_str = cleaned_text.split(' - ')
                try:
                    end_date_obj = datetime.strptime(end_str.strip(), "%d %b %Y")
                except ValueError:
                    end_str_with_year = f"{end_str.strip()} {datetime.now().year}"
                    end_date_obj = datetime.strptime(end_str_with_year, "%d %b %Y")
                start_str_with_year = f"{start_str.strip()} {end_date_obj.year}"
                start_date_obj = datetime.strptime(start_str_with_year, "%d %b %Y")
                return start_date_obj.strftime("%Y-%m-%d"), end_date_obj.strftime("%Y-%m-%d")
            else:
                end_date_obj = datetime.strptime(cleaned_text.strip(), "%d %b %Y")
                return datetime.now().strftime("%Y-%m-%d"), end_date_obj.strftime("%Y-%m-%d")
        return "", ""
    except Exception as e:
        print(f"      - Could not parse date: '{date_text}' for {competitor} | Error: {e}")
        return "", ""

def setup_driver():
    """Initializes a robust Selenium WebDriver for GitHub Actions or local use."""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.binary_location = "/usr/bin/chromium-browser"

    service = Service()
        
    return webdriver.Chrome(service=service, options=options)

# --- Scraper Functions ---
def scrape_best_denki(driver):
    print("\n--- Scraping Best Denki ---")
    promotions = []
    try:
        driver.get("https://www.bestdenki.com.sg/bundle-promotions")
        WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.CLASS_NAME, "promotions-list")))
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        promo_cards = soup.find_all('div', class_='promotions')
        print(f"    - Found {len(promo_cards)} potential promotion cards.")
        for card in promo_cards:
            try:
                link = card.find('a')
                if not link: continue
                img = link.find('img')
                title = img['alt'].strip() if img else "No Title Found"
                promo_url = link['href']
                promotions.append({"competitor": "Best Denki", "title": title, "startDate": "", "endDate": "", "details": "Click for details.", "url": promo_url})
            except Exception as e:
                print(f"      - ERROR parsing a card: {e}")
                continue
    except Exception as e:
        print(f"    - FATAL ERROR for Best Denki: {e}")
    return promotions

def scrape_courts(driver):
    print("\n--- Scraping Courts ---")
    promotions = []
    try:
        driver.get("https://www.courts.com.sg/hot-deals")
        WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.CLASS_NAME, "cms-promotion-box")))
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        promo_cards = soup.find_all('div', class_='cms-promotion-box')
        print(f"    - Found {len(promo_cards)} potential promotion cards.")
        for card in promo_cards:
            try:
                link = card.find('a')
                title_tag = card.find('p', class_='title')
                validity_tag = card.find('p', class_='date')
                if not all([link, title_tag, validity_tag]): continue
                title = title_tag.get_text(strip=True)
                validity = validity_tag.get_text(strip=True)
                promo_url = link['href']
                start_date, end_date = parse_promo_date_sg(validity, "Courts")
                promotions.append({"competitor": "Courts", "title": title, "startDate": start_date, "endDate": end_date, "details": validity, "url": promo_url})
            except Exception as e:
                print(f"      - ERROR parsing a card: {e}")
                continue
    except Exception as e:
        print(f"    - FATAL ERROR for Courts: {e}")
    return promotions

def scrape_harvey_norman(driver):
    print("\n--- Scraping Harvey Norman ---")
    promotions = []
    try:
        driver.get("https://www.harveynorman.com.sg/promotions/catalogues-and-promotions.html")
        wait_selector = "li.item.promotion"
        WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.CSS_SELECTOR, wait_selector)))
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        promo_cards = soup.select(wait_selector)
        print(f"    - Found {len(promo_cards)} potential promotion cards.")
        for card in promo_cards:
            try:
                link = card.find('a', class_='product-item-link')
                if not link: continue
                img = link.find('img')
                title = img['alt'].strip() if img else "No Title Found"
                promo_url = link['href']
                promotions.append({"competitor": "Harvey Norman", "title": title, "startDate": "", "endDate": "", "details": "See website for period.", "url": promo_url})
            except Exception as e:
                print(f"      - ERROR parsing a card: {e}")
                continue
    except Exception as e:
        print(f"    - FATAL ERROR for Harvey Norman: {e}")
    return promotions

def scrape_gain_city(driver):
    print("\n--- Scraping Gain City ---")
    promotions = []
    try:
        driver.get("https://www.gaincity.com/promotions")
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//script[@type='application/ld+json']")))
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        found_promos = []
        for script in json_ld_scripts:
            if not script.string: continue
            try:
                data = json.loads(script.string)
                graph_items = data.get('@graph', []) if isinstance(data, dict) else []
                for item in graph_items:
                    if item.get('@type') in ['Event', 'SaleEvent']:
                        title = item.get('name', 'No Title')
                        promo_url = item.get('url', driver.current_url)
                        details = item.get('description', 'No details.')
                        start_date = item.get('startDate', '')[:10]
                        end_date = item.get('endDate', '')[:10]
                        found_promos.append({"competitor": "Gain City", "title": title, "startDate": start_date, "endDate": end_date, "details": details, "url": promo_url})
            except (json.JSONDecodeError, AttributeError):
                continue
        promotions.extend(found_promos)
        print(f"    - Found {len(promotions)} promotions from structured data.")
    except Exception as e:
        print(f"    - FATAL ERROR for Gain City: {e}")
    return promotions

# --- Main Execution ---
def update_jsonbin(data, bin_url, api_key):
    headers = {'Content-Type': 'application/json', 'X-Master-Key': api_key, 'X-Bin-Versioning': 'false'}
    print(f"\n--- Updating data to jsonbin.io ---")
    if not data:
        print("    - FAILED: Promotion list is empty. Aborting update to prevent data loss.")
        return False
    try:
        payload = {"record": data, "metadata": {"lastUpdate": datetime.utcnow().isoformat()}}
        response = requests.put(bin_url, headers=headers, data=json.dumps(payload, indent=4))
        response.raise_for_status()
        print("    - SUCCESS: Data updated on jsonbin.io.")
        return True
    except requests.exceptions.RequestException as e:
        print(f"    - FAILED: Could not update jsonbin.io. Error: {e}")
        if e.response is not None:
            print(f"    - Response Body: {e.response.text}")
        return False

if __name__ == "__main__":
    JSONBIN_URL = os.environ.get("JSONBIN_URL")
    JSONBIN_API_KEY = os.environ.get("JSONBIN_API_KEY")

    if not JSONBIN_URL or not JSONBIN_API_KEY:
        print("FATAL: Environment variables for jsonbin.io are not set.")
        exit(1)

    all_promotions = []
    driver = None
    try:
        driver = setup_driver()
        all_promotions.extend(scrape_best_denki(driver))
        all_promotions.extend(scrape_courts(driver))
        all_promotions.extend(scrape_harvey_norman(driver))
        all_promotions.extend(scrape_gain_city(driver))
    
    except Exception as e:
        print(f"\nAn unexpected error occurred in the main execution block: {e}")
    
    finally:
        if driver:
            driver.quit()

    all_promotions = [p for p in all_promotions if p]
    
    print(f"\nScraping complete. Total promotions found: {len(all_promotions)}")
    
    if all_promotions:
        update_jsonbin(all_promotions, JSONBIN_URL, JSONBIN_API_KEY)
    else:
        print("\nNo promotions found. Skipping JSONbin update.")
