import React, { useRef, useState } from 'react';
import { Upload, Video, XCircle } from 'lucide-react';

interface VideoInputProps {
  onVideoSelected: (file: File, base64: string) => void;
  isLoading: boolean;
}

const VideoInput: React.FC<VideoInputProps> = ({ onVideoSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 20 * 1024 * 1024) { // 20MB limit for browser Base64 safety
      setError("Video is too large. Please upload a clip under 20MB (approx 10-15 seconds).");
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove Data URL prefix for API
      const base64 = result.split(',')[1];
      onVideoSelected(file, base64);
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  };

  const clearSelection = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      {!previewUrl ? (
        <div 
          className={`border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center transition-colors 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer bg-white'}`}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/mp4,video/webm,video/quicktime" 
            className="hidden" 
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Upload size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700">Upload Baby Cry Video</h3>
              <p className="text-sm text-slate-500 mt-1">Select a short clip (max 20MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
          <video 
            src={previewUrl} 
            controls 
            className="w-full max-h-[400px] object-contain"
          />
          {!isLoading && (
            <button 
              onClick={clearSelection}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition"
            >
              <XCircle size={24} />
            </button>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoInput;