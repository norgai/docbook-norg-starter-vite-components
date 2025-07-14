import { Link } from 'react-router-dom';
import type { ComponentMetadata } from '../../types/component.types';

interface ComponentCardProps {
  component: ComponentMetadata;
  onClick?: () => void;
  showCategory?: boolean;
  className?: string;
}

export function ComponentCard({ 
  component, 
  onClick, 
  showCategory = true,
  className = "" 
}: ComponentCardProps) {
  const cardContent = (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow 
                     border border-gray-200 overflow-hidden cursor-pointer ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {showCategory && component.category.icon && (
                <span className="text-lg">{component.category.icon}</span>
              )}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {component.displayName}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                v{component.version}
              </span>
            </div>
            {showCategory && (
              <div className="text-sm text-gray-600 mb-2">
                {component.category.name}
              </div>
            )}
            <p className="text-sm text-gray-600 line-clamp-2">
              {component.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-1 ml-3">
            {component.aiModifiable && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                AI
              </div>
            )}
            {component.chatEnabled && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Chat
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-3">
          {component.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs 
                       font-medium rounded-full truncate max-w-20"
            >
              #{tag}
            </span>
          ))}
          {component.tags.length > 4 && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs 
                           font-medium rounded-full">
              +{component.tags.length - 4}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>Updated {new Date(component.updatedAt).toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              component.status === 'active' ? 'bg-green-100 text-green-800' :
              component.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              component.status === 'deprecated' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {component.status}
            </span>
          </div>
          
          {component.properties?.props && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span>{component.properties.props.length} props</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {cardContent}
      </button>
    );
  }

  return (
    <Link 
      to={`/component/${component.id}`}
      className="block w-full"
    >
      {cardContent}
    </Link>
  );
}