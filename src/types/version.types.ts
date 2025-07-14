// Version Management Type Definitions

export interface ComponentVersion {
  id: string;
  componentId: string;
  version: string;
  commitHash: string;
  message: string;
  author: string;
  createdAt: string;
  changes: VersionChange[];
  branch?: string;
  tag?: string;
  metadata?: {
    aiGenerated?: boolean;
    requestType?: 'styling' | 'functionality' | 'structure' | 'props';
    conversationId?: string;
    parentVersion?: string;
  };
}

export interface VersionChange {
  id: string;
  type: 'added' | 'modified' | 'deleted' | 'renamed';
  filePath: string;
  description: string;
  linesAdded?: number;
  linesDeleted?: number;
  diff?: string;
}

export interface VersionBranch {
  id: string;
  name: string;
  componentId: string;
  baseVersion: string;
  currentVersion: string;
  description: string;
  createdAt: string;
  author: string;
  isActive: boolean;
  mergedAt?: string;
  conflictsCount?: number;
}

export interface VersionComparison {
  fromVersion: ComponentVersion;
  toVersion: ComponentVersion;
  changes: VersionChange[];
  conflicts: VersionConflict[];
  summary: {
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
    conflictsCount: number;
  };
}

export interface VersionConflict {
  id: string;
  filePath: string;
  type: 'content' | 'delete-modify' | 'rename' | 'binary';
  description: string;
  resolution?: 'manual' | 'auto' | 'skip';
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface VersionSnapshot {
  id: string;
  componentId: string;
  version: string;
  timestamp: string;
  files: VersionFile[];
  dependencies: string[];
  metadata: {
    buildable: boolean;
    testsPassing: boolean;
    size: number;
    checksum: string;
  };
}

export interface VersionFile {
  path: string;
  content: string;
  size: number;
  lastModified: string;
  checksum: string;
}

export interface RollbackOptions {
  targetVersion: string;
  preserveUncommitted?: boolean;
  createBackup?: boolean;
  skipValidation?: boolean;
  affectedFiles?: string[];
}

export interface RollbackResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  backupCreated?: string;
  filesChanged: string[];
  warnings: string[];
  errors: string[];
}

export interface VersionTag {
  name: string;
  version: string;
  componentId: string;
  commitHash: string;
  message: string;
  createdAt: string;
  author: string;
  isStable: boolean;
  releaseNotes?: string;
}

export interface VersionMergeRequest {
  id: string;
  sourceBranch: string;
  targetBranch: string;
  componentId: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  changes: VersionChange[];
  conflicts: VersionConflict[];
  reviewers?: string[];
  approvals?: string[];
}

// Version management event types
export const VersionEventType = {
  VERSION_CREATED: 'version:created',
  VERSION_RESTORED: 'version:restored',
  BRANCH_CREATED: 'branch:created',
  BRANCH_MERGED: 'branch:merged',
  CONFLICT_DETECTED: 'conflict:detected',
  CONFLICT_RESOLVED: 'conflict:resolved',
  ROLLBACK_STARTED: 'rollback:started',
  ROLLBACK_COMPLETED: 'rollback:completed',
  TAG_CREATED: 'tag:created'
} as const;

export type VersionEventType = typeof VersionEventType[keyof typeof VersionEventType];

export interface VersionEvent {
  type: VersionEventType;
  componentId: string;
  version?: string;
  data: any;
  timestamp: string;
  user?: string;
}

// Version management settings
export interface VersionSettings {
  autoCommit: boolean;
  commitPrefix: string;
  maxVersionHistory: number;
  enableBranching: boolean;
  requireApproval: boolean;
  enableRollback: boolean;
  backupBeforeRollback: boolean;
  excludePatterns: string[];
  tagPattern: string;
  branchPrefix: string;
}

// Version query interfaces
export interface VersionQuery {
  componentId?: string;
  author?: string;
  branch?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
  includeChanges?: boolean;
  sortBy?: 'date' | 'version' | 'author';
  sortOrder?: 'asc' | 'desc';
}

export interface VersionSearchResult {
  versions: ComponentVersion[];
  totalCount: number;
  hasMore: boolean;
  query: VersionQuery;
}

// Version statistics
export interface VersionStats {
  componentId: string;
  totalVersions: number;
  totalCommits: number;
  activeBranches: number;
  lastActivity: string;
  topContributors: Array<{
    author: string;
    commits: number;
    linesChanged: number;
  }>;
  changeFrequency: Array<{
    date: string;
    commits: number;
    linesChanged: number;
  }>;
  fileChanges: Array<{
    filePath: string;
    changeCount: number;
    lastChanged: string;
  }>;
}