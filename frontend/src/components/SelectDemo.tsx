import React, { useState } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

const SelectDemo: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const options: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Select Demo</h2>
      <select 
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedValue && (
        <p className="mt-2">Selected: {selectedValue}</p>
      )}
    </div>
  );
};

export default SelectDemo;
