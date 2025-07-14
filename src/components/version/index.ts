// Version Management Components Export

export { VersionHistory } from './VersionHistory';
export { VersionTimeline } from './VersionTimeline';
export { VersionDetail } from './VersionDetail';
export { VersionComparison } from './VersionComparison';
export { BranchManager } from './BranchManager';

// Export types for convenience
export type {
  ComponentVersion,
  VersionChange,
  VersionBranch,
  VersionComparison as VersionComparisonType,
  RollbackOptions,
  RollbackResult,
  VersionStats,
  VersionQuery
} from '../../types/version.types';