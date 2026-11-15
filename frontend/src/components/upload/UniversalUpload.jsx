import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  FileText, 
  Scan, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileCheck2, 
  Sliders, 
  Eye, 
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LiveCameraModal from './LiveCameraModal';
import DocumentScannerModal from './DocumentScannerModal';

export default function UniversalUpload({
  files = [],
  onChange,
  onStartProcessing,
  processing = false,
  processingStatus = 'WAITING', // 'WAITING', 'UPLOADING', 'UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'
  statusMessage = '',
  accept = '.pdf,image/png,image/jpeg,image/webp,.dcm',
  maxSizeBytes = 25 * 1024 * 1024, // 25 MB default
  multiple = false,
  showCameraOption = true,
  showScannerOption = true,
  uploadLabel = 'Choose medical document, scan, or report',
  helperText = 'Supported formats: PDF, JPG, PNG, WEBP, DICOM (.dcm). Max size 25MB.',
  title = 'Upload Medical Document',
  enableQualityValidation = true,
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [qualityWarnings, setQualityWarnings] = useState([]);

  const inputRef = useRef(null);

  // Validate files
  const validateAndAddFiles = (incomingFiles) => {
    const validFiles = [];
    const warnings = [];

    const fileList = Array.from(incomingFiles);
    for (const f of fileList) {
      if (f.size > maxSizeBytes) {
        warnings.push(`"${f.name}" exceeds the maximum allowable size of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`);
        continue;
      }

      // Check quality if image
      if (enableQualityValidation && f.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(f);
        img.onload = () => {
          if (img.width < 800 || img.height < 600) {
            warnings.push(`Resolution of "${f.name}" (${img.width}x${img.height}) is below optimal diagnostic clarity (minimum 800x600).`);
            setQualityWarnings(prev => [...new Set([...prev, ...warnings])]);
          }
        };
      }

      validFiles.push(f);
    }

    if (validFiles.length > 0) {
      if (multiple) {
        onChange([...files, ...validFiles]);
      } else {
        onChange([validFiles[0]]);
      }
    }

    if (warnings.length > 0) {
      setQualityWarnings(warnings);
    } else {
      setQualityWarnings([]);
    }
  };

  const handleFilePickerChange = (e) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    onChange(updated);
    setQualityWarnings([]);
  };

  // Live Camera Handshake
  const handleCameraCapture = (file) => {
    validateAndAddFiles([file]);
  };

  // Document Scanner Handshake
  const handleScannerConfirm = (scannedFiles) => {
    onChange(scannedFiles);
    setQualityWarnings([]);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center relative ${
          dragActive
            ? 'border-aurora-teal bg-teal-50/50 dark:bg-teal-950/20'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-aurora-midnight/50 hover:border-aurora-teal/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shadow-xs">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{title}</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{helperText}</p>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse Device</span>
            </Button>

            {showCameraOption && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setIsCameraOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Camera className="w-3.5 h-3.5 text-aurora-teal" />
                <span>Open Live Camera</span>
              </Button>
            )}

            {showScannerOption && files.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Scan className="w-3.5 h-3.5 text-aurora-violet" />
                <span>Enhance / Scan Document</span>
              </Button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFilePickerChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Quality Warnings */}
      {qualityWarnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Image Quality Pre-Check Notice:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-700 dark:text-amber-400">
            {qualityWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Attached Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
            <span>Selected Files ({files.length})</span>
            {processing && (
              <span className="flex items-center gap-1.5 text-aurora-teal">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{statusMessage || 'Processing analysis...'}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {files.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
              const isDicom = file.name.endsWith('.dcm') || file.type.includes('dicom');
              const previewUrl = isImage ? URL.createObjectURL(file) : null;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
                        {isDicom ? <Scan className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="uppercase font-mono">{file.name.split('.').pop()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {showScannerOption && isImage && (
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        title="Enhance scan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-aurora-teal hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => handleRemoveFile(idx)}
                      title="Remove file"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trigger Processing Button */}
          {onStartProcessing && (
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                loading={processing}
                disabled={files.length === 0 || processing}
                onClick={onStartProcessing}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {processing ? statusMessage || 'Running Clinical Analysis...' : 'Start Clinical Analysis & Extraction'}
                </span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Live Camera Modal */}
      <LiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Live Clinical Camera"
      />

      {/* Document Scanner & Editor Modal */}
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        initialFiles={files}
        onConfirmScans={handleScannerConfirm}
      />
    </div>
  );
}
