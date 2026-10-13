import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, X, Check, Loader2 } from 'lucide-react';
import { mediaApi } from '../services/api.js';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string, publicId?: string) => void;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Cover Image',
  helperText = 'Upload an image via Cloudinary or paste a direct URL (16:9 recommended)',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const res = await mediaApi.uploadMedia(file);
      if (res.success && res.data) {
        onChange(res.data.secureUrl || res.data.url, res.data.publicId);
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err.response?.data?.message || err.message || 'Image upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setShowUrlInput(false);
      setManualUrl('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors flex items-center space-x-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Upload file' : 'Paste URL instead'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex items-center space-x-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:border-neutral-900"
          />
          <button
            type="button"
            onClick={handleManualUrlSubmit}
            className="px-3 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Apply
          </button>
        </div>
      ) : value ? (
        /* Image Preview Box */
        <div className="relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-52 object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-medium hover:bg-neutral-100 shadow"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-rose-600 text-white text-xs hover:bg-rose-700 shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-neutral-900 bg-neutral-100'
              : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
              <p className="text-xs font-medium text-neutral-700">Uploading to Cloudinary...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-xs text-neutral-700">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
