// Rollback Service for Version Management
// Handles rollback operations, validation, and backup creation

import type { 
  ComponentVersion, 
  RollbackOptions, 
  RollbackResult,
  VersionSnapshot
} from '../types/version.types';
import { gitService } from './gitService';
import { versionDatabaseService } from './versionDatabaseService';

export interface RollbackValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  conflicts: string[];
  affectedFiles: string[];
}

class RollbackService {
  private rollbackHistory: Map<string, RollbackResult[]> = new Map();

  // Main rollback function
  async rollbackToVersion(
    componentId: string,
    targetVersion: ComponentVersion,
    options: Partial<RollbackOptions> = {}
  ): Promise<RollbackResult> {
    try {
      console.log(`Starting rollback for ${componentId} to version ${targetVersion.version}`);

      // Set default options
      const rollbackOptions: Required<RollbackOptions> = {
        targetVersion: targetVersion.version,
        preserveUncommitted: true,
        createBackup: true,
        skipValidation: false,
        affectedFiles: [],
        ...options
      };

      // Get current version for comparison
      const currentVersions = await versionDatabaseService.getVersionHistory(componentId, 1);
      const currentVersion = currentVersions[0];

      if (!currentVersion) {
        throw new Error('No current version found for component');
      }

      // Pre-rollback validation
      if (!rollbackOptions.skipValidation) {
        const validation = await this.validateRollback(currentVersion, targetVersion);
        if (!validation.isValid) {
          return {
            success: false,
            fromVersion: currentVersion.version,
            toVersion: targetVersion.version,
            filesChanged: [],
            warnings: validation.warnings,
            errors: validation.errors
          };
        }
      }

      // Create backup if requested
      let backupId: string | undefined;
      if (rollbackOptions.createBackup) {
        backupId = await this.createBackup(componentId, currentVersion);
        console.log(`Created backup: ${backupId}`);
      }

      // Perform the actual rollback
      const result = await this.performRollback(
        componentId,
        currentVersion,
        targetVersion,
        rollbackOptions
      );

      // Add backup information to result
      if (backupId) {
        result.backupCreated = backupId;
      }

      // Record rollback in history
      await this.recordRollback(componentId, result);

      console.log(`Rollback completed: ${result.success}`);
      return result;

    } catch (error: any) {
      console.error('Rollback failed:', error);
      return {
        success: false,
        fromVersion: options.targetVersion || 'unknown',
        toVersion: targetVersion.version,
        filesChanged: [],
        warnings: [],
        errors: [error.message || 'Rollback failed with unknown error']
      };
    }
  }

  // Validate rollback before execution
  async validateRollback(
    fromVersion: ComponentVersion,
    toVersion: ComponentVersion
  ): Promise<RollbackValidation> {
    const warnings: string[] = [];
    const errors: string[] = [];
    const conflicts: string[] = [];
    const affectedFiles: string[] = [];

    try {
      // Check if target version exists
      const targetExists = await versionDatabaseService.getVersion(toVersion.id);
      if (!targetExists) {
        errors.push(`Target version ${toVersion.version} not found`);
      }

      // Check git status for uncommitted changes
      const gitStatus = await gitService.getStatus();
      if (!gitStatus.clean) {
        if (gitStatus.modified.length > 0) {
          warnings.push(`${gitStatus.modified.length} uncommitted changes will be lost`);
          affectedFiles.push(...gitStatus.modified);
        }
        if (gitStatus.untracked.length > 0) {
          warnings.push(`${gitStatus.untracked.length} untracked files will remain`);
        }
      }

      // Check for version conflicts
      const versionDiff = await this.compareVersions(fromVersion, toVersion);
      if (versionDiff.conflicts && versionDiff.conflicts.length > 0) {
        conflicts.push(...versionDiff.conflicts.map((c: any) => c.description || 'Unknown conflict'));
      }

      // Check for dependency changes
      const dependencyChanges = await this.checkDependencyChanges(fromVersion, toVersion);
      if (dependencyChanges.length > 0) {
        warnings.push(`Dependency changes detected: ${dependencyChanges.join(', ')}`);
      }

      // Validate file accessibility
      const fileValidation = await this.validateFileAccess(toVersion);
      if (!fileValidation.valid) {
        errors.push(...fileValidation.errors);
      }

      return {
        isValid: errors.length === 0,
        warnings,
        errors,
        conflicts,
        affectedFiles: [...new Set(affectedFiles)]
      };

    } catch (error: any) {
      return {
        isValid: false,
        warnings,
        errors: [error.message || 'Validation failed'],
        conflicts,
        affectedFiles
      };
    }
  }

