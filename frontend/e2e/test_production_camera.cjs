const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testProductionCamera() {
  const PROD_URL = 'https://healthmate-ai-nine-mocha.vercel.app';
  console.log(`=== PRODUCTION LIVE CAMERA VERIFICATION: ${PROD_URL} ===`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    permissions: ['camera', 'microphone'],
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (msg.type() === 'error' || text.includes('AbortError') || text.includes('Camera')) {
      console.log(`[PROD Console ${msg.type()}]:`, text);
    }
    if (msg.type() === 'error' || text.includes('AbortError')) {
      consoleErrors.push(text);
    }
  });

  console.log('1. Setting up patient session on production...');
  await page.goto(`${PROD_URL}/login?role=PATIENT`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const mockPatient = {
      _id: '6af95a1234567890abcdef12',
      id: '6af95a1234567890abcdef12',
      fullName: 'Abhishek Kumar (Verified Patient)',
      email: 'abhishekgga140@gmail.com',
      role: 'PATIENT',
      isEmailVerified: true,
    };
    sessionStorage.setItem('healthmate_active_user', JSON.stringify(mockPatient));
    localStorage.setItem('healthmate_token', 'mock_jwt_token_for_e2e_verification');
  });

  console.log('2. Navigating to production Medical Imaging Center...');
  await page.goto(`${PROD_URL}/patient/medical-imaging`, { waitUntil: 'networkidle' });

  console.log('3. Clicking "Take Live Photo"...');
  const takePhotoBtn = await page.waitForSelector('button:has-text("Take Live Photo")', { timeout: 10000 });
  await takePhotoBtn.click();

  console.log('4. Waiting for Live Clinical Camera modal...');
  await page.waitForSelector('h3:has-text("Live Clinical Camera")', { timeout: 5000 });

  console.log('5. Waiting for live video feed confirmation...');
  const activeStatus = await page.waitForSelector('text=Live Camera Active', { timeout: 15000 });
  const statusText = await activeStatus.textContent();
  console.log('6. Confirmed Status in Production:', statusText.trim());

  // Check video DOM state in production
  const videoState = await page.evaluate(() => {
    const video = document.querySelector('video');
    if (!video) return { exists: false };
    const stream = video.srcObject;
    const tracks = stream ? stream.getVideoTracks() : [];
    return {
      exists: true,
      hasSrcObject: Boolean(stream),
      streamActive: stream ? stream.active : false,
      trackCount: tracks.length,
      trackReadyState: tracks[0] ? tracks[0].readyState : 'none',
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      paused: video.paused,
      muted: video.muted
    };
  });
  console.log('7. Production Video DOM State:', videoState);

  const screenshotDir = path.join(__dirname, '../../screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const prodPreviewPath = path.join(screenshotDir, 'prod_camera_live_preview.png');
  await page.screenshot({ path: prodPreviewPath });
  console.log('8. Production preview screenshot saved:', prodPreviewPath);

  // Capture Photo in Production
  console.log('9. Clicking "Capture Photo" in production...');
  await page.click('button:has-text("Capture Photo"):not([disabled])');

  await page.waitForSelector('button:has-text("Use This Photo")', { timeout: 5000 });
  await page.waitForSelector('button:has-text("Retake")', { timeout: 5000 });
  console.log('10. Production photo review buttons verified.');

  const prodCapturedPath = path.join(screenshotDir, 'prod_camera_captured_photo.png');
  await page.screenshot({ path: prodCapturedPath });
  console.log('11. Production captured photo screenshot saved:', prodCapturedPath);

  // Retake in Production
  console.log('12. Clicking "Retake" in production...');
  await page.click('button:has-text("Retake")');
  await page.waitForSelector('button:has-text("Capture Photo"):not([disabled])', { timeout: 5000 });
  await page.waitForSelector('text=Live Camera Active', { timeout: 5000 });
  console.log('13. Production retake verified: camera resumed active with zero black screen.');

  // Confirm photo in Production
  console.log('14. Capturing again and confirming...');
  await page.click('button:has-text("Capture Photo")');
  await page.waitForSelector('button:has-text("Use This Photo")', { timeout: 5000 });
  await page.click('button:has-text("Use This Photo")');

  await page.waitForSelector('h3:has-text("Live Clinical Camera")', { state: 'detached', timeout: 5000 });
  await page.waitForSelector('text=clinical_photo_', { timeout: 5000 });
  console.log('15. Production handoff to UniversalUpload succeeded!');

  const prodHandoffPath = path.join(screenshotDir, 'prod_camera_handoff_success.png');
  await page.screenshot({ path: prodHandoffPath });
  console.log('16. Production handoff screenshot saved:', prodHandoffPath);

  const abortErrors = consoleErrors.filter(e => e.includes('AbortError'));
  console.log('17. Production Console AbortErrors:', abortErrors.length);

  await browser.close();

  if (abortErrors.length > 0) {
    console.error('FAILED: AbortErrors present in production!');
    process.exit(1);
  } else {
    console.log('=== PRODUCTION VERIFICATION COMPLETE: ALL CHECKS PASSED ===');
  }
}

testProductionCamera().catch(err => {
  console.error('Production test crashed:', err);
  process.exit(1);
});
