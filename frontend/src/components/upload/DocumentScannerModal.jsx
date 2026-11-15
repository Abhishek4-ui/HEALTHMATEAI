import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, 
  RotateCw, 
  Sliders, 
  Crop, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Sparkles, 
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import Button from '../ui/Button';

export default function DocumentScannerModal({ 
  isOpen, 
  onClose, 
  initialFiles = [], 
  onConfirmScans,
  title = 'Document Scanner & Image Enhancer' 
}) {
  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Enhancement controls for active page
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [filterMode, setFilterMode] = useState('DOCUMENT'); // 'ORIGINAL', 'DOCUMENT', 'BW', 'INVERT'
  const [brightness, setBrightness] = useState(100); // 50 to 150
  const [contrast, setContrast] = useState(100); // 50 to 180

  const canvasRef = useRef(null);
  const hiddenInputRef = useRef(null);

  // Initialize pages when opened
  useEffect(() => {
    if (isOpen && initialFiles && initialFiles.length > 0) {
      const pageList = initialFiles.map((file, idx) => ({
        id: `page_${Date.now()}_${idx}`,
        file,
        name: file.name,
        originalUrl: URL.createObjectURL(file),
        rotation: 0,
        filterMode: 'DOCUMENT',
        brightness: 105,
        contrast: 115,
      }));
      setPages(pageList);
      setActivePageIndex(0);
      setRotation(0);
      setFilterMode('DOCUMENT');
      setBrightness(105);
      setContrast(115);
    }
  }, [isOpen, initialFiles]);

  const activePage = pages[activePageIndex];

  // Update active page adjustments in list
  const updateActivePageAdjustments = useCallback((rot, filt, b, c) => {
    setPages(prev => {
      const copy = [...prev];
      if (copy[activePageIndex]) {
        copy[activePageIndex] = {
          ...copy[activePageIndex],
          rotation: rot,
          filterMode: filt,
          brightness: b,
          contrast: c,
        };
      }
      return copy;
    });
  }, [activePageIndex]);

  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    updateActivePageAdjustments(nextRot, filterMode, brightness, contrast);
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    updateActivePageAdjustments(rotation, mode, brightness, contrast);
  };

  const handleBrightnessChange = (val) => {
    setBrightness(val);
    updateActivePageAdjustments(rotation, filterMode, val, contrast);
  };

  const handleContrastChange = (val) => {
    setContrast(val);
    updateActivePageAdjustments(rotation, filterMode, brightness, val);
  };

  // Add more pages
  const handleAddMoreFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPages = files.map((file, idx) => ({
      id: `page_${Date.now()}_${pages.length + idx}`,
      file,
      name: file.name,
      originalUrl: URL.createObjectURL(file),
      rotation: 0,
      filterMode: 'DOCUMENT',
      brightness: 105,
      contrast: 115,
    }));

    setPages(prev => [...prev, ...newPages]);
    setActivePageIndex(pages.length);
  };

  // Page reordering and deletion
  const handleDeletePage = (indexToDelete) => {
    if (pages.length <= 1) return;
    const filtered = pages.filter((_, idx) => idx !== indexToDelete);
    setPages(filtered);
    setActivePageIndex(Math.max(0, indexToDelete - 1));
  };

  const handleMovePage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    const reordered = [...pages];
    const item = reordered.splice(fromIdx, 1)[0];
    reordered.splice(toIdx, 0, item);
    setPages(reordered);
    setActivePageIndex(toIdx);
  };

  // Render processed preview to canvas & export
  const renderProcessedCanvas = useCallback(async (pageObj) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const isRotated90or270 = pageObj.rotation === 90 || pageObj.rotation === 270;

        canvas.width = isRotated90or270 ? img.height : img.width;
        canvas.height = isRotated90or270 ? img.width : img.height;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((pageObj.rotation * Math.PI) / 180);

        let filterString = `brightness(${pageObj.brightness}%) contrast(${pageObj.contrast}%)`;
        if (pageObj.filterMode === 'BW') {
          filterString += ' grayscale(100%)';
        } else if (pageObj.filterMode === 'DOCUMENT') {
          filterString += ' grayscale(40%) contrast(120%)';
        } else if (pageObj.filterMode === 'INVERT') {
          filterString += ' invert(100%)';
        }
        ctx.filter = filterString;

        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.92);
      };
      img.src = pageObj.originalUrl;
    });
  }, []);

  // Final confirmation: compile processed pages
  const handleConfirmAllPages = async () => {
    if (pages.length === 0) return;

    const processedFiles = [];
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const processedBlob = await renderProcessedCanvas(p);
      const safeName = p.name ? p.name.replace(/\.[^/.]+$/, '') : `scanned_page_${i + 1}`;
      const processedFile = new File(
        [processedBlob],
        `${safeName}_enhanced.jpg`,
        { type: 'image/jpeg' }
      );
      // Retain reference to original unedited file
      processedFile.originalSource = p.file;
      processedFiles.push(processedFile);
    }

    if (onConfirmScans) {
      onConfirmScans(processedFiles);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-500">
                Enhance contrast, auto-deskew, rotate, and assemble multi-page medical records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 bg-slate-100 dark:bg-slate-950">
          {/* Main Visual Editor (2 columns on desktop) */}
          <div className="md:col-span-2 relative flex flex-col items-center justify-center p-4 min-h-[350px] sm:min-h-[440px] overflow-hidden bg-black/90">
            {activePage ? (
              <div className="relative max-h-[460px] max-w-full flex items-center justify-center overflow-hidden">
                <img
                  src={activePage.originalUrl}
                  alt={`Page ${activePageIndex + 1}`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                      filterMode === 'BW' ? 'grayscale(100%)' : filterMode === 'DOCUMENT' ? 'grayscale(40%) contrast(120%)' : filterMode === 'INVERT' ? 'invert(100%)' : ''
                    }`,
                    maxHeight: '440px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    transition: 'filter 0.15s ease, transform 0.2s ease',
                  }}
                  className="rounded-lg shadow-xl"
                />
              </div>
            ) : (
              <div className="text-xs text-slate-400">No document page loaded.</div>
            )}

            {/* Floating Quick Filter Presets */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => handleFilterChange('DOCUMENT')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  filterMode === 'DOCUMENT' ? 'bg-aurora-teal text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Scan Enhance
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('BW')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  filterMode === 'BW' ? 'bg-aurora-teal text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Clean B&W
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('ORIGINAL')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  filterMode === 'ORIGINAL' ? 'bg-aurora-teal text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Original Photo
              </button>
            </div>
          </div>

          {/* Controls & Multi-Page Tray (1 column on desktop) */}
          <div className="p-4 bg-white dark:bg-aurora-navy border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              {/* Page Navigator */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-aurora-teal" />
                  <span>Page {activePageIndex + 1} of {pages.length}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
                    disabled={activePageIndex === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActivePageIndex(prev => Math.min(pages.length - 1, prev + 1))}
                    disabled={activePageIndex === pages.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Adjustments: Rotate, Brightness, Contrast */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Orientation</span>
                  <button
                    onClick={handleRotate}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-aurora-teal" />
                    <span>Rotate 90° ({rotation}°)</span>
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={brightness}
                    onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Contrast / Text Sharpness</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="160"
                    value={contrast}
                    onChange={(e) => handleContrastChange(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>

              {/* Multi-Page Thumbnail Strip */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Document Pages ({pages.length})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {pages.map((p, idx) => (
                    <div
                      key={p.id}
                      onClick={() => setActivePageIndex(idx)}
                      className={`relative p-1 rounded-xl border cursor-pointer transition-all ${
                        activePageIndex === idx
                          ? 'border-aurora-teal bg-teal-50/40 dark:bg-teal-950/40 ring-2 ring-aurora-teal/30'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={p.originalUrl}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-14 object-cover rounded-lg"
                      />
                      <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                        P{idx + 1}
                      </span>
                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(idx);
                          }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Page Button */}
                  <button
                    type="button"
                    onClick={() => hiddenInputRef.current?.click()}
                    className="h-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-aurora-teal hover:border-aurora-teal transition-colors"
                  >
                    <Plus className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px]">Add Page</span>
                  </button>
                  <input
                    ref={hiddenInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleAddMoreFiles}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <Button size="sm" variant="ghost" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleConfirmAllPages} className="flex items-center gap-1.5 text-xs">
                <Check className="w-3.5 h-3.5" />
                <span>Save Enhanced Scans ({pages.length})</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
