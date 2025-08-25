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
# FUNGSI PARSING TANGGAL - Disesuaikan untuk format SG
# ==============================================================================
def parse_promo_date_sg(date_text, competitor):
    """
    Parses different date formats found on Singaporean competitor websites.
    """
    try:
        if competitor == "Courts":
            # Format: "Valid from 15 Aug - 31 Aug 2025" or "Valid till 31 Aug 2025"
            cleaned_text = date_text.lower().replace("valid from", "").replace("valid till", "").strip()
            
            if ' - ' in cleaned_text:
                start_str, end_str = cleaned_text.split(' - ')
                
                try:
                    end_date_obj = datetime.strptime(end_str.strip(), "%d %b %Y")
                except ValueError: # If year is missing in end_str
                    end_str_with_year = f"{end_str.strip()} {datetime.now().year}"
                    end_date_obj = datetime.strptime(end_str_with_year, "%d %b %Y")
                
                start_str_with_year = f"{start_str.strip()} {end_date_obj.year}"
                start_date_obj = datetime.strptime(start_str_with_year, "%d %b %Y")
                return start_date_obj.strftime("%Y-%m-%d"), end_date_obj.strftime("%Y-%m-%d")
            else: # Handles "Valid till..." format
                end_date_obj = datetime.strptime(cleaned_text.strip(), "%d %b %Y")
                start_date_obj = datetime.now() # Assume promo starts now
                return start_date_obj.strftime("%Y-%m-%d"), end_date_obj.strftime("%Y-%m-%d")
        return "", ""
    except Exception as e:
        print(f"      - Gagal parse tanggal: '{date_text}' | Error: {e}")
        return "", ""

# ==============================================================================
# SCRAPER BEST DENKI SINGAPORE (BARU)
# ==============================================================================
def scrape_best_denki():
    print("\n--- Memulai Scrape Best Denki Singapore ---")
    options = uc.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = uc.Chrome(options=options)
    url = "https://www.bestdenki.com.sg/bundle-promotions"
    print(f"Mengunjungi URL: {url}...")
    
    promotions = []
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 20)
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "promotions")))
        time.sleep(3)
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')
        
        promo_cards = soup.find_all('div', class_='promotions')
        if not promo_cards:
            print("Tidak menemukan kartu promosi Best Denki.")
            return []

        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Best Denki.")
        for card in promo_cards:
            try:
                link_element = card.find('a')
                img_element = card.find('img')
                
                title = img_element['alt'].strip() if img_element and img_element.has_attr('alt') else 'No Title'
                promo_url = link_element['href'] if link_element else ''
                
                promo_data = {"competitor": "Best Denki", "title": title, "startDate": "", "endDate": "", "details": "Click for promotion details and validity.", "url": promo_url}
                promotions.append(promo_data)
            except Exception as e:
                print(f"      - Gagal memproses kartu promosi Best Denki: {e}")
                continue
    except Exception as e:
        print(f"Error saat navigasi atau mem-parsing Best Denki: {e}")
    finally:
        driver.quit()
    return promotions

# ==============================================================================
# SCRAPER COURTS SINGAPORE (URL & LOGIC DIPERBARUI)
# ==============================================================================
def scrape_courts():
    print("\n--- Memulai Scrape Courts Singapore ---")
    service = Service() 
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    url = "https://www.courts.com.sg/hot-deals"
    print(f"Mengunjungi URL: {url}...")
    
    promotions = []
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 20)
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "cms-promotion-box")))
        time.sleep(3)
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')
        
        promo_cards = soup.find_all('div', class_='cms-promotion-box')
        if not promo_cards:
            print("Tidak menemukan kartu promosi Courts.")
            return []
            
        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Courts.")
        for card in promo_cards:
            try:
                link_element = card.find('a')
                title = card.find('p', class_='title').get_text(strip=True)
                validity = card.find('p', class_='date').get_text(strip=True)
                promo_url = link_element['href']
                
                start_date, end_date = parse_promo_date_sg(validity, "Courts")
                
                promo_data = {"competitor": "Courts", "title": title, "startDate": start_date, "endDate": end_date, "details": validity, "url": promo_url}
                promotions.append(promo_data)
            except Exception as e:
                print(f"      - Gagal memproses kartu promosi Courts: {e}")
                continue
    except Exception as e:
        print(f"Error saat navigasi browser Courts: {e}")
    finally:
        driver.quit()
    return promotions

