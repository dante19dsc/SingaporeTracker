import os
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime

# ==============================================================================
# NEW: GET CHROME PATH FROM ENVIRONMENT VARIABLE FOR GITHUB ACTIONS
# ==============================================================================
CHROME_PATH = os.environ.get('CHROME_EXECUTABLE_PATH')

# ==============================================================================
# FUNGSI PARSING TANGGAL
# ==============================================================================
def parse_promo_date_sg(date_text, competitor):
    # This function is unchanged
    try:
        if competitor == "Courts":
            cleaned_text = date_text.lower().replace("valid from", "").replace("valid till", "").strip()
            if ' - ' in cleaned_text:
                start_str, end_str = cleaned_text.split(' - ')
                try: end_date_obj = datetime.strptime(end_str.strip(), "%d %b %Y")
                except ValueError: end_date_obj = datetime.strptime(f"{end_str.strip()} {datetime.now().year}", "%d %b %Y")
                start_date_obj = datetime.strptime(f"{start_str.strip()} {end_date_obj.year}", "%d %b %Y")
                return start_date_obj.strftime("%Y-%m-%d"), end_date_obj.strftime("%Y-%m-%d")
            else:
                end_date_obj = datetime.strptime(cleaned_text.strip(), "%d %b %Y")
                return datetime.now().strftime("%Y-%m-%d"), end_date_obj.strftime("%Y-%m-%d")
        return "", ""
    except Exception as e:
        print(f"      - Gagal parse tanggal: '{date_text}' | Error: {e}")
        return "", ""

# ==============================================================================
# SCRAPER FUNCTIONS (UPDATED TO USE THE CHROME_PATH)
# ==============================================================================
def setup_driver(is_uc=True):
    """Initializes a Selenium driver, UC or standard."""
    options = webdriver.ChromeOptions() if not is_uc else uc.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--window-size=1920,1080")
    
    # This is the crucial part for GitHub Actions
    if CHROME_PATH:
        print(f"    - Using Chrome from path: {CHROME_PATH}")
        if is_uc:
            return uc.Chrome(options=options, browser_executable_path=CHROME_PATH)
        else:
            service = Service(executable_path=CHROME_PATH)
            return webdriver.Chrome(service=service, options=options)
    else: # Fallback for local execution
        print("    - Chrome path not specified, using default.")
        if is_uc:
            return uc.Chrome(options=options)
        else:
            return webdriver.Chrome(options=options)

def scrape_best_denki():
    print("\n--- Memulai Scrape Best Denki Singapore ---")
    driver = setup_driver(is_uc=True)
    url = "https://www.bestdenki.com.sg/bundle-promotions"; print(f"Mengunjungi URL: {url}...")
    promotions = []
    try:
        driver.get(url); WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.CLASS_NAME, "promotions"))); time.sleep(3)
        soup = BeautifulSoup(driver.page_source, 'html.parser'); promo_cards = soup.find_all('div', class_='promotions')
        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Best Denki.")
        for card in promo_cards:
            try:
                link = card.find('a'); title = link.find('img')['alt'].strip(); promo_url = link['href']
                promotions.append({"competitor": "Best Denki", "title": title, "startDate": "", "endDate": "", "details": "Click for details.", "url": promo_url})
            except: continue
    except Exception as e: print(f"Error saat mem-parsing Best Denki: {e}")
    finally: driver.quit()
    return promotions

def scrape_courts():
    print("\n--- Memulai Scrape Courts Singapore ---")
    driver = setup_driver(is_uc=False) # Standard selenium is fine here
    url = "https://www.courts.com.sg/hot-deals"; print(f"Mengunjungi URL: {url}...")
    promotions = []
    try:
        driver.get(url); WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.CLASS_NAME, "cms-promotion-box"))); time.sleep(3)
        soup = BeautifulSoup(driver.page_source, 'html.parser'); promo_cards = soup.find_all('div', class_='cms-promotion-box')
        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Courts.")
        for card in promo_cards:
            try:
                link = card.find('a'); title = card.find('p', class_='title').get_text(strip=True); validity = card.find('p', class_='date').get_text(strip=True)
                promo_url = link['href']; start_date, end_date = parse_promo_date_sg(validity, "Courts")
                promotions.append({"competitor": "Courts", "title": title, "startDate": start_date, "endDate": end_date, "details": validity, "url": promo_url})
            except: continue
    except Exception as e: print(f"Error saat mem-parsing Courts: {e}")
    finally: driver.quit()
    return promotions

