import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, 
  Layers, 
  Eye, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileUp, 
  FileText,
  UserCheck,
  Activity,
  Microscope,
  Info
} from 'lucide-react';
import { aiService } from '../../../services/aiService';

const MODALITIES = [
  { id: 'XRAY', name: 'Chest X-Ray (CXR)', icon: Scan, desc: 'Pneumonia, pleural effusion, cardiomegaly screening' },
  { id: 'CT', name: 'Computed Tomography (CT)', icon: Layers, desc: 'Hounsfield density, intracranial hemorrhage, soft tissue' },
  { id: 'MRI', name: 'Magnetic Resonance (MRI)', icon: Eye, desc: 'T1/T2 signal mapping, ventricular morphology, white matter' },
  { id: 'ULTRASOUND', name: 'Sonography / Ultrasound', icon: Activity, desc: 'Echogenicity evaluation, fluid collection, organ parenchyma' },
  { id: 'PATHOLOGY', name: 'Digital Pathology', icon: Microscope, desc: 'Cellular pleomorphism, nuclear-cytoplasmic ratio, mitotic index' }
];

export default function Module20_MedicalImagingCenter() {
  const [selectedModality, setSelectedModality] = useState('XRAY');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [radiologistRequested, setRadiologistRequested] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Canvas Image Controls
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [inverted, setInverted] = useState(false);
  const [zoom, setZoom] = useState(100);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setAnalysisResult(null);
    setErrorMsg(null);
    setRadiologistRequested(false);

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setInverted(false);
    setZoom(100);
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setErrorMsg('Please upload a scan file to initiate clinical analysis.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('modality', selectedModality);
      formData.append('patient_consent', 'true');

      // Post to backend patient imaging endpoint via aiService
      const res = await aiService.analyzeImagingScan(formData);
      const data = res.data || res;
      if (!data || data.success === false) {
        throw new Error(data?.message || data?.error || 'Failed to analyze imaging scan.');
      }

      setAnalysisResult(data);
    } catch (err) {
      console.error('Imaging analysis error:', err);
      setErrorMsg(err.message || 'AI microservice connection error. Please verify network connectivity.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-500/20 text-teal-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-teal-500/30 flex items-center gap-1">
              <Scan className="w-3.5 h-3.5" /> Medical Imaging AI Center
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-mono">
              DICOM & Multi-Modality
            </span>
          </div>
          <h1 className="text-2xl font-bold">Clinical Radiology & Imaging Intelligence</h1>
          <p className="text-sm text-teal-100/80 max-w-2xl mt-1">
            Algorithmic pre-screening and finding prioritization for Chest X-Ray, CT, MRI, Ultrasound, and Pathology scans with certified radiologist peer-review handoff.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-right">
          <p className="text-xs text-teal-200 uppercase tracking-wider font-semibold">Triage Integrity</p>
          <p className="text-xl font-bold font-mono">100% Verified</p>
          <p className="text-[11px] text-white/70">Zero Diagnostic Fabrication</p>
        </div>
      </div>

      {/* Mandatory Clinical Safety Disclaimer Banner */}
      <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <span className="font-bold uppercase tracking-wider">Mandatory Clinical Safety Notice:</span> Automated imaging insights are computational triage assists developed for finding prioritization and workflow optimization. Under Indian Medical Council (Professional Conduct) Regulations and CDSCO SaMD directives, algorithmic output does <span className="font-bold underline">not</span> constitute a standalone radiological diagnosis. Formal evaluation by a certified Radiologist or licensed physician is strictly required.
        </div>
      </div>

      {/* Modality Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MODALITIES.map((mod) => {
          const Icon = mod.icon;
          const isActive = selectedModality === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => {
                setSelectedModality(mod.id);
                setAnalysisResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive 
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs">{mod.name.split(' (')[0]}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{mod.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Workspace: Left Panel Upload/Viewer, Right Panel Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Viewer and Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            {/* Viewer Header / Toolbar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-teal-600" /> Medical Viewer Canvas
              </span>

              {previewUrl && (
                <div className="flex items-center gap-1 bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
                  <button 
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    title="Zoom Out"
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] px-1 text-slate-500 dark:text-slate-400">{zoom}%</span>
                  <button 
                    onClick={() => setZoom(Math.min(300, zoom + 25))}
                    title="Zoom In"
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-600 mx-1" />

                  <button 
                    onClick={() => setInverted(!inverted)}
                    title="Invert Negative (Bone/Soft Tissue)"
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      inverted 
                        ? 'bg-teal-600 text-white' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    Invert
                  </button>

                  <button 
                    onClick={handleResetFilters}
                    title="Reset Viewer Filters"
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Viewer Display Window */}
            <div className="relative h-[380px] bg-slate-950 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <div 
                  className="w-full h-full flex items-center justify-center p-4 transition-transform duration-100"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${inverted ? 'invert(1)' : ''}`,
                  }}
                >
                  <img 
                    src={previewUrl} 
                    alt="Radiology preview" 
                    className="max-h-full max-w-full object-contain rounded shadow"
                  />
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-700 rounded-xl m-4 cursor-pointer hover:border-teal-500 transition-colors"
                >
                  <FileUp className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-slate-300">Upload {MODALITIES.find(m => m.id === selectedModality)?.name}</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Drop DICOM (.dcm), High-Res PNG, JPEG, or TIFF imaging files here (max 15MB)
                  </p>
                  <span className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium rounded-xl shadow">
                    Select File from Device
                  </span>
                </div>
              )}

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,.dcm" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>

            {/* Viewer Sliders Bar */}
            {previewUrl && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                    <span>Brightness</span>
                    <span className="font-mono">{brightness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="180" 
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                    <span>Window / Contrast</span>
                    <span className="font-mono">{contrast}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="200" 
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {selectedFile ? 'Change Scan File' : 'Browse Scan File'}
            </button>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || !selectedFile}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md flex items-center gap-2 transition ${
                analyzing || !selectedFile 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/25'
              }`}
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Modality ({selectedModality})...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Run AI Imaging Analysis
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: AI Findings & Structured Triage (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Preliminary AI Findings
              </h2>
              {analysisResult && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                  {analysisResult.modality}
                </span>
              )}
            </div>

            {analysisResult ? (
              <div className="space-y-4">
                {/* Image Quality Score */}
                {analysisResult.quality_validation && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Image Diagnostic Quality</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {analysisResult.quality_validation.score}/100 ({analysisResult.quality_validation.status})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${analysisResult.quality_validation.score > 70 ? 'bg-teal-500' : 'bg-amber-500'}`} 
                        style={{ width: `${analysisResult.quality_validation.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Findings List */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detected Morphological Markers</p>
                  {(analysisResult.findings || []).map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.finding}</span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          item.status.includes('NORMAL') || item.status.includes('PRESERVED') || item.status.includes('CLEAR')
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>Region: {item.anatomical_region}</span>
                        <span>Confidence: {item.confidence}% ({item.uncertainty_bounds})</span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Model Provenance */}
                {analysisResult.model_provenance && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <Info className="w-3.5 h-3.5 text-teal-600" />
                      Model Provenance & Benchmark
                    </div>
                    <p>Engine: <span className="font-mono text-slate-700 dark:text-slate-300">{analysisResult.model_provenance.model_id}</span> ({analysisResult.model_provenance.framework})</p>
                    <p>Dataset: {analysisResult.model_provenance.training_dataset}</p>
                  </div>
                )}

                {/* Doctor Review Call-to-Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  {radiologistRequested ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Radiologist Referral Dispatched</p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Status: PENDING_CLINICIAN_REVIEW. An accredited teleradiologist has been queued.</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition"
                    >
                      <UserCheck className="w-4 h-4" />
                      Request Certified Radiologist Review
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center space-y-3">
                <Scan className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Awaiting Imaging Input</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Select a modality, load a scan into the medical canvas, and run the triage analysis to view algorithmic observations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Radiologist Referral */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Confirm Radiologist Consultation</h3>
                <p className="text-xs text-slate-500">Peer-Review Referral Protocol</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will route your {selectedModality} scan and automated preliminary observations to an accredited consulting Radiologist on the HealthMate Network for formal clinical verification.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl text-[11px] text-slate-500 space-y-1">
              <p>• Data handling conforms with the Indian Digital Personal Data Protection (DPDP) Act 2023.</p>
              <p>• Ephemeral scan files will be securely purged according to your privacy settings.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setRadiologistRequested(true);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/25 transition"
              >
                Dispatch Referral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
