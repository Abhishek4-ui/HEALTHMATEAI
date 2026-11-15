// Verification script for HealthMate AI DICOM Engine
import { 
  parseDicomBinary, 
  evaluateMprFeasibility, 
  CLINICAL_WINDOW_PRESETS 
} from '../src/utils/dicomEngine.js';

function createMockDicomBuffer({
  magic = 'DICM',
  transferSyntax = '1.2.840.10008.1.2.1', // Explicit VR Little Endian
  modality = 'CT',
  patientName = 'DOE^JOHN',
  rows = 16,
  cols = 16,
  rescaleSlope = 1.0,
  rescaleIntercept = -1024.0,
  windowCenter = 40.0,
  windowWidth = 400.0,
  includePixelData = true
} = {}) {
  // 128 bytes preamble + 4 bytes magic
  const parts = [];
  
  // Preamble 128 bytes
  const preamble = new Uint8Array(128);
  parts.push(preamble);

  // Magic
  if (magic) {
    const magicBytes = new Uint8Array(4);
    for (let i = 0; i < magic.length; i++) {
      magicBytes[i] = magic.charCodeAt(i);
    }
    parts.push(magicBytes);
  }

  function writeTag(group, element, vr, valBytes) {
    const header = new Uint8Array(8);
    const dv = new DataView(header.buffer);
    dv.setUint16(0, group, true);
    dv.setUint16(2, element, true);
    header[4] = vr.charCodeAt(0);
    header[5] = vr.charCodeAt(1);
    dv.setUint16(6, valBytes.length, true);
    parts.push(header);
    parts.push(valBytes);
  }

  function writeStr(group, element, vr, str) {
    let s = str;
    if (s.length % 2 !== 0) s += ' '; // DICOM padding
    const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
    writeTag(group, element, vr, bytes);
  }

  function writeShort(group, element, vr, val) {
    const bytes = new Uint8Array(2);
    new DataView(bytes.buffer).setUint16(0, val, true);
    writeTag(group, element, vr, bytes);
  }

  // File Meta Information: Transfer Syntax UID (0002, 0010)
  writeStr(0x0002, 0x0010, 'UI', transferSyntax);

  // Modality (0008, 0060)
  writeStr(0x0008, 0x0060, 'CS', modality);

  // Patient Name (0010, 0010)
  writeStr(0x0010, 0x0010, 'PN', patientName);

  // Rows & Cols (0028, 0010 / 0011)
  writeShort(0x0028, 0x0010, 'US', rows);
  writeShort(0x0028, 0x0011, 'US', cols);

  // Bits Allocated & Stored (0028, 0100 / 0101)
  writeShort(0x0028, 0x0100, 'US', 16);
  writeShort(0x0028, 0x0101, 'US', 16);
  writeShort(0x0028, 0x0102, 'US', 15); // High Bit
  writeShort(0x0028, 0x0103, 'US', 0);  // Pixel Representation (unsigned)

  // Rescale Intercept & Slope (0028, 1052 / 1053)
  writeStr(0x0028, 0x1052, 'DS', rescaleIntercept.toString());
  writeStr(0x0028, 0x1053, 'DS', rescaleSlope.toString());

  // Window Center & Width (0028, 1050 / 1051)
  writeStr(0x0028, 0x1050, 'DS', windowCenter.toString());
  writeStr(0x0028, 0x1051, 'DS', windowWidth.toString());

  // Pixel Data (7fe0, 0010)
  if (includePixelData) {
    const numPixels = rows * cols;
    const pixelBytes = new Uint8Array(numPixels * 2);
    const dv = new DataView(pixelBytes.buffer);
    for (let i = 0; i < numPixels; i++) {
      // Simulate raw 16-bit CT value, e.g. 1024 -> 0 HU
      dv.setUint16(i * 2, 1024 + (i % 200), true);
    }
    
    // Explicit VR OW for Pixel Data has 4-byte reserved + 4-byte length
    const owHeader = new Uint8Array(12);
    const owDv = new DataView(owHeader.buffer);
    owDv.setUint16(0, 0x7fe0, true);
    owDv.setUint16(2, 0x0010, true);
    owHeader[4] = 'O'.charCodeAt(0);
    owHeader[5] = 'W'.charCodeAt(0);
    owDv.setUint16(6, 0, true); // reserved
    owDv.setUint32(8, pixelBytes.length, true);
    parts.push(owHeader);
    parts.push(pixelBytes);
  }

  // Concatenate all parts
  const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result.buffer;
}

