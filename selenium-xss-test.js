import { Builder, By, until } from 'selenium-webdriver';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║      GANGA PHOTO STUDIO ERP — BROWSER UI SECURITY TEST (SELENIUM)            ║
 * ║      Target: DOM-Based XSS (html2pdf.js) in Order Invoices                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Threat Scenario:
 * An attacker (employee or owner) injects a malicious JavaScript payload into 
 * the 'notes' field of a customer order. When an owner views the invoice and 
 * clicks "Export PDF", if the application passes unsanitized React DOM straight 
 * into html2pdf.js, the payload might execute in the context of the current user.
 */
async function runXssTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  
  try {
    // 1. Login to the application
    await driver.get('http://localhost:5173/login');
    await driver.findElement(By.css('input[type="email"]')).sendKeys('owner@ganga.test');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('Owner@Secure1!');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for dashboard to load
    await driver.wait(until.urlContains('/dashboard'), 5000);
    
    // 2. Navigate to Create Order
    await driver.get('http://localhost:5173/dashboard/orders/new');
    
    // 3. Inject XSS payload into the 'notes' field
    // We use an image tag with an onerror handler because modern React escapes 
    // <script> tags, but html2pdf/html2canvas might evaluate rich HTML if dangerouslySetInnerHTML is used.
    const xssPayload = `<img src="x" onerror="document.title='XSS_VULNERABLE'; alert('XSS!')">`;
    
    // Fill out required order fields...
    // (Assume steps to fill customer, service, price here)
    
    const notesField = await driver.findElement(By.name('notes'));
    await notesField.sendKeys(xssPayload);
    
    // Submit the order
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/orders'), 5000);
    
    // 4. Navigate to the Order Invoice view (triggering the payload rendering)
    // Assuming the first order in the table is the one we just created
    await driver.findElement(By.css('table tbody tr:first-child a.view-invoice')).click();
    
    // Wait for the invoice page to render
    await driver.sleep(2000); 
    
    // 5. Trigger the PDF Export (html2pdf.js interaction)
    await driver.findElement(By.css('button.export-pdf')).click();
    
    // 6. ASSERTION: Check if the payload executed
    // If the document title changed to 'XSS_VULNERABLE' or an alert popped up, we have DOM-based XSS.
    
    try {
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      console.error('❌ FAIL: DOM-Based XSS Vulnerability confirmed! Alert fired with text:', alertText);
      await alert.accept();
    } catch (e) {
      // No alert found - good!
      const title = await driver.getTitle();
      if (title === 'XSS_VULNERABLE') {
        console.error('❌ FAIL: DOM-Based XSS Vulnerability confirmed! document.title was modified.');
      } else {
        console.log('✅ PASS: XSS payload did not execute. Input is properly sanitized.');
      }
    }
    
  } finally {
    await driver.quit();
  }
}

runXssTest();
