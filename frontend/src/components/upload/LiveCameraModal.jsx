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
  RefreshCw,
  Video
} from 'lucide-react';
import Button from '../ui/Button';

export default function LiveCameraModal({ isOpen, onClose, onCapture, title = 'Live Clinical Camera' }) {
  // UI and capture state
  const [facingMode, setFacingMode] = useState('environment'); // 'user' (front) or 'environment' (rear)
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('IDLE'); // 'IDLE' | 'INITIALIZING' | 'WAITING_FOR_FRAMES' | 'READY' | 'ERROR'
  const [statusMessage, setStatusMessage] = useState('Initializing camera feed...');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  // Stable references that do not trigger effect re-executions
  const streamRef = useRef(null);
  const initCounterRef = useRef(0);
  const isPlayingRef = useRef(false);
  const frameReceivedRef = useRef(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Stop active media tracks safely and release resources
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {}
        });
      } catch (e) {}
      streamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {}
    }

    isPlayingRef.current = false;
    frameReceivedRef.current = false;
  }, []);

  // Centralized, race-condition-free camera initialization
  const initCamera = useCallback(async (requestedFacing) => {
    // Increment initialization sequence counter to invalidate prior async invocations
    const currentInitId = ++initCounterRef.current;

    stopStream();
    setCameraError(null);
    setCameraStatus('INITIALIZING');
    setStatusMessage('Requesting camera permissions...');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or requires a secure HTTPS connection.');
      setCameraStatus('ERROR');
      return;
    }

    const targetFacing = requestedFacing || facingMode;
    let newStream = null;

    // Attempt 1: High definition ideal constraints without rigid min bounds
    try {
      newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
    } catch (err1) {
      console.warn('[Camera] High-res constraints failed, falling back to facingMode:', err1.name);
      // Attempt 2: Relaxed constraint with facingMode only
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: targetFacing } },
          audio: false,
        });
      } catch (err2) {
        console.warn('[Camera] FacingMode constraint failed, falling back to basic video:', err2.name);
        // Attempt 3: Any video device
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3) {
          console.error('[Camera] All getUserMedia attempts failed:', err3);
          if (currentInitId !== initCounterRef.current) return; // Stale call

          if (err3.name === 'NotAllowedError' || err3.name === 'PermissionDeniedError') {
            setCameraError('Camera permission was denied. Please allow camera permissions in your browser address bar.');
          } else if (err3.name === 'NotFoundError' || err3.name === 'DevicesNotFoundError') {
            setCameraError('No camera hardware was detected on your computer or mobile device.');
          } else {
            setCameraError(`Camera initialization error: ${err3.message || 'Device in use or unavailable.'}`);
          }
          setCameraStatus('ERROR');
          return;
        }
      }
    }

    // Discard stream if a newer initCamera call was launched while awaiting getUserMedia
    if (currentInitId !== initCounterRef.current) {
      if (newStream) {
        newStream.getTracks().forEach(t => t.stop());
      }
      return;
    }

    // Verify that the stream contains an active live video track
    const videoTracks = newStream.getVideoTracks();
    if (!videoTracks || videoTracks.length === 0 || videoTracks[0].readyState !== 'live') {
      setCameraError('Camera device connected, but no active live video track was received.');
      setCameraStatus('ERROR');
      newStream.getTracks().forEach(t => t.stop());
      return;
    }

    streamRef.current = newStream;
    setCameraStatus('WAITING_FOR_FRAMES');
    setStatusMessage('Waiting for video frames...');

    const video = videoRef.current;
    if (!video) {
      console.warn('[Camera] Video element ref not mounted');
      return;
    }

    // Assign stream to video element exactly ONCE
    if (video.srcObject !== newStream) {
      video.srcObject = newStream;
    }

    // Controlled single play attempt that handles AbortError gracefully
    const attemptPlay = () => {
      if (currentInitId !== initCounterRef.current) return;
      if (isPlayingRef.current) return;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (currentInitId !== initCounterRef.current) return;
            isPlayingRef.current = true;
            console.log('[Camera] Playback initiated successfully');
          })
          .catch(playErr => {
            if (currentInitId !== initCounterRef.current) return;
            if (playErr.name === 'AbortError') {
              // Interrupted by an intentional stream update; not a fatal error
              console.warn('[Camera] Play request interrupted by load request');
            } else {
              console.error('[Camera] Play error:', playErr);
              setCameraError('Video playback could not be started: ' + (playErr.message || 'Autoplay blocked'));
              setCameraStatus('ERROR');
            }
          });
      }
    };

    // Frame confirmation: verify videoWidth/videoHeight > 0 and frames rendering
    const confirmFrames = () => {
      if (currentInitId !== initCounterRef.current) return;

      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        setVideoDimensions({ width: video.videoWidth, height: video.videoHeight });
        frameReceivedRef.current = true;
        setCameraStatus('READY');
        setStatusMessage('Live Camera Active');
        console.log(`[Camera] Confirmed video dimensions: ${video.videoWidth}x${video.videoHeight}`);
        return;
      }

      // Check via requestVideoFrameCallback if supported
      if (video && 'requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        video.requestVideoFrameCallback(() => {
          if (currentInitId !== initCounterRef.current) return;
          if (video.videoWidth > 0) {
            setVideoDimensions({ width: video.videoWidth, height: video.videoHeight });
            frameReceivedRef.current = true;
            setCameraStatus('READY');
            setStatusMessage('Live Camera Active');
            console.log(`[Camera] rVFC confirmed frame: ${video.videoWidth}x${video.videoHeight}`);
          }
        });
      } else {
        // Fallback polling loop (up to 2 seconds)
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (currentInitId !== initCounterRef.current || attempts > 10) {
            clearInterval(interval);
            return;
          }
          if (video && video.videoWidth > 0) {
            clearInterval(interval);
            setVideoDimensions({ width: video.videoWidth, height: video.videoHeight });
            frameReceivedRef.current = true;
            setCameraStatus('READY');
            setStatusMessage('Live Camera Active');
          }
        }, 200);
      }
    };

    // Attach event listeners for robust lifecycle tracking
    video.onloadedmetadata = () => {
      attemptPlay();
      confirmFrames();
    };

    video.onplaying = () => {
      confirmFrames();
    };

    // If metadata was already available synchronously
    if (video.readyState >= 1) {
      attemptPlay();
      confirmFrames();
    }

    // Enumerate devices for front/rear switch button
    try {
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch (e) {}
  }, [facingMode, stopStream]);

  // Modal open / close lifecycle: runs ONLY when `isOpen` changes
  useEffect(() => {
    if (isOpen) {
      setCapturedBlob(null);
      setCapturedUrl(null);
      initCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, initCamera, stopStream, facingMode]);

  // Toggle front / rear camera
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    initCamera(nextFacing);
  };

  // Safe helper to construct a File object across all browsers (including iOS Safari)
  const createSafeFile = (blob, filename) => {
    try {
      return new File([blob], filename, { type: 'image/jpeg' });
    } catch (e) {
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
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height || width === 0 || height === 0) {
      setCameraError('Camera stream is still warming up. Please wait until the live feed appears.');
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
      if (!blob || blob.size === 0) {
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
          if (blob && blob.size > 0) {
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

  // Retake photo: clear captured preview without stopping video stream
  const handleRetake = () => {
    if (capturedUrl) {
      try {
        URL.revokeObjectURL(capturedUrl);
      } catch (e) {}
    }
    setCapturedBlob(null);
    setCapturedUrl(null);

    // Resume video playback if needed
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Confirm photo capture and hand off to parent
  const handleConfirm = () => {
    if (capturedBlob && onCapture) {
      onCapture(capturedBlob, capturedUrl);
    }
    stopStream();
    onClose();
  };

  // Close modal and cleanup
  const handleClose = () => {
    if (capturedUrl) {
      try {
        URL.revokeObjectURL(capturedUrl);
      } catch (e) {}
    }
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  const isReady = cameraStatus === 'READY';
  const isInitializing = cameraStatus === 'INITIALIZING' || cameraStatus === 'WAITING_FOR_FRAMES';

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

          {/* Initializing / Waiting for frames indicator */}
          {isInitializing && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 space-y-2.5 bg-black/75">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-xs text-slate-200 font-medium">{statusMessage}</p>
              <p className="text-[10px] text-slate-400">Please grant camera permissions if prompted</p>
            </div>
          )}

          {cameraError ? (
            <div className="p-6 text-center max-w-md text-white space-y-3 z-20">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold">Camera Access Notice</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              <Button size="sm" variant="secondary" onClick={() => initCamera(facingMode)} className="mt-2 text-xs">
                Retry Camera Access
              </Button>
            </div>
          ) : (
            <>
              {/* Permanent Video Element with direct stream binding */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain max-h-[500px] ${capturedUrl ? 'hidden' : 'block'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Preview overlay when captured */}
              {capturedUrl && (
                <img
                  src={capturedUrl}
                  alt="Captured Frame Preview"
                  className="w-full h-full object-contain max-h-[500px] z-20 bg-black"
                />
              )}

              {/* Document Alignment Overlay Box (only visible when video is live and ready) */}
              {!capturedUrl && isReady && (
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
                <Button size="sm" variant="primary" onClick={handleConfirm} className="flex items-center gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold">
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
                <div className="text-[11px] flex items-center gap-1.5">
                  {isReady ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        Live Camera Active ({videoDimensions.width}x{videoDimensions.height})
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-slate-500 dark:text-slate-400">
                        {statusMessage}
                      </span>
                    </>
                  )}
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
                  disabled={Boolean(cameraError) || !isReady}
                  className={`flex items-center gap-1.5 text-xs font-semibold ${
                    !isReady
                      ? 'bg-slate-400 cursor-not-allowed text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
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
