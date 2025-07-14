import { useState } from 'react';
import type { ComponentMetadata } from '../../types/component.types';
import { ChatInterface } from '../chat/ChatInterface';
import { useChatFlow } from '../../hooks/useChatFlow';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { ProgressIndicator } from '../progress/ProgressIndicator';
import { VersionHistory, VersionTimeline } from '../version';
import { useVersionManagement } from '../../hooks/useVersionManagement';

interface ComponentDetailViewProps {
  component: ComponentMetadata;
  onEdit?: () => void;
  onChat?: () => void;
}

export function ComponentDetailView({ component, onEdit }: ComponentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'props' | 'examples' | 'usage' | 'chat' | 'versions'>('overview');
  
  // Initialize chat functionality if enabled
  const chatFlow = component.chatEnabled ? useChatFlow(component.id) : null;
  
  // Initialize real-time updates
  const realTimeUpdates = useRealTimeUpdates({
    componentId: component.id,
    autoConnect: component.chatEnabled,
    watchFiles: true
  });

  // Initialize version management
  const versionManagement = useVersionManagement(component.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'props', label: 'Props' },
    { id: 'examples', label: 'Examples' },
    { id: 'usage', label: 'Usage' },
    { id: 'versions', label: 'Versions' },
    ...(component.chatEnabled ? [{ id: 'chat', label: 'AI Chat' }] : [])
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {component.category.icon && (
                <span className="text-2xl">{component.category.icon}</span>
              )}
              <h1 className="text-3xl font-bold">{component.displayName}</h1>
              <span className="px-2 py-1 bg-white/20 rounded-full text-sm">
                v{component.version}
              </span>
            </div>
            <p className="text-blue-100 text-lg mb-3">{component.description}</p>
            <div className="flex flex-wrap gap-2">
              {component.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            {component.chatEnabled && (
              <button
                onClick={() => setActiveTab('chat')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg 
                         font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with AI
                {chatFlow?.isConnected === false && (
                  <span className="ml-1 w-2 h-2 bg-red-400 rounded-full"></span>
                )}
              </button>
            )}
            {component.aiModifiable && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 
                         rounded-lg font-medium transition-colors"
              >
                Edit Component
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab component={component} />
        )}
        {activeTab === 'props' && (
          <PropsTab component={component} />
        )}
        {activeTab === 'examples' && (
          <ExamplesTab component={component} />
        )}
        {activeTab === 'usage' && (
          <UsageTab component={component} />
        )}
        {activeTab === 'versions' && (
          <VersionsTab component={component} versionManagement={versionManagement} />
        )}
        {activeTab === 'chat' && component.chatEnabled && chatFlow && (
          <ChatTab component={component} chatFlow={chatFlow} realTimeUpdates={realTimeUpdates} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ component }: { component: ComponentMetadata }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Component Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Category</div>
            <div className="font-medium flex items-center gap-2">
              {component.category.icon} {component.category.name}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Status</div>
            <div className="font-medium capitalize">{component.status}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Created</div>
            <div className="font-medium">
              {new Date(component.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Last Updated</div>
            <div className="font-medium">
              {new Date(component.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {component.dependencies && component.dependencies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Dependencies</h3>
          <div className="flex flex-wrap gap-2">
            {component.dependencies.map(dep => (
              <span
                key={dep}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${component.aiModifiable ? 'bg-green-400' : 'bg-gray-300'}`} />
            <span className="text-gray-700">AI Modifiable</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${component.chatEnabled ? 'bg-green-400' : 'bg-gray-300'}`} />
            <span className="text-gray-700">Chat Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropsTab({ component }: { component: ComponentMetadata }) {
  const props = component.properties?.props || [];
  const events = component.properties?.events || [];
  const cssVars = component.properties?.cssVariables || [];

  return (
    <div className="space-y-8">
      {props.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Props</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {props.map(prop => (
                  <tr key={prop.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prop.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {prop.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prop.required ? '✓' : '–'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {prop.default !== undefined ? String(prop.default) : '–'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {prop.description || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Events</h3>
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.name} className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium text-gray-900">{event.name}</div>
                {event.description && (
                  <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                )}
                {event.payload && (
                  <div className="text-sm font-mono text-gray-500 mt-2">
                    Payload: {event.payload}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cssVars.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">CSS Variables</h3>
          <div className="space-y-3">
            {cssVars.map(cssVar => (
              <div key={cssVar.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium font-mono text-gray-900">{cssVar.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{cssVar.type}</div>
                </div>
                <div className="text-sm font-mono text-gray-600 mt-1">
                  Default: {cssVar.default}
                </div>
                {cssVar.description && (
                  <div className="text-sm text-gray-600 mt-2">{cssVar.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExamplesTab({ component }: { component: ComponentMetadata }) {
  const examples = component.usage?.examples || [];

  return (
    <div className="space-y-6">
      {examples.map((example, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">{example.title}</h4>
            {example.description && (
              <p className="text-sm text-gray-600 mt-1">{example.description}</p>
            )}
          </div>
          <div className="p-4">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{example.code}</code>
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsageTab({ component }: { component: ComponentMetadata }) {
  const usage = component.usage;

  return (
    <div className="space-y-6">
      {usage?.documentation && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Documentation</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700">{usage.documentation}</p>
          </div>
        </div>
      )}

      {usage?.bestPractices && usage.bestPractices.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
          <ul className="space-y-2">
            {usage.bestPractices.map((practice, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{practice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {usage?.apiReference && (
        <div>
          <h3 className="text-lg font-semibold mb-3">API Reference</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{usage.apiReference}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatTab({ component, chatFlow, realTimeUpdates }: { 
  component: ComponentMetadata; 
  chatFlow: ReturnType<typeof useChatFlow>;
  realTimeUpdates: ReturnType<typeof useRealTimeUpdates>;
}) {
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <ProgressIndicator
        conversationId={chatFlow.conversation?.id}
        position="relative"
        showDetails={true}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">AI-Powered Component Modification</h3>
            <p className="text-blue-800 text-sm">
              Chat with AI to modify the <strong>{component.displayName}</strong> component. 
              You can ask for styling changes, functionality updates, or structural modifications.
              The AI will connect to N8N workflows that use Claude Code to make actual changes to your codebase.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium text-amber-800">N8N Connection</span>
          </div>
          <p className="text-amber-700 text-sm">
            {chatFlow.isConnected 
              ? "✅ Connected to N8N workflows"
              : "❌ N8N connection unavailable"
            }
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium text-green-800">Live Updates</span>
          </div>
          <p className="text-green-700 text-sm">
            {realTimeUpdates.isConnected 
              ? "✅ Monitoring file changes"
              : "⏳ Connecting to live updates"
            }
          </p>
        </div>
      </div>

      {/* File Changes */}
      {realTimeUpdates.hasRecentFileChanges && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Recent File Changes</h4>
          <div className="space-y-1">
            {realTimeUpdates.fileChanges.slice(0, 3).map((change, index) => (
              <div key={index} className="text-sm text-purple-700 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  change.type === 'created' ? 'bg-green-400' :
                  change.type === 'modified' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`} />
                <span className="font-mono text-xs">{change.file}</span>
                <span className="text-purple-500">•</span>
                <span className="capitalize">{change.type}</span>
              </div>
            ))}
          </div>
          {realTimeUpdates.fileChanges.length > 3 && (
            <p className="text-purple-600 text-xs mt-2">
              +{realTimeUpdates.fileChanges.length - 3} more changes
            </p>
          )}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <ChatInterface
          componentId={component.id}
          onSendMessage={chatFlow.sendMessage}
          isConnected={chatFlow.isConnected && realTimeUpdates.isConnected}
          disabled={!chatFlow.isConnected}
          height="500px"
        />
      </div>

      {chatFlow.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-red-800">Error</span>
          </div>
          <p className="text-red-700 text-sm">{chatFlow.error}</p>
          {chatFlow.canRetry && (
            <button
              onClick={chatFlow.retryLastMessage}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm transition-colors"
            >
              Retry Last Message
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function VersionsTab({ component, versionManagement }: { 
  component: ComponentMetadata; 
  versionManagement: ReturnType<typeof useVersionManagement>;
}) {
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState<any>(null);

  const handleVersionSelect = (_version: any) => {
    // Version selection logic can be implemented here
  };

  const handleRollbackRequest = (version: any) => {
    setRollbackTarget(version);
    setShowRollbackConfirm(true);
  };

  const handleRollbackConfirm = async () => {
    if (rollbackTarget) {
      await versionManagement.rollbackToVersion(rollbackTarget);
      setShowRollbackConfirm(false);
      setRollbackTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Version Stats */}
      {versionManagement.stats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Version Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{versionManagement.stats.totalVersions}</div>
              <div className="text-sm text-gray-600">Total Versions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{versionManagement.stats.totalCommits}</div>
              <div className="text-sm text-gray-600">Total Commits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{versionManagement.stats.activeBranches}</div>
              <div className="text-sm text-gray-600">Active Branches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {versionManagement.stats.topContributors.length}
              </div>
              <div className="text-sm text-gray-600">Contributors</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Version Timeline */}
        <div className="lg:col-span-1">
          <VersionTimeline
            componentId={component.id}
            onVersionSelect={handleVersionSelect}
            limit={8}
          />
        </div>

        {/* Version History */}
        <div className="lg:col-span-2">
          <VersionHistory
            componentId={component.id}
            onVersionSelect={handleVersionSelect}
            onRollback={handleRollbackRequest}
          />
        </div>
      </div>

      {/* Loading State */}
      {versionManagement.loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading version data...</span>
        </div>
      )}

      {/* Error State */}
      {versionManagement.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Version Management Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{versionManagement.error}</p>
          <button
            onClick={versionManagement.clearError}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {showRollbackConfirm && rollbackTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Rollback</h3>
              </div>

              <p className="text-gray-700 mb-4">
                Are you sure you want to rollback to version <strong>{rollbackTarget.version}</strong>? 
                This will revert all changes made after this version.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="text-yellow-800 text-sm">
                  <strong>Warning:</strong> This action will create a backup of the current state before rolling back.
                  Uncommitted changes may be lost.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowRollbackConfirm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRollbackConfirm}
                  disabled={versionManagement.rollbackInProgress}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-md transition-colors flex items-center gap-2"
                >
                  {versionManagement.rollbackInProgress && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Rollback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}