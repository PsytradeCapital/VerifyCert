import React from 'react';

export default function CertificateMetadataDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-neutral-900 mb-2">Accessibility</h4>
        <p className="text-sm text-neutral-600">
          Proper ARIA labels, keyboard navigation support, and semantic HTML structure.
        </p>
      </div>
      
      <div>
        <h4 className="font-medium text-neutral-900 mb-2">Visual Design</h4>
        <p className="text-sm text-neutral-600">
          Consistent typography, spacing, and visual indicators help users quickly scan information.
        </p>
      </div>
    </div>
  );
}