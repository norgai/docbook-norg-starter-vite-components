import { useState, useEffect } from 'react';
import type { VersionBranch, ComponentVersion } from '../../types/version.types';
import { versionDatabaseService } from '../../services/versionDatabaseService';
import { gitService } from '../../services/gitService';

interface BranchManagerProps {
  componentId: string;
  currentVersion?: ComponentVersion;
  onBranchCreate?: (branch: VersionBranch) => void;
  onBranchSwitch?: (branch: VersionBranch) => void;
  className?: string;
}

export function BranchManager({ 
  componentId, 
  currentVersion,
  onBranchCreate,
  onBranchSwitch,
  className = '' 
}: BranchManagerProps) {
  const [branches, setBranches] = useState<VersionBranch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    baseVersion: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBranches();
    loadCurrentBranch();
  }, [componentId]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const componentBranches = await versionDatabaseService.getBranches(componentId);
      setBranches(componentBranches);
    } catch (err: any) {
      setError(err.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentBranch = async () => {
    try {
      const current = await gitService.getCurrentBranch();
      setCurrentBranch(current);
    } catch (error) {
      console.error('Failed to get current branch:', error);
    }
  };

  const handleCreateBranch = async () => {
    if (!createForm.name.trim()) {
      setError('Branch name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Validate branch name
      if (!/^[a-zA-Z0-9_/-]+$/.test(createForm.name)) {
        throw new Error('Branch name can only contain letters, numbers, underscores, and hyphens');
      }

      // Check if branch already exists
      const existingBranch = branches.find(b => b.name === createForm.name);
      if (existingBranch) {
        throw new Error('Branch name already exists');
      }

      // Create git branch
      const branchName = `component/${componentId}/${createForm.name}`;
      const gitSuccess = await gitService.createBranch(branchName);
      
      if (!gitSuccess) {
        throw new Error('Failed to create git branch');
      }

      // Create branch record
      const newBranch = await versionDatabaseService.createBranch({
        name: createForm.name,
        componentId,
        baseVersion: createForm.baseVersion || currentVersion?.version || 'main',
        currentVersion: currentVersion?.version || 'main',
        description: createForm.description,
        createdAt: new Date().toISOString(),
        author: 'Branch Manager',
        isActive: true
      });

      // Update local state
      setBranches(prev => [...prev, newBranch]);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', baseVersion: '' });

      onBranchCreate?.(newBranch);

    } catch (err: any) {
      setError(err.message || 'Failed to create branch');
    } finally {
      setCreating(false);
    }
  };

  const handleSwitchBranch = async (branch: VersionBranch) => {
    try {
      setError(null);
      
      const branchName = `component/${componentId}/${branch.name}`;
      const success = await gitService.switchBranch(branchName);
      
      if (success) {
        setCurrentBranch(branchName);
        onBranchSwitch?.(branch);
      } else {
        throw new Error('Failed to switch branch');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch branch');
    }
  };

  const handleMergeBranch = async (branch: VersionBranch) => {
    try {
      setError(null);
      
      // Mark branch as merged
      await versionDatabaseService.updateBranch(branch.id, {
        isActive: false,
        mergedAt: new Date().toISOString()
      });

      // Reload branches
      await loadBranches();
      
    } catch (err: any) {
      setError(err.message || 'Failed to merge branch');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBranchStatusIcon = (branch: VersionBranch) => {
    if (branch.mergedAt) {
      return (
        <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (branch.isActive) {
      return (
        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        </div>
      );
    } else {
      return (
        <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading branches...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Branch Management</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Branch
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Branch */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-medium text-blue-900">Current Branch</div>
            <div className="text-sm text-blue-700">{currentBranch}</div>
          </div>
        </div>
      </div>

      {/* Branch List */}
      {branches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No branches found</p>
          <p className="text-sm mt-1">Create a new branch to start working on component variations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map((branch) => {
            const isCurrent = currentBranch.includes(branch.name);
            
            return (
              <div
                key={branch.id}
                className={`border rounded-lg p-4 transition-all ${
                  isCurrent ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getBranchStatusIcon(branch)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{branch.name}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Current
                          </span>
                        )}
                        {branch.mergedAt && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Merged
                          </span>
                        )}
                        {!branch.isActive && !branch.mergedAt && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      {branch.description && (
                        <p className="text-sm text-gray-600 mb-2">{branch.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Base: {branch.baseVersion}</span>
                        <span>Current: {branch.currentVersion}</span>
                        <span>Created {formatDate(branch.createdAt)}</span>
                        <span>by {branch.author}</span>
                        {branch.mergedAt && (
                          <span>Merged {formatDate(branch.mergedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!isCurrent && branch.isActive && (
                      <button
                        onClick={() => handleSwitchBranch(branch)}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
                      >
                        Switch
                      </button>
                    )}
                    {branch.isActive && !branch.mergedAt && (
                      <button
                        onClick={() => handleMergeBranch(branch)}
                        className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors"
                      >
                        Merge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Branch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Branch</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="feature-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this branch is for..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Version
                  </label>
                  <input
                    type="text"
                    value={createForm.baseVersion}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, baseVersion: e.target.value }))}
                    placeholder={currentVersion?.version || 'main'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use current version ({currentVersion?.version || 'main'})
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBranch}
                  disabled={creating || !createForm.name.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors flex items-center gap-2"
                >
                  {creating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Create Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}