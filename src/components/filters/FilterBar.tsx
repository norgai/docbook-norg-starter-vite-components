import { SearchBar } from '../search/SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { TagFilter } from './TagFilter';
import { SortFilter } from './SortFilter';
import type { ComponentCategory, ComponentFilter, ComponentSortOptions } from '../../types/component.types';

interface FilterBarProps {
  filter: ComponentFilter;
  sortOptions: ComponentSortOptions;
  categories: ComponentCategory[];
  tags: string[];
  onUpdateFilter: (updates: Partial<ComponentFilter>) => void;
  onSortChange: (options: ComponentSortOptions) => void;
  onClearFilter: () => void;
  onToggleCategory: (categoryId: string) => void;
  onToggleTag: (tag: string) => void;
  className?: string;
}

export function FilterBar({
  filter,
  sortOptions,
  categories,
  tags,
  onUpdateFilter,
  onSortChange,
  onClearFilter,
  onToggleCategory,
  onToggleTag,
  className = ""
}: FilterBarProps) {
  const hasActiveFilters = 
    filter.search || 
    (filter.categories && filter.categories.length > 0) ||
    (filter.tags && filter.tags.length > 0) ||
    filter.aiModifiable !== undefined ||
    filter.chatEnabled !== undefined;

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 py-4">
        {/* Top row: Search and primary actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchBar
            value={filter.search || ''}
            onChange={(search) => onUpdateFilter({ search })}
            placeholder="Search components..."
            className="w-full sm:w-auto"
          />
          
          <div className="flex flex-wrap gap-2 items-center">
            <CategoryFilter
              categories={categories}
              selectedCategories={filter.categories || []}
              onToggleCategory={onToggleCategory}
            />
            
            <TagFilter
              tags={tags}
              selectedTags={filter.tags || []}
              onToggleTag={onToggleTag}
            />
            
            <SortFilter
              sortOptions={sortOptions}
              onSortChange={onSortChange}
            />
            
            {hasActiveFilters && (
              <button
                onClick={onClearFilter}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 
                         border border-gray-300 rounded-md hover:bg-gray-50 
                         transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: Additional filters */}
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filter.aiModifiable === true}
              onChange={(e) => onUpdateFilter({ 
                aiModifiable: e.target.checked ? true : undefined 
              })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded 
                       focus:ring-blue-500 focus:ring-2 mr-2"
            />
            AI Modifiable Only
          </label>
          
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filter.chatEnabled === true}
              onChange={(e) => onUpdateFilter({ 
                chatEnabled: e.target.checked ? true : undefined 
              })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded 
                       focus:ring-blue-500 focus:ring-2 mr-2"
            />
            Chat Enabled Only
          </label>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filter.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full 
                             text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{filter.search}"
                <button
                  onClick={() => onUpdateFilter({ search: undefined })}
                  className="ml-1 h-4 w-4 flex items-center justify-center 
                           rounded-full hover:bg-blue-200 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            
            {filter.categories?.map(categoryId => {
              const category = categories.find(c => c.id === categoryId);
              return category ? (
                <span
                  key={categoryId}
                  className="inline-flex items-center px-2 py-1 rounded-full 
                           text-xs font-medium bg-green-100 text-green-800"
                >
                  {category.icon} {category.name}
                  <button
                    onClick={() => onToggleCategory(categoryId)}
                    className="ml-1 h-4 w-4 flex items-center justify-center 
                             rounded-full hover:bg-green-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
            
            {filter.tags?.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full 
                         text-xs font-medium bg-purple-100 text-purple-800"
              >
                #{tag}
                <button
                  onClick={() => onToggleTag(tag)}
                  className="ml-1 h-4 w-4 flex items-center justify-center 
                           rounded-full hover:bg-purple-200 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}