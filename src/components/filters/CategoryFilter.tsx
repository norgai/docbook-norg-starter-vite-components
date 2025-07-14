import { useState } from 'react';
import type { ComponentCategory } from '../../types/component.types';

interface CategoryFilterProps {
  categories: ComponentCategory[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  className?: string;
}

export function CategoryFilter({ 
  categories, 
  selectedCategories, 
  onToggleCategory,
  className = ""
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCount = selectedCategories.length;
  const buttonText = selectedCount > 0 
    ? `Categories (${selectedCount})` 
    : 'All Categories';

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
        <div className="absolute z-10 mt-1 w-56 bg-white shadow-lg 
                        rounded-md border border-gray-200 max-h-60 overflow-auto">
          <div className="py-1">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              
              return (
                <label
                  key={category.id}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 
                           hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleCategory(category.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded 
                             focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 flex items-center">
                    {category.icon && (
                      <span className="mr-2 text-base">{category.icon}</span>
                    )}
                    {category.name}
                  </span>
                  {category.description && (
                    <span className="ml-auto text-xs text-gray-500 truncate max-w-32">
                      {category.description}
                    </span>
                  )}
                </label>
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