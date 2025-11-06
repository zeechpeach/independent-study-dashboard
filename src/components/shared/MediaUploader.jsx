import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, File, Trash2 } from 'lucide-react';
import { validateFile } from '../../services/firebase';

/**
 * MediaUploader - Component for uploading and managing media files in notes
 * Supports images (JPG, PNG, GIF), PDFs, and document files
 */
const MediaUploader = ({ media = [], onMediaChange, disabled = false }) => {
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    setUploadError('');
    const newMediaItems = [];
    const errors = [];

    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Create a temporary media item with the File object
      // The actual upload happens when the note is saved
      newMediaItems.push({
        file: file,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
        mimeType: file.type,
        // Create a temporary preview URL for images
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        isNew: true // Flag to indicate this needs to be uploaded
      });
    }

    if (errors.length > 0) {
      setUploadError(errors.join('; '));
    }

    if (newMediaItems.length > 0) {
      onMediaChange([...media, ...newMediaItems]);
    }

    // Reset the input
    e.target.value = '';
  };

  const handleRemoveMedia = (index) => {
    const newMedia = [...media];
    const removedItem = newMedia[index];
    
    // Revoke the preview URL if it exists
    if (removedItem.previewUrl && removedItem.isNew) {
      URL.revokeObjectURL(removedItem.previewUrl);
    }
    
    newMedia.splice(index, 1);
    onMediaChange(newMedia);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mediaItem) => {
    if (mediaItem.type === 'image') {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (mediaItem.mimeType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        
        {/* Upload button */}
        <label className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 text-gray-700'
        }`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload Files</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />
        </label>
        
        <p className="text-xs text-gray-500 mt-1">
          Supported: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT (max 10MB each)
        </p>
        
        {uploadError && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {uploadError}
          </div>
        )}
      </div>

      {/* Media list */}
      {media.length > 0 && (
        <div className="space-y-2">
          {media.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              {/* Preview or icon */}
              {item.type === 'image' && (item.previewUrl || item.url) ? (
                <img
                  src={item.previewUrl || item.url}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded border border-gray-300"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded border border-gray-300">
                  {getFileIcon(item)}
                </div>
              )}
              
              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(item.size)}
                  {item.isNew && <span className="ml-2 text-purple-600">• Pending upload</span>}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                {item.url && !item.isNew && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title="View/Download"
                  >
                    <FileText className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(index)}
                  disabled={disabled}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
