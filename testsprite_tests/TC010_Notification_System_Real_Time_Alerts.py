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
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
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
        # Trigger low stock event to generate a notification.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Trigger bulk order status update event to generate a notification.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/nav/div/a[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Trigger bulk order status update event to generate a notification.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/main/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Trigger system message event to generate a notification.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Open Notification Center to review alert details and verify system message notification.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Dismiss notifications one by one and verify they clear correctly.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[2]/div/div/div[2]/div/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Dismiss the next notification and verify it clears correctly.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[2]/div/div/div[2]/div[2]/div/div[2]/div/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Dismiss the last remaining notification and verify it clears correctly.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[2]/div/div/div[2]/div[2]/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Dismiss the remaining Low Stock Alert notification and verify it clears correctly.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[2]/div/div/div[2]/div/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert notifications appear immediately in the Notification Center after triggering events.
        notifications_locator = frame.locator('xpath=//div[contains(@class, "notification-center")]//div[contains(@class, "notification-item")]')
        await notifications_locator.first.wait_for(state='visible', timeout=5000)
        assert await notifications_locator.count() > 0, "Expected at least one notification to appear in the Notification Center."
        
        # Open Notification Center and review alert details.
        notification_center_button = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[2]/div/button').nth(0)
        await notification_center_button.click()
        await frame.wait_for_timeout(1000)  # wait for notification center to open
        
        # Verify alerts provide accurate information by checking notification text content.
        notification_texts = []
        count = await notifications_locator.count()
        for i in range(count):
            notification_text = await notifications_locator.nth(i).inner_text()
            notification_texts.append(notification_text)
        assert any("low stock" in text.lower() for text in notification_texts), "Low stock notification not found or incorrect."
        assert any("order update" in text.lower() or "order status" in text.lower() for text in notification_texts), "Order update notification not found or incorrect."
        assert any("system message" in text.lower() for text in notification_texts), "System message notification not found or incorrect."
        
        # Dismiss notifications one by one and verify they clear correctly.
        for i in range(count):
            dismiss_button = notifications_locator.nth(0).locator('button')
            await dismiss_button.click()
            await frame.wait_for_timeout(1000)  # wait for notification to clear
        assert await notifications_locator.count() == 0, "Expected all notifications to be dismissed and cleared."
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    