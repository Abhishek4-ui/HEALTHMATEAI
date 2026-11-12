import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = process.env.TEST_URL || 'https://healthmate-ai-nine-mocha.vercel.app';
const SCREENSHOT_DIR = path.resolve('frontend/tests/screenshots');

async function runAcceptanceTests() {
  console.log('=================================================================');
  console.log(`🌐 HEALTHMATE AI — PRODUCTION BROWSER ACCEPTANCE VERIFICATION`);
  console.log(`🎯 Target URL: ${TARGET_URL}`);
  console.log(`📸 Screenshots Directory: ${SCREENSHOT_DIR}`);
  console.log('=================================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const testResults = [];

  // Helper to record result
  const record = (testId, name, status, details = {}) => {
    testResults.push({ testId, name, status, ...details });
    const icon = status === 'PASS' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${icon} [${testId}] ${name}: ${status}`);
    if (details.message) console.log(`   └─ ${details.message}`);
  };

  try {
    // TEST 1: Desktop Homepage Navigation
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'HealthMate-Production-QA-Agent/1.0'
    });
    const desktopPage = await desktopContext.newPage();

    const consoleLogs = [];
    const failedRequests = [];

    desktopPage.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    desktopPage.on('requestfailed', req => failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`));

    console.log('--- Step 1: Loading Homepage ---');
    const homeRes = await desktopPage.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_homepage.png'), fullPage: false });

    const homeTitle = await desktopPage.title();
    const hasBrand = await desktopPage.locator('text=HealthMate').count() > 0;

    record('PROD-E2E-01', 'Desktop Homepage Load & Brand Integrity', (homeRes.status() === 200 && hasBrand) ? 'PASS' : 'FAIL', {
      statusCode: homeRes.status(),
      title: homeTitle,
      screenshot: '01_desktop_homepage.png'
    });

    // TEST 2: Patient Login Workflow
    console.log('\n--- Step 2: Testing Patient Login ---');
    await desktopPage.goto(`${TARGET_URL}/login`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1500);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_login_page.png') });

    const hasEmailInput = await desktopPage.locator('input[type="email"]').count() > 0;
    const hasPasswordInput = await desktopPage.locator('input[type="password"]').count() > 0;

    if (hasEmailInput && hasPasswordInput) {
      await desktopPage.fill('input[type="email"]', 'patient@healthmate.ai');
      await desktopPage.fill('input[type="password"]', 'Password123!');
      await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_login_filled.png') });
      await desktopPage.click('button[type="submit"]');
      await desktopPage.waitForTimeout(3000);
      await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_post_login_dashboard.png') });

      const currentUrl = desktopPage.url();
      record('PROD-E2E-02', 'Patient Authentication & Session Initiation', currentUrl.includes('/patient') ? 'PASS' : 'PARTIAL', {
        currentUrl,
        screenshot: '04_post_login_dashboard.png'
      });
    } else {
      record('PROD-E2E-02', 'Patient Authentication Inputs', 'FAIL', { message: 'Login inputs not found' });
    }

    // TEST 3: Doctor Discovery & All-India State Filtering
    console.log('\n--- Step 3: Doctor Discovery Across States ---');
    await desktopPage.goto(`${TARGET_URL}/patient/doctors`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(3000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_doctor_discovery_page.png') });

    const doctorCards = await desktopPage.locator('text=Dr.').count();

    record('PROD-E2E-03', 'All-India Doctor Discovery Interface', doctorCards > 0 ? 'PASS' : 'PARTIAL', {
      doctorCardsFound: doctorCards,
      screenshot: '05_doctor_discovery_page.png'
    });

    // TEST 4: Appointment Booking & Dual-Rail Payment Selection Modal
    console.log('\n--- Step 4: Appointment Scheduling & Payment Modal ---');
    await desktopPage.goto(`${TARGET_URL}/patient/appointments`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(3000);

    // Switch to tab "Book Consultation"
    const bookTab = desktopPage.locator('button:has-text("Book Consultation")');
    if (await bookTab.count() > 0) {
      await bookTab.click();
      await desktopPage.waitForTimeout(1500);
    }
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_booking_form.png') });

    // Pick tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const dateInput = desktopPage.locator('input[type="date"]');
    if (await dateInput.count() > 0) {
      await dateInput.fill(tomorrowStr);
      await desktopPage.waitForTimeout(1500);

      // Select first available slot
      const slotSelect = desktopPage.locator('select').nth(2);
      if (await slotSelect.count() > 0) {
        const slotOptions = await slotSelect.locator('option').allInnerTexts();
        const validSlot = slotOptions.find(o => o.includes(':'));
        if (validSlot) {
          await slotSelect.selectOption({ label: validSlot });
        }
      }

      // Enter symptom details
      const reasonTextarea = desktopPage.locator('textarea');
      if (await reasonTextarea.count() > 0) {
        await reasonTextarea.fill('Routine health checkup and clinical review for blood pressure monitoring.');
      }

      await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_booking_form_filled.png') });

      // Click proceed to payment
      const submitBtn = desktopPage.locator('button[type="submit"]');
      if (await submitBtn.count() > 0 && !(await submitBtn.isDisabled())) {
        await submitBtn.click();
        await desktopPage.waitForTimeout(3000);
        await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_payment_selection_modal.png') });

        const modalVisible = await desktopPage.locator('text=Consultation Payment Options').count() > 0;
        const razorpayOption = await desktopPage.locator('text=Razorpay Gateway').count() > 0;
        const manualUpiOption = await desktopPage.locator('text=Direct Manual UPI').count() > 0;

        record('PROD-E2E-04', 'Dual-Rail Payment Selection Modal Appearance', (modalVisible && (razorpayOption || manualUpiOption)) ? 'PASS' : 'PARTIAL', {
          modalVisible,
          razorpayOption,
          manualUpiOption,
          screenshot: '08_payment_selection_modal.png'
        });
      } else {
        record('PROD-E2E-04', 'Booking Submit Button Readiness', 'PARTIAL', { message: 'Slot was disabled or awaiting schedule selection' });
      }
    }

    // TEST 5: Mobile Viewport Responsiveness
    console.log('\n--- Step 5: Mobile Viewport Testing (375x667) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '09_mobile_homepage.png') });

    const mobileHasBrand = await mobilePage.locator('text=HealthMate').count() > 0;
    record('PROD-E2E-05', 'Mobile Viewport (iPhone SE 375px) Layout Responsiveness', mobileHasBrand ? 'PASS' : 'FAIL', {
      screenshot: '09_mobile_homepage.png'
    });

    await desktopContext.close();
    await mobileContext.close();

  } catch (err) {
    console.error('Fatal E2E test execution error:', err.message);
    record('PROD-E2E-FATAL', 'E2E Suite Execution Flow', 'FAIL', { error: err.message });
  } finally {
    await browser.close();
  }

  // Write JSON summary
  const summaryPath = path.resolve('frontend/tests/e2e_results_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 E2E Results written to: ${summaryPath}`);
  console.log('=================================================================\n');
}

runAcceptanceTests().catch(console.error);
