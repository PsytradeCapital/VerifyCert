import React, { useState } from 'react';

interface CertificateFormProps {
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

interface FormData {
  recipientName: string;
  courseName: string;
  institutionName: string;
  description: string;
}

export default function CertificateForm({ onSubmit, loading = false }: CertificateFormProps) {
  const [formData, setFormData] = useState<FormData>({
    recipientName: '',
    courseName: '',
    institutionName: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
          Recipient Name
        </label>
        <input
          type="text"
          id="recipientName"
          name="recipientName"
          value={formData.recipientName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
          Course Name
        </label>
        <input
          type="text"
          id="courseName"
          name="courseName"
          value={formData.courseName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700">
          Institution Name
        </label>
        <input
          type="text"
          id="institutionName"
          name="institutionName"
          value={formData.institutionName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Certificate'}
      </button>
    </form>
  );
}