  // Create backup before rollback
  async createBackup(
    componentId: string,
    version: ComponentVersion
  ): Promise<string> {
    const backupId = `backup_${componentId}_${Date.now()}`;
    
    try {
      // Create snapshot of current state
      const snapshot: Omit<VersionSnapshot, 'id'> = {
        componentId,
        version: version.version,
        timestamp: new Date().toISOString(),
        files: await this.getComponentFiles(componentId),
        dependencies: await this.getComponentDependencies(componentId),
        metadata: {
          buildable: true,
          testsPassing: true,
          size: 0,
          checksum: this.generateChecksum()
        }
      };

      // Store backup snapshot
      await versionDatabaseService.createSnapshot(snapshot);

      // Create git backup branch
      const backupBranch = `backup/${componentId}/${version.version}/${Date.now()}`;
      await gitService.createBranch(backupBranch);

      console.log(`Backup created: ${backupId} on branch ${backupBranch}`);
      return backupId;

    } catch (error: any) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  // Perform the actual rollback operation
  private async performRollback(
    componentId: string,
    fromVersion: ComponentVersion,
    toVersion: ComponentVersion,
    options: Required<RollbackOptions>
  ): Promise<RollbackResult> {
    const filesChanged: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Stage 1: Git rollback to target commit
      const gitRollbackSuccess = await gitService.resetToCommit(
        toVersion.commitHash,
        options.preserveUncommitted ? 'soft' : 'hard'
      );

      if (!gitRollbackSuccess) {
        throw new Error('Git rollback failed');
      }

      // Stage 2: Get list of changed files
      const changedFiles = await this.getChangedFilesBetweenVersions(fromVersion, toVersion);
      filesChanged.push(...changedFiles);

      // Stage 3: Update component files if specific files are targeted
      if (options.affectedFiles.length > 0) {
        const fileRestoreResult = await this.restoreSpecificFiles(
          toVersion,
          options.affectedFiles
        );
        
        if (!fileRestoreResult.success) {
          warnings.push(...fileRestoreResult.warnings);
          errors.push(...fileRestoreResult.errors);
        }
      }

      // Stage 4: Update version database
      await this.updateVersionDatabase(componentId, toVersion);

      // Stage 5: Create rollback commit
      const rollbackCommit = await gitService.createCommit(
        `Rollback to version ${toVersion.version}`,
        { 
          includePrefix: true, 
          componentId,
          autoStage: true 
        }
      );

      if (!rollbackCommit) {
        warnings.push('Failed to create rollback commit');
      }

      // Stage 6: Validate post-rollback state
      const postValidation = await this.validatePostRollback(componentId, toVersion);
      if (!postValidation.valid) {
        warnings.push(...postValidation.warnings);
      }

      return {
        success: errors.length === 0,
        fromVersion: fromVersion.version,
        toVersion: toVersion.version,
        filesChanged,
        warnings,
        errors
      };

    } catch (error: any) {
      errors.push(error.message || 'Rollback operation failed');
      
      return {
        success: false,
        fromVersion: fromVersion.version,
        toVersion: toVersion.version,
        filesChanged,
        warnings,
        errors
      };
    }
  }

  // Compare versions to identify conflicts
  private async compareVersions(
    _fromVersion: ComponentVersion,
    toVersion: ComponentVersion
  ) {
    // Mock comparison for demo - would integrate with actual diff logic
    return {
      conflicts: [],
      changes: await versionDatabaseService.getVersionChanges(toVersion.id)
    };
  }

  // Check for dependency changes between versions
  private async checkDependencyChanges(
    _fromVersion: ComponentVersion,
    _toVersion: ComponentVersion
  ): Promise<string[]> {
    // Mock dependency checking - would integrate with package.json analysis
    const changes = ['react updated from 18.0.0 to 18.2.0'];
    return changes;
  }

