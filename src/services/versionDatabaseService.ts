// Version Database Service
// Handles database operations for version management

import type { 
  ComponentVersion, 
  VersionChange, 
  VersionBranch, 
  VersionSnapshot,
  VersionTag,
  VersionQuery,
  VersionSearchResult,
  VersionStats,
  VersionEvent
} from '../types/version.types';

// Simple in-memory database for demo purposes
// In a real application, this would use IndexedDB, SQLite, or a cloud database
class VersionDatabaseService {
  private versions: Map<string, ComponentVersion> = new Map();
  private changes: Map<string, VersionChange[]> = new Map();
  private branches: Map<string, VersionBranch> = new Map();
  private snapshots: Map<string, VersionSnapshot> = new Map();
  private tags: Map<string, VersionTag> = new Map();
  private events: VersionEvent[] = [];
  private isInitialized = false;

  // Initialize the database with sample data
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create sample version data
    await this.createSampleData();
    this.isInitialized = true;
    console.log('Version database initialized with sample data');
  }

  // Component Version CRUD Operations
  async createVersion(version: Omit<ComponentVersion, 'id'>): Promise<ComponentVersion> {
    await this.ensureInitialized();

    const id = this.generateId('version');
    const newVersion: ComponentVersion = {
      ...version,
      id
    };

    this.versions.set(id, newVersion);
    
    // Log event
    await this.logEvent({
      type: 'version:created',
      componentId: version.componentId,
      version: version.version,
      data: { versionId: id },
      timestamp: new Date().toISOString()
    });

    return newVersion;
  }

  async getVersion(versionId: string): Promise<ComponentVersion | null> {
    await this.ensureInitialized();
    return this.versions.get(versionId) || null;
  }

  async updateVersion(versionId: string, updates: Partial<ComponentVersion>): Promise<ComponentVersion | null> {
    await this.ensureInitialized();
    
    const existing = this.versions.get(versionId);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.versions.set(versionId, updated);
    
    return updated;
  }

  async deleteVersion(versionId: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const version = this.versions.get(versionId);
    if (!version) return false;

    this.versions.delete(versionId);
    this.changes.delete(versionId);
    
    return true;
  }

  // Version querying and search
  async searchVersions(query: VersionQuery): Promise<VersionSearchResult> {
    await this.ensureInitialized();

    let results = Array.from(this.versions.values());

    // Apply filters
    if (query.componentId) {
      results = results.filter(v => v.componentId === query.componentId);
    }
    if (query.author) {
      results = results.filter(v => v.author.toLowerCase().includes(query.author!.toLowerCase()));
    }
    if (query.branch) {
      results = results.filter(v => v.branch === query.branch);
    }
    if (query.since) {
      const sinceDate = new Date(query.since);
      results = results.filter(v => new Date(v.createdAt) >= sinceDate);
    }
    if (query.until) {
      const untilDate = new Date(query.until);
      results = results.filter(v => new Date(v.createdAt) <= untilDate);
    }

    // Apply sorting
    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'desc';
    
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'version':
          comparison = a.version.localeCompare(b.version);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    const totalCount = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    // Include changes if requested
    if (query.includeChanges) {
      for (const version of paginatedResults) {
        version.changes = this.changes.get(version.id) || [];
      }
    }

    return {
      versions: paginatedResults,
      totalCount,
      hasMore: offset + limit < totalCount,
      query
    };
  }

  async getVersionHistory(componentId: string, limit: number = 20): Promise<ComponentVersion[]> {
    const result = await this.searchVersions({
      componentId,
      limit,
      sortBy: 'date',
      sortOrder: 'desc',
      includeChanges: true
    });
    
    return result.versions;
  }

  // Version Changes
  async getVersionChanges(versionId: string): Promise<VersionChange[]> {
    await this.ensureInitialized();
    return this.changes.get(versionId) || [];
  }

  async addVersionChanges(versionId: string, changes: VersionChange[]): Promise<void> {
    await this.ensureInitialized();
    
    const existing = this.changes.get(versionId) || [];
    this.changes.set(versionId, [...existing, ...changes]);
  }

  // Branch Management
  async createBranch(branch: Omit<VersionBranch, 'id'>): Promise<VersionBranch> {
    await this.ensureInitialized();

    const id = this.generateId('branch');
    const newBranch: VersionBranch = {
      ...branch,
      id
    };

    this.branches.set(id, newBranch);
    
    await this.logEvent({
      type: 'branch:created',
      componentId: branch.componentId,
      data: { branchId: id, branchName: branch.name },
      timestamp: new Date().toISOString()
    });

    return newBranch;
  }

  async getBranches(componentId?: string): Promise<VersionBranch[]> {
    await this.ensureInitialized();
    
    const branches = Array.from(this.branches.values());
    return componentId 
      ? branches.filter(b => b.componentId === componentId)
      : branches;
  }

  async getBranch(branchId: string): Promise<VersionBranch | null> {
    await this.ensureInitialized();
    return this.branches.get(branchId) || null;
  }

  async updateBranch(branchId: string, updates: Partial<VersionBranch>): Promise<VersionBranch | null> {
    await this.ensureInitialized();
    
    const existing = this.branches.get(branchId);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.branches.set(branchId, updated);
    
    return updated;
  }

  // Snapshot Management
  async createSnapshot(snapshot: Omit<VersionSnapshot, 'id'>): Promise<VersionSnapshot> {
    await this.ensureInitialized();

    const id = this.generateId('snapshot');
    const newSnapshot: VersionSnapshot = {
      ...snapshot,
      id
    };

    this.snapshots.set(id, newSnapshot);
    return newSnapshot;
  }

  async getSnapshot(snapshotId: string): Promise<VersionSnapshot | null> {
    await this.ensureInitialized();
    return this.snapshots.get(snapshotId) || null;
  }

  async getComponentSnapshots(componentId: string): Promise<VersionSnapshot[]> {
    await this.ensureInitialized();
    
    return Array.from(this.snapshots.values())
      .filter(s => s.componentId === componentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Tag Management
  async createTag(tag: VersionTag): Promise<void> {
    await this.ensureInitialized();
    
    this.tags.set(tag.name, tag);
    
    await this.logEvent({
      type: 'tag:created',
      componentId: tag.componentId,
      version: tag.version,
      data: { tagName: tag.name },
      timestamp: new Date().toISOString()
    });
  }

  async getTags(componentId?: string): Promise<VersionTag[]> {
    await this.ensureInitialized();
    
    const tags = Array.from(this.tags.values());
    return componentId 
      ? tags.filter(t => t.componentId === componentId)
      : tags;
  }

  async getTag(tagName: string): Promise<VersionTag | null> {
    await this.ensureInitialized();
    return this.tags.get(tagName) || null;
  }

  // Statistics and Analytics
  async getVersionStats(componentId: string): Promise<VersionStats> {
    await this.ensureInitialized();

    const versions = await this.getVersionHistory(componentId, 1000);
    const branches = await this.getBranches(componentId);

    // Calculate statistics
    const authors = new Map<string, { commits: number; linesChanged: number }>();
    const fileChanges = new Map<string, { changeCount: number; lastChanged: string }>();
    const dailyChanges = new Map<string, { commits: number; linesChanged: number }>();

    for (const version of versions) {
      // Author stats
      const authorStats = authors.get(version.author) || { commits: 0, linesChanged: 0 };
      authorStats.commits++;
      authorStats.linesChanged += version.changes.reduce((sum, change) => 
        sum + (change.linesAdded || 0) + (change.linesDeleted || 0), 0
      );
      authors.set(version.author, authorStats);

      // File change stats
      for (const change of version.changes) {
        const fileStats = fileChanges.get(change.filePath) || { changeCount: 0, lastChanged: version.createdAt };
        fileStats.changeCount++;
        if (new Date(version.createdAt) > new Date(fileStats.lastChanged)) {
          fileStats.lastChanged = version.createdAt;
        }
        fileChanges.set(change.filePath, fileStats);
      }

      // Daily change stats
      const date = new Date(version.createdAt).toISOString().split('T')[0];
      const dailyStats = dailyChanges.get(date) || { commits: 0, linesChanged: 0 };
      dailyStats.commits++;
      dailyStats.linesChanged += version.changes.reduce((sum, change) => 
        sum + (change.linesAdded || 0) + (change.linesDeleted || 0), 0
      );
      dailyChanges.set(date, dailyStats);
    }

    return {
      componentId,
      totalVersions: versions.length,
      totalCommits: versions.length,
      activeBranches: branches.filter(b => b.isActive).length,
      lastActivity: versions[0]?.createdAt || new Date().toISOString(),
      topContributors: Array.from(authors.entries())
        .map(([author, stats]) => ({ author, ...stats }))
        .sort((a, b) => b.commits - a.commits)
        .slice(0, 5),
      changeFrequency: Array.from(dailyChanges.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30), // Last 30 days
      fileChanges: Array.from(fileChanges.entries())
        .map(([filePath, stats]) => ({ filePath, ...stats }))
        .sort((a, b) => b.changeCount - a.changeCount)
        .slice(0, 10) // Top 10 most changed files
    };
  }

  // Event Logging
  async logEvent(event: Omit<VersionEvent, 'timestamp'> & { timestamp?: string }): Promise<void> {
    const fullEvent: VersionEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    };
    
    this.events.push(fullEvent);
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events.splice(0, this.events.length - 1000);
    }
  }

  async getEvents(componentId?: string, limit: number = 50): Promise<VersionEvent[]> {
    await this.ensureInitialized();
    
    let events = [...this.events];
    
    if (componentId) {
      events = events.filter(e => e.componentId === componentId);
    }
    
    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Database management
  async clearComponentData(componentId: string): Promise<void> {
    await this.ensureInitialized();

    // Remove versions
    for (const [id, version] of this.versions.entries()) {
      if (version.componentId === componentId) {
        this.versions.delete(id);
        this.changes.delete(id);
      }
    }

    // Remove branches
    for (const [id, branch] of this.branches.entries()) {
      if (branch.componentId === componentId) {
        this.branches.delete(id);
      }
    }

    // Remove snapshots
    for (const [id, snapshot] of this.snapshots.entries()) {
      if (snapshot.componentId === componentId) {
        this.snapshots.delete(id);
      }
    }

    // Remove tags
    for (const [name, tag] of this.tags.entries()) {
      if (tag.componentId === componentId) {
        this.tags.delete(name);
      }
    }

    // Filter events
    this.events = this.events.filter(e => e.componentId !== componentId);
  }

  // Private helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private async createSampleData(): Promise<void> {
    // Create sample versions for different components
    const components = ['Button', 'Card', 'Form', 'Modal'];
    
    for (const componentId of components) {
      for (let i = 0; i < 3; i++) {
        const version = await this.createVersion({
          componentId,
          version: `1.${i}.0`,
          commitHash: `commit_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          message: `Updated ${componentId} component - Version 1.${i}.0`,
          author: 'AI Component Builder',
          createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
          changes: [
            {
              id: this.generateId('change'),
              type: 'modified',
              filePath: `src/components/${componentId}.tsx`,
              description: `Updated ${componentId} styling and functionality`,
              linesAdded: Math.floor(Math.random() * 20) + 5,
              linesDeleted: Math.floor(Math.random() * 10) + 1
            }
          ],
          branch: 'main',
          metadata: {
            aiGenerated: true,
            requestType: 'styling'
          }
        });

        // Add changes to the changes map
        await this.addVersionChanges(version.id, version.changes);
      }

      // Create a branch for each component
      await this.createBranch({
        name: `feature/${componentId.toLowerCase()}-improvements`,
        componentId,
        baseVersion: '1.0.0',
        currentVersion: '1.2.0',
        description: `Feature branch for ${componentId} improvements`,
        createdAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
        author: 'AI Component Builder',
        isActive: true
      });

      // Create a tag
      await this.createTag({
        name: `${componentId.toLowerCase()}-v1.2.0`,
        version: '1.2.0',
        componentId,
        commitHash: `commit_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        message: `Release ${componentId} v1.2.0`,
        createdAt: new Date().toISOString(),
        author: 'AI Component Builder',
        isStable: true,
        releaseNotes: `Stable release of ${componentId} component with improved styling and functionality.`
      });
    }
  }
}

// Export singleton instance
export const versionDatabaseService = new VersionDatabaseService();
export default VersionDatabaseService;