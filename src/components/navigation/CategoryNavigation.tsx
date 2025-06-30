import React, { useState } from 'react';
import { ComponentCategory } from '../../types/component.types';

interface CategoryNavigationProps {
  categories: ComponentCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string) => void;
  onClearSelection: () => void;
  showHierarchy?: boolean;
  className?: string;
}

export function CategoryNavigation({
  categories,
  selectedCategories,
  onCategorySelect,
  onClearSelection,
  showHierarchy = true,
  className = ""
}: CategoryNavigationProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build hierarchy
  const rootCategories = categories.filter(c => !c.parent);
  const getChildren = (parentId: string) => 
    categories.filter(c => c.parent === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: ComponentCategory, level: number = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.includes(category.id);

    return (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            level > 0 ? `ml-${level * 4}` : ''
          } ${
            isSelected 
              ? 'bg-blue-100 text-blue-900 border border-blue-200' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => onCategorySelect(category.id)}
        >
          {/* Expand/Collapse button */}
          {hasChildren && showHierarchy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(category.id);
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {/* Category icon */}
          {category.icon && (
            <span className="mr-3 text-lg">{category.icon}</span>
          )}
          
          {/* Category name */}
          <span className="flex-1 font-medium">{category.name}</span>
          
          {/* Selection indicator */}
          {isSelected && (
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        {/* Description */}
        {category.description && level === 0 && (
          <p className="text-xs text-gray-500 px-3 pb-2">{category.description}</p>
        )}
        
        {/* Children */}
        {hasChildren && showHierarchy && isExpanded && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear ({selectedCategories.length})
          </button>
        )}
      </div>
      
      {/* All Categories option */}
      <div
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors mb-2 ${
          selectedCategories.length === 0
            ? 'bg-blue-100 text-blue-900 border border-blue-200'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        onClick={onClearSelection}
      >
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="font-medium">All Categories</span>
        {selectedCategories.length === 0 && (
          <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      {/* Categories */}
      <div className="space-y-1">
        {rootCategories
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(category => renderCategory(category))}
      </div>
    </div>
  );
}