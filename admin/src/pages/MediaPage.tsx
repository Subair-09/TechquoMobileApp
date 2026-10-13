import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { mediaApi } from '../services/api.js';
import { MediaAsset } from '../types/index.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { Modal } from '../components/Modal.js';

export const MediaPage: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview Modal
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await mediaApi.getMedia({ limit: 40 });
      if (res.success) {
        setAssets(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load media assets:', err);
      setError('Failed to fetch media assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP, SVG)');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const res = await mediaApi.uploadMedia(file);
      if (res.success) {
        fetchMedia();
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload media to Cloudinary.');
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

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await mediaApi.deleteMedia(deleteTarget._id);
      setDeleteTarget(null);
      fetchMedia();
    } catch (err: any) {
      console.error('Failed to delete media:', err);
      setError(err.response?.data?.message || 'Failed to delete asset.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Cloudinary media asset repository for editorial articles and imagery
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#050505] hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
          <span>{isUploading ? 'Uploading...' : 'Upload Asset'}</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        accept="image/*"
        className="hidden"
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
          isDragging
            ? 'border-neutral-900 bg-neutral-100'
            : 'border-neutral-300 hover:border-neutral-900 bg-white'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-neutral-900">
          Click to upload or drag files into this library
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          High-resolution PNG, JPG, or WebP up to 10MB processed by Cloudinary CDN
        </p>
      </div>

      {/* Asset Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
            Loading media assets...
          </p>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-xs text-neutral-400">
          No media files uploaded yet. Add high-quality photography above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div
              key={asset._id}
              className="bg-white rounded-xl border border-neutral-200/90 overflow-hidden shadow-2xs hover:border-neutral-400 transition-all group flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div
                onClick={() => setPreviewAsset(asset)}
                className="relative aspect-video sm:aspect-square bg-neutral-100 cursor-pointer overflow-hidden"
              >
                <img
                  src={asset.secureUrl || asset.url}
                  alt={asset.originalFilename || 'Media asset'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-black/70 text-white backdrop-blur-xs">
                  {asset.format}
                </span>
              </div>

              {/* Asset Meta & Action Footer */}
              <div className="p-2.5 space-y-1.5 border-t border-neutral-100 bg-white">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>{formatFileSize(asset.bytes)}</span>
                  {asset.width && asset.height && (
                    <span>
                      {asset.width}x{asset.height}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleCopyUrl(asset.secureUrl || asset.url, asset._id)}
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-600 transition-colors flex items-center space-x-1 text-xs"
                    title="Copy Image URL"
                  >
                    {copiedId === asset._id ? (
                      <span className="text-emerald-600 flex items-center space-x-1 text-[11px] font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[11px]">
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setDeleteTarget(asset)}
                    className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Preview Modal */}
      <Modal
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
        title="Asset Preview"
        subtitle={previewAsset?.publicId}
        maxWidth="max-w-3xl"
      >
        {previewAsset && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center max-h-[500px]">
              <img
                src={previewAsset.secureUrl || previewAsset.url}
                alt="Asset preview"
                className="max-h-[500px] w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl text-xs font-mono">
              <span className="text-neutral-500 truncate mr-3">
                {previewAsset.secureUrl || previewAsset.url}
              </span>
              <button
                onClick={() => handleCopyUrl(previewAsset.secureUrl || previewAsset.url, 'preview')}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 flex-shrink-0"
              >
                Copy URL
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Media Asset"
        message="Are you sure you want to delete this media asset? If it is currently used as an article cover, the image may fail to render."
        confirmLabel="Delete Asset"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
