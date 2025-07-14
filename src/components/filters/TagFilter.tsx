import { useState } from 'react';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  className?: string;
}

export function TagFilter({ 
  tags, 
  selectedTags, 
  onToggleTag,
  className = ""
}: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = selectedTags.length;
  const buttonText = selectedCount > 0 
    ? `Tags (${selectedCount})` 
    : 'All Tags';

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
        <div className="absolute z-10 mt-1 w-64 bg-white shadow-lg 
                        rounded-md border border-gray-200">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                         text-sm focus:outline-none focus:ring-1 
                         focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tags list */}
          <div className="max-h-48 overflow-auto">
            {filteredTags.length > 0 ? (
              <div className="py-1">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  
                  return (
                    <label
                      key={tag}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 
                               hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleTag(tag)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded 
                                 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 flex-1">{tag}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No tags found
              </div>
            )}
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full 
                             text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => onToggleTag(tag)}
                      className="ml-1 h-4 w-4 flex items-center justify-center 
                               rounded-full hover:bg-blue-200 transition-colors"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
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