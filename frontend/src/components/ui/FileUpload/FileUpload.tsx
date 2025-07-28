import React, { useState, useRef, useCallback } from 'react';

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
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  label,
  error,
  helperText,
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFileSelect(validFiles);
    }

    if (errors.length > 0) {
      console.error('File validation errors:', errors);
    }
  }, [maxSize, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
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
    }
  }, [disabled, handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const uploadId = `upload-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={uploadId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 cursor-pointer
          ${isDragOver && !disabled
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          id={uploadId}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
        />

        <div className="text-center">
          <svg
            className={`mx-auto h-12 w-12 ${
              isDragOver ? 'text-blue-400' : 'text-gray-400'
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
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {' '}or drag and drop
            </p>
            {accept && (
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: {accept}
              </p>
            )}
            {maxSize && (
              <p className="text-xs text-gray-500">
                Max file size: {formatFileSize(maxSize)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-red-500 hover:text-red-700 p-1"
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
          ))}
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