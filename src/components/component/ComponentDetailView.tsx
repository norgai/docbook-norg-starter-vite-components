import React, { useState } from 'react';
import { ComponentMetadata, UsageExample } from '../../types/component.types';

interface ComponentDetailViewProps {
  component: ComponentMetadata;
  onEdit?: () => void;
  onChat?: () => void;
}

export function ComponentDetailView({ component, onEdit, onChat }: ComponentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'props' | 'examples' | 'usage'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'props', label: 'Props' },
    { id: 'examples', label: 'Examples' },
    { id: 'usage', label: 'Usage' }
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
            {component.chatEnabled && onChat && (
              <button
                onClick={onChat}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg 
                         font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with AI
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