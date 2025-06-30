import React, { useState } from 'react';
import { ComponentSortOptions } from '../../types/component.types';

interface SortFilterProps {
  sortOptions: ComponentSortOptions;
  onSortChange: (options: ComponentSortOptions) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { field: 'name' as const, label: 'Name' },
  { field: 'createdAt' as const, label: 'Created Date' },
  { field: 'updatedAt' as const, label: 'Updated Date' },
  { field: 'category' as const, label: 'Category' }
];

export function SortFilter({ 
  sortOptions, 
  onSortChange,
  className = ""
}: SortFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = SORT_OPTIONS.find(opt => opt.field === sortOptions.field);
  const buttonText = `Sort: ${currentOption?.label} ${sortOptions.order === 'asc' ? '↑' : '↓'}`;

  const handleSortChange = (field: ComponentSortOptions['field']) => {
    // If same field, toggle order; otherwise use ascending
    const order = field === sortOptions.field && sortOptions.order === 'asc' 
      ? 'desc' 
      : 'asc';
    
    onSortChange({ field, order });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 
                   rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 
                   hover:bg-gray-50 focus:outline-none focus:ring-2 
                   focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <span>{buttonText}</span>
        <svg 
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-white shadow-lg 
                        rounded-md border border-gray-200">
          <div className="py-1">
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.field === sortOptions.field;
              
              return (
                <button
                  key={option.field}
                  onClick={() => handleSortChange(option.field)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 
                           hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <span className="ml-2 text-blue-600">
                      {sortOptions.order === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}