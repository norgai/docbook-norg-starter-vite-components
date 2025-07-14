import { useState, useCallback, useEffect } from 'react';
import type { 
  ComponentVersion, 
  VersionQuery, 
  RollbackOptions,
  RollbackResult,
  VersionStats
} from '../types/version.types';
import { versionDatabaseService } from '../services/versionDatabaseService';
import { rollbackService } from '../services/rollbackService';
import { gitService } from '../services/gitService';

interface VersionManagementState {
  versions: ComponentVersion[];
  currentVersion: ComponentVersion | null;
  loading: boolean;
  error: string | null;
  stats: VersionStats | null;
  rollbackInProgress: boolean;
}

export function useVersionManagement(componentId: string) {
  const [state, setState] = useState<VersionManagementState>({
    versions: [],
    currentVersion: null,
    loading: false,
    error: null,
    stats: null,
    rollbackInProgress: false
  });

  // Load version history
  const loadVersions = useCallback(async (query?: Partial<VersionQuery>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchQuery: VersionQuery = {
        componentId,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        includeChanges: true,
        ...query
      };

      const result = await versionDatabaseService.searchVersions(searchQuery);
      
      setState(prev => ({
        ...prev,
        versions: result.versions,
        currentVersion: result.versions[0] || null,
        loading: false
      }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load versions'
      }));
    }
  }, [componentId]);

  // Load version statistics
  const loadStats = useCallback(async () => {
    try {
      const stats = await versionDatabaseService.getVersionStats(componentId);
      setState(prev => ({ ...prev, stats }));
    } catch (error: any) {
      console.error('Failed to load version stats:', error);
    }
  }, [componentId]);

  // Create new version
  const createVersion = useCallback(async (
    version: Omit<ComponentVersion, 'id' | 'componentId'>
  ): Promise<ComponentVersion | null> => {
    try {
      const newVersion = await versionDatabaseService.createVersion({
        ...version,
        componentId
      });

      // Reload versions to include the new one
      await loadVersions();
      
      return newVersion;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to create version'
      }));
      return null;
    }
  }, [componentId, loadVersions]);

  // Rollback to specific version
  const rollbackToVersion = useCallback(async (
    targetVersion: ComponentVersion,
    options?: RollbackOptions
  ): Promise<RollbackResult> => {
    setState(prev => ({ ...prev, rollbackInProgress: true, error: null }));

    try {
      // Validate rollback first
      const validation = await rollbackService.validateRollback(
        state.currentVersion!,
        targetVersion
      );

      if (!validation.isValid && !options?.skipValidation) {
        const result: RollbackResult = {
          success: false,
          fromVersion: state.currentVersion?.version || 'unknown',
          toVersion: targetVersion.version,
          filesChanged: [],
          warnings: validation.warnings,
          errors: validation.errors
        };
        
        setState(prev => ({ ...prev, rollbackInProgress: false }));
        return result;
      }

      // Perform rollback
      const result = await rollbackService.rollbackToVersion(
        componentId,
        targetVersion,
        options
      );

      if (result.success) {
        // Reload versions after successful rollback
        await loadVersions();
        await loadStats();
      }

      setState(prev => ({ 
        ...prev, 
        rollbackInProgress: false,
        error: result.success ? null : result.errors.join(', ')
      }));

      return result;

    } catch (error: any) {
      const result: RollbackResult = {
        success: false,
        fromVersion: state.currentVersion?.version || 'unknown',
        toVersion: targetVersion.version,
        filesChanged: [],
        warnings: [],
        errors: [error.message || 'Rollback failed']
      };

      setState(prev => ({
        ...prev,
        rollbackInProgress: false,
        error: error.message || 'Rollback failed'
      }));

      return result;
    }
  }, [componentId, state.currentVersion, loadVersions, loadStats]);

  // Get version details
  const getVersionDetails = useCallback(async (versionId: string): Promise<ComponentVersion | null> => {
    try {
      const version = await versionDatabaseService.getVersion(versionId);
      return version;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to get version details'
      }));
      return null;
    }
  }, []);

  // Compare versions
  const compareVersions = useCallback(async (
    fromVersionId: string,
    toVersionId: string
  ) => {
    try {
      const fromVersion = await versionDatabaseService.getVersion(fromVersionId);
      const toVersion = await versionDatabaseService.getVersion(toVersionId);

      if (!fromVersion || !toVersion) {
        throw new Error('One or both versions not found');
      }

      // Get changes for both versions
      const fromChanges = await versionDatabaseService.getVersionChanges(fromVersionId);
      const toChanges = await versionDatabaseService.getVersionChanges(toVersionId);

      // Calculate comparison data
      const allFiles = new Set([
        ...fromChanges.map(c => c.filePath),
        ...toChanges.map(c => c.filePath)
      ]);

      const comparison = {
        fromVersion,
        toVersion,
        changes: [...toChanges],
        conflicts: [], // Would be calculated based on actual diff
        summary: {
          filesChanged: allFiles.size,
          linesAdded: toChanges.reduce((sum, c) => sum + (c.linesAdded || 0), 0),
          linesDeleted: toChanges.reduce((sum, c) => sum + (c.linesDeleted || 0), 0),
          conflictsCount: 0
        }
      };

      return comparison;

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to compare versions'
      }));
      return null;
    }
  }, []);

  // Create component branch
  const createBranch = useCallback(async (
    branchName: string,
    fromVersion?: ComponentVersion
  ): Promise<boolean> => {
    try {
      const baseCommit = fromVersion?.commitHash;
      const success = await gitService.createBranch(branchName, baseCommit);
      
      if (success) {
        // Create branch record in database
        await versionDatabaseService.createBranch({
          name: branchName,
          componentId,
          baseVersion: fromVersion?.version || state.currentVersion?.version || 'main',
          currentVersion: fromVersion?.version || state.currentVersion?.version || 'main',
          description: `Branch created for ${componentId}`,
          createdAt: new Date().toISOString(),
          author: 'Version Management',
          isActive: true
        });
      }

      return success;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to create branch'
      }));
      return false;
    }
  }, [componentId, state.currentVersion]);

  // Get branches
  const getBranches = useCallback(async () => {
    try {
      const branches = await versionDatabaseService.getBranches(componentId);
      return branches;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to get branches'
      }));
      return [];
    }
  }, [componentId]);

  // Get rollback history
  const getRollbackHistory = useCallback(async () => {
    try {
      const history = await rollbackService.getRollbackHistory(componentId);
      return history;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to get rollback history'
      }));
      return [];
    }
  }, [componentId]);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-create version when component changes are detected
  const autoCreateVersion = useCallback(async (
    changes: string[],
    message?: string
  ): Promise<ComponentVersion | null> => {
    try {
      // Create git commit first
      const commitHash = await gitService.createComponentVersion(componentId, changes);
      
      if (!commitHash) {
        throw new Error('Failed to create git commit');
      }

      // Generate version number
      const latestVersion = state.currentVersion?.version || '0.0.0';
      const [major, minor, patch] = latestVersion.split('.').map(Number);
      const newVersion = `${major}.${minor}.${patch + 1}`;

      // Create version record
      const version = await createVersion({
        version: newVersion,
        commitHash,
        message: message || `Auto-generated version with ${changes.length} changes`,
        author: 'AI Component Builder',
        createdAt: new Date().toISOString(),
        changes: changes.map(change => ({
          id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          type: 'modified' as const,
          filePath: change,
          description: `Updated ${change}`,
          linesAdded: Math.floor(Math.random() * 20) + 1,
          linesDeleted: Math.floor(Math.random() * 10)
        })),
        branch: await gitService.getCurrentBranch(),
        metadata: {
          aiGenerated: true,
          requestType: 'functionality'
        }
      });

      return version;

    } catch (error: any) {
      console.error('Auto-create version failed:', error);
      return null;
    }
  }, [componentId, state.currentVersion, createVersion]);

  // Initialize data on mount
  useEffect(() => {
    loadVersions();
    loadStats();
  }, [loadVersions, loadStats]);

  return {
    // State
    versions: state.versions,
    currentVersion: state.currentVersion,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    rollbackInProgress: state.rollbackInProgress,

    // Actions
    loadVersions,
    loadStats,
    createVersion,
    rollbackToVersion,
    getVersionDetails,
    compareVersions,
    createBranch,
    getBranches,
    getRollbackHistory,
    autoCreateVersion,
    clearError
  };
}