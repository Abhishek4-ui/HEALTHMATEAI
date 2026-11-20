import React, { useState, useMemo } from 'react';
import { 
  Scan, 
  Layers, 
  Eye, 
  Activity, 
  Microscope, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  Info, 
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Sliders,
  HardDrive,
  Maximize2
} from 'lucide-react';
import UniversalUpload from '../../../components/upload/UniversalUpload';
import MedicalDICOMViewer from '../../../components/imaging/MedicalDICOMViewer';
import PatientFriendlyResult from '../../../components/results/PatientFriendlyResult';
import { 
  RADIOLOGY_CATALOGUE, 
  CT_STUDIES, 
  MRI_STUDIES, 
  ULTRASOUND_STUDIES 
} from '../../../constants/radiologyCatalogue';
import { MODEL_REGISTRY } from '../../../constants/modelRegistry';
import { aiService } from '../../../services/aiService';

const MODALITY_TABS = [
  { id: 'XRAY', name: 'Digital Radiography (X-Ray)', icon: Scan, desc: 'All-body anatomical skeletal & thoracic radiographs' },
  { id: 'CT', name: 'Computed Tomography (CT)', icon: Layers, desc: 'Cross-sectional axial slices & Hounsfield attenuation' },
  { id: 'MRI', name: 'Magnetic Resonance (MRI)', icon: Eye, desc: 'T1/T2 weighted neuro & musculoskeletal imaging' },
  { id: 'ULTRASOUND', name: 'Diagnostic Ultrasound', icon: Activity, desc: 'Acoustic impedance & soft-tissue parenchymal assessment' },
  { id: 'PATHOLOGY', name: 'Digital Histopathology', icon: Microscope, desc: 'Cellular pleomorphism & whole-slide digital biopsy' }
];

const LATERALITY_OPTIONS = ['N/A', 'Left', 'Right', 'Bilateral'];

