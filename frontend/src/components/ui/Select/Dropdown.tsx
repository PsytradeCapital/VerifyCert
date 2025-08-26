import React from 'react';

export interface DropdownItem {
  value: string;
  label: string;
}

export interface DropdownProps {
  items: DropdownItem[];
  onSelect?: (value: string) => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ items, onSelect, className = "" }) => {
  return (
    <div className={`dropdown ${className}`}>
      {items.map((item) => (
        <div 
          key={item.value} 
          onClick={() => onSelect?.(item.value)}
          className="dropdown-item cursor-pointer p-2 hover:bg-gray-100"
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default Dropdown;