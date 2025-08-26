import React from 'react';

export interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  values?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  values = [], 
  onChange, 
  placeholder = "Select options",
  className = ""
}) => {
  const handleChange = (value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange?.(newValues);
  };

  return (
    <div className={`multi-select ${className}`}>
      <div className="placeholder">{placeholder}</div>
      {options.map((option) => (
        <label key={option.value} className="flex items-center p-2">
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={() => handleChange(option.value)}
            className="mr-2"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default MultiSelect;