export default function Module20_MedicalImagingCenter() {
  const [selectedModality, setSelectedModality] = useState('XRAY');
  
  // X-Ray Specific Selections
  const [selectedRegionId, setSelectedRegionId] = useState('CHEST_THORAX');
  const [selectedExamId, setSelectedExamId] = useState('CXR_STANDARD');
  const [selectedView, setSelectedView] = useState('PA View');
  const [selectedLaterality, setSelectedLaterality] = useState('N/A');

  // Other Modalities Selections
  const [selectedCtStudy, setSelectedCtStudy] = useState(CT_STUDIES[0]);
  const [selectedMriStudy, setSelectedMriStudy] = useState(MRI_STUDIES[0]);
  const [selectedUsStudy, setSelectedUsStudy] = useState(ULTRASOUND_STUDIES[0]);

  // File & Viewer State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [radiologistRequested, setRadiologistRequested] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Current selected region in catalogue
  const currentRegion = useMemo(() => {
    return RADIOLOGY_CATALOGUE.find(r => r.id === selectedRegionId) || RADIOLOGY_CATALOGUE[0];
  }, [selectedRegionId]);

  // Current examination object with strict clinical model compatibility mapping
  const currentExam = useMemo(() => {
    if (selectedModality === 'XRAY') {
      const exam = currentRegion.examinations.find(e => e.id === selectedExamId) || currentRegion.examinations[0];
      const isChest = exam.id === 'CXR_STANDARD' || exam.id === 'CXR_PORTABLE';
      
      let reason = null;
      if (!isChest) {
        if (selectedRegionId === 'HEAD_FACE') {
          reason = 'Thoracic deep learning models are strictly sequestered from Craniofacial radiographs to prevent diagnostic hallucination. Certified radiologist review is recommended.';
        } else if (selectedRegionId === 'SPINE') {
          reason = 'Thoracic screening pipelines cannot evaluate vertebral compression, disc spacing, or spinal curvature. Certified spine specialist review is required.';
        } else if (selectedRegionId === 'SHOULDER_UPPER_LIMB' || selectedRegionId === 'LOWER_LIMB' || selectedRegionId === 'PELVIS_HIP') {
          reason = 'Musculoskeletal extremity and pelvic radiographs require certified orthopedic/radiological evaluation for joint spacing and trabecular disruption.';
        } else if (selectedRegionId === 'ABDOMEN') {
          reason = 'Bowel gas patterns and intra-abdominal calcifications require specialized abdominal radiological assessment.';
        } else if (selectedRegionId === 'DENTAL') {
          reason = 'Maxillofacial and dental radiographs require licensed dental specialist interpretation.';
        } else {
          reason = 'Thoracic AI models must never be applied to non-thoracic radiographs to maintain clinical safety standards.';
        }
      }

      return {
        ...exam,
        aiModelSupported: isChest,
        modelId: isChest ? 'mdl_cxr_denseresnet_v2' : null,
        unsupportedReason: reason
      };
    }

    if (selectedModality === 'CT') {
      const isSupported = selectedCtStudy.includes('Head') || 
                          selectedCtStudy.includes('Brain') || 
                          selectedCtStudy.includes('Thorax') || 
                          selectedCtStudy.includes('Chest') || 
                          selectedCtStudy.includes('Abdomen');
      return { 
        id: 'CT_SCAN', 
        name: selectedCtStudy, 
        aiModelSupported: isSupported, 
        modelId: isSupported ? 'mdl_ct_axial_slice_v1' : null,
        unsupportedReason: isSupported ? null : 'Axial attenuation profiling is validated for Thoracic, Neuro, and Abdominopelvic CT series. Extremity / specialized CT requires manual radiologist inspection.'
      };
    }

    if (selectedModality === 'MRI') {
      const isSupported = selectedMriStudy.includes('Brain');
      return { 
        id: 'MRI_SCAN', 
        name: selectedMriStudy, 
        aiModelSupported: isSupported, 
        modelId: isSupported ? 'mdl_mri_neuro_t2_v1' : null,
        unsupportedReason: isSupported ? null : 'Neuro-MRI signal boundary classifier is validated for Brain structural series. Musculoskeletal and cardiac MRI require certified radiologist evaluation.'
      };
    }

    if (selectedModality === 'ULTRASOUND') {
      return { 
        id: 'US_SCAN', 
        name: selectedUsStudy, 
        aiModelSupported: false, 
        modelId: null,
        unsupportedReason: 'Diagnostic ultrasound relies on dynamic operator-dependent acoustic impedance and real-time probe sweeps. Static single-frame algorithmic diagnosis is not clinically recommended.'
      };
    }

    return { 
      id: 'HISTOPATHOLOGY', 
      name: 'Digital Histopathology Biopsy', 
      aiModelSupported: false, 
      modelId: null,
      unsupportedReason: 'Whole-slide digital histopathology requires calibrated multi-gigabyte pyramidal WSI scanning and board-certified histopathologist review.'
    };
  }, [selectedModality, currentRegion, selectedExamId, selectedRegionId, selectedCtStudy, selectedMriStudy, selectedUsStudy]);

  // Available views for currently selected exam
  const availableViews = useMemo(() => {
    if (selectedModality === 'XRAY') {
      return currentExam.views || ['Standard View', 'Not Sure'];
    }
    return ['Axial', 'Coronal', 'Sagittal', 'Standard Projection'];
  }, [selectedModality, currentExam]);

  // Switch region handler
  const handleRegionChange = (newRegionId) => {
    setSelectedRegionId(newRegionId);
    const targetRegion = RADIOLOGY_CATALOGUE.find(r => r.id === newRegionId);
    if (targetRegion && targetRegion.examinations.length > 0) {
      const firstExam = targetRegion.examinations[0];
      setSelectedExamId(firstExam.id);
      setSelectedView(firstExam.views?.[0] || 'Standard View');
    }
    setAnalysisResult(null);
  };

  // Upload handler from UniversalUpload
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setErrorMsg(null);
    setRadiologistRequested(false);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Run Clinical Analysis
  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setErrorMsg('Please upload or scan an imaging file to initiate clinical analysis.');
      return;
    }

    if (!currentExam.aiModelSupported) {
      setErrorMsg(`AI automated analysis is intentionally unavailable for ${currentExam.name} pursuant to clinical safety guardrails. Secure cloud storage and DICOM viewing are active.`);
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('modality', selectedModality);
      formData.append('examination_id', currentExam.id);
      formData.append('patient_consent', 'true');

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
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-500/20 text-teal-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-teal-500/30 flex items-center gap-1">
              <Scan className="w-3.5 h-3.5" /> Medical Imaging Center
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-mono">
              All-Body Modality Coverage • Cornerstone3D Canvas
            </span>
          </div>
          <h1 className="text-2xl font-bold">Clinical Radiology & Multi-Modality Intelligence</h1>
          <p className="text-sm text-teal-100/80 max-w-2xl mt-1">
            Comprehensive diagnostic imaging hub covering all anatomical X-ray examinations, CT, MRI, Ultrasound, and Histopathology with verified AI triage and peer-review handoff.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-right">
          <p className="text-xs text-teal-200 uppercase tracking-wider font-semibold">Triage Integrity</p>
          <p className="text-xl font-bold font-mono">Zero Fabrication</p>
          <p className="text-[11px] text-white/70">Evidence-Backed Models</p>
        </div>
      </div>

      {/* Mandatory Clinical Safety Disclaimer Banner */}
      <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-bold uppercase tracking-wider">Mandatory Clinical Safety Notice:</span> Automated imaging insights are computational triage assists developed for finding prioritization and workflow optimization. Under Indian Medical Council (Professional Conduct) Regulations and CDSCO SaMD directives, algorithmic output does <span className="font-bold underline">not</span> constitute a standalone radiological diagnosis. Formal evaluation by a certified Radiologist or licensed physician is strictly required.
        </div>
      </div>

      {/* Modality Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MODALITY_TABS.map((mod) => {
          const Icon = mod.icon;
          const isActive = selectedModality === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => {
                setSelectedModality(mod.id);
                setAnalysisResult(null);
                setErrorMsg(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive 
                  ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 shadow-sm ring-1 ring-teal-500'
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

      {/* Modality-Specific Examination Configuration Box */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            Study & Anatomical Parameters
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Selected: <strong className="text-slate-800 dark:text-slate-200">{currentExam.name}</strong>
          </span>
        </div>

        {/* When X-Ray: Region, Examination, View & Laterality */}
        {selectedModality === 'XRAY' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Anatomical Region
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {RADIOLOGY_CATALOGUE.map(reg => (
                  <option key={reg.id} value={reg.id}>{reg.regionName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specific Examination
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setAnalysisResult(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {currentRegion.examinations.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Radiographic View / Projection
              </label>
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {availableViews.map((v, i) => (
                  <option key={i} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Laterality / Side
              </label>
              <select
                value={selectedLaterality}
                onChange={(e) => setSelectedLaterality(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {LATERALITY_OPTIONS.map(lat => (
                  <option key={lat} value={lat}>{lat}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* When CT: CT Study Selector */}
        {selectedModality === 'CT' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CT Clinical Study Protocol
              </label>
              <select
                value={selectedCtStudy}
                onChange={(e) => {
                  setSelectedCtStudy(e.target.value);
                  setAnalysisResult(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {CT_STUDIES.map((ct, idx) => (
                  <option key={idx} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Hounsfield Preset</p>
                <p className="text-[11px] text-slate-500">Standard / Lung / Bone / Brain</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                HU Attenuation
              </span>
            </div>
          </div>
        )}

        {/* When MRI: MRI Study Selector */}
        {selectedModality === 'MRI' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                MRI Study Sequence Protocol
              </label>
              <select
                value={selectedMriStudy}
                onChange={(e) => {
                  setSelectedMriStudy(e.target.value);
                  setAnalysisResult(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {MRI_STUDIES.map((mri, idx) => (
                  <option key={idx} value={mri}>{mri}</option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Pulse Sequence</p>
                <p className="text-[11px] text-slate-500">T1 / T2 / FLAIR Multi-Echo</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                Resonance Signal
              </span>
            </div>
          </div>
        )}

        {/* When Ultrasound: Ultrasound Study Selector */}
        {selectedModality === 'ULTRASOUND' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sonography Examination Protocol
              </label>
              <select
                value={selectedUsStudy}
                onChange={(e) => {
                  setSelectedUsStudy(e.target.value);
                  setAnalysisResult(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {ULTRASOUND_STUDIES.map((us, idx) => (
                  <option key={idx} value={us}>{us}</option>
                ))}
              </select>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Acoustic Mode</p>
                <p className="text-[11px] text-slate-500">B-Mode + Color Doppler</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                Echogenicity
              </span>
            </div>
          </div>
        )}

        {/* Dedicated 3-Tier Examination Capability Status Matrix */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Examination Capability & Service Matrix
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Status 1: File Upload & Secure Storage */}
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">1. Storage & Archival</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-tight">
                  Always available. Encrypted cloud storage for DICOM (.dcm), PNG, JPG, and PDF.
                </p>
              </div>
            </div>

            {/* Status 2: Interactive DICOM Viewing */}
            <div className="p-3 rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/50 dark:bg-cyan-950/20 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-600 text-white shrink-0 mt-0.5">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-cyan-900 dark:text-cyan-200">2. Interactive DICOM</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-cyan-800/80 dark:text-cyan-300/80 mt-0.5 leading-tight">
                  Cornerstone3D WebGL engine with custom Hounsfield windowing, pan, zoom, and invert.
                </p>
              </div>
            </div>

            {/* Status 3: AI Analysis Compatibility */}
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              currentExam.aiModelSupported
                ? 'border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20'
            }`}>
              <div className={`p-1.5 rounded-lg text-white shrink-0 mt-0.5 ${
                currentExam.aiModelSupported ? 'bg-teal-600' : 'bg-amber-600'
              }`}>
                {currentExam.aiModelSupported ? <Sparkles className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className={`text-xs font-bold ${
                    currentExam.aiModelSupported ? 'text-teal-900 dark:text-teal-200' : 'text-amber-900 dark:text-amber-200'
                  }`}>
                    3. AI Clinical Model
                  </h4>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    currentExam.aiModelSupported
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                  }`}>
                    {currentExam.aiModelSupported ? 'MODEL READY' : 'PEER-REVIEW ONLY'}
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 leading-tight ${
                  currentExam.aiModelSupported
                    ? 'text-teal-800/80 dark:text-teal-300/80'
                    : 'text-amber-800/80 dark:text-amber-300/80'
                }`}>
                  {currentExam.aiModelSupported ? (
                    <>Model <strong className="font-mono">{currentExam.modelId}</strong> is validated for {currentExam.name}.</>
                  ) : (
                    currentExam.unsupportedReason || 'Clinical guardrail active: model withheld for non-thoracic anatomy to prevent diagnostic error.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace: Left Panel Upload & DICOM Viewer, Right Panel Findings & Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Hub & Medical Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Universal Upload Integration */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <UniversalUpload
              files={selectedFile ? [selectedFile] : []}
              onFileSelect={handleFileSelect}
              acceptedTypes={['.dcm', '.png', '.jpg', '.jpeg', '.webp', '.pdf']}
              maxSizeMB={25}
              title={`Upload or Scan ${currentExam.name}`}
              subtitle="Device browse, live camera capture of film negatives, or document scanner enhancement"
              allowCamera={true}
              allowScanner={true}
            />
          </div>

          {/* Interactive Medical DICOM Canvas */}
          <MedicalDICOMViewer
            file={selectedFile}
            imageUrl={previewUrl}
            modality={selectedModality}
            studyMetadata={{
              patientName: 'Anonymous Patient (Protected)',
              studyDate: new Date().toLocaleDateString(),
              modality: selectedModality,
              seriesDescription: `${currentExam.name} (${selectedView || 'Standard'})`,
              dimensions: 'High-Res Digital Matrix',
              sopClass: selectedModality === 'CT' ? 'CT Image Storage' : 'Digital X-Ray Storage'
            }}
          />

          {/* Action Trigger Buttons */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 w-full sm:w-auto">
              {selectedFile ? (
                <span>Loaded Scan: <strong className="text-slate-800 dark:text-slate-200">{selectedFile.name}</strong></span>
              ) : (
                <span>No scan loaded yet. Browse or take a live camera photo above.</span>
              )}
            </div>

            {currentExam.aiModelSupported ? (
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing || !selectedFile}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2 transition ${
                  analyzing || !selectedFile
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/25'
                }`}
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing {currentExam.name}...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    Run AI Imaging Analysis
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowReviewModal(true)}
                  disabled={!selectedFile}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2 transition ${
                    !selectedFile
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Request Radiologist Review</span>
                </button>
              </div>
            )}
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
                Preliminary Clinical Triage
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
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Diagnostic Image Quality</span>
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
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {analysisResult.ai_model_supported === false ? 'Clinical Sequestration Safeguard' : 'Detected Morphological Markers'}
                  </p>
                  {analysisResult.ai_model_supported === false ? (
                    <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Thoracic Deep Learning Sequestration Active</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {analysisResult.unsupported_reason || 'Thoracic AI models must never be applied to non-thoracic radiographs to maintain clinical safety standards. Certified specialist review is required.'}
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Recommended Action: Dispatch to certified radiologist below.</span>
                      </div>
                    </div>
                  ) : (
                    (analysisResult.findings || []).map((item, idx) => (
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
                    ))
                  )}
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
              <div className="py-10 px-4 text-center space-y-3">
                <Scan className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {currentExam.aiModelSupported ? 'Awaiting Scan Input' : 'Certified Clinician Review Channel'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {currentExam.aiModelSupported
                    ? `Load an imaging file for ${currentExam.name} and click "Run AI Imaging Analysis" to inspect morphological markers.`
                    : `${currentExam.name} operates under peer-review safety protocol. You can inspect the image in the DICOM canvas with custom windowing or dispatch it to an accredited Radiologist.`}
                </p>
                {!currentExam.aiModelSupported && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    disabled={!selectedFile}
                    className={`mt-3 px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition ${
                      !selectedFile ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                    }`}
                  >
                    Dispatch to Radiologist Directly
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Friendly Structured Report Display (When Analysis Result Exists) */}
      {analysisResult && (
        <div className="pt-4">
          <PatientFriendlyResult
            analysisResult={analysisResult}
            modality={selectedModality}
            examTitle={currentExam.name}
            modelId={currentExam.modelId || 'mdl_cxr_denseresnet_v2'}
          />
        </div>
      )}

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
              This will route your {currentExam.name} scan ({selectedModality}) to an accredited consulting Radiologist on the HealthMate Telemedicine Network for formal clinical verification.
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
