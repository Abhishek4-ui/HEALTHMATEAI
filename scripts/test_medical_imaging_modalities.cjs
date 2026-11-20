const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1/ai';

async function runModalityTests() {
  console.log('========================================================================');
  console.log('  HEALTHMATE AI — MULTI-MODALITY IMAGING & ANATOMICAL SEQUESTRATION TEST');
  console.log('========================================================================\n');

  // Create a minimal 1x1 or test buffer representing an image
  const dummyScan = Buffer.from('RIFF....WEBPVP8 ...HEALTHMATE_TEST_SCAN_BYTES_1234567890_CLINICAL_VALIDATION_SAMPLE');

  const testCases = [
    {
      name: 'Chest X-Ray (CXR_STANDARD)',
      modality: 'XRAY',
      examination_id: 'CXR_STANDARD',
      expectedSupported: true,
      expectedFinding: 'Lung Parenchyma Expansion'
    },
    {
      name: 'Head & Skull Radiograph (SKULL)',
      modality: 'XRAY',
      examination_id: 'SKULL',
      expectedSupported: false,
      expectedStatus: 'MANDATORY_RADIOLOGIST_REVIEW'
    },
    {
      name: 'Lumbar Spine Radiograph (LUMBAR_SPINE)',
      modality: 'XRAY',
      examination_id: 'LUMBAR_SPINE',
      expectedSupported: false,
      expectedStatus: 'MANDATORY_RADIOLOGIST_REVIEW'
    },
    {
      name: 'Knee Radiograph (KNEE_STANDARD)',
      modality: 'XRAY',
      examination_id: 'KNEE_STANDARD',
      expectedSupported: false,
      expectedStatus: 'MANDATORY_RADIOLOGIST_REVIEW'
    },
    {
      name: 'Abdomen Radiograph (ABDOMEN_KUB)',
      modality: 'XRAY',
      examination_id: 'ABDOMEN_KUB',
      expectedSupported: false,
      expectedStatus: 'MANDATORY_RADIOLOGIST_REVIEW'
    },
    {
      name: 'Dental Radiograph (DENTAL_OPG)',
      modality: 'XRAY',
      examination_id: 'DENTAL_OPG',
      expectedSupported: false,
      expectedStatus: 'MANDATORY_RADIOLOGIST_REVIEW'
    },
    {
      name: 'Thoracic / Head CT Scan (CT_THORAX)',
      modality: 'CT',
      examination_id: 'CT_THORAX',
      expectedSupported: true,
      expectedModel: 'alg_ct_window_triage_v1'
    },
    {
      name: 'Brain MRI Scan (MRI_BRAIN)',
      modality: 'MRI',
      examination_id: 'MRI_BRAIN',
      expectedSupported: true,
      expectedModel: 'alg_mri_gradient_triage_v1'
    },
    {
      name: 'Abdominal Ultrasound (US_ABDOMEN)',
      modality: 'ULTRASOUND',
      examination_id: 'US_ABDOMEN',
      expectedSupported: true,
      expectedModel: 'alg_us_acoustic_triage_v1'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    process.stdout.write(`[*] Testing Modality: ${tc.name}... `);
    try {
      const form = new FormData();
      const blob = new Blob([dummyScan], { type: 'image/jpeg' });
      form.append('image', blob, 'sample_scan.jpg');
      form.append('modality', tc.modality);
      form.append('examination_id', tc.examination_id);
      form.append('patient_consent', 'true');

      const res = await fetch(`${BACKEND_URL}/patient/imaging/analyze`, {
        method: 'POST',
        body: form
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(`API returned success: false -> ${JSON.stringify(data)}`);
      }

      if (tc.expectedSupported === false) {
        if (data.ai_model_supported === false && data.doctor_review_status === tc.expectedStatus) {
          console.log(`PASS [Sequestration Enforced: ${data.doctor_review_status}]`);
          passed++;
        } else {
          console.log(`FAIL [Expected sequestration: ai_model_supported=false, got: ${data.ai_model_supported}]`);
          failed++;
        }
      } else {
        if (data.ai_model_supported !== false && data.findings && data.findings.length > 0) {
          const modelId = data.model_provenance ? data.model_provenance.model_id : 'N/A';
          console.log(`PASS [Model: ${modelId}, Findings Count: ${data.findings.length}]`);
          passed++;
        } else {
          console.log(`FAIL [Expected valid findings, got: ${JSON.stringify(data)}]`);
          failed++;
        }
      }
    } catch (e) {
      console.log(`ERROR [${e.message}]`);
      failed++;
    }
  }

  console.log(`\n========================================================================`);
  console.log(`  MODALITY AUDIT RESULTS: ${passed}/${testCases.length} PASSED, ${failed} FAILED`);
  console.log(`========================================================================`);

  if (failed > 0) process.exit(1);
}

runModalityTests();