  // Validate file access for rollback
  private async validateFileAccess(version: ComponentVersion): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    // Check if all files in the version are accessible
    for (const change of version.changes) {
      // Mock file access check
      const accessible = true; // Would check actual file system
      if (!accessible) {
        errors.push(`File not accessible: ${change.filePath}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get component files for backup
  private async getComponentFiles(componentId: string) {
    // Mock file listing - would scan actual file system
    return [
      {
        path: `src/components/${componentId}.tsx`,
        content: '// Component content...',
        size: 1024,
        lastModified: new Date().toISOString(),
        checksum: 'abc123'
      }
    ];
  }

  // Get component dependencies
  private async getComponentDependencies(_componentId: string): Promise<string[]> {
    // Mock dependencies - would read from package.json and imports
    return ['react', 'typescript', '@types/react'];
  }

  // Generate checksum for backup
  private generateChecksum(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Get changed files between versions
  private async getChangedFilesBetweenVersions(
    fromVersion: ComponentVersion,
    toVersion: ComponentVersion
  ): Promise<string[]> {
    const fromChanges = fromVersion.changes.map(c => c.filePath);
    const toChanges = toVersion.changes.map(c => c.filePath);
    
    return [...new Set([...fromChanges, ...toChanges])];
  }

  // Restore specific files from version
  private async restoreSpecificFiles(
    version: ComponentVersion,
    files: string[]
  ): Promise<{ success: boolean; warnings: string[]; errors: string[] }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      for (const filePath of files) {
        // Mock file restoration - would restore from git or backup
        console.log(`Restoring file: ${filePath} to version ${version.version}`);
        
        // Check if file exists in target version
        const fileExists = version.changes.some(c => c.filePath === filePath);
        if (!fileExists) {
          warnings.push(`File ${filePath} not found in target version`);
        }
      }

      return {
        success: errors.length === 0,
        warnings,
        errors
      };
    } catch (error: any) {
      return {
        success: false,
        warnings,
        errors: [error.message]
      };
    }
  }

  // Update version database after rollback
  private async updateVersionDatabase(
    componentId: string,
    targetVersion: ComponentVersion
  ): Promise<void> {
    // Create new version entry for the rollback
    await versionDatabaseService.createVersion({
      componentId,
      version: `${targetVersion.version}-rollback-${Date.now()}`,
      commitHash: targetVersion.commitHash,
      message: `Rollback to version ${targetVersion.version}`,
      author: 'Rollback Service',
      createdAt: new Date().toISOString(),
      changes: targetVersion.changes,
      branch: await gitService.getCurrentBranch(),
      metadata: {
        aiGenerated: false,
        parentVersion: targetVersion.version
      }
    });
  }

  // Validate state after rollback
  private async validatePostRollback(
    _componentId: string,
    _targetVersion: ComponentVersion
  ): Promise<{ valid: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      // Check git status
      const gitStatus = await gitService.getStatus();
      if (!gitStatus.clean) {
        warnings.push('Repository not clean after rollback');
      }

      // Verify target version state
      const currentCommit = await gitService.getCurrentBranch();
      if (!currentCommit) {
        warnings.push('Unable to verify current git state');
      }

      return {
        valid: warnings.length === 0,
        warnings
      };
    } catch (error) {
      return {
        valid: false,
        warnings: ['Post-rollback validation failed']
      };
    }
  }

  // Record rollback in history
  private async recordRollback(
    componentId: string,
    result: RollbackResult
  ): Promise<void> {
    const history = this.rollbackHistory.get(componentId) || [];
    history.push({
      ...result,
      // Add timestamp if not present
      warnings: [...result.warnings, `Rollback completed at ${new Date().toISOString()}`]
    });
    
    // Keep only last 10 rollback records
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    this.rollbackHistory.set(componentId, history);

    // Log event in database
    await versionDatabaseService.logEvent({
      type: result.success ? 'rollback:completed' : 'rollback:failed',
      componentId,
      version: result.toVersion,
      data: result,
      timestamp: new Date().toISOString()
    });
  }

  // Get rollback history for component
  async getRollbackHistory(componentId: string): Promise<RollbackResult[]> {
    return this.rollbackHistory.get(componentId) || [];
  }

  // Cancel ongoing rollback (if applicable)
  async cancelRollback(componentId: string): Promise<boolean> {
    // In a real implementation, this would cancel any ongoing rollback operations
    console.log(`Rollback cancellation requested for ${componentId}`);
    return true;
  }

  // Restore from backup
  async restoreFromBackup(
    componentId: string,
    backupId: string
  ): Promise<RollbackResult> {
    try {
      // Find backup snapshot
      const snapshots = await versionDatabaseService.getComponentSnapshots(componentId);
      const backup = snapshots.find(s => s.id === backupId);
      
      if (!backup) {
        throw new Error(`Backup ${backupId} not found`);
      }

      // Restore files from backup
      const restoreResult = await this.restoreFromSnapshot(backup);
      
      return {
        success: restoreResult.success,
        fromVersion: 'current',
        toVersion: backup.version,
        filesChanged: restoreResult.filesChanged,
        warnings: restoreResult.warnings,
        errors: restoreResult.errors
      };

    } catch (error: any) {
      return {
        success: false,
        fromVersion: 'current',
        toVersion: 'backup',
        filesChanged: [],
        warnings: [],
        errors: [error.message]
      };
    }
  }

  // Restore from snapshot
  private async restoreFromSnapshot(snapshot: VersionSnapshot): Promise<{
    success: boolean;
    filesChanged: string[];
    warnings: string[];
    errors: string[];
  }> {
    const filesChanged: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Restore each file from snapshot
      for (const file of snapshot.files) {
        filesChanged.push(file.path);
        // Mock file restoration
        console.log(`Restoring file from backup: ${file.path}`);
      }

      return {
        success: errors.length === 0,
        filesChanged,
        warnings,
        errors
      };
    } catch (error: any) {
      return {
        success: false,
        filesChanged,
        warnings,
        errors: [error.message]
      };
    }
  }
}

// Export singleton instance
export const rollbackService = new RollbackService();
export default RollbackService;