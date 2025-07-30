import React, { useState } from 'react';
import { FileUpload } from './ui';

const FileUploadDemo: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setUploadStatus(`Selected ${files.length} file(s)`);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus('No files selected');
      return;
    }

    setUploadStatus('Uploading...');
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus(`Successfully uploaded ${selectedFiles.length} file(s)`);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">FileUpload Component Demo</h1>
      
      {/* Basic Upload */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic File Upload</h2>
        <FileUpload
          onFileSelect={handleFileSelect}
          label="Upload Files"
          helperText="Select files to upload"
        />
        {uploadStatus && (
          <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded">
            {uploadStatus}
          </div>
        )}
        {selectedFiles.length > 0 && (
          <button
            onClick={handleUpload}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upload Files
          </button>
        )}
      </section>

      {/* Multiple Files */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Multiple File Upload</h2>
        <FileUpload
          onFileSelect={(files) => console.log('Multiple files:', files)}
          label="Upload Multiple Files"
          multiple
          helperText="You can select multiple files at once"
        />
      </section>

      {/* Image Upload with Size Limit */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Image Upload (Size Limited)</h2>
        <FileUpload
          onFileSelect={(files) => console.log('Images:', files)}
          label="Upload Profile Picture"
          accept="image/*"
          maxSize={2 * 1024 * 1024} // 2MB
          helperText="Images only, max 2MB"
        />
      </section>

      {/* Document Upload */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
        <FileUpload
          onFileSelect={(files) => console.log('Documents:', files)}
          label="Upload Certificate Documents"
          accept=".pdf,.doc,.docx"
          multiple
          maxSize={10 * 1024 * 1024} // 10MB
          helperText="PDF or Word documents, max 10MB each"
        />
      </section>

      {/* Error State */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Error State</h2>
        <FileUpload
          onFileSelect={(files) => console.log('Error demo:', files)}
          label="Upload with Error"
          error="Upload failed. Please try again."
        />
      </section>

      {/* Disabled State */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Disabled State</h2>
        <FileUpload
          onFileSelect={(files) => console.log('Disabled:', files)}
          label="Disabled Upload"
          disabled
          helperText="This upload is currently disabled"
        />
      </section>
    </div>
  );
};

export default FileUploadDemo;