console.log('--- HealthMate AI DICOM Engine Acceptance Verification ---\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// Test 1: Valid DICOM parsing
try {
  const buf = createMockDicomBuffer();
  const parsed = parseDicomBinary(buf, 'chest_ct_001.dcm');
  
  assert(parsed.isDicom === true, 'Parsed valid DICOM file with isDicom=true');
  assert(parsed.patientName === 'DOE^JOHN', `Extracted patient name: ${parsed.patientName}`);
  assert(parsed.modality === 'CT', `Extracted modality: ${parsed.modality}`);
  assert(parsed.rows === 16 && parsed.columns === 16, `Extracted dimensions: ${parsed.rows}x${parsed.columns}`);
  assert(parsed.rescaleSlope === 1.0, `Extracted rescale slope: ${parsed.rescaleSlope}`);
  assert(parsed.rescaleIntercept === -1024.0, `Extracted rescale intercept: ${parsed.rescaleIntercept}`);
  assert(parsed.windowCenter === 40.0, `Extracted window center: ${parsed.windowCenter}`);
  assert(parsed.windowWidth === 400.0, `Extracted window width: ${parsed.windowWidth}`);
  assert(parsed.pixelData !== null && (parsed.pixelData.length === 16 * 16 || parsed.pixelData.byteLength === 16 * 16 * 2), 'Parsed uncompressed 16-bit pixel data array');
  assert(parsed.transferSyntaxSupported === true, 'Identified supported Explicit VR Little Endian syntax');
} catch (e) {
  assert(false, `Valid DICOM parsing threw error: ${e.message}`);
}

// Test 2: Corrupted DICOM without DICM prefix
try {
  const badBuf = createMockDicomBuffer({ magic: 'NOPE' });
  let threw = false;
  try {
    parseDicomBinary(badBuf, 'corrupt.dcm');
  } catch (err) {
    threw = true;
    assert(err.message.includes('Missing DICM magic bytes') || err.message.includes('corrupted'), 
      `Caught expected corruption error: "${err.message}"`);
  }
  assert(threw, 'Corrupted binary rejected properly');
} catch (e) {
  assert(false, `Corrupt DICOM test failed: ${e.message}`);
}

// Test 3: Unsupported compressed transfer syntax (JPEG 2000)
try {
  const compBuf = createMockDicomBuffer({ 
    transferSyntax: '1.2.840.10008.1.2.4.90' // JPEG 2000 Lossless
  });
  let caughtSyntaxError = false;
  try {
    parseDicomBinary(compBuf, 'compressed_j2k.dcm');
  } catch (err) {
    caughtSyntaxError = true;
    assert(err.message.includes('Unsupported DICOM Transfer Syntax') && err.message.includes('JPEG 2000'),
      `Detected unsupported compressed syntax with descriptive guidance: "${err.message}"`);
  }
  assert(caughtSyntaxError, 'Unsupported transfer syntax flagged');
} catch (e) {
  assert(false, `Transfer syntax test failed: ${e.message}`);
}

// Test 4: MPR Feasibility Check
try {
  // Case A: 3 slices (insufficient)
  const lowSlices = [{ rows: 512, columns: 512 }, { rows: 512, columns: 512 }, { rows: 512, columns: 512 }];
  const mprLow = evaluateMprFeasibility(lowSlices);
  assert(mprLow.feasible === false && mprLow.reason.includes('Insufficient slice depth'), 
    `MPR correctly rejected for < 8 slices: "${mprLow.reason}"`);

  // Case B: 10 slices with mismatched dimensions
  const mismatched = [
    ...Array(9).fill({ rows: 512, columns: 512 }),
    { rows: 256, columns: 256 }
  ];
  const mprMismatch = evaluateMprFeasibility(mismatched);
  assert(mprMismatch.feasible === false && mprMismatch.reason.includes('mismatched dimensions'),
    `MPR correctly rejected for mismatched matrix dimensions: "${mprMismatch.reason}"`);

  // Case C: 12 slices with uniform 512x512 matrix
  const validSeries = Array(12).fill({ rows: 512, columns: 512 });
  const mprValid = evaluateMprFeasibility(validSeries);
  assert(mprValid.feasible === true && mprValid.orientationCount === 3,
    `MPR confirmed feasible for uniform volume with ${mprValid.sliceCount} slices`);
} catch (e) {
  assert(false, `MPR feasibility test failed: ${e.message}`);
}

// Test 5: Clinical Presets
try {
  assert(CLINICAL_WINDOW_PRESETS.lung.wc === -600 && CLINICAL_WINDOW_PRESETS.lung.ww === 1500, 'Lung Window Preset verified (WC -600, WW 1500)');
  assert(CLINICAL_WINDOW_PRESETS.bone.wc === 300 && CLINICAL_WINDOW_PRESETS.bone.ww === 1500, 'Bone Window Preset verified (WC 300, WW 1500)');
  assert(CLINICAL_WINDOW_PRESETS.brain.wc === 40 && CLINICAL_WINDOW_PRESETS.brain.ww === 80, 'Brain Window Preset verified (WC 40, WW 80)');
  assert(CLINICAL_WINDOW_PRESETS.soft_tissue.wc === 50 && CLINICAL_WINDOW_PRESETS.soft_tissue.ww === 350, 'Soft Tissue Preset verified (WC 50, WW 350)');
} catch (e) {
  assert(false, `Presets test failed: ${e.message}`);
}

console.log(`\n========================================`);
console.log(`DICOM Engine Results: ${passedTests}/${totalTests} Passed.`);
console.log(`========================================`);
if (passedTests !== totalTests) {
  process.exit(1);
}
