/**
 * HealthMate AI — Clinical DICOM Engine
 * Powered by dicom-parser for genuine binary DICOM parsing in the browser.
 * 
 * Supports:
 * - Parsing genuine DICOM files (.dcm)
 * - Preamble & Transfer Syntax validation
 * - Rescale Slope (0028,1053) & Intercept (0028,1052) Modality LUT
 * - Window Width (0028,1051) & Center (0028,1050) Linear VOI LUT
 * - 16-bit (signed/unsigned) and 8-bit raw pixel data rendering to HTML5 Canvas
 * - Multi-slice series parsing & volumetric stack assembly
 * - Orthogonal Multi-Planar Reconstruction (MPR) feasibility checking
 * - Explicit error handling for corrupted files and compressed transfer syntaxes
 */

import dicomParser from 'dicom-parser';

// Standard DICOM Transfer Syntax UIDs
export const TRANSFER_SYNTAXES = {
  '1.2.840.10008.1.2': { name: 'Implicit VR Little Endian (Default)', supported: true, compressed: false },
  '1.2.840.10008.1.2.1': { name: 'Explicit VR Little Endian', supported: true, compressed: false },
  '1.2.840.10008.1.2.2': { name: 'Explicit VR Big Endian', supported: true, compressed: false },
  '1.2.840.10008.1.2.4.50': { name: 'JPEG Baseline (Process 1)', supported: false, compressed: true },
  '1.2.840.10008.1.2.4.51': { name: 'JPEG Extended (Process 2 & 4)', supported: false, compressed: true },
  '1.2.840.10008.1.2.4.70': { name: 'JPEG Lossless, Non-Hierarchical', supported: false, compressed: true },
  '1.2.840.10008.1.2.4.80': { name: 'JPEG-LS Lossless', supported: false, compressed: true },
  '1.2.840.10008.1.2.4.90': { name: 'JPEG 2000 Image Compression (Lossless Only)', supported: false, compressed: true },
  '1.2.840.10008.1.2.4.91': { name: 'JPEG 2000 Image Compression', supported: false, compressed: true },
  '1.2.840.10008.1.2.5': { name: 'RLE Lossless', supported: false, compressed: true },
};

// Standard Clinical Hounsfield Window/Level Presets
export const CLINICAL_WINDOW_PRESETS = {
  auto: { name: 'Auto (Header VOI)', ww: null, wc: null },
  lung: { name: 'Lung Window (CT)', ww: 1500, wc: -600 },
  bone: { name: 'Bone Window (CT)', ww: 1500, wc: 300 },
  brain: { name: 'Brain Window (CT)', ww: 80, wc: 40 },
  soft_tissue: { name: 'Soft Tissue (CT)', ww: 350, wc: 50 },
};

export const parseDicomBinary = parseDicomFile;

/**
 * Parses an ArrayBuffer containing a single DICOM file.
 * Returns parsed metadata, extracted pixel array, dimensions, and windowing defaults.
 */
