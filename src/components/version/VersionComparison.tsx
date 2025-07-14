import { useState, useEffect } from 'react';
import type { ComponentVersion, VersionComparison, VersionChange } from '../../types/version.types';
import { versionDatabaseService } from '../../services/versionDatabaseService';

interface VersionComparisonProps {
  fromVersion: ComponentVersion;
  toVersion: ComponentVersion;
  onClose?: () => void;
  className?: string;
}

export function VersionComparison({ 
  fromVersion, 
  toVersion, 
  onClose, 
  className = '' 
}: VersionComparisonProps) {
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComparison();
  }, [fromVersion.id, toVersion.id]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get changes for both versions
      const fromChanges = await versionDatabaseService.getVersionChanges(fromVersion.id);
      const toChanges = await versionDatabaseService.getVersionChanges(toVersion.id);

      // Calculate file changes
      const allFiles = new Set([
        ...fromChanges.map(c => c.filePath),
        ...toChanges.map(c => c.filePath)
      ]);

      // Create comparison data
      const comparisonData: VersionComparison = {
        fromVersion,
        toVersion,
        changes: toChanges,
        conflicts: [], // Would be calculated in real implementation
        summary: {
          filesChanged: allFiles.size,
          linesAdded: toChanges.reduce((sum, c) => sum + (c.linesAdded || 0), 0),
          linesDeleted: toChanges.reduce((sum, c) => sum + (c.linesDeleted || 0), 0),
          conflictsCount: 0
        }
      };

      setComparison(comparisonData);
    } catch (err: any) {
      setError(err.message || 'Failed to load version comparison');
    } finally {
      setLoading(false);
    }
  };

  const toggleFileExpansion = (filePath: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'text-green-600 bg-green-50';
      case 'modified': return 'text-yellow-600 bg-yellow-50';
      case 'deleted': return 'text-red-600 bg-red-50';
      case 'renamed': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        );
      case 'modified':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        );
      case 'deleted':
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'renamed':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const renderDiff = (change: VersionChange) => {
    if (!change.diff) {
      return (
        <div className="text-sm text-gray-500 italic p-3">
          No diff available for this change
        </div>
      );
    }

    const lines = change.diff.split('\n');
    
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-800 text-gray-200 text-sm font-mono border-b border-gray-700">
          {change.filePath}
        </div>
        <div className="p-0">
          {viewMode === 'unified' ? (
            <pre className="text-sm font-mono overflow-x-auto">
              {lines.map((line, index) => {
                const isAddition = line.startsWith('+') && !line.startsWith('+++');
                const isDeletion = line.startsWith('-') && !line.startsWith('---');
                const isContext = !isAddition && !isDeletion && !line.startsWith('@@');
                
                return (
                  <div
                    key={index}
                    className={`px-4 py-0.5 ${
                      isAddition ? 'bg-green-900/30 text-green-200' :
                      isDeletion ? 'bg-red-900/30 text-red-200' :
                      isContext ? 'text-gray-300' :
                      'text-gray-500'
                    }`}
                  >
                    <span className="inline-block w-8 text-gray-500 text-right mr-4 select-none">
                      {index + 1}
                    </span>
                    {line}
                  </div>
                );
              })}
            </pre>
          ) : (
            <div className="grid grid-cols-2 divide-x divide-gray-700">
              <div className="bg-red-900/10">
                <div className="px-4 py-2 text-red-200 text-sm border-b border-gray-700">
                  {fromVersion.version}
                </div>
                <pre className="text-sm font-mono text-red-200 p-4">
                  {lines.filter(line => line.startsWith('-') || (!line.startsWith('+') && !line.startsWith('@@'))).join('\n')}
                </pre>
              </div>
              <div className="bg-green-900/10">
                <div className="px-4 py-2 text-green-200 text-sm border-b border-gray-700">
                  {toVersion.version}
                </div>
                <pre className="text-sm font-mono text-green-200 p-4">
                  {lines.filter(line => line.startsWith('+') || (!line.startsWith('-') && !line.startsWith('@@'))).join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading comparison...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-red-800">{error}</div>
        <button
          onClick={loadComparison}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No comparison data available
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Version Comparison</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-purple-100 text-sm">From</div>
                <div className="font-semibold">v{fromVersion.version}</div>
                <div className="text-purple-100 text-sm">{formatDate(fromVersion.createdAt)}</div>
              </div>
              <div>
                <div className="text-purple-100 text-sm">To</div>
                <div className="font-semibold">v{toVersion.version}</div>
                <div className="text-purple-100 text-sm">{formatDate(toVersion.createdAt)}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'unified' ? 'bg-white text-purple-600' : 'text-white hover:bg-white/10'
                }`}
              >
                Unified
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'split' ? 'bg-white text-purple-600' : 'text-white hover:bg-white/10'
                }`}
              >
                Split
              </button>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-b border-gray-200 p-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{comparison.summary.filesChanged}</div>
            <div className="text-sm text-gray-600">Files Changed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{comparison.summary.linesAdded}</div>
            <div className="text-sm text-gray-600">Lines Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">-{comparison.summary.linesDeleted}</div>
            <div className="text-sm text-gray-600">Lines Deleted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{comparison.summary.conflictsCount}</div>
            <div className="text-sm text-gray-600">Conflicts</div>
          </div>
        </div>
      </div>

      {/* Changes */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">File Changes</h3>
        
        {comparison.changes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No changes between these versions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comparison.changes.map((change) => {
              const isExpanded = expandedFiles.has(change.filePath);
              
              return (
                <div key={change.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFileExpansion(change.filePath)}
                  >
                    <div className="flex items-center gap-3">
                      {getChangeIcon(change.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">{change.filePath}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${getChangeTypeColor(change.type)}`}>
                            {change.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{change.description}</p>
                        {(change.linesAdded || change.linesDeleted) && (
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            {change.linesAdded && (
                              <span className="text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                +{change.linesAdded} lines
                              </span>
                            )}
                            {change.linesDeleted && (
                              <span className="text-red-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                -{change.linesDeleted} lines
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {renderDiff(change)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conflicts Section */}
      {comparison.conflicts.length > 0 && (
        <div className="border-t border-gray-200 p-6 bg-orange-50">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">Conflicts</h3>
          <div className="space-y-3">
            {comparison.conflicts.map((conflict) => (
              <div key={conflict.id} className="bg-white border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-orange-900">{conflict.filePath}</h4>
                    <p className="text-sm text-orange-700 mt-1">{conflict.description}</p>
                    <div className="mt-2 text-xs text-orange-600">
                      Type: {conflict.type}
                      {conflict.resolution && ` • Resolved: ${conflict.resolution}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}