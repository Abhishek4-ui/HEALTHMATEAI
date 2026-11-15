const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testLiveCamera() {
  console.log('=== TEST LIVE CAMERA LIFECYCLE & FRAME RENDERING ===');
  
  // Launch Chromium with fake media device and auto-accept permissions
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

  // Listen to browser console logs and errors
  const consoleLogs = [];
  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (msg.type() === 'error' || text.includes('AbortError') || text.includes('Camera')) {
      console.log(`[Browser Console ${msg.type()}]:`, text);
    }
    if (msg.type() === 'error' || text.includes('AbortError')) {
      consoleErrors.push(text);
    }
  });

  // Establish authenticated patient session
  console.log('1. Establishing patient session...');
  await page.goto('http://localhost:5174/login?role=PATIENT');
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

  // Navigate directly to Medical Imaging Center where Live Camera is embedded
  console.log('2. Navigating to Medical Imaging Center (/patient/medical-imaging)...');
  await page.goto('http://localhost:5174/patient/medical-imaging', { waitUntil: 'networkidle' });

  // Find "Take Live Photo" button
  console.log('3. Locating "Take Live Photo" button...');
  const takePhotoBtn = await page.waitForSelector('button:has-text("Take Live Photo")', { timeout: 5000 });
  await takePhotoBtn.click();
  console.log('4. Clicked "Take Live Photo". Modal opening...');

  // Wait for Live Clinical Camera modal
  await page.waitForSelector('h3:has-text("Live Clinical Camera")', { timeout: 5000 });
  console.log('5. Live Clinical Camera modal is open.');

  // Check video element state and wait for "Live Camera Active"
  console.log('6. Waiting for live video frames and "Live Camera Active" status...');
  const activeStatus = await page.waitForSelector('text=Live Camera Active', { timeout: 10000 });
  const statusText = await activeStatus.textContent();
  console.log('7. Camera Status Confirmed:', statusText.trim());

  // Inspect video element properties directly in DOM
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
  console.log('8. Detailed Video Element DOM State:', videoState);

  // Take screenshot of live preview
  const screenshotDir = path.join(__dirname, '../../screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const previewPath = path.join(screenshotDir, 'camera_live_preview_verified.png');
  await page.screenshot({ path: previewPath });
  console.log('9. Live camera preview screenshot saved:', previewPath);

  // Verify Capture Photo
  console.log('10. Clicking "Capture Photo"...');
  const captureBtn = await page.waitForSelector('button:has-text("Capture Photo"):not([disabled])');
  await captureBtn.click();

  // Wait for Review UI ("Use This Photo" and "Retake")
  await page.waitForSelector('button:has-text("Use This Photo")', { timeout: 5000 });
  await page.waitForSelector('button:has-text("Retake")', { timeout: 5000 });
  console.log('11. Photo captured. Review buttons rendered.');

  // Verify captured image preview is visible
  const capturedImg = await page.$('img[alt="Captured Frame Preview"]');
  console.log('12. Captured frame image element present:', Boolean(capturedImg));

  const capturedPath = path.join(screenshotDir, 'camera_captured_photo_verified.png');
  await page.screenshot({ path: capturedPath });
  console.log('13. Captured photo screenshot saved:', capturedPath);

  // Test Retake Photo
  console.log('14. Clicking "Retake" to verify stream resumes without black screen...');
  const retakeBtn = await page.$('button:has-text("Retake")');
  await retakeBtn.click();

  // Wait for "Capture Photo" button to re-appear and video to be live
  await page.waitForSelector('button:has-text("Capture Photo"):not([disabled])', { timeout: 5000 });
  await page.waitForSelector('text=Live Camera Active', { timeout: 5000 });
  console.log('15. Retake successful. Camera resumed and active.');

  // Capture again and Confirm
  console.log('16. Capturing photo again for confirmation...');
  await page.click('button:has-text("Capture Photo")');
  await page.waitForSelector('button:has-text("Use This Photo")', { timeout: 5000 });

  console.log('17. Clicking "Use This Photo"...');
  await page.click('button:has-text("Use This Photo")');

  // Verify modal closed and file is loaded into UniversalUpload
  await page.waitForSelector('h3:has-text("Live Clinical Camera")', { state: 'detached', timeout: 5000 });
  console.log('18. Live Camera Modal closed smoothly.');

  // Check that the file was received in UniversalUpload
  await page.waitForSelector('text=clinical_photo_', { timeout: 5000 });
  console.log('19. File successfully passed to UniversalUpload and rendered in file card!');

  const finalPath = path.join(screenshotDir, 'camera_handoff_success.png');
  await page.screenshot({ path: finalPath });
  console.log('20. Final handoff screenshot saved:', finalPath);

  // Check for any AbortError in console errors
  const abortErrors = consoleErrors.filter(e => e.includes('AbortError'));
  console.log('21. Total console AbortErrors encountered:', abortErrors.length);

  await browser.close();

  if (abortErrors.length > 0) {
    console.error('FAILED: AbortError was detected in console!');
    process.exit(1);
  } else {
    console.log('=== TEST PASSED: CAMERA LIFECYCLE, RENDERING, RETAKE & UPLOAD SUCCEEDED WITH ZERO ABORTERRORS ===');
  }
}

testLiveCamera().catch(err => {
  console.error('Test crashed:', err);
  process.exit(1);
});
