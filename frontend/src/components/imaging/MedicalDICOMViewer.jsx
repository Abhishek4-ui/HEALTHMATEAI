import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Sliders, 
  Layers, 
  Maximize2, 
  Eye, 
  Download, 
  Sun, 
  Contrast,
  RefreshCw,
  Info,
  ChevronLeft,
  ChevronRight,
  Scan,
  AlertTriangle,
  Play,
  Pause,
  Box,
  FileText
} from 'lucide-react';
import Button from '../ui/Button';
import { 
  parseDicomFile, 
  parseDicomSeries, 
  renderDicomToImageData, 
  evaluateMprFeasibility 
} from '../../utils/dicomEngine';

// Standard Clinical Window/Level Presets (in Hounsfield Units)
const CLINICAL_WINDOW_PRESETS = [
  { id: 'DEFAULT', name: 'Standard Auto', width: 400, level: 40, desc: 'General Radiographic Balance' },
  { id: 'LUNG', name: 'Lung Window', width: 1500, level: -600, desc: 'Parenchyma & Airway Details' },
  { id: 'BONE', name: 'Bone Window', width: 2000, level: 350, desc: 'Cortical Bone & Trabeculae' },
  { id: 'BRAIN', name: 'Brain Window', width: 80, level: 40, desc: 'Gray-White Matter Interface' },
  { id: 'SOFT_TISSUE', name: 'Soft Tissue', width: 400, level: 50, desc: 'Abdominal & Muscular Planes' },
];

