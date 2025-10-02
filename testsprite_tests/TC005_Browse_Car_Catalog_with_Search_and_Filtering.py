import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Click on 'Katalog Mobil' button to go to the car catalog page
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/nav/div/div/div[2]/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Input 'Toyota' in the search box to test search by brand
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div[2]/div/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Toyota')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div[2]/div/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Apply filters: Set price range, year, and type filters and apply them
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div[2]/div/div/div[2]/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Select '200 - 300 Juta' price range filter and apply the filter
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[2]/div/div/div[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Set year filter to 2023 and apply filters
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div[2]/div/div/div[2]/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2023')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div[2]/div/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Apply type filter (e.g., 'Manual' or 'Automatic') and apply filters
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div[2]/div/div/div[2]/div[2]/div/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Select 'Manual' transmission filter and apply filters
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[2]/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assertion: Verify that search results include matching vehicles with 'Toyota' in the name or brand
        search_results = [car for car in catalog_section['cars'] if 'Toyota' in car['name'] or 'Toyota' in car.get('dealer', '')]
        assert len(search_results) > 0, "No search results matching 'Toyota' found."
        # Assertion: Verify that filtered results meet all selected filter criteria
        for car in catalog_section['cars']:
            # Check price range filter: 200 - 300 Juta (200,000,000 to 300,000,000 IDR)
            price_str = car['price']['current'] if isinstance(car['price'], dict) else car['price']
            price_num = int(''.join(filter(str.isdigit, price_str)))
            assert 200000000 <= price_num <= 300000000, f"Car price {price_num} not in filter range 200-300 Juta."
            # Check year filter: 2023
            assert car['year'] == 2023, f"Car year {car['year']} does not match filter year 2023."
            # Check transmission filter: Manual
            assert car['transmission'].lower() == 'manual', f"Car transmission {car['transmission']} does not match filter 'Manual'."
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    