import { Paper, PaperVersion } from '@/types/paper';

/**
 * Increment a version number
 */
export function incrementVersion(version: number): number {
  return version + 1;
}

/**
 * Check if a version matches the expected version
 */
export function checkVersion(current: number, expected: number): boolean {
  return current === expected;
}

/**
 * Create a version record for tracking changes
 */
export function createVersionRecord(
  paper: Paper,
  action: 'create' | 'update' | 'delete'
): PaperVersion {
  return {
    paperId: paper.id,
    version: paper.version,
    text: paper.text,
    timestamp: Date.now(),
    action,
  };
}

/**
 * Check if a paper update has a version conflict
 * @returns True if there's a conflict (current version doesn't match expected)
 */
export function hasVersionConflict(
  currentVersion: number,
  expectedVersion: number
): boolean {
  return currentVersion !== expectedVersion;
}

/**
 * Merge paper updates while preserving version integrity
 */
export function mergePaperUpdates(
  current: Paper,
  updates: Partial<Paper>
): Paper {
  return {
    ...current,
    ...updates,
    // Preserve fields that shouldn't be overwritten
    id: current.id,
    createdAt: current.createdAt,
    version: current.version, // Version is updated separately
    updatedAt: Date.now(),
  };
}
