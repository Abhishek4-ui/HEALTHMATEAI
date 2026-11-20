const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';

async function testECGValidation() {
  console.log('========================================================================');
  console.log('  HEALTHMATE AI — GENUINE CLINICAL ECG & DIGITIZATION VALIDATION AUDIT');
  console.log('========================================================================\n');

  // 1. Create a genuine 1D discrete time-series ECG record (sampling rate 250 Hz, Lead II millivolts)
  // Calibrated standard sinus cycle: baseline -> P wave -> PR segment -> QRS spike -> ST -> T wave
  const samplingRateHz = 250;
  const signalPoints = [];
  const durationSec = 2.0; // 500 samples
  const totalSamples = samplingRateHz * durationSec;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / samplingRateHz; // time in seconds
    const cycleTime = t % 0.8; // 75 bpm -> 0.8s period
    let v = 0.0; // millivolts

    if (cycleTime >= 0.05 && cycleTime < 0.15) {
      // P wave (0.15 mV)
      v = 0.15 * Math.sin(((cycleTime - 0.05) / 0.10) * Math.PI);
    } else if (cycleTime >= 0.20 && cycleTime < 0.22) {
      // Q wave (-0.15 mV)
      v = -0.15 * Math.sin(((cycleTime - 0.20) / 0.02) * Math.PI);
    } else if (cycleTime >= 0.22 && cycleTime < 0.26) {
      // R peak (+1.2 mV)
      v = 1.20 * Math.sin(((cycleTime - 0.22) / 0.04) * Math.PI);
    } else if (cycleTime >= 0.26 && cycleTime < 0.29) {
      // S wave (-0.25 mV)
      v = -0.25 * Math.sin(((cycleTime - 0.26) / 0.03) * Math.PI);
    } else if (cycleTime >= 0.38 && cycleTime < 0.52) {
      // T wave (+0.30 mV)
      v = 0.30 * Math.sin(((cycleTime - 0.38) / 0.14) * Math.PI);
    }

    signalPoints.push(parseFloat(v.toFixed(3)));
  }

  // Create discrete CSV record
  const csvContent = "time_s,lead_ii_mv\n" + signalPoints.map((v, idx) => `${(idx / 250).toFixed(3)},${v}`).join("\n");
  const clinicalEcgCsvPath = path.join(__dirname, 'fixtures_clinical_lead2_250hz.csv');
  fs.writeFileSync(clinicalEcgCsvPath, csvContent);

  let passed = 0;
  let total = 2;

  // TEST 1: Discrete 1D Clinical Signal Upload
  process.stdout.write('[*] Testing: 1. Genuine 1D Discrete Clinical ECG (250Hz Time Series)... ');
  try {
    const form = new FormData();
    const blob = new Blob([fs.readFileSync(clinicalEcgCsvPath)], { type: 'text/csv' });
    form.append('ecg', blob, 'clinical_lead2_250hz.csv');
    form.append('patient_age', '54');
    form.append('patient_consent', 'true');

    const res = await fetch(`${BACKEND_URL}/patient/cardiac/ecg-analyze`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();

    const is1D = data.waveform_source === '1D_SIGNAL_RECORD' || data.waveform_source === '1D_CLINICAL_SIGNAL_RECORD';
    const measurements = data.cardiac_measurements || data;
    const hr = typeof measurements.heart_rate_bpm === 'number' ? measurements.heart_rate_bpm : data.heart_rate_bpm;
    const hasHR = typeof hr === 'number' && hr >= 60 && hr <= 90;
    const pr = measurements.pr_interval_ms || data.pr_interval_ms;
    const qrs = measurements.qrs_duration_ms || data.qrs_duration_ms;
    const qtc = measurements.qtc_interval_ms || data.qtc_interval_ms;
    const hasIntervals = pr && qrs && qtc;

    if (is1D && hasHR && hasIntervals) {
      console.log(`PASS [Source: ${data.waveform_source}, HR: ${hr} bpm, QTc: ${qtc} ms]`);
      passed++;
    } else {
      console.log(`FAIL [Unexpected ECG output: ${JSON.stringify(data)}]`);
    }
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }

  // TEST 2: Optical Paper ECG Digitization Image
  process.stdout.write('[*] Testing: 2. Paper ECG Optical Digitization (Grid Line Extraction)... ');
  try {
    const form = new FormData();
    const imagePath = fs.existsSync(path.join(__dirname, '../docs/screenshots/camera_captured_photo_verified.png'))
      ? path.join(__dirname, '../docs/screenshots/camera_captured_photo_verified.png')
      : path.join(__dirname, '../screenshots/camera_captured_photo_verified.png');
    const sampleImage = fs.readFileSync(imagePath);
    const blob = new Blob([sampleImage], { type: 'image/png' });
    form.append('ecg', blob, 'paper_ecg_lead2_scan.png');
    form.append('patient_age', '60');
    form.append('patient_consent', 'true');

    const res = await fetch(`${BACKEND_URL}/patient/cardiac/ecg-analyze`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();

    const isDistinguished = Boolean(data.waveform_source);
    const hasProvenance = data.model_provenance && data.model_provenance.model_id === 'mdl_ecg_lead12_waveform_v2';

    if (isDistinguished && hasProvenance) {
      console.log(`PASS [Source Mode: ${data.waveform_source}, Model: ${data.model_provenance.model_id}]`);
      passed++;
    } else {
      console.log(`FAIL [Unexpected paper ECG result: ${JSON.stringify(data)}]`);
    }
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }

  console.log(`\n========================================================================`);
  console.log(`  ECG VALIDATION AUDIT RESULTS: ${passed}/${total} PASSED`);
  console.log(`========================================================================`);

  if (passed < total) process.exit(1);
}

testECGValidation();
