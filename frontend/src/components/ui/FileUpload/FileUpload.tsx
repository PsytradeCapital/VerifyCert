import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ariaLabels, ariaDescriptions, generateAriaId } from '../../../utils/ariaUtils';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  previewHeight?: number;

interface FileWithPreview extends File {
  preview?: string;

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  label,
  error,
  helperText,
  disabled = false,
  className = '',
  showPreview = true,
  previewHeight = 120
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    return null;
  };

  const generatePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!showPreview) {
        resolve(null);
        return;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
    });
  };

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

  const isPdfFile = (file: File): boolean => {
    return file.type === 'application/pdf';
  };

  const getFileIcon = (file: File): string => {
    if (isImageFile(file)) return '🖼️';
    if (isPdfFile(file)) return '📄';
    if (file.type.includes('json')) return '📋';
    if (file.type.includes('text')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const preview = await generatePreview(file);
        const fileWithPreview: FileWithPreview = Object.assign(file, { preview: preview || undefined });
        validFiles.push(fileWithPreview);

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFileSelect(validFiles);

    if (errors.length > 0) {
      console.error('File validation errors:', errors);
  }, [maxSize, onFileSelect, showPreview]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
      });
    };
  }, [selectedFiles]);

  const uploadId = generateAriaId('file-upload');
  const descriptionId = generateAriaId('upload-description');
  const instructionsId = generateAriaId('upload-instructions');

  return (
    <div className={className}>
      {label && (
        <label htmlFor={uploadId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Screen reader instructions */}
      <div id={instructionsId} className="sr-only">
        {ariaDescriptions.forms.fileUpload}
      </div>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 cursor-pointer
          ${isDragOver && !disabled
            ? 'border-blue-400 bg-blue-50 scale-[1.02] shadow-lg'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:bg-gray-50 hover:shadow-md'}
          ${selectedFiles.length > 0 ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabels.forms.fileUpload}
        aria-describedby={`${instructionsId} ${descriptionId}`}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            handleClick();
        }}
      >
        {/* Description for screen readers */}
        <div id={descriptionId} className="sr-only">
          {ariaDescriptions.forms.dragDrop}
        </div>
        <input
          ref={fileInputRef}
          id={uploadId}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          aria-describedby={instructionsId}
        />

        <div className="text-center">
          {/* Upload Icon with Animation */}
          <div className={`mx-auto mb-4 transition-transform duration-300 ${
            isDragOver ? 'scale-110' : 'scale-100'
          }`}>
            {selectedFiles.length > 0 ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ) : (
              <svg
                className={`mx-auto h-16 w-16 transition-colors duration-300 ${
                  isDragOver 
                    ? 'text-blue-500' 
                    : disabled 
                    ? 'text-gray-300' 
                    : 'text-gray-400'
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          
          <div className="space-y-2">
            {selectedFiles.length > 0 ? (
              <div>
                <p className="text-lg font-medium text-green-700">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-green-600">
                  Click to add more files or drag and drop
                </p>
              </div>
            ) : isDragOver ? (
              <div>
                <p className="text-lg font-medium text-blue-600">
                  Drop files here
                </p>
                <p className="text-sm text-blue-500">
                  Release to upload
                </p>
              </div>
            ) : (
              <div>
                <p className="text-base text-gray-700">
                  <span className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                    Click to upload
                  </span>
                  {' '}or drag and drop files here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {multiple ? 'Select one or more files' : 'Select a file'}
                </p>
              </div>
            )}
            
            {/* File Format and Size Info */}
            <div className="mt-3 space-y-1">
              {accept && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Accepted formats:</span> {accept}
                </p>
              )}
              {maxSize && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Max file size:</span> {formatFileSize(maxSize)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Files with Enhanced Preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* File Preview */}
                <div className="flex-shrink-0">
                  {file.preview && isImageFile(file) ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded-md border border-gray-200"
                      style={{ maxHeight: `${previewHeight}px` }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                      <span className="text-2xl">{getFileIcon(file)}</span>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {file.type.split('/')[1] || 'Unknown'}
                        </span>
                      </div>
                      
                      {/* File Type Badge */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isImageFile(file)
                            ? 'bg-green-100 text-green-800'
                            : isPdfFile(file)
                            ? 'bg-red-100 text-red-800'
                            : file.type.includes('json')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isImageFile(file) ? 'Image' : 
                           isPdfFile(file) ? 'PDF' :
                           file.type.includes('json') ? 'JSON' : 'Document'}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                      title="Remove file"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FileUpload;
}}}}}}}}}}}}}}}}