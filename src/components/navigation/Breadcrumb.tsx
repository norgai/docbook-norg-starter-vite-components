import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ 
  items, 
  separator = <ChevronRightIcon />,
  className = ""
}: BreadcrumbProps) {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <div className="flex items-center text-gray-400 mx-1 md:mx-3">
                {separator}
              </div>
            )}
            
            <div className="flex items-center">
              {item.icon && (
                <span className="mr-2 text-sm">{item.icon}</span>
              )}
              
              {item.current ? (
                <span className="text-sm font-medium text-gray-500 cursor-default">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  to={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 
                           transition-colors truncate max-w-32 md:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-700 truncate max-w-32 md:max-w-none">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ChevronRightIcon() {
  return (
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 5l7 7-7 7" 
      />
    </svg>
  );
}