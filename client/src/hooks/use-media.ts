import { useState, useEffect, useRef, useCallback } from 'react';

export function useMedia() {
  const [images, setImages] = useState<string[]>([]);
  const [useCamera, setUseCamera] = useState(false);
  const [isFullscreenCamera, setIsFullscreenCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useCamera) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          setError("Could not access camera. Check permissions.");
          setUseCamera(false);
        });
    } else {
      if (videoRef.current) {
        const srcObject = videoRef.current.srcObject as MediaStream;
        if (srcObject) {
          srcObject.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [useCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 800;
           const scaleSize = MAX_WIDTH / img.width;
           canvas.width = MAX_WIDTH;
           canvas.height = img.height * scaleSize;
           const ctx = canvas.getContext('2d');
           if (ctx) {
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
             setImages(prev => [...prev, canvas.toDataURL(file.type)]);
           }
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && useCamera) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setImages(prev => [...prev, canvas.toDataURL('image/jpeg')]);
      }
    }
  }, [useCamera]);

  return {
    images,
    setImages,
    useCamera,
    setUseCamera,
    isFullscreenCamera,
    setIsFullscreenCamera,
    videoRef,
    handleFileUpload,
    removeImage,
    capturePhoto,
    error
  };
}