# ==============================================================================
# SCRAPER HARVEY NORMAN SINGAPORE (URL & LOGIC DIPERBARUI)
# ==============================================================================
def scrape_harvey_norman():
    print("\n--- Memulai Scrape Harvey Norman Singapore ---")
    options = uc.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = uc.Chrome(options=options)
    url = "https://www.harveynorman.com.sg/promotions/catalogues-and-promotions.html"
    print(f"Mengunjungi URL: {url}...")
    
    promotions = []
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 20)
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "item.promotion")))
        time.sleep(3)
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')
        
        promo_cards = soup.find_all('li', class_='item promotion')
        if not promo_cards:
            print("Tidak menemukan kartu promosi Harvey Norman.")
            return []

        print(f"SUKSES! Menemukan {len(promo_cards)} promosi Harvey Norman.")
        for card in promo_cards:
            try:
                link_element = card.find('a', class_='product-item-link')
                title = link_element.find('img')['alt'].strip()
                promo_url = link_element['href']
                
                promo_data = {"competitor": "Harvey Norman", "title": title, "startDate": "", "endDate": "", "details": "See website for promotion period.", "url": promo_url}
                promotions.append(promo_data)
            except Exception as e:
                print(f"      - Gagal memproses kartu promosi Harvey Norman: {e}")
                continue
    except Exception as e:
        print(f"Error saat navigasi atau mem-parsing Harvey Norman: {e}")
    finally:
        driver.quit()
    return promotions

# ==============================================================================
# SCRAPER GAIN CITY SINGAPORE (URL DIPERBARUI)
# ==============================================================================
def scrape_gain_city():
    print("\n--- Memulai Scrape Gain City Singapore ---")
    options = uc.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = uc.Chrome(options=options)
    url = "https://www.gaincity.com/national-day-sale"
    print(f"Mengunjungi URL: {url}...")
    
    promotions = []
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 20)
        wait.until(EC.presence_of_element_located((By.XPATH, "//script[@type='application/ld+json']")))
        time.sleep(3)
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')

        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                if '@graph' in data:
                    for item in data['@graph']:
                        if item.get('@type') in ['Event', 'SaleEvent']:
                            title = item.get('name', 'No Title')
                            promo_url = item.get('url', 'No URL')
                            details = item.get('description', 'No details available.')
                            start_date = item.get('startDate', '')[:10]
                            end_date = item.get('endDate', '')[:10]
                            
                            promo_data = {"competitor": "Gain City", "title": title, "startDate": start_date, "endDate": end_date, "details": details, "url": promo_url}
                            promotions.append(promo_data)
            except (json.JSONDecodeError, AttributeError, KeyError):
                continue
                
        if not promotions:
            print("Tidak menemukan data promosi JSON-LD di Gain City.")
            return []

        print(f"SUKSES! Menemukan {len(promotions)} promosi Gain City dari data terstruktur.")

    except Exception as e:
        print(f"Error saat navigasi atau mem-parsing Gain City: {e}")
    finally:
        driver.quit()
    return promotions

# ==============================================================================
# EKSEKUSI UTAMA (URUTAN DIPERBARUI)
# ==============================================================================
if __name__ == "__main__":
    all_promotions = []
    
    best_denki_promos = scrape_best_denki()
    all_promotions.extend(best_denki_promos)

    courts_promos = scrape_courts()
    all_promotions.extend(courts_promos)

    harvey_norman_promos = scrape_harvey_norman()
    all_promotions.extend(harvey_norman_promos)
    
    gain_city_promos = scrape_gain_city()
    all_promotions.extend(gain_city_promos)

    all_promotions = [p for p in all_promotions if p]
    
    output_file = 'promotions_sg.json'
    with open(output_file, 'w') as f:
        json.dump(all_promotions, f, indent=4)
        
    print(f"\nScraping Selesai. Data disimpan ke {output_file}")
    print(f"Total promosi yang berhasil di-parse: {len(all_promotions)}")
