import React from 'react';
import { Camera, Upload, X, VideoOff } from 'lucide-react';

interface MediaControlsProps {
  images: string[];
  useCamera: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setUseCamera: (use: boolean) => void;
  capturePhoto: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export function MediaControls({
  images,
  useCamera,
  videoRef,
  setUseCamera,
  capturePhoto,
  handleFileUpload,
  removeImage
}: MediaControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button 
          onClick={() => setUseCamera(!useCamera)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 border ${useCamera ? 'border-primary bg-primary/10 text-primary' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white'} transition-colors uppercase font-bold tracking-wider`}
        >
          {useCamera ? <><VideoOff className="w-4 h-4" /> Close Cam</> : <><Camera className="w-4 h-4" /> Open Cam</>}
        </button>
        
        <label className="flex-1 flex items-center justify-center gap-2 py-4 border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white cursor-pointer transition-colors uppercase font-bold tracking-wider">
          <Upload className="w-4 h-4" />
          Upload
          <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Camera View */}
      {useCamera && (
        <div className="relative border border-primary/50 bg-black aspect-video">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-black/80 to-transparent">
            <button 
              onClick={capturePhoto}
              className="bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform active:scale-95"
            >
              SNAP PIC
            </button>
          </div>
          {/* Overlay lines for "scanning" effect */}
          <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 m-4">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-bottom-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square group border border-neutral-800">
              <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/80 text-white p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
