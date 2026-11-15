import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RotateCcw, 
  SwitchCamera, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles,
  Zap
} from 'lucide-react';
import Button from '../ui/Button';

export default function LiveCameraModal({ isOpen, onClose, onCapture, title = 'Live Camera Capture' }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' (front) or 'environment' (rear)
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Stop all active camera tracks
  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopTracks();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or requires a secure HTTPS/localhost connection.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 1024 },
          height: { ideal: 1080, min: 768 },
        },
        audio: false, // Explicitly no audio / continuous recording
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check available devices for switching
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser address bar to capture photos.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on your device.');
      } else {
        setCameraError(`Unable to start camera: ${err.message || 'Device in use or unavailable.'}`);
      }
    }
  }, [facingMode, stopTracks]);

  // Handle open / close lifecycle
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

  // Switch between front & rear cameras
  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame to canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setCapturedBlob(file);
        setCapturedUrl(url);
      }
    }, 'image/jpeg', 0.95);
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }
    setCapturedBlob(null);
    setCapturedUrl(null);
  };

  // Confirm photo capture
  const handleConfirm = () => {
    if (capturedBlob && onCapture) {
      onCapture(capturedBlob, capturedUrl);
    }
    stopTracks();
    onClose();
  };

  const handleClose = () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
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

        {/* Viewport Box */}
        <div className="relative flex-1 bg-black min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {flashEffect && <div className="absolute inset-0 bg-white z-30 opacity-90 animate-out fade-out duration-200 pointer-events-none" />}

          {cameraError ? (
            <div className="p-6 text-center max-w-md text-white space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold">Camera Access Notice</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              <Button size="sm" variant="secondary" onClick={startCamera} className="mt-2 text-xs">
                Retry Camera Access
              </Button>
            </div>
          ) : capturedUrl ? (
            <img
              src={capturedUrl}
              alt="Captured Frame Preview"
              className="max-h-[500px] w-auto max-w-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain max-h-[500px]"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Document Alignment Overlay Box */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-teal-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] text-teal-300 font-mono bg-black/40 px-2 py-0.5 rounded self-start">
                  <span>CLINICAL PHOTO ALIGNMENT</span>
                </div>
                <div className="text-center text-[10px] text-white/70 bg-black/50 px-2.5 py-1 rounded-full self-center">
                  Keep scan flat, avoid glare, and ensure text is in focus
                </div>
              </div>
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
                <Button size="sm" variant="primary" onClick={handleConfirm} className="flex items-center gap-1.5 text-xs">
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
                <div className="text-[11px] text-slate-400">Live Camera Active</div>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={handleClose} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={capturePhoto}
                  disabled={Boolean(cameraError)}
                  className="flex items-center gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white"
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
