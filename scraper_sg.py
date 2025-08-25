import os
import requests
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime

def setup_driver():
    """Initializes a Firefox WebDriver."""
    print("--- Setting up Firefox Driver ---")
    options = FirefoxOptions()
    options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    service = FirefoxService(executable_path="/usr/bin/geckodriver")
    return webdriver.Firefox(service=service, options=options)

def run_diagnostic(driver):
    """Runs a diagnostic test and saves artifacts."""
    # Test 1: Prove the browser works by visiting a neutral site
    try:
        print("\n--- DIAGNOSTIC STEP 1: Testing connection with Google.com ---")
        driver.get("https://www.google.com")
        print(f"    - Successfully loaded page. Title: '{driver.title}'")
        driver.save_screenshot("debug_google_success.png")
        print("    - Successfully saved screenshot: debug_google_success.png")
    except Exception as e:
        print(f"    - FATAL ERROR: Could not even connect to Google. Error: {e}")
        # If this fails, there's nothing more we can do with this environment.
        return

    # Test 2: Try to access the target site and capture the result
    target_url = "https://www.harveynorman.com.sg/promotions/catalogues-and-promotions.html"
    print(f"\n--- DIAGNOSTIC STEP 2: Attempting to access {target_url} ---")
    try:
        driver.get(target_url)
        # If it gets here without crashing, it means it worked!
        print("    - SUCCESS: Page loaded without crashing!")
        driver.save_screenshot("debug_harvey_norman_success.png")
        with open("debug_harvey_norman_success.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("    - Saved screenshot and HTML of successful page load.")

    except Exception as e:
        # This is where the crash has been happening. We will capture the state.
        print(f"    - ERROR: The browser failed as expected. Error: {e}")
        print("    - Attempting to save debug files...")
        try:
            # These files will show us the block page/CAPTCHA
            driver.save_screenshot("debug_harvey_norman_crashed.png")
            with open("debug_harvey_norman_crashed.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("    - Successfully saved screenshot and HTML from the failed page.")
        except Exception as save_e:
            print(f"    - Could not save debug files after crash. Error: {save_e}")

if __name__ == "__main__":
    driver = None
    try:
        driver = setup_driver()
        run_diagnostic(driver)
    except Exception as e:
        print(f"\nAn unexpected error occurred in the main execution block: {e}")
    finally:
        if driver:
            print("\n--- Shutting down driver ---")
            driver.quit()
    print("\n--- DIAGNOSTIC SCRIPT FINISHED ---")
