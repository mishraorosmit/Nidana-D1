import React, { useState, useEffect, useRef, useCallback } from 'react';

interface OdysseyPreloaderScreenProps {
  onFinish: () => void;
  videoSrc?: string;
}

export const OdysseyPreloaderScreen: React.FC<OdysseyPreloaderScreenProps> = ({
  onFinish,
  videoSrc = '/assets/nidana-odyssey-intro.mp4',
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasFinishedRef = useRef<boolean>(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFinish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 450);
  }, [onFinish]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setProgress(100);
        const timer = setTimeout(() => {
          triggerFinish();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [triggerFinish]);

  useEffect(() => {
    safetyTimeoutRef.current = setTimeout(() => {
      if (!hasFinishedRef.current) {
        setProgress(100);
        triggerFinish();
      }
    }, 16000);

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, [triggerFinish]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    const attemptPlay = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Odyssey preloader video autoplay prevented or failed:', err);
          setHasError(true);
          let fakeProgress = 0;
          const interval = setInterval(() => {
            fakeProgress += 10;
            if (fakeProgress >= 100) {
              clearInterval(interval);
              triggerFinish();
            } else {
              setProgress(fakeProgress);
            }
          }, 150);
        }
      }
    };

    attemptPlay();

    return () => {
      isMounted = false;
    };
  }, [triggerFinish]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration > 0) {
      const pct = Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100));
      setProgress(pct);
      if (video.currentTime >= video.duration - 0.05 && !hasFinishedRef.current) {
        setProgress(100);
        triggerFinish();
      }
    }
  };

  const handleEnded = () => {
    setProgress(100);
    triggerFinish();
  };

  const handleError = () => {
    console.warn('Odyssey preloader video failed to load.');
    setHasError(true);
    setTimeout(() => {
      triggerFinish();
    }, 1200);
  };

  return (
    <div
      role="region"
      aria-label="App Initialization"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#131211] text-[#F8F2E7] select-none overflow-hidden touch-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#131211] z-0">
        {!hasError ? (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleError}
            className="w-full h-full object-cover object-center transform scale-[1.01]"
          />
        ) : (
          
          <div className="w-full h-full relative bg-gradient-to-b from-[#1C1815] via-[#2A231D] to-[#131211]">
            <img
              src="/assets/preq-header.png"
              alt=""
              className="w-full h-full object-cover opacity-40 filter blur-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};