def scrape_harvey_norman():
    print("\n--- Memulai Scrape Harvey Norman Singapore ---")
    driver = setup_driver(is_uc=True)
    url = "https://www.harveynorman.com.sg/promotions/catalogues-and-promotions.html"; print(f"Mengunjungi URL: {url}...")
    promotions = []
    try:
        driver.get(url); WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.CLASS_NAME, "item.promotion"))); time.sleep(3)
        soup = BeautifulSoup(driver.page_source, 'html.parser'); promo_cards = soup.find_all('li', class_='item promotion')
        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Harvey Norman.")
        for card in promo_cards:
            try:
                link = card.find('a', class_='product-item-link'); title = link.find('img')['alt'].strip(); promo_url = link['href']
                promotions.append({"competitor": "Harvey Norman", "title": title, "startDate": "", "endDate": "", "details": "See website for period.", "url": promo_url})
            except: continue
    except Exception as e: print(f"Error saat mem-parsing Harvey Norman: {e}")
    finally: driver.quit()
    return promotions

def scrape_gain_city():
    print("\n--- Memulai Scrape Gain City Singapore ---")
    driver = setup_driver(is_uc=True)
    url = "https://www.gaincity.com/national-day-sale"; print(f"Mengunjungi URL: {url}...")
    promotions = []
    try:
        driver.get(url); WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//script[@type='application/ld+json']"))); time.sleep(3)
        soup = BeautifulSoup(driver.page_source, 'html.parser'); json_ld_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string);
                if '@graph' in data:
                    for item in data['@graph']:
                        if item.get('@type') in ['Event', 'SaleEvent']:
                            title = item.get('name', 'No Title'); promo_url = item.get('url', 'No URL'); details = item.get('description', 'No details.')
                            start_date = item.get('startDate', '')[:10]; end_date = item.get('endDate', '')[:10]
                            promotions.append({"competitor": "Gain City", "title": title, "startDate": start_date, "endDate": end_date, "details": details, "url": promo_url})
            except: continue
        print(f"SUKSES! Menemukan {len(promotions)} promosi Gain City.")
    except Exception as e: print(f"Error saat mem-parsing Gain City: {e}")
    finally: driver.quit()
    return promotions

# ==============================================================================
# FUNGSI UPDATE JSONBIN.IO
# ==============================================================================
def update_jsonbin(data, bin_url, api_key):
    headers = {'Content-Type': 'application/json', 'X-Master-Key': api_key}
    try:
        print(f"\n--- Mengupdate data ke {bin_url} ---")
        # Add a check to prevent updating with empty data
        if not data:
            print("GAGAL! Daftar promosi kosong. Pembatalan update untuk mencegah penghapusan data.")
            return False
        response = requests.put(bin_url, headers=headers, data=json.dumps(data, indent=4))
        response.raise_for_status()
        print("SUKSES! Data di jsonbin.io berhasil diperbarui.")
        return True
    except requests.exceptions.RequestException as e:
        print(f"GAGAL! Error saat mengupdate jsonbin.io: {e}")
        return False

# ==============================================================================
# EKSEKUSI UTAMA
# ==============================================================================
if __name__ == "__main__":
    JSONBIN_URL = os.environ.get("JSONBIN_URL")
    JSONBIN_API_KEY = os.environ.get("JSONBIN_API_KEY")

    if not JSONBIN_URL or not JSONBIN_API_KEY:
        print("FATAL: Environment variables JSONBIN_URL and JSONBIN_API_KEY harus diatur."); exit(1)

    all_promotions = []
    all_promotions.extend(scrape_best_denki())
    all_promotions.extend(scrape_courts())
    all_promotions.extend(scrape_harvey_norman())
    all_promotions.extend(scrape_gain_city())

    all_promotions = [p for p in all_promotions if p]
    
    print(f"\nScraping Selesai. Total promosi: {len(all_promotions)}")
    update_jsonbin(all_promotions, JSONBIN_URL, JSONBIN_API_KEY)
