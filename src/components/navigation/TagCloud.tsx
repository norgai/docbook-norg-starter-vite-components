import { useMemo } from 'react';

interface TagCloudProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagDeselect: (tag: string) => void;
  maxTags?: number;
  showCount?: boolean;
  tagCounts?: Record<string, number>;
  className?: string;
}

export function TagCloud({
  tags,
  selectedTags,
  onTagSelect,
  onTagDeselect,
  maxTags = 50,
  showCount = false,
  tagCounts = {},
  className = ""
}: TagCloudProps) {
  // Sort tags by usage count and limit
  const sortedTags = useMemo(() => {
    const tagList = tags.slice();
    
    if (showCount && Object.keys(tagCounts).length > 0) {
      tagList.sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0));
    } else {
      tagList.sort();
    }
    
    return tagList.slice(0, maxTags);
  }, [tags, tagCounts, maxTags, showCount]);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagDeselect(tag);
    } else {
      onTagSelect(tag);
    }
  };

  const getTagSize = (tag: string) => {
    if (!showCount || !tagCounts[tag]) return 'text-sm';
    
    const count = tagCounts[tag];
    const maxCount = Math.max(...Object.values(tagCounts));
    const ratio = count / maxCount;
    
    if (ratio > 0.8) return 'text-lg';
    if (ratio > 0.6) return 'text-base';
    if (ratio > 0.4) return 'text-sm';
    return 'text-xs';
  };

  const getTagOpacity = (tag: string) => {
    if (!showCount || !tagCounts[tag]) return 'opacity-100';
    
    const count = tagCounts[tag];
    const maxCount = Math.max(...Object.values(tagCounts));
    const ratio = count / maxCount;
    
    if (ratio > 0.8) return 'opacity-100';
    if (ratio > 0.6) return 'opacity-90';
    if (ratio > 0.4) return 'opacity-80';
    return 'opacity-70';
  };

  if (sortedTags.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 text-sm">No tags available</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2">
        {sortedTags.map(tag => {
          const isSelected = selectedTags.includes(tag);
          const count = tagCounts[tag] || 0;
          
          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`inline-flex items-center px-3 py-1 rounded-full font-medium 
                         transition-all duration-200 hover:scale-105 ${getTagSize(tag)} ${getTagOpacity(tag)} ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              title={showCount && count > 0 ? `${count} components` : undefined}
            >
              <span>#{tag}</span>
              {showCount && count > 0 && (
                <span className={`ml-1 text-xs ${
                  isSelected ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {tags.length > maxTags && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Showing {maxTags} of {tags.length} tags
          </p>
        </div>
      )}
    </div>
  );
}