import { useState, useEffect } from 'react';
import type { ComponentVersion, VersionChange } from '../../types/version.types';
import { versionDatabaseService } from '../../services/versionDatabaseService';

interface VersionDetailProps {
  version: ComponentVersion;
  onRollback?: (version: ComponentVersion) => void;
  onCompare?: (version: ComponentVersion) => void;
  onClose?: () => void;
  className?: string;
}

export function VersionDetail({ 
  version, 
  onRollback, 
  onCompare, 
  onClose, 
  className = '' 
}: VersionDetailProps) {
  const [changes, setChanges] = useState<VersionChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadChanges();
  }, [version.id]);

  const loadChanges = async () => {
    try {
      setLoading(true);
      const versionChanges = await versionDatabaseService.getVersionChanges(version.id);
      setChanges(versionChanges);
    } catch (error) {
      console.error('Failed to load version changes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'modified':
        return (
          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
        );
      case 'deleted':
        return (
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'renamed':
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const toggleChangeExpansion = (changeId: string) => {
    setExpandedChanges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(changeId)) {
        newSet.delete(changeId);
      } else {
        newSet.add(changeId);
      }
      return newSet;
    });
  };

  const renderDiff = (change: VersionChange) => {
    if (!change.diff) return null;

    return (
      <div className="mt-3 bg-gray-900 rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-gray-800 text-gray-200 text-xs font-mono">
          {change.filePath}
        </div>
        <pre className="p-3 text-xs font-mono text-gray-100 overflow-x-auto whitespace-pre-wrap">
          {change.diff}
        </pre>
      </div>
    );
  };

  const getSummaryStats = () => {
    const filesChanged = new Set(changes.map(c => c.filePath)).size;
    const linesAdded = changes.reduce((sum, c) => sum + (c.linesAdded || 0), 0);
    const linesDeleted = changes.reduce((sum, c) => sum + (c.linesDeleted || 0), 0);
    
    return { filesChanged, linesAdded, linesDeleted };
  };

  const stats = getSummaryStats();

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">Version {version.version}</h2>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {version.commitHash.substring(0, 8)}
              </span>
              {version.metadata?.aiGenerated && (
                <span className="px-3 py-1 bg-purple-400/30 rounded-full text-sm">
                  AI Generated
                </span>
              )}
            </div>
            <p className="text-blue-100 mb-3">{version.message}</p>
            <div className="flex items-center gap-4 text-sm text-blue-100">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {version.author}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(version.createdAt)}
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
          </div>
          
          <div className="flex items-center gap-2">
            {onCompare && (
              <button
                onClick={() => onCompare(version)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                Compare
              </button>
            )}
            {onRollback && (
              <button
                onClick={() => onRollback(version)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors"
              >
                Rollback
              </button>
            )}
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
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.filesChanged}</div>
            <div className="text-sm text-gray-600">Files Changed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{stats.linesAdded}</div>
            <div className="text-sm text-gray-600">Lines Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">-{stats.linesDeleted}</div>
            <div className="text-sm text-gray-600">Lines Deleted</div>
          </div>
        </div>
      </div>

      {/* Changes */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Changes</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading changes...</span>
          </div>
        ) : changes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No changes recorded for this version</p>
          </div>
        ) : (
          <div className="space-y-4">
            {changes.map((change) => {
              const isExpanded = expandedChanges.has(change.id);
              
              return (
                <div key={change.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleChangeExpansion(change.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getChangeTypeIcon(change.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">{change.filePath}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                            change.type === 'added' ? 'bg-green-100 text-green-800' :
                            change.type === 'modified' ? 'bg-yellow-100 text-yellow-800' :
                            change.type === 'deleted' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {change.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{change.description}</p>
                        {(change.linesAdded || change.linesDeleted) && (
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            {change.linesAdded && (
                              <span className="text-green-600">+{change.linesAdded} lines</span>
                            )}
                            {change.linesDeleted && (
                              <span className="text-red-600">-{change.linesDeleted} lines</span>
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
                  
                  {isExpanded && change.diff && (
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

      {/* Metadata */}
      {version.metadata && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h4>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {version.metadata.requestType && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Request Type</dt>
                <dd className="text-sm text-gray-900 capitalize">{version.metadata.requestType}</dd>
              </div>
            )}
            {version.metadata.conversationId && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Conversation ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{version.metadata.conversationId}</dd>
              </div>
            )}
            {version.metadata.parentVersion && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent Version</dt>
                <dd className="text-sm text-gray-900">{version.metadata.parentVersion}</dd>
              </div>
            )}
            {version.tag && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Tag</dt>
                <dd className="text-sm text-gray-900">{version.tag}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}