export default function MedicalDICOMViewer({
  file,
  files = [],
  imageUrl,
  modality = 'XRAY',
  studyMetadata = {},
}) {
  // DICOM Parsing State
  const [dicomSeries, setDicomSeries] = useState(null);
  const [currentSliceIndex, setCurrentSliceIndex] = useState(0);
  const [parsingDicom, setParsingDicom] = useState(false);
  const [dicomError, setDicomError] = useState(null);
  const [unsupportedSyntaxWarning, setUnsupportedSyntaxWarning] = useState(null);

  // Viewport & Window/Level State
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const [rotation, setRotation] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  
  // Active Window Width & Center in Hounsfield Units (HU)
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowCenter, setWindowCenter] = useState(40);
  const [activePreset, setActivePreset] = useState('DEFAULT');
  
  // Interactive W/L drag mode
  const [isAdjustingWL, setIsAdjustingWL] = useState(false);
  const [startWL, setStartWL] = useState({ x: 0, y: 0, w: 400, c: 40 });

  // Cine loop playback for multi-slice
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const cineIntervalRef = useRef(null);

  const [showMetadata, setShowMetadata] = useState(false);
  const [showMprInfo, setShowMprInfo] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Parse DICOM file(s) on change
  useEffect(() => {
    let isCancelled = false;

    async function loadDicomData() {
      const targetFiles = files && files.length > 0 ? files : (file ? [file] : []);
      const isDcm = targetFiles.some(f => f.name.toLowerCase().endsWith('.dcm') || f.type.includes('dicom'));

      if (!isDcm || targetFiles.length === 0) {
        setDicomSeries(null);
        setDicomError(null);
        setUnsupportedSyntaxWarning(null);
        return;
      }

      setParsingDicom(true);
      setDicomError(null);
      setUnsupportedSyntaxWarning(null);

      try {
        const seriesData = await parseDicomSeries(targetFiles);
        if (isCancelled) return;

        if (seriesData.slices.length === 0 && seriesData.errors.length > 0) {
          throw new Error(seriesData.errors[0].error);
        }

        setDicomSeries(seriesData);
        setCurrentSliceIndex(0);

        // Establish default windowing from parsed slice
        const firstSlice = seriesData.slices[0];
        if (firstSlice) {
          setWindowWidth(firstSlice.windowWidth || 400);
          setWindowCenter(firstSlice.windowCenter || 40);

          if (!firstSlice.isSupportedTransferSyntax) {
            setUnsupportedSyntaxWarning(
              `Notice: Transfer Syntax (${firstSlice.transferSyntaxName}) is compressed. Viewing pixel data in uncompressed Little Endian format is recommended for full diagnostic fidelity.`
            );
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('DICOM parsing error:', err);
          setDicomError(err.message || 'Unable to parse DICOM dataset.');
        }
      } finally {
        if (!isCancelled) setParsingDicom(false);
      }
    }

    loadDicomData();
    return () => { isCancelled = true; };
  }, [file, files]);

  // Current active slice
  const activeSlice = useMemo(() => {
    if (dicomSeries && dicomSeries.slices.length > 0) {
      return dicomSeries.slices[currentSliceIndex] || dicomSeries.slices[0];
    }
    return null;
  }, [dicomSeries, currentSliceIndex]);

  // Render DICOM slice to Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (activeSlice && activeSlice.rawPixelData) {
      canvas.width = activeSlice.cols;
      canvas.height = activeSlice.rows;

      const imgData = renderDicomToImageData(
        activeSlice,
        windowWidth,
        windowCenter,
        isInverted,
        0
      );
      ctx.putImageData(imgData, 0, 0);
    }
  }, [activeSlice, windowWidth, windowCenter, isInverted]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Cine loop handling
  useEffect(() => {
    if (isPlayingCine && dicomSeries && dicomSeries.slices.length > 1) {
      cineIntervalRef.current = setInterval(() => {
        setCurrentSliceIndex(prev => (prev + 1) % dicomSeries.slices.length);
      }, 100);
    } else {
      if (cineIntervalRef.current) clearInterval(cineIntervalRef.current);
    }
    return () => {
      if (cineIntervalRef.current) clearInterval(cineIntervalRef.current);
    };
  }, [isPlayingCine, dicomSeries]);

  // Apply Window/Level preset
  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    setWindowWidth(preset.width);
    setWindowCenter(preset.level);
  };

  // Reset viewport parameters
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setIsInverted(false);
    if (activeSlice) {
      setWindowWidth(activeSlice.windowWidth || 400);
      setWindowCenter(activeSlice.windowCenter || 40);
    } else {
      setWindowWidth(400);
      setWindowCenter(40);
    }
    setActivePreset('DEFAULT');
  };

  // Mouse pan & W/L Drag controls
  const handleMouseDown = (e) => {
    if (e.button === 0 && !isAdjustingWL) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 2 || isAdjustingWL) {
      e.preventDefault();
      setStartWL({
        x: e.clientX,
        y: e.clientY,
        w: windowWidth,
        c: windowCenter
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (e.buttons === 2 || (isAdjustingWL && e.buttons === 1)) {
      // W/L dragging: horizontal delta changes Width, vertical changes Center
      const deltaX = e.clientX - startWL.x;
      const deltaY = e.clientY - startWL.y;
      setWindowWidth(Math.max(1, Math.round(startWL.w + deltaX * 2)));
      setWindowCenter(Math.round(startWL.c - deltaY * 2));
      setActivePreset('CUSTOM');
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // MPR Feasibility Evaluation
  const mprReport = useMemo(() => {
    return evaluateMprFeasibility(dicomSeries?.slices);
  }, [dicomSeries]);

  // Export current frame
  const handleExportView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `dicom_scan_export_${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const hasDicom = Boolean(activeSlice && activeSlice.rawPixelData);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono text-xs font-bold border border-teal-500/30">
            {activeSlice ? activeSlice.modality : modality}
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
              {hasDicom ? 'Genuine DICOM Canvas' : 'Clinical Radiograph Canvas'}
              {hasDicom && (
                <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[9px] font-mono">
                  16-Bit Modality LUT
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Viewport Action Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(3.5, prev + 0.25))}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            title="Rotate 90°"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsInverted(prev => !prev)}
            title="Invert Monochrome (Negative)"
            className={`p-1.5 rounded-lg transition-colors ${
              isInverted ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsAdjustingWL(prev => !prev)}
            title="Interactive W/L Drag Mode (or Right-Click & Drag)"
            className={`p-1.5 rounded-lg transition-colors ${
              isAdjustingWL ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset Viewport"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowMetadata(prev => !prev)}
            title="DICOM Metadata Tags"
            className={`p-1.5 rounded-lg transition-colors ${
              showMetadata ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowMprInfo(prev => !prev)}
            title="Multi-Planar Reconstruction (MPR) Status"
            className={`p-1.5 rounded-lg transition-colors ${
              showMprInfo ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Box className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportView}
            title="Export Frame"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warnings & Diagnostics Notification */}
      {unsupportedSyntaxWarning && (
        <div className="px-4 py-2 bg-amber-500/20 border-b border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{unsupportedSyntaxWarning}</span>
        </div>
      )}

      {dicomError && (
        <div className="px-4 py-2 bg-red-500/20 border-b border-red-500/30 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{dicomError}</span>
        </div>
      )}

      {/* Presets Bar */}
      <div className="p-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1">HU Presets:</span>
          {CLINICAL_WINDOW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activePreset === preset.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>W: <strong className="text-white">{windowWidth}</strong></span>
          <span>L: <strong className="text-white">{windowCenter}</strong></span>
          <span>Zoom: <strong className="text-white">{Math.round(zoom * 100)}%</strong></span>
        </div>
      </div>

      {/* Main Medical Canvas Display */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="relative h-[420px] bg-black flex items-center justify-center overflow-hidden cursor-crosshair select-none"
      >
        {parsingDicom ? (
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Parsing DICOM Modality LUT & Pixel Stream...</p>
          </div>
        ) : hasDicom ? (
          <canvas
            ref={canvasRef}
            className="max-h-full max-w-full object-contain transition-transform duration-75"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        ) : imageUrl ? (
          <div
            className="w-full h-full flex items-center justify-center p-4 transition-transform duration-75"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotate(${rotation}deg)`,
              filter: `brightness(${Math.min(200, Math.max(20, (windowCenter / 40) * 100))}%) contrast(${Math.min(250, Math.max(30, (windowWidth / 400) * 100))}%) ${isInverted ? 'invert(1)' : ''}`,
            }}
          >
            <img
              src={imageUrl}
              alt="Medical Radiograph"
              className="max-h-full max-w-full object-contain rounded shadow"
              draggable={false}
            />
          </div>
        ) : (
          <div className="text-center p-6 space-y-2 text-slate-500">
            <Scan className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-xs font-semibold">No Medical Scan Loaded</p>
            <p className="text-[11px] max-w-xs">Load a genuine .dcm file or high-res radiograph image to inspect.</p>
          </div>
        )}

        {/* Informational PACS Warning Overlay */}
        <div className="absolute bottom-2 left-2 pointer-events-none px-2 py-1 rounded bg-black/75 border border-white/10 text-[9px] text-slate-400 font-mono">
          TRIAGE ASSIST • NOT A CLASS II PRIMARY DIAGNOSTIC PACS
        </div>
      </div>

      {/* Multi-Slice Navigator Strip (Active when Series has > 1 Slices) */}
      {dicomSeries && dicomSeries.slices.length > 1 && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlayingCine(!isPlayingCine)}
              className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-medium flex items-center gap-1.5"
            >
              {isPlayingCine ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingCine ? 'Pause' : 'Cine Loop'}</span>
            </button>
            <span className="font-mono text-[11px] text-slate-400">
              Slice {currentSliceIndex + 1} of {dicomSeries.slices.length}
            </span>
          </div>

          <div className="flex-1 max-w-md flex items-center gap-2">
            <button
              type="button"
              disabled={currentSliceIndex === 0}
              onClick={() => setCurrentSliceIndex(prev => Math.max(0, prev - 1))}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="0"
              max={dicomSeries.slices.length - 1}
              value={currentSliceIndex}
              onChange={(e) => setCurrentSliceIndex(parseInt(e.target.value, 10))}
              className="w-full accent-teal-500"
            />

            <button
              type="button"
              disabled={currentSliceIndex === dicomSeries.slices.length - 1}
              onClick={() => setCurrentSliceIndex(prev => Math.min(dicomSeries.slices.length - 1, prev + 1))}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Metadata Slide-out Panel */}
      {showMetadata && (
        <div className="p-4 bg-slate-900/95 border-t border-slate-800 text-xs space-y-2.5 font-mono max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" /> Parsed DICOM Header Tags
            </span>
            <button onClick={() => setShowMetadata(false)} className="text-slate-400 hover:text-white text-[11px]">
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
            <div>Patient: <strong className="text-slate-200">{activeSlice?.patientName || studyMetadata.patientName || 'Anonymous'}</strong></div>
            <div>ID: <strong className="text-slate-200">{activeSlice?.patientId || 'Protected'}</strong></div>
            <div>Study Date: <strong className="text-slate-200">{activeSlice?.studyDate || studyMetadata.studyDate || 'N/A'}</strong></div>
            <div>Modality: <strong className="text-teal-400">{activeSlice?.modality || modality}</strong></div>
            <div>Dimensions: <strong className="text-slate-200">{activeSlice ? `${activeSlice.cols}x${activeSlice.rows}` : 'N/A'}</strong></div>
            <div>Bits Allocated: <strong className="text-slate-200">{activeSlice?.bitsAllocated || 16}-bit</strong></div>
            <div>Rescale Intercept: <strong className="text-slate-200">{activeSlice?.rescaleIntercept ?? 0}</strong></div>
            <div>Rescale Slope: <strong className="text-slate-200">{activeSlice?.rescaleSlope ?? 1}</strong></div>
            <div>Transfer Syntax: <strong className="text-slate-300 truncate block">{activeSlice?.transferSyntaxName || 'Standard Little Endian'}</strong></div>
          </div>
        </div>
      )}

      {/* MPR Feasibility Slide-out Panel */}
      {showMprInfo && (
        <div className="p-4 bg-slate-900/95 border-t border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-indigo-400" /> Orthogonal Multi-Planar Reconstruction (MPR)
            </span>
            <button onClick={() => setShowMprInfo(false)} className="text-slate-400 hover:text-white text-[11px]">
              Close
            </button>
          </div>

          <div className="flex items-start gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              mprReport.feasible ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {mprReport.feasible ? 'MPR SUPPORTED' : 'MPR UNAVAILABLE'}
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{mprReport.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
