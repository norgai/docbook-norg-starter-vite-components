import { useState, useEffect } from 'react';
import type { ComponentVersion, VersionQuery } from '../../types/version.types';
import { versionDatabaseService } from '../../services/versionDatabaseService';

interface VersionHistoryProps {
  componentId: string;
  onVersionSelect?: (version: ComponentVersion) => void;
  onRollback?: (version: ComponentVersion) => void;
  className?: string;
}

export function VersionHistory({ 
  componentId, 
  onVersionSelect, 
  onRollback, 
  className = '' 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ComponentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<VersionQuery>({
    componentId,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
    includeChanges: true
  });

  useEffect(() => {
    loadVersions();
  }, [componentId, query]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await versionDatabaseService.searchVersions(query);
      setVersions(result.versions);
    } catch (err: any) {
      setError(err.message || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newQuery: Partial<VersionQuery>) => {
    setQuery(prev => ({ ...prev, ...newQuery }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangesSummary = (version: ComponentVersion) => {
    const changes = version.changes || [];
    const filesChanged = new Set(changes.map(c => c.filePath)).size;
    const linesAdded = changes.reduce((sum, c) => sum + (c.linesAdded || 0), 0);
    const linesDeleted = changes.reduce((sum, c) => sum + (c.linesDeleted || 0), 0);
    
    return { filesChanged, linesAdded, linesDeleted };
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading version history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error loading version history</span>
        </div>
        <p className="text-red-700 text-sm mt-1">{error}</p>
        <button
          onClick={loadVersions}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
        <div className="flex items-center gap-2">
          <select
            value={query.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="date">Sort by Date</option>
            <option value="version">Sort by Version</option>
            <option value="author">Sort by Author</option>
          </select>
          <select
            value={query.sortOrder}
            onChange={(e) => handleFilterChange({ sortOrder: e.target.value as any })}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Version List */}
      {versions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No version history found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, index) => {
            const summary = getChangesSummary(version);
            const isLatest = index === 0;
            
            return (
              <div
                key={version.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${
                  isLatest ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => onVersionSelect?.(version)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isLatest ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          v{version.version}
                        </span>
                        {isLatest && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Latest
                          </span>
                        )}
                        {version.metadata?.aiGenerated && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(version.createdAt)}
                      </div>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-1">{version.message}</h4>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {version.author}
                      </span>
                      {version.branch && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {version.branch}
                        </span>
                      )}
                    </div>

                    {/* Changes Summary */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {summary.filesChanged} file{summary.filesChanged !== 1 ? 's' : ''}
                      </span>
                      {summary.linesAdded > 0 && (
                        <span className="text-green-600">+{summary.linesAdded}</span>
                      )}
                      {summary.linesDeleted > 0 && (
                        <span className="text-red-600">-{summary.linesDeleted}</span>
                      )}
                    </div>

                    {/* File Changes */}
                    {version.changes && version.changes.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {version.changes.slice(0, 3).map((change, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className={`w-2 h-2 rounded-full ${
                              change.type === 'added' ? 'bg-green-400' :
                              change.type === 'modified' ? 'bg-yellow-400' :
                              change.type === 'deleted' ? 'bg-red-400' :
                              'bg-blue-400'
                            }`} />
                            <span className="font-mono text-xs">{change.filePath}</span>
                            <span className="capitalize text-gray-500">{change.type}</span>
                          </div>
                        ))}
                        {version.changes.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{version.changes.length - 3} more files
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!isLatest && onRollback && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRollback(version);
                        }}
                        className="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 
                                 rounded transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Rollback
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionSelect?.(version);
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 
                               rounded transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {versions.length >= (query.limit || 20) && (
        <div className="text-center">
          <button
            onClick={() => handleFilterChange({ limit: (query.limit || 20) + 20 })}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 
                     rounded transition-colors"
          >
            Load More Versions
          </button>
        </div>
      )}
    </div>
  );
}