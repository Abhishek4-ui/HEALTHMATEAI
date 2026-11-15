import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RotateCcw, 
  SwitchCamera, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles,
  Zap,
  RefreshCw
} from 'lucide-react';
import Button from '../ui/Button';

export default function LiveCameraModal({ isOpen, onClose, onCapture, title = 'Live Clinical Camera' }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' (front) or 'environment' (rear)
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Stop all active tracks
  const stopTracks = useCallback(() => {
    if (stream) {
      try {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {}
        });
      } catch (e) {}
      setStream(null);
    }
  }, [stream]);

  // Progressive camera initialization with safe fallback constraints
  const startCamera = useCallback(async (desiredFacing) => {
    stopTracks();
    setCameraError(null);
    setIsInitializing(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or requires a secure HTTPS connection.');
      setIsInitializing(false);
      return;
    }

    const currentFacing = desiredFacing || facingMode;
    let mediaStream = null;

    // Attempt 1: High definition ideal constraints without rigid min bounds
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: currentFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
    } catch (err1) {
      console.warn('High-res constraints failed, falling back to basic facingMode:', err1.name, err1.message);
      // Attempt 2: Relaxed constraint with facingMode only
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: currentFacing } },
          audio: false,
        });
      } catch (err2) {
        console.warn('FacingMode constraints failed, falling back to basic video:', err2.name, err2.message);
        // Attempt 3: Any available video device
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3) {
          console.error('All camera attempts failed:', err3);
          if (err3.name === 'NotAllowedError' || err3.name === 'PermissionDeniedError') {
            setCameraError('Camera permission was denied. Please allow camera permissions in your browser address bar.');
          } else if (err3.name === 'NotFoundError' || err3.name === 'DevicesNotFoundError') {
            setCameraError('No camera device detected on this device.');
          } else {
            setCameraError(`Camera initialization error: ${err3.message || 'Device unavailable or in use by another application.'}`);
          }
          setIsInitializing(false);
          return;
        }
      }
    }

    if (mediaStream) {
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video auto-play warning:', playErr);
        }
      }

      // Check for multiple cameras (e.g. front and rear)
      try {
        if (navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter(d => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        }
      } catch (enumErr) {
        console.warn('Could not enumerate devices:', enumErr);
      }
    }

    setIsInitializing(false);
  }, [facingMode, stopTracks]);

  // Keep videoRef.srcObject synchronized whenever stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.warn('Stream play warning:', e));
    }
  }, [stream]);

  // Modal open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedBlob(null);
      setCapturedUrl(null);
      startCamera();
    } else {
      stopTracks();
    }
    return () => {
      stopTracks();
    };
  }, [isOpen, startCamera, stopTracks]);

  // Toggle front / rear camera
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Safe helper to construct a File object across all browsers (including iOS Safari)
  const createSafeFile = (blob, filename) => {
    try {
      return new File([blob], filename, { type: 'image/jpeg' });
    } catch (e) {
      // Fallback for older Safari/WebKit where File constructor fails
      const fallbackFile = blob;
      fallbackFile.name = filename;
      fallbackFile.lastModifiedDate = new Date();
      return fallbackFile;
    }
  };

  // Capture frame to canvas and update state
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Verify video stream dimensions
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('Camera stream is still warming up. Please wait a moment and try again.');
      return;
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    // Trigger visual shutter flash
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const filename = `clinical_photo_${Date.now()}.jpg`;

    const handleCreatedBlob = (blob) => {
      if (!blob) {
        setCameraError('Failed to capture image frame from video feed. Please try again.');
        return;
      }
      const safeFile = createSafeFile(blob, filename);
      const url = URL.createObjectURL(blob);
      setCapturedBlob(safeFile);
      setCapturedUrl(url);
    };

    try {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            handleCreatedBlob(blob);
          } else {
            // Fallback for browsers returning null on toBlob
            try {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
              fetch(dataUrl)
                .then(res => res.blob())
                .then(handleCreatedBlob)
                .catch(err => {
                  console.error('DataURL blob conversion failed:', err);
                  setCameraError('Unable to process photo. Please retry.');
                });
            } catch (dErr) {
              console.error('DataURL generation error:', dErr);
              setCameraError('Image processing error.');
            }
          }
        }, 'image/jpeg', 0.95);
      } else {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        fetch(dataUrl)
          .then(res => res.blob())
          .then(handleCreatedBlob);
      }
    } catch (err) {
      console.error('Canvas capture exception:', err);
      setCameraError('Capture error: ' + (err.message || 'Unknown canvas error'));
    }
  };

  // Retake photo: clear captured preview without unmounting video stream
  const handleRetake = () => {
    if (capturedUrl) {
      try {
        URL.revokeObjectURL(capturedUrl);
      } catch (e) {}
    }
    setCapturedBlob(null);
    setCapturedUrl(null);
  };

  // Confirm photo capture and hand off to parent
  const handleConfirm = () => {
    if (capturedBlob && onCapture) {
      onCapture(capturedBlob, capturedUrl);
    }
    stopTracks();
    onClose();
  };

  // Close modal and cleanup
  const handleClose = () => {
    if (capturedUrl) {
      try {
        URL.revokeObjectURL(capturedUrl);
      } catch (e) {}
    }
    stopTracks();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-500">
                {capturedBlob ? 'Review captured photo before confirming' : 'Align document, prescription, or clinical scan inside the frame'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Box: Video is PERMANENTLY mounted to maintain stream state */}
        <div className="relative flex-1 bg-black min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {flashEffect && (
            <div className="absolute inset-0 bg-white z-30 opacity-90 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {isInitializing && !stream && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-xs text-slate-300">Initializing camera feed...</p>
            </div>
          )}

          {cameraError ? (
            <div className="p-6 text-center max-w-md text-white space-y-3 z-20">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold">Camera Access Notice</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              <Button size="sm" variant="secondary" onClick={() => startCamera()} className="mt-2 text-xs">
                Retry Camera Access
              </Button>
            </div>
          ) : (
            <>
              {/* Keep video permanently mounted in DOM so stream is never lost */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain max-h-[500px] ${capturedUrl ? 'invisible' : 'visible'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Preview overlay when captured */}
              {capturedUrl && (
                <img
                  src={capturedUrl}
                  alt="Captured Frame Preview"
                  className="absolute inset-0 w-full h-full object-contain max-h-[500px] z-20 bg-black"
                />
              )}

              {/* Document Alignment Overlay Box (only visible during live preview) */}
              {!capturedUrl && !isInitializing && (
                <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-teal-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3 z-10">
                  <div className="flex justify-between text-[10px] text-teal-300 font-mono bg-black/50 px-2 py-0.5 rounded self-start">
                    <span>CLINICAL PHOTO ALIGNMENT</span>
                  </div>
                  <div className="text-center text-[10px] text-white/80 bg-black/60 px-2.5 py-1 rounded-full self-center">
                    Keep scan flat, avoid glare, and ensure text is in focus
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 dark:bg-aurora-midnight border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {capturedBlob ? (
            <>
              <Button size="sm" variant="secondary" onClick={handleRetake} className="flex items-center gap-1.5 text-xs">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={handleClose} className="text-xs">
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleConfirm} className="flex items-center gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  <Check className="w-3.5 h-3.5" />
                  <span>Use This Photo</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              {hasMultipleCameras ? (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-navy text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-aurora-teal" />
                  <span>Switch Camera</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Camera Active</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={handleClose} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={capturePhoto}
                  disabled={Boolean(cameraError) || isInitializing}
                  className="flex items-center gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture Photo</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
