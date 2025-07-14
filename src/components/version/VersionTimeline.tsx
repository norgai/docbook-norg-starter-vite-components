import { useState, useEffect } from 'react';
import type { ComponentVersion } from '../../types/version.types';
import { versionDatabaseService } from '../../services/versionDatabaseService';

interface VersionTimelineProps {
  componentId: string;
  onVersionSelect?: (version: ComponentVersion) => void;
  className?: string;
  limit?: number;
}

export function VersionTimeline({ 
  componentId, 
  onVersionSelect, 
  className = '',
  limit = 10
}: VersionTimelineProps) {
  const [versions, setVersions] = useState<ComponentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, [componentId, limit]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await versionDatabaseService.searchVersions({
        componentId,
        limit,
        sortBy: 'date',
        sortOrder: 'desc',
        includeChanges: true
      });
      
      setVersions(result.versions);
    } catch (err: any) {
      setError(err.message || 'Failed to load version timeline');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionIcon = (version: ComponentVersion, index: number) => {
    const isLatest = index === 0;
    const isAI = version.metadata?.aiGenerated;
    
    if (isLatest) {
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    if (isAI) {
      return (
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'styling': return 'bg-blue-100 text-blue-800';
      case 'functionality': return 'bg-green-100 text-green-800';
      case 'structure': return 'bg-purple-100 text-purple-800';
      case 'props': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-red-800 text-sm">{error}</div>
        <button
          onClick={loadVersions}
          className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className={`text-center py-6 text-gray-500 ${className}`}>
        <div className="text-sm">No version history available</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {versions.map((version, index) => {
            const isLast = index === versions.length - 1;
            const changes = version.changes || [];
            const filesChanged = new Set(changes.map(c => c.filePath)).size;
            
            return (
              <li key={version.id}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span
                      className="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  
                  <div className="relative flex space-x-3">
                    <div className="flex-shrink-0">
                      {getVersionIcon(version, index)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Version {version.version}
                            {index === 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(version.createdAt)} at {formatTime(version.createdAt)}
                          </p>
                        </div>
                        
                        {version.metadata?.requestType && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(version.metadata.requestType)}`}>
                            {version.metadata.requestType}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {version.message}
                        </p>
                        
                        {filesChanged > 0 && (
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {filesChanged} file{filesChanged !== 1 ? 's' : ''} changed
                          </div>
                        )}
                        
                        {changes.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {changes.slice(0, 2).map((change, idx) => (
                              <div key={idx} className="flex items-center text-xs text-gray-600">
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                  change.type === 'added' ? 'bg-green-400' :
                                  change.type === 'modified' ? 'bg-yellow-400' :
                                  change.type === 'deleted' ? 'bg-red-400' :
                                  'bg-blue-400'
                                }`} />
                                <span className="font-mono truncate max-w-32">
                                  {change.filePath.split('/').pop()}
                                </span>
                              </div>
                            ))}
                            {changes.length > 2 && (
                              <div className="text-xs text-gray-500 ml-3.5">
                                +{changes.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                        
                        {onVersionSelect && (
                          <button
                            onClick={() => onVersionSelect(version)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      
      {versions.length >= limit && (
        <div className="text-center">
          <button
            onClick={() => setVersions([])}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Full History
          </button>
        </div>
      )}
    </div>
  );
}