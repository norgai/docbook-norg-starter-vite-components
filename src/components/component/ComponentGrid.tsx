import type { ComponentMetadata } from '../../types/component.types';
import { ComponentCard } from './ComponentCard';

interface ComponentGridProps {
  components: ComponentMetadata[];
  onComponentClick?: (component: ComponentMetadata) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ComponentGrid({ 
  components, 
  onComponentClick,
  loading = false,
  emptyMessage = "No components found",
  className = ""
}: ComponentGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  <div className="h-5 bg-gray-200 rounded w-12"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-10"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg 
          className="mx-auto h-12 w-12 text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Components Found</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {components.map(component => (
        <ComponentCard
          key={component.id}
          component={component}
          onClick={onComponentClick ? () => onComponentClick(component) : undefined}
        />
      ))}
    </div>
  );
}