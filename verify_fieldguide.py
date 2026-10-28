import asyncio
import os
import sys
import threading

sys.stdout.reconfigure(encoding="utf-8")
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.async_api import async_playwright

PORT = 8089
BASE_URL = f"http://127.0.0.1:{PORT}"

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def run_server():
    server = HTTPServer(("127.0.0.1", PORT), QuietHandler)
    server.serve_forever()

async def run_tests():
    print(f"=== Starting Fieldguide End-to-End Verification on {BASE_URL} ===")
    
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    await asyncio.sleep(0.5)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: errors.append(f"CONSOLE ERROR: {msg.text}") if msg.type == "error" else None)

        # ----------------------------------------------------------------------
        # TEST 1: Ducks Guide (?guide=ducks)
        # ----------------------------------------------------------------------
        print("\n[TEST 1] Testing Ducks Guide (?guide=ducks)...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed article")

        cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Rendered duck cards: {len(cards)} (Expected 29)")
        assert len(cards) == 29, f"Expected 29 duck cards, got {len(cards)}"

        # Check two-row filter layout
        row1 = await page.query_selector("button[data-sex='all']")
        assert row1 is not None, "Row 1 (sex filters) missing"

        # Check 5-color beak swatches
        for color in ['blue', 'orange', 'yellow', 'black', 'red']:
            beak_btn = await page.query_selector(f"button[data-beak='{color}']")
            assert beak_btn is not None, f"Beak button for '{color}' missing"
            title = await beak_btn.get_attribute("title")
            assert title and len(title) > 5, f"Beak button '{color}' missing hover tooltip: {title}"
        print("  -> 5-color beak swatches present with hover tooltips.")

        # Check standing height gauges
        gauges = await page.query_selector_all("div[title*='Standing Stature']")
        assert len(gauges) == 29, f"Expected 29 standing height gauges, got {len(gauges)}"
        print("  -> Standing height gauges present on all 29 duck cards.")

        # Check dual plate/photo stages and image HTTP status (HTTP 200)
        img_check = await page.evaluate("""async () => {
          const imgs = Array.from(document.querySelectorAll('#speciesFeed img'));
          const results = await Promise.all(imgs.map(async img => {
            try {
              const res = await fetch(img.src);
              return { src: img.src, ok: res.ok, status: res.status };
            } catch (e) {
              return { src: img.src, ok: false, status: 0 };
            }
          }));
          const broken = results.filter(r => !r.ok);
          return { total: results.length, broken: broken.map(b => b.src) };
        }""")
        print(f"  -> Total images checked on ducks page: {img_check['total']}, Broken: {len(img_check['broken'])}")
        assert len(img_check['broken']) == 0, f"Broken images found: {img_check['broken']}"

        # Test photo mode toggle (Profile vs Crux)
        first_card_id = await cards[0].get_attribute("data-species-id")
        crux_btn = await page.query_selector(f"#card-{first_card_id} button[data-mode='crux']")
        if crux_btn:
            await crux_btn.click()
            await page.wait_for_timeout(200)
            print("  -> Photo toggle Profile/Crux clicked successfully.")

        # ----------------------------------------------------------------------
        # TEST 2: All Other Guides Rendering & Image Parity
        # ----------------------------------------------------------------------
        guides_to_test = [
            ("sparrows", 11),
            ("gulls", 19),
            ("shorebirds", 22),
            ("terns", 16),
            ("grebes", 14),
            ("swans", 14)
        ]

        for g_id, expected_count in guides_to_test:
            print(f"\n[TEST 2] Testing Guide '{g_id}' (?guide={g_id})...")
            await page.goto(f"{BASE_URL}/index.html?guide={g_id}")
            await page.wait_for_selector("#speciesFeed article")
            c = await page.query_selector_all("#speciesFeed article")
            print(f"  -> Rendered cards for {g_id}: {len(c)} (Expected {expected_count})")
            assert len(c) == expected_count, f"Expected {expected_count} cards for {g_id}, got {len(c)}"

            imgs = await page.evaluate("""async () => {
              const imgs = Array.from(document.querySelectorAll('#speciesFeed img'));
              const results = await Promise.all(imgs.map(async img => {
                try {
                  const res = await fetch(img.src);
                  return { src: img.src, ok: res.ok, status: res.status };
                } catch (e) {
                  return { src: img.src, ok: false, status: 0 };
                }
              }));
              const broken = results.filter(r => !r.ok);
              return { total: results.length, broken: broken.map(b => b.src) };
            }""")
            print(f"  -> Images on {g_id}: {imgs['total']} loaded, {len(imgs['broken'])} broken.")
            assert len(imgs['broken']) == 0, f"Broken images on {g_id}: {imgs['broken']}"

        # ----------------------------------------------------------------------
        # TEST 3: Dynamic Tab Switching (Zero Full Page Reloads)
        # ----------------------------------------------------------------------
        print("\n[TEST 3] Testing Dynamic Tab Switching...")
        await page.goto(f"{BASE_URL}/index.html?guide=sparrows")
        await page.wait_for_selector("#speciesFeed article")

        await page.evaluate("() => { window.__SPA_STAMP__ = 'active_spa_session'; }")

        ducks_tab = await page.query_selector("a[data-guide='ducks']")
        assert ducks_tab is not None, "Ducks tab link not found"
        await ducks_tab.click()
        await page.wait_for_timeout(300)

        url = page.url
        print(f"  -> URL after clicking Ducks tab: {url}")
        assert "guide=ducks" in url, f"Expected guide=ducks in URL, got {url}"

        stamp = await page.evaluate("() => window.__SPA_STAMP__")
        assert stamp == 'active_spa_session', "Full page reload occurred! SPA routing violated."
        print("  -> SPA stamp verified: Tab switch was instant client-side transition without page reload.")

        duck_cards = await page.query_selector_all("#speciesFeed article")
        assert len(duck_cards) == 29, f"Expected 29 duck cards after tab switch, got {len(duck_cards)}"

        # ----------------------------------------------------------------------
        # TEST 4: Query Parameter Filters (?species, ?sort, ?beak)
        # ----------------------------------------------------------------------
        print("\n[TEST 4] Testing Query Parameter Filters...")

        # 4A. ?species=mallard,wood_duck
        await page.goto(f"{BASE_URL}/index.html?guide=ducks&species=mallard,wood_duck")
        await page.wait_for_selector("#speciesFeed article")
        checklist_banner = await page.query_selector("#appFilterContainer")
        banner_text = await checklist_banner.inner_text()
        print("  -> Checklist banner text:", banner_text.replace('\n', ' ')[:100])
        assert "targeted checklist active" in banner_text.lower(), "Targeted Checklist Active banner missing"
        spec_cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Cards shown with ?species=mallard,wood_duck: {len(spec_cards)} (Expected 4 variants: Drake+Hen for each)")
        assert len(spec_cards) == 4, f"Expected 4 cards for mallard and wood duck, got {len(spec_cards)}"

        # 4B. ?sort=size-asc
        await page.goto(f"{BASE_URL}/index.html?guide=ducks&sort=size-asc")
        await page.wait_for_selector("#speciesFeed article")
        first_duck_name = await page.query_selector("#speciesFeed article h2")
        name_text = await first_duck_name.inner_text()
        print(f"  -> First duck with ?sort=size-asc: {name_text}")
        assert "Bufflehead" in name_text or "Teal" in name_text, f"Expected smallest duck first, got {name_text}"

        # 4C. ?beak=blue
        await page.goto(f"{BASE_URL}/index.html?guide=ducks&beak=blue")
        await page.wait_for_selector("#speciesFeed article")
        blue_beak_btn = await page.query_selector("button[data-beak='blue']")
        btn_class = await blue_beak_btn.get_attribute("class")
        assert "ring-2" in btn_class, f"Blue beak swatch should be active, class: {btn_class}"
        blue_cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Cards shown with ?beak=blue: {len(blue_cards)} (Expected 12 blue-beak species)")
        assert len(blue_cards) == 12, f"Expected 12 blue beak ducks, got {len(blue_cards)}"

        # ----------------------------------------------------------------------
        # TEST 5: Fullscreen Lightbox Modal & Smooth Navigation
        # ----------------------------------------------------------------------
        print("\n[TEST 5] Testing Fullscreen Lightbox Modal & Navigation...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed [data-action='lightbox']")

        lightbox_modal = await page.query_selector("#imageLightboxModal")
        assert "hidden" in (await lightbox_modal.get_attribute("class")), "Modal should initially be hidden"

        # Click the first image to open lightbox
        first_img_stage = await page.query_selector("#speciesFeed [data-action='lightbox']")
        await first_img_stage.click()
        await page.wait_for_timeout(200)

        modal_class = await lightbox_modal.get_attribute("class")
        assert "hidden" not in modal_class, "Modal should be visible after click"

        modal_title = await page.query_selector("#lightboxTitle")
        title_1 = await modal_title.inner_text()
        print(f"  -> Lightbox opened successfully for: {title_1}")

        # Check counter indicator
        counter_el = await page.query_selector("#lightboxCounter")
        counter_text = await counter_el.inner_text()
        print(f"  -> Lightbox counter: {counter_text}")
        assert "1 /" in counter_text or "1/" in counter_text, f"Unexpected counter: {counter_text}"

        # Check navigation button visibility and click Next
        next_btn = await page.query_selector("#lightboxNextBtn")
        assert "hidden" not in (await next_btn.get_attribute("class")), "Next button should be visible for multi-image feed"
        await next_btn.click()
        await page.wait_for_timeout(200)

        badge_el = await page.query_selector("#lightboxBadge")
        badge_text = await badge_el.inner_text()
        print(f"  -> Lightbox after Next: title='{await modal_title.inner_text()}', badge='{badge_text}'")

        # Test keyboard navigation (ArrowRight & ArrowLeft)
        await page.keyboard.press("ArrowRight")
        await page.wait_for_timeout(200)
        title_3 = await modal_title.inner_text()
        print(f"  -> Lightbox after ArrowRight: title='{title_3}'")

        await page.keyboard.press("ArrowLeft")
        await page.wait_for_timeout(200)
        print(f"  -> Lightbox after ArrowLeft: title='{await modal_title.inner_text()}'")

        # Press Esc to close
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(200)
        modal_class_after = await lightbox_modal.get_attribute("class")
        assert "hidden" in modal_class_after, "Modal should be hidden after pressing Escape"
        print("  -> Lightbox closed cleanly via Escape key.")

        # ----------------------------------------------------------------------
        # TEST 6: Legacy Redirects (?species, ?sort, ?beak preservation)
        # ----------------------------------------------------------------------
        print("\n[TEST 6] Testing Legacy HTML Redirects...")
        await page.goto(f"{BASE_URL}/ducks.html?species=mallard&sort=size-asc&beak=yellow")
        await page.wait_for_timeout(500)
        redirect_url = page.url
        print(f"  -> Redirect URL from ducks.html: {redirect_url}")
        assert "index.html?guide=ducks" in redirect_url, f"Expected redirect to index.html?guide=ducks, got {redirect_url}"
        assert "species=mallard" in redirect_url, "species parameter not preserved in redirect"
        assert "sort=size-asc" in redirect_url, "sort parameter not preserved in redirect"
        assert "beak=yellow" in redirect_url, "beak parameter not preserved in redirect"
        print("  -> Legacy redirect preserved all query parameters.")

        # ----------------------------------------------------------------------
        # TEST 7: Service Worker Registration & Cache
        # ----------------------------------------------------------------------
        print("\n[TEST 7] Testing Service Worker Registration...")
        await page.goto(f"{BASE_URL}/index.html")
        await page.wait_for_timeout(1000)
        sw_registered = await page.evaluate("""async () => {
          if (!('serviceWorker' in navigator)) return false;
          const reg = await navigator.serviceWorker.getRegistration();
          return Boolean(reg);
        }""")
        print(f"  -> ServiceWorker registered in browser: {sw_registered}")

        # ----------------------------------------------------------------------
        # TEST 8: Adversarial Test - Beak Filter Leak Isolation
        # ----------------------------------------------------------------------
        print("\n[TEST 8] Testing Beak Filter Leak Isolation across Guides...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks&beak=blue")
        await page.wait_for_selector("#speciesFeed article")
        duck_blue_cards = await page.query_selector_all("#speciesFeed article")
        assert len(duck_blue_cards) == 12, f"Expected 12 blue beak ducks, got {len(duck_blue_cards)}"

        # Switch to Sparrows tab
        sparrow_tab = await page.query_selector("a[data-guide='sparrows']")
        await sparrow_tab.click()
        await page.wait_for_timeout(300)

        # Verify Sparrows feed renders all 11 sparrows and is NOT emptied by beak=blue leak
        sparrow_cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Sparrow cards rendered after switching from ducks&beak=blue: {len(sparrow_cards)} (Expected 11)")
        assert len(sparrow_cards) == 11, f"Beak filter leaked! Expected 11 sparrows, got {len(sparrow_cards)}"
        assert "beak=" not in page.url, f"Duck beak parameter leaked into sparrows URL: {page.url}"
        print("  -> Beak filter correctly scoped; zero filter bleed across guides.")

        # ----------------------------------------------------------------------
        # TEST 9: Adversarial Test - Complex Multi-Token Query Filters
        # ----------------------------------------------------------------------
        print("\n[TEST 9] Testing Complex Multi-Token Query Filters...")
        # ?guide=ducks&species=wood_duck,norsho,teal&sort=size-desc&beak=orange,blue
        await page.goto(f"{BASE_URL}/index.html?guide=ducks&species=wood_duck,norsho,teal&sort=size-desc&beak=orange,blue")
        await page.wait_for_selector("#speciesFeed")
        complex_cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Complex filtered cards count: {len(complex_cards)}")
        assert len(complex_cards) == 1, f"Expected exactly 1 duck (Northern Shoveler Hen), got {len(complex_cards)}"
        shoveler_hen_name = await (await complex_cards[0].query_selector("h2")).inner_text()
        assert "Northern Shoveler (Hen)" in shoveler_hen_name, f"Expected Northern Shoveler (Hen), got {shoveler_hen_name}"
        print("  -> Multi-token combination correctly evaluated intersection.")

        # ----------------------------------------------------------------------
        # TEST 10: Adversarial Test - Nonexistent Checklist Filter Handling
        # ----------------------------------------------------------------------
        print("\n[TEST 10] Testing Nonexistent Checklist Filter Handling...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks&species=nonexistent_zebra")
        await page.wait_for_selector("#appFilterContainer")
        empty_banner = await page.query_selector("#appFilterContainer")
        empty_banner_text = await empty_banner.inner_text()
        print(f"  -> Nonexistent species banner: {empty_banner_text.replace(chr(10), ' ')[:80]}")
        assert "0 of 29 cards" in empty_banner_text.lower(), "Checklist banner should show 0 of 29 cards"

        # Check empty state button and click Show All
        show_all_btn = await page.query_selector("#clearChecklistBtn")
        assert show_all_btn is not None, "Show all button missing on banner"
        await show_all_btn.click()
        await page.wait_for_timeout(300)
        restored_cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Cards after Show All clicked: {len(restored_cards)} (Expected 29)")
        assert len(restored_cards) == 29, f"Expected 29 restored cards, got {len(restored_cards)}"

        # ----------------------------------------------------------------------
        # TEST 11: Adversarial Test - Hash Routing
        # ----------------------------------------------------------------------
        print("\n[TEST 11] Testing Hash Routing Fallbacks...")
        await page.goto(f"{BASE_URL}/index.html#ducks")
        await page.wait_for_selector("#speciesFeed article")
        hash_cards = await page.query_selector_all("#speciesFeed article")
        assert len(hash_cards) == 29, f"Expected 29 cards with #ducks, got {len(hash_cards)}"

        await page.goto(f"{BASE_URL}/index.html#guide=gulls")
        await page.wait_for_selector("#speciesFeed article")
        hash_gull_cards = await page.query_selector_all("#speciesFeed article")
        assert len(hash_gull_cards) == 19, f"Expected 19 cards with #guide=gulls, got {len(hash_gull_cards)}"
        print("  -> Hash routing #ducks and #guide=gulls successfully routed.")

        # ----------------------------------------------------------------------
        # TEST 12: Adversarial Test - Offline PWA Functionality
        # ----------------------------------------------------------------------
        print("\n[TEST 12] Testing Offline PWA Functionality...")
        # Give SW time to activate and pre-cache
        await page.goto(f"{BASE_URL}/index.html")
        await page.wait_for_timeout(2000)

        # Toggle offline mode in Playwright browser context
        await context.set_offline(True)
        print("  -> Browser context switched to OFFLINE mode.")

        # Navigate offline to index.html?guide=ducks
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed article")
        offline_duck_cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Offline duck cards rendered: {len(offline_duck_cards)} (Expected 29)")
        assert len(offline_duck_cards) == 29, f"Offline rendering failed! Expected 29 duck cards, got {len(offline_duck_cards)}"

        # Switch context back to online
        await context.set_offline(False)
        print("  -> Browser context restored to ONLINE mode.")

        # ----------------------------------------------------------------------
        # TEST 13: Universal Compare Matrix Feature
        # ----------------------------------------------------------------------
        print("\n[TEST 13] Testing Universal Compare Matrix Feature...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed article")

        # Click + Compare on Mallard Drake and Wood Duck Drake
        btn1 = (await page.query_selector_all("button[data-action='compare']"))[0]
        await btn1.click()
        await page.wait_for_timeout(300)

        # Re-query after feed re-render
        btn2 = (await page.query_selector_all("button[data-action='compare']"))[1]
        await btn2.click()
        await page.wait_for_timeout(300)

        tray = await page.query_selector("#comparisonTray")
        assert tray is not None, "Comparison tray element not found in DOM"
        assert "hidden" not in (await tray.get_attribute("class")), "Comparison tray should be visible"

        view_matrix_btn = await page.query_selector("#openCompareModalBtn")
        assert view_matrix_btn is not None, "View matrix button not found in tray"
        await view_matrix_btn.click()
        await page.wait_for_timeout(300)

        modal = await page.query_selector("#comparisonModal")
        assert "hidden" not in (await modal.get_attribute("class")), "Comparison modal should be visible"
        modal_cards = await page.query_selector_all("#compareModalBody > div > div")
        print(f"  -> Cards inside comparison modal: {len(modal_cards)} (Expected 2)")
        assert len(modal_cards) == 2, f"Expected 2 compared duck cards, got {len(modal_cards)}"

        # Close compare modal
        close_btn = await page.query_selector("#closeCompareModalBtn")
        await close_btn.click()
        await page.wait_for_timeout(200)
        assert "hidden" in (await modal.get_attribute("class")), "Comparison modal should be closed"
        # ----------------------------------------------------------------------
        # TEST 14: Adversarial Test - Photo Variant Switching
        # ----------------------------------------------------------------------
        print("\n[TEST 14] Testing Photo Variant Switching on Sparrows...")
        await page.goto(f"{BASE_URL}/index.html?guide=sparrows")
        await page.wait_for_selector("#card-white_throated_sparrow")
        wt_card = await page.query_selector("#card-white_throated_sparrow")
        wt_img = await wt_card.query_selector("img[alt*='Photo']")
        initial_img_src = await wt_img.get_attribute("src")
        assert "white_throated_white_striped" in initial_img_src, f"Expected initial White-Striped photo, got {initial_img_src}"

        # Click the 'Tan-Striped' variant button
        tan_btn = await wt_card.query_selector("button[data-action='switch-variant'][data-index='1']")
        assert tan_btn is not None, "Tan-Striped variant button not found on White-throated Sparrow"
        await tan_btn.click()
        await page.wait_for_timeout(300)

        # Re-query image and verify source updated to tan-striped variant
        wt_card_after = await page.query_selector("#card-white_throated_sparrow")
        wt_img_after = await wt_card_after.query_selector("img[alt*='Photo']")
        updated_img_src = await wt_img_after.get_attribute("src")
        print(f"  -> Photo src before: {initial_img_src}")
        print(f"  -> Photo src after variant click: {updated_img_src}")
        assert "white_throated_tan_striped" in updated_img_src, f"Photo failed to switch to Tan-Striped! Got {updated_img_src}"
        print("  -> Photo variant successfully switched image stage dynamically.")

        # ----------------------------------------------------------------------
        # TEST 15: Adversarial Test - Clean Apostrophe Rendering in Lightbox
        # ----------------------------------------------------------------------
        print("\n[TEST 15] Testing Clean Apostrophe Rendering in Lightbox...")
        # Lincoln's Sparrow
        await page.goto(f"{BASE_URL}/index.html?guide=sparrows")
        await page.wait_for_selector("#card-lincolns_sparrow")
        linc_card = await page.query_selector("#card-lincolns_sparrow")
        linc_stage = await linc_card.query_selector("[data-action='lightbox']")
        await linc_stage.click()
        await page.wait_for_timeout(200)

        lightbox_title = await page.inner_text("#lightboxTitle")
        print(f"  -> Lightbox title for Lincoln's Sparrow: {repr(lightbox_title)}")
        assert "\\" not in lightbox_title, f"Apostrophe was corrupted with escaped backslash: {lightbox_title}"
        assert lightbox_title == "Lincoln's Sparrow", f"Expected \"Lincoln's Sparrow\", got {lightbox_title}"

        # Close lightbox
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(200)
        print("  -> Lightbox rendered clean unescaped apostrophe without backslashes.")

        # ----------------------------------------------------------------------
        # TEST 16: Adversarial Test - Bidirectional Filter URL Synchronization
        # ----------------------------------------------------------------------
        print("\n[TEST 16] Testing Bidirectional Filter URL Synchronization...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed article")

        # Click Drake filter button
        drake_btn = await page.query_selector("button[data-sex='drake']")
        await drake_btn.click()
        await page.wait_for_timeout(200)
        assert "sex=drake" in page.url, f"sex=drake not synchronized to URL: {page.url}"

        # Click Rare status button
        rare_btn = await page.query_selector("button[data-rarity='rare']")
        await rare_btn.click()
        await page.wait_for_timeout(200)
        assert "rarity=rare" in page.url, f"rarity=rare not synchronized to URL: {page.url}"
        print(f"  -> URL after selecting Drake + Rare: {page.url}")

        # Reload page and verify filters persist
        await page.reload()
        await page.wait_for_selector("#speciesFeed article")
        persisted_cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Cards after reload with URL filters: {len(persisted_cards)}")
        assert len(persisted_cards) == 2, f"Expected 2 rare drakes (Eurasian Wigeon Drake & Tufted Duck Drake), got {len(persisted_cards)}"

        # Click Reset button and verify URL parameters are wiped
        reset_btn = await page.query_selector("#resetFiltersBtn")
        await reset_btn.click()
        await page.wait_for_timeout(200)
        assert "sex=" not in page.url and "rarity=" not in page.url, f"Filters not cleared from URL after reset: {page.url}"
        reset_cards = await page.query_selector_all("#speciesFeed article")
        assert len(reset_cards) == 29, f"Expected 29 cards after reset, got {len(reset_cards)}"
        print("  -> Bidirectional URL filter synchronization and full reset verified.")

        # ----------------------------------------------------------------------
        # TEST 17: Adversarial Test - In-SPA Popstate History Filter Reset
        # ----------------------------------------------------------------------
        print("\n[TEST 17] Testing In-SPA History Back-Forward Filter Reset...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed article")
        assert len(await page.query_selector_all("#speciesFeed article")) == 29

        # Push filtered state in-SPA
        await page.evaluate('''() => {
            history.pushState(null, '', '?guide=ducks&rarity=rare');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }''')
        await page.wait_for_timeout(300)
        assert len(await page.query_selector_all("#speciesFeed article")) == 4

        # Go back in history
        await page.go_back()
        await page.wait_for_timeout(400)
        cards_after_back = len(await page.query_selector_all("#speciesFeed article"))
        print(f"  -> Cards after go_back() in history: {cards_after_back} (Expected 29)")
        assert cards_after_back == 29, f"Filter stayed stuck after go_back! Expected 29, got {cards_after_back}"
        print("  -> In-SPA history back-forward popstate filter restoration verified.")

        # ----------------------------------------------------------------------
        # TEST 18: Adversarial Test - Comparison Modal & Tray Feed Desynchronization
        # ----------------------------------------------------------------------
        print("\n[TEST 18] Testing Comparison Modal & Feed Card Synchronization...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed article")

        # Add Mallard Drake to comparison
        cmp_btn = await page.query_selector("#card-mallard_drake button[data-action='compare']")
        await cmp_btn.click()
        await page.wait_for_timeout(200)
        card_text_1 = await (await page.query_selector("#card-mallard_drake button[data-action='compare']")).inner_text()
        assert "Compared" in card_text_1, f"Expected button to show Compared, got {card_text_1}"

        # Clear comparison via tray clear button
        tray_clear = await page.query_selector("#comparisonTray button[onclick*='clearComparison']")
        assert tray_clear is not None, "Tray clear button missing"
        await tray_clear.click()
        await page.wait_for_timeout(200)

        # Feed card must immediately reflect that comparison was cleared
        card_text_2 = await (await page.query_selector("#card-mallard_drake button[data-action='compare']")).inner_text()
        print(f"  -> Mallard Drake compare button text after tray clear: {repr(card_text_2)}")
        assert "+ Compare" in card_text_2, f"Feed card remained stuck in Compared state: {card_text_2}"
        print("  -> Comparison tray and feed card state perfectly synchronized.")

        # ----------------------------------------------------------------------
        # TEST 19: Adversarial Test - Hash Route Migration
        # ----------------------------------------------------------------------
        print("\n[TEST 19] Testing Hash Route Migration without Losing Guide...")
        await page.goto(f"{BASE_URL}/index.html#ducks")
        await page.wait_for_selector("#speciesFeed article")
        # Change sort to size-asc
        await page.select_option("#sortSelect", "size-asc")
        await page.wait_for_timeout(300)
        print(f"  -> URL after selecting sort on #ducks: {page.url}")
        assert "guide=ducks" in page.url, f"Active guide lost during URL parameter update: {page.url}"
        assert "sort=size-asc" in page.url, f"Sort parameter missing from URL: {page.url}"
        duck_cards_after_sort = await page.query_selector_all("#speciesFeed article")
        assert len(duck_cards_after_sort) == 29, f"Expected 29 duck cards, got {len(duck_cards_after_sort)}"
        print("  -> Hash route migration successfully retained active guide.")

        # ----------------------------------------------------------------------
        # TEST 20: Adversarial Test - Invalid Guide Fallback & Active Tab Scope
        # ----------------------------------------------------------------------
        print("\n[TEST 20] Testing Invalid Guide Fallback (?guide=penguins)...")
        await page.goto(f"{BASE_URL}/index.html?guide=penguins")
        await page.wait_for_selector("#speciesFeed article")
        active_tab = await page.query_selector("[role='tab'][aria-selected='true']")
        assert active_tab is not None, "No active tab selected on invalid guide fallback"
        active_tab_text = await active_tab.inner_text()
        print(f"  -> Active tab on fallback: {active_tab_text}")
        assert "Sparrows" in active_tab_text, f"Expected Sparrows tab active on fallback, got {active_tab_text}"

        # Test sparrow filter functionality after fallback
        streaked_btn = await page.query_selector("button[data-fork='streaked']")
        assert streaked_btn is not None, "Sparrow breast fork buttons missing on fallback"
        await streaked_btn.click()
        await page.wait_for_timeout(300)
        streaked_cards = await page.query_selector_all("#speciesFeed article")
        print(f"  -> Streaked sparrows on fallback: {len(streaked_cards)} (Expected 5)")
        assert len(streaked_cards) == 5, f"Expected 5 streaked sparrows, got {len(streaked_cards)}"
        print("  -> Invalid guide fallback correctly normalized and scoped to Sparrows.")

        # ----------------------------------------------------------------------
        # TEST 21: Adversarial Test - Comparison Modal Escape Dismissal & Auto-Close
        # ----------------------------------------------------------------------
        print("\n[TEST 21] Testing Comparison Modal Escape Dismissal & Auto-Close...")
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed article")

        # Add 1 duck
        btn_cmp = await page.query_selector("#card-mallard_drake button[data-action='compare']")
        await btn_cmp.click()
        await page.wait_for_timeout(200)

        # Open compare modal
        view_matrix = await page.query_selector("#openCompareModalBtn")
        await view_matrix.click()
        await page.wait_for_timeout(200)
        cmp_modal = await page.query_selector("#comparisonModal")
        assert "hidden" not in (await cmp_modal.get_attribute("class")), "Comparison modal should be visible"

        # Press Escape key to test modal dismissal
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(200)
        assert "hidden" in (await cmp_modal.get_attribute("class")), "Comparison modal failed to close on Escape key"
        print("  -> Comparison modal dismissed cleanly via Escape key.")

        # Reopen compare modal
        await view_matrix.click()
        await page.wait_for_timeout(200)
        assert "hidden" not in (await cmp_modal.get_attribute("class")), "Comparison modal should be visible again"

        # Click remove inside modal for the only card
        remove_in_modal = await page.query_selector("#compareModalBody button")
        assert remove_in_modal is not None, "Remove button inside modal not found"
        await remove_in_modal.click()
        await page.wait_for_timeout(300)

        # Modal must automatically close and body overflow restored
        assert "hidden" in (await cmp_modal.get_attribute("class")), "Comparison modal stayed stuck open after removing last card!"
        body_classes = await page.evaluate("() => document.body.className")
        assert "overflow-hidden" not in body_classes, f"Body stayed frozen with overflow-hidden: {body_classes}"
        print("  -> Comparison modal auto-closed and unlocked body scroll after last card removed.")

        # ----------------------------------------------------------------------
        # TEST 22: Adversarial Test - Hash Route Parameters (#guide=ducks&sort=size-asc)
        # ----------------------------------------------------------------------
        print("\n[TEST 22] Testing Hash Route Query Parameters...")
        await page.goto(f"{BASE_URL}/index.html#guide=ducks&sort=size-asc")
        await page.wait_for_selector("#speciesFeed article")
        duck_cards_h1 = await page.query_selector_all("#speciesFeed article")
        active_tab_h1 = await (await page.query_selector("[role='tab'][aria-selected='true']")).inner_text()
        print(f"  -> Hash #guide=ducks&sort=size-asc rendered {len(duck_cards_h1)} cards (Active tab: {active_tab_h1})")
        assert len(duck_cards_h1) == 29, f"Expected 29 duck cards, got {len(duck_cards_h1)}"
        assert "Ducks" in active_tab_h1, f"Expected Ducks tab active, got {active_tab_h1}"
        first_duck = await (await page.query_selector("#speciesFeed article h2")).inner_text()
        assert "Bufflehead" in first_duck or "Teal" in first_duck, f"Expected sort=size-asc to order smallest duck first, got {first_duck}"

        await page.goto(f"{BASE_URL}/index.html#ducks?sort=size-desc")
        await page.wait_for_selector("#speciesFeed article")
        duck_cards_h2 = await page.query_selector_all("#speciesFeed article")
        assert len(duck_cards_h2) == 29, f"Expected 29 duck cards for #ducks?sort=size-desc, got {len(duck_cards_h2)}"
        first_large_duck = await (await page.query_selector("#speciesFeed article h2")).inner_text()
        assert "Pintail" in first_large_duck or "Mallard" in first_large_duck or "Canvasback" in first_large_duck or "Merganser" in first_large_duck, f"Expected large duck first, got {first_large_duck}"
        print("  -> Hash routing with query parameters successfully routed and sorted.")

        # ----------------------------------------------------------------------
        # TEST 23: Adversarial Test - Empty Feed Reset URL Cleanliness
        # ----------------------------------------------------------------------
        print("\n[TEST 23] Testing Empty Feed Reset All Filters URL Cleanliness...")
        # Impossible combination in sparrows: streaked breast + pink bill (Field sparrow is unstreaked)
        await page.goto(f"{BASE_URL}/index.html?guide=sparrows&breast=streaked&traits=pink_bill")
        await page.wait_for_selector("#emptyResetBtn")
        assert len(await page.query_selector_all("#speciesFeed article")) == 0, "Expected 0 matching sparrows"

        empty_reset = await page.query_selector("#emptyResetBtn")
        await empty_reset.click()
        await page.wait_for_timeout(300)

        assert "breast=" not in page.url, f"breast parameter not cleared after empty reset: {page.url}"
        assert "traits=" not in page.url, f"traits parameter not cleared after empty reset: {page.url}"
        assert len(await page.query_selector_all("#speciesFeed article")) == 11, "Expected all 11 sparrows restored"
        print("  -> Empty state reset button cleaned URL parameters and restored all cards.")

        # ----------------------------------------------------------------------
        # TEST 24: Adversarial Test - Hotkey 'P' Suppressed When Modal Open
        # ----------------------------------------------------------------------
        print("\n[TEST 24] Testing Hotkey 'P' Suppressed When Modal Open...")
        await page.goto(f"{BASE_URL}/index.html?guide=sparrows")
        await page.wait_for_selector("#speciesFeed article")

        # Open lightbox
        first_img = await page.query_selector("#speciesFeed [data-action='lightbox']")
        await first_img.click()
        await page.wait_for_timeout(200)

        # Press 'P' while lightbox is open
        await page.keyboard.press("p")
        await page.wait_for_timeout(200)

        # Close lightbox
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(200)

        # Asset mode should still be 'both', not flipped
        asset_both_btn = await page.query_selector("#assetBothBtn")
        assert "text-white" in (await asset_both_btn.get_attribute("class")), "Hotkey 'P' incorrectly fired while Lightbox was open!"
        print("  -> Hotkey 'P' safely suppressed while modal dialog is open.")

        # Check console errors
        print(f"\n[ERROR CHECK] Page errors: {len(errors)}")
        if errors:
            print("Errors logged:", errors)
        assert len(errors) == 0, f"Encountered runtime errors: {errors}"

        # Capture Desktop and Mobile screenshots for visual verification
        os.makedirs("test-results", exist_ok=True)
        await page.set_viewport_size({"width": 1280, "height": 800})
        await page.goto(f"{BASE_URL}/index.html?guide=ducks")
        await page.wait_for_selector("#speciesFeed article")
        await page.screenshot(path="test-results/Desktop-Ducks-preview.png", full_page=False)

        await page.set_viewport_size({"width": 390, "height": 844})
        await page.screenshot(path="test-results/Mobile-Ducks-preview.png", full_page=False)

        await page.goto(f"{BASE_URL}/index.html?guide=sparrows")
        await page.wait_for_selector("#speciesFeed article")
        await page.screenshot(path="test-results/Mobile-Sparrows-preview.png", full_page=False)

        await browser.close()

    print("\n✅ ALL 24 ADVERSARIAL AND ACCEPTANCE CRITERIA VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
