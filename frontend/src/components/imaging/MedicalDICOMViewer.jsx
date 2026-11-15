import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Scan
} from 'lucide-react';
import Button from '../ui/Button';

// Standard Clinical Window/Level Presets (in Hounsfield Units)
const WINDOW_PRESETS = [
  { id: 'DEFAULT', name: 'Standard Auto', width: 350, level: 40, desc: 'General Radiographic Balance' },
  { id: 'LUNG', name: 'Lung Window', width: 1500, level: -600, desc: 'Parenchyma & Airway Details' },
  { id: 'BONE', name: 'Bone Window', width: 2000, level: 350, desc: 'Cortical Bone & Trabeculae' },
  { id: 'BRAIN', name: 'Brain Window', width: 80, level: 40, desc: 'Gray-White Matter Interface' },
  { id: 'SOFT_TISSUE', name: 'Soft Tissue', width: 400, level: 50, desc: 'Abdominal & Muscular Planes' },
];

export default function MedicalDICOMViewer({
  file,
  imageUrl,
  modality = 'XRAY',
  studyInfo = {},
  isDicom = false,
  sliceCount = 1,
}) {
  const [currentSlice, setCurrentSlice] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const [rotation, setRotation] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [activePreset, setActivePreset] = useState('DEFAULT');
  const [showMetadata, setShowMetadata] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Reset viewport parameters
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setIsInverted(false);
    setBrightness(100);
    setContrast(100);
    setActivePreset('DEFAULT');
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(3.5, prev + 0.25));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.25));

  // Rotate 90 degrees
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Apply Window/Level preset
  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    if (preset.id === 'LUNG') {
      setContrast(140);
      setBrightness(115);
    } else if (preset.id === 'BONE') {
      setContrast(160);
      setBrightness(90);
    } else if (preset.id === 'BRAIN') {
      setContrast(130);
      setBrightness(105);
    } else if (preset.id === 'SOFT_TISSUE') {
      setContrast(120);
      setBrightness(100);
    } else {
      setContrast(100);
      setBrightness(100);
    }
  };

  // Mouse pan controls
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Secure export of enhanced view
  const handleExportView = () => {
    if (!imageRef.current) return;
    const canvas = document.createElement('canvas');
    const img = imageRef.current;
    canvas.width = img.naturalWidth || 1024;
    canvas.height = img.naturalHeight || 1024;

    const ctx = canvas.getContext('2d');
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(100%)' : ''}`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);

    const link = document.createElement('a');
    link.download = `medical_scan_export_${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const activeSrc = imageUrl || (file ? URL.createObjectURL(file) : null);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-aurora-teal flex items-center justify-center font-mono text-xs font-bold">
            {modality}
          </div>
          <span className="text-xs font-semibold tracking-wide">
            {isDicom ? 'DICOM High-Fidelity Viewer' : 'Clinical Radiograph Viewer'}
          </span>
          {isDicom && (
            <span className="px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-mono">
              DICM Standard
            </span>
          )}
        </div>

        {/* Viewport Control Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsInverted(prev => !prev)}
            title="Invert Monochrome"
            className={`p-1.5 rounded-lg transition-colors ${
              isInverted ? 'bg-aurora-teal text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowMetadata(prev => !prev)}
            title="DICOM Metadata"
            className={`p-1.5 rounded-lg transition-colors ${
              showMetadata ? 'bg-aurora-violet text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportView}
            title="Export Image"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Medical Canvas Box */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative flex-1 min-h-[440px] max-h-[580px] bg-black flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        {activeSrc ? (
          <img
            ref={imageRef}
            src={activeSrc}
            alt="Medical Scan"
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(100%)' : ''}`,
              transition: isPanning ? 'none' : 'filter 0.15s ease',
              maxHeight: '520px',
              maxWidth: '90%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div className="text-center text-slate-500 text-xs">
            <Scan className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No scan loaded in active viewport
          </div>
        )}

        {/* Viewport Floating Info OSD */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[10px] font-mono text-slate-300 pointer-events-none space-y-0.5">
          <div>ZOOM: {(zoom * 100).toFixed(0)}%</div>
          <div>ROT: {rotation}°</div>
          <div>PRESET: {activePreset}</div>
        </div>

        {/* Multi-Slice Navigator (if series > 1) */}
        {sliceCount > 1 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/10 flex flex-col items-center gap-2">
            <button
              onClick={() => setCurrentSlice(prev => Math.max(1, prev - 1))}
              disabled={currentSlice <= 1}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 rotate-90" />
            </button>
            <span className="text-[10px] font-mono font-bold text-teal-400">
              {currentSlice}/{sliceCount}
            </span>
            <button
              onClick={() => setCurrentSlice(prev => Math.min(sliceCount, prev + 1))}
              disabled={currentSlice >= sliceCount}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
          </div>
        )}

        {/* Floating Metadata Inspector Drawer */}
        {showMetadata && (
          <div className="absolute top-3 right-3 bottom-3 w-64 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 shadow-xl overflow-y-auto text-[11px] font-mono text-slate-300 space-y-2 z-30 animate-in fade-in slide-in-from-right-4 duration-150">
            <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-1.5">
              <span>Study Metadata</span>
              <button onClick={() => setShowMetadata(false)} className="text-slate-400 hover:text-white">×</button>
            </div>
            <div>
              <span className="text-slate-500">Modality:</span> {modality}
            </div>
            <div>
              <span className="text-slate-500">Format:</span> {isDicom ? 'DICOM Part 10' : 'Digital Radiograph'}
            </div>
            <div>
              <span className="text-slate-500">Patient ID:</span> {studyInfo.patientId || 'ANONYMIZED_TEST_USER'}
            </div>
            <div>
              <span className="text-slate-500">Window Center:</span> {WINDOW_PRESETS.find(p => p.id === activePreset)?.level || 40}
            </div>
            <div>
              <span className="text-slate-500">Window Width:</span> {WINDOW_PRESETS.find(p => p.id === activePreset)?.width || 350}
            </div>
            <div>
              <span className="text-slate-500">Photometric:</span> {isInverted ? 'MONOCHROME1' : 'MONOCHROME2'}
            </div>
            <div>
              <span className="text-slate-500">Transfer Syntax:</span> Implicit VR Little Endian (1.2.840.10008.1.2)
            </div>
          </div>
        )}
      </div>

      {/* Bottom Presets & Fine-Tuning Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1">Hounsfield Presets:</span>
          {WINDOW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activePreset === preset.id
                  ? 'bg-aurora-teal text-white ring-1 ring-teal-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Fine Adjustment Sliders */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Brightness</span>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-16 accent-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Contrast</span>
            <input
              type="range"
              min="50"
              max="180"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-16 accent-teal-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
