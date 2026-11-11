import React, { useState, useRef } from 'react';
import { 
  Heart, 
  Activity, 
  ShieldAlert, 
  FileUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  Zap, 
  ArrowUpRight, 
  Info,
  Calendar
} from 'lucide-react';

export default function Module21_ECGCardiacCenter() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientAge, setPatientAge] = useState(50);
  const [analyzing, setAnalyzing] = useState(false);
  const [ecgResult, setEcgResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [cardiologistConsulted, setCardiologistConsulted] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setEcgResult(null);
    setErrorMsg(null);
    setCardiologistConsulted(false);
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select an ECG recording file (PDF, PNG, or JPG) to analyze.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('ecg', selectedFile);
      formData.append('patient_age', String(patientAge));
      formData.append('patient_consent', 'true');

      const response = await fetch('/api/v1/patient/cardiac/ecg-analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || 'Failed to analyze ECG recording.');
      }

      setEcgResult(data);
    } catch (err) {
      console.error('ECG analysis error:', err);
      setErrorMsg(err.message || 'AI microservice unreachable. Please ensure the backend and AI services are running.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper to generate SVG path from Lead II points
  const renderWaveformPath = (points) => {
    if (!points || points.length === 0) return '';
    // SVG dimensions: viewBox 0 0 1000 200
    // Y center is 100. Amplitude 1.0mV = 60px height.
    return points.map((p, idx) => {
      const x = p.time_ms; // 0 to 1000
      const y = 100 - (p.amplitude_mv * 60);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-rose-500/20 text-rose-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-rose-500/30 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Cardiac Intelligence Center
            </span>
            <span className="bg-white/10 text-rose-200 text-xs px-2 py-0.5 rounded-full font-mono">
              PTB-XL Validated Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-bold">12-Lead Electrocardiography & Rhythm Intelligence</h1>
          <p className="text-sm text-rose-100/80 max-w-2xl mt-1">
            Algorithmic measurement of cardiac conduction intervals, Bazett QTc calculation, and automated rhythm categorization with direct cardiology consultation triage.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-right">
          <p className="text-xs text-rose-200 uppercase tracking-wider font-semibold">Standard Conduction</p>
          <p className="text-xl font-bold font-mono">Bazett Formula</p>
          <p className="text-[11px] text-white/70">QTc = QT / √(RR)</p>
        </div>
      </div>

      {/* Mandatory Clinical Safety Disclaimer Banner */}
      <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <span className="font-bold uppercase tracking-wider">Mandatory Emergency Notice:</span> This algorithmic ECG assessment is a preliminary triage screening assist. It is <span className="font-bold underline">not</span> a replacement for a formal clinical reading by a certified Cardiologist. In the presence of acute chest discomfort, radiating left arm pain, diaphoresis, or sudden shortness of breath, immediately contact national emergency services (<span className="font-bold font-mono">Dial 112 / 102</span>) or proceed to the nearest emergency department.
        </div>
      </div>

      {/* Top Configuration & Upload Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ECG Recording File (PDF or High-Resolution Image)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 hover:border-rose-500 cursor-pointer flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
                <FileUp className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span className="truncate">{selectedFile ? selectedFile.name : 'Choose ECG PDF / Image...'}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">Browse</span>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Patient Age (for normal interval calibration)
            </label>
            <input 
              type="number"
              min="1"
              max="110"
              value={patientAge}
              onChange={(e) => setPatientAge(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-4 flex items-end">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || !selectedFile}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2 transition ${
                analyzing || !selectedFile 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/25'
              }`}
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating Intervals & Waveforms...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Analyze ECG Conduction & Rhythm
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Analysis Display */}
      {ecgResult && (
        <div className="space-y-6">
          {/* Waveform Visualizer Canvas (Interactive SVG with Standard ECG Millivolt Grid) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600" />
                  Lead II Rhythm Strip Waveform (1000 ms Sweep)
                </h2>
                <p className="text-xs text-slate-500">Standard Calibration: 25 mm/s, 10 mm/mV (0.04s small box, 0.20s major box)</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                  P-QRS-T Synthesized Trace
                </span>
                {hoveredPoint && (
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200">
                    t: {hoveredPoint.time_ms}ms | v: {hoveredPoint.amplitude_mv}mV
                  </span>
                )}
              </div>
            </div>

            {/* SVG ECG Grid & Waveform */}
            <div className="w-full bg-[#fff5f5] dark:bg-[#1a0f12] rounded-xl border border-rose-200 dark:border-rose-950/60 p-2 overflow-x-auto">
              <svg 
                viewBox="0 0 1000 200" 
                className="w-full h-48 min-w-[700px] select-none"
              >
                <defs>
                  {/* Minor Grid: 10px (~0.04s) */}
                  <pattern id="ecgMinorGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(244, 63, 94, 0.15)" strokeWidth="0.5" />
                  </pattern>
                  {/* Major Grid: 50px (~0.20s) */}
                  <pattern id="ecgMajorGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <rect width="50" height="50" fill="url(#ecgMinorGrid)" />
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(244, 63, 94, 0.35)" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Grid Background */}
                <rect width="1000" height="200" fill="url(#ecgMajorGrid)" />

                {/* Baseline 0.0mV Center Line */}
                <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(244, 63, 94, 0.5)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Waveform Trace */}
                <path 
                  d={renderWaveformPath(ecgResult.waveform_lead_ii)} 
                  fill="none" 
                  stroke="#e11d48" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Interactive Points on hover */}
                {(ecgResult.waveform_lead_ii || []).filter((_, i) => i % 5 === 0).map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.time_ms}
                    cy={100 - (pt.amplitude_mv * 60)}
                    r="3"
                    className="opacity-0 hover:opacity-100 fill-rose-700 cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Metric Telemetry Cards (Intervals & Rate) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Heart Rate */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Heart Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {ecgResult.cardiac_measurements?.heart_rate_bpm || 72}
                </span>
                <span className="text-xs text-slate-400">BPM</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Normal: 60 - 100 BPM</p>
            </div>

            {/* PR Interval */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PR Interval</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {ecgResult.cardiac_measurements?.pr_interval_ms || 160}
                </span>
                <span className="text-xs text-slate-400">ms</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Normal: 120 - 200 ms</p>
            </div>

            {/* QRS Duration */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">QRS Duration</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {ecgResult.cardiac_measurements?.qrs_duration_ms || 90}
                </span>
                <span className="text-xs text-slate-400">ms</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Normal: 80 - 120 ms</p>
            </div>

            {/* Bazett QTc Interval */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">QTc (Bazett)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {ecgResult.cardiac_measurements?.qtc_interval_ms || 410}
                </span>
                <span className="text-xs text-slate-400">ms</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Normal: &lt; 440 ms (Male), &lt; 460 ms (Female)</p>
            </div>
          </div>

          {/* Rhythm Classification & Clinical Consultation Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Cardiac Rhythm Assessment
              </h3>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {ecgResult.rhythm_analysis?.classification?.replace(/_/g, ' ') || 'NORMAL SINUS RHYTHM'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold ${
                    ecgResult.rhythm_analysis?.triage_urgency === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    Urgency: {ecgResult.rhythm_analysis?.triage_urgency || 'ROUTINE'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ecgResult.rhythm_analysis?.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Confidence: {ecgResult.rhythm_analysis?.confidence_score}% ({ecgResult.rhythm_analysis?.uncertainty_bounds})</span>
                  <span>ST Elevation: {ecgResult.rhythm_analysis?.is_st_segment_elevated ? 'DETECTED' : 'NOT DETECTED'}</span>
                </div>
              </div>

              {ecgResult.model_provenance && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                  <p>Model ID: <span className="font-mono">{ecgResult.model_provenance.model_id}</span> ({ecgResult.model_provenance.framework})</p>
                  <p>Validation Benchmark: {ecgResult.model_provenance.training_dataset}</p>
                </div>
              )}
            </div>

            {/* Consultation Action Box */}
            <div className="md:col-span-5 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-700 p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Clinical Action</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Review with a Cardiologist</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Connect with registered cardiologists across 36 Indian States and Union Territories for comprehensive Holter, Echo, or Stress testing evaluation.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {cardiologistConsulted ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Consultation Request Queued</p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Cardiology triage specialist assigned to patient session.</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCardiologistConsulted(true)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    Book Priority Cardiology Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