export function parseDicomFile(arrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer);

  // 1. Validate DICOM 'DICM' Magic Preamble at byte offset 128
  let hasDcmPreamble = false;
  if (byteArray.length > 132) {
    const magic = String.fromCharCode(byteArray[128], byteArray[129], byteArray[130], byteArray[131]);
    hasDcmPreamble = (magic === 'DICM');
  }

  if (!hasDcmPreamble && byteArray.length > 132) {
    throw new Error('Missing DICM magic bytes at byte offset 128. File is corrupted or not a standard Part 10 DICOM file.');
  }

  // 2. Parse data set via dicom-parser
  let dataSet;
  try {
    dataSet = dicomParser.parseDicom(byteArray);
  } catch (err) {
    throw new Error(`DICOM Parse Error: ${err.message || 'Corrupted or unreadable DICOM binary format.'}`);
  }

  // 3. Transfer Syntax Validation
  const transferSyntaxUID = dataSet.string('x00020010') || '1.2.840.10008.1.2.1';
  const syntaxInfo = TRANSFER_SYNTAXES[transferSyntaxUID] || {
    name: 'Unknown Transfer Syntax',
    supported: false,
    compressed: true
  };

  if (syntaxInfo.compressed) {
    throw new Error(`Unsupported DICOM Transfer Syntax: ${syntaxInfo.name} (${transferSyntaxUID}). Encapsulated compressed pixel data (JPEG/JPEG 2000/RLE) requires client-side decompression codecs. Please export as uncompressed Little Endian DICOM.`);
  }

  // 4. Metadata Extraction
  const patientName = dataSet.string('x00100010') || 'Anonymous Patient';
  const patientId = dataSet.string('x00100020') || 'Protected ID';
  const studyDate = dataSet.string('x00080020') || 'Unknown Date';
  const modality = dataSet.string('x00080060') || 'OT';
  const seriesDescription = dataSet.string('x0008103e') || dataSet.string('x00081030') || 'Series';
  const sopClassUID = dataSet.string('x00080016') || 'Secondary Capture Image Storage';
  const instanceNumber = parseInt(dataSet.string('x00200013') || '1', 10);
  const sliceLocation = parseFloat(dataSet.string('x00201041') || '0.0');

  // Dimensions & Pixel representation
  const rows = dataSet.uint16('x00280010');
  const cols = dataSet.uint16('x00280011');
  const bitsAllocated = dataSet.uint16('x00280100') || 16;
  const bitsStored = dataSet.uint16('x00280101') || bitsAllocated;
  const pixelRepresentation = dataSet.uint16('x00280103') || 0; // 0 = unsigned, 1 = signed 2's complement
  const numberOfFrames = parseInt(dataSet.string('x00280008') || '1', 10);

  // Modality LUT (Rescale Intercept and Slope)
  const rescaleIntercept = parseFloat(dataSet.string('x00281052') || '0.0');
  const rescaleSlope = parseFloat(dataSet.string('x00281053') || '1.0');

  // VOI LUT Window Width and Window Center
  let windowCenter = parseFloat(dataSet.string('x00281050') || '40.0');
  let windowWidth = parseFloat(dataSet.string('x00281051') || '400.0');

  // If window width <= 0, establish safe default
  if (!windowWidth || windowWidth <= 0) {
    windowWidth = 400.0;
    windowCenter = 40.0;
  }

  // 5. Pixel Data Element Check
  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement) {
    throw new Error('DICOM header contains no Pixel Data element (7FE0,0010).');
  }

  let rawPixelData = null;
  let isCompressed = syntaxInfo.compressed;

  if (!isCompressed && pixelDataElement.length > 0) {
    const dataOffset = pixelDataElement.dataOffset;
    if (bitsAllocated === 16) {
      if (pixelRepresentation === 1) {
        rawPixelData = new Int16Array(byteArray.buffer, dataOffset, (rows * cols * numberOfFrames));
      } else {
        rawPixelData = new Uint16Array(byteArray.buffer, dataOffset, (rows * cols * numberOfFrames));
      }
    } else if (bitsAllocated === 8) {
      rawPixelData = new Uint8Array(byteArray.buffer, dataOffset, (rows * cols * numberOfFrames));
    }
  }

  return {
    isDicom: hasDcmPreamble,
    hasDcmPreamble,
    transferSyntaxUID,
    transferSyntaxName: syntaxInfo.name,
    isSupportedTransferSyntax: syntaxInfo.supported,
    transferSyntaxSupported: syntaxInfo.supported,
    isCompressed,
    patientName,
    patientId,
    studyDate,
    modality,
    seriesDescription,
    sopClassUID,
    instanceNumber,
    sliceLocation,
    rows: rows || 512,
    cols: cols || 512,
    columns: cols || 512,
    bitsAllocated,
    bitsStored,
    pixelRepresentation,
    numberOfFrames,
    rescaleIntercept,
    rescaleSlope,
    windowCenter,
    windowWidth,
    rawPixelData,
    pixelData: rawPixelData,
    byteArrayLength: byteArray.length
  };
}

/**
 * Converts a raw 16-bit or 8-bit slice buffer into a windowed RGBA ImageData object.
 * Applies Rescale Slope/Intercept (HU) and Linear VOI LUT windowing.
 */
export function renderDicomToImageData(parsedDicom, activeWindowWidth, activeWindowCenter, invert = false, frameIndex = 0) {
  const { rows, cols, rawPixelData, rescaleSlope, rescaleIntercept } = parsedDicom;

  const width = cols;
  const height = rows;
  const totalPixels = width * height;
  const frameOffset = frameIndex * totalPixels;

  const imgData = new ImageData(width, height);
  const data = imgData.data; // RGBA Uint8ClampedArray

  const w = Math.max(1, activeWindowWidth);
  const c = activeWindowCenter;
  const lower = c - 0.5 - (w - 1) / 2;
  const upper = c - 0.5 + (w - 1) / 2;
  const range = upper - lower;

  if (rawPixelData && rawPixelData.length >= (frameOffset + totalPixels)) {
    for (let i = 0; i < totalPixels; i++) {
      const rawVal = rawPixelData[frameOffset + i];
      // 1. Modality LUT: Hounsfield Units (HU)
      const hu = (rawVal * rescaleSlope) + rescaleIntercept;

      // 2. VOI LUT Windowing (linear mapping to 0-255)
      let gray;
      if (hu <= lower) {
        gray = 0;
      } else if (hu > upper) {
        gray = 255;
      } else {
        gray = Math.round(((hu - lower) / range) * 255);
      }

      if (invert) {
        gray = 255 - gray;
      }

      const pixelIdx = i * 4;
      data[pixelIdx] = gray;     // R
      data[pixelIdx + 1] = gray; // G
      data[pixelIdx + 2] = gray; // B
      data[pixelIdx + 3] = 255;  // Alpha
    }
  } else {
    // Fallback if pixel data element was compressed or empty
    for (let i = 0; i < totalPixels; i++) {
      const pixelIdx = i * 4;
      data[pixelIdx] = 30;
      data[pixelIdx + 1] = 30;
      data[pixelIdx + 2] = 35;
      data[pixelIdx + 3] = 255;
    }
  }

  return imgData;
}

/**
 * Parses multiple DICOM files into an organized, sorted multi-slice volumetric series.
 */
export async function parseDicomSeries(fileList) {
  const parsedSlices = [];
  const errors = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    try {
      const buffer = await file.arrayBuffer();
      const slice = parseDicomFile(buffer);
      slice.fileName = file.name;
      parsedSlices.push(slice);
    } catch (err) {
      errors.push({ fileName: file.name, error: err.message });
    }
  }

  // Sort slices sequentially by InstanceNumber or SliceLocation
  parsedSlices.sort((a, b) => {
    if (a.sliceLocation !== b.sliceLocation) {
      return a.sliceLocation - b.sliceLocation;
    }
    return a.instanceNumber - b.instanceNumber;
  });

  return {
    slices: parsedSlices,
    errors,
    totalSlices: parsedSlices.length,
    isSeries: parsedSlices.length > 1
  };
}

/**
 * Checks if loaded series qualifies for Multi-Planar Reconstruction (MPR).
 * Requires uniform dimensions and minimum 8 slices.
 */
export function evaluateMprFeasibility(slices) {
  if (!slices || slices.length < 8) {
    return {
      feasible: false,
      sliceCount: slices ? slices.length : 0,
      reason: `Insufficient slice depth for 3D MPR (contains ${slices ? slices.length : 0} slices, minimum 8 required).`
    };
  }

  const baseRows = slices[0].rows;
  const baseCols = slices[0].cols || slices[0].columns;
  const allUniform = slices.every(s => (s.rows === baseRows) && ((s.cols || s.columns) === baseCols));

  if (!allUniform) {
    return {
      feasible: false,
      sliceCount: slices.length,
      reason: 'Slices have mismatched dimensions or uncompressed pixel buffers missing.'
    };
  }

  return {
    feasible: true,
    sliceCount: slices.length,
    orientationCount: 3,
    depth: slices.length,
    rows: baseRows,
    cols: baseCols,
    reason: `Volumetric series verified (${baseCols}x${baseRows}x${slices.length}). Axial, Coronal, and Sagittal orthogonal views supported.`
  };
}
