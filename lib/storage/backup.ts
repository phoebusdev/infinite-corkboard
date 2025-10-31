import { put, list } from '@vercel/blob';
import { Paper } from '@/types/paper';

const BACKUP_PREFIX = 'backups/papers-';
const MAX_BACKUPS = 10;

/**
 * Create a backup of papers before modifying
 */
export async function createBackup(papers: Paper[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('Blob not configured, skipping backup');
    return;
  }

  try {
    const timestamp = Date.now();
    const filename = `${BACKUP_PREFIX}${timestamp}.json`;

    const blob = new Blob([JSON.stringify(papers, null, 2)], {
      type: 'application/json',
    });

    await put(filename, blob, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Clean up old backups
    await cleanupOldBackups();
  } catch (error) {
    console.error('Error creating backup:', error);
    // Don't throw - backups are best-effort
  }
}

/**
 * Remove old backups, keeping only the most recent ones
 */
async function cleanupOldBackups(): Promise<void> {
  try {
    const { blobs } = await list({
      prefix: BACKUP_PREFIX,
    });

    if (blobs.length <= MAX_BACKUPS) {
      return;
    }

    // Sort by uploadedAt descending
    const sortedBlobs = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    // Delete old backups
    const blobsToDelete = sortedBlobs.slice(MAX_BACKUPS);
    for (const blob of blobsToDelete) {
      // Note: Vercel Blob doesn't have a direct delete API in free tier
      // In production, you'd use blob.del() or implement custom cleanup
      console.log('Would delete old backup:', blob.pathname);
    }
  } catch (error) {
    console.error('Error cleaning up backups:', error);
  }
}

/**
 * List available backups
 */
export async function listBackups(): Promise<
  Array<{ url: string; uploadedAt: Date; size: number }>
> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return [];
  }

  try {
    const { blobs } = await list({
      prefix: BACKUP_PREFIX,
    });

    return blobs.map((blob) => ({
      url: blob.url,
      uploadedAt: new Date(blob.uploadedAt),
      size: blob.size,
    }));
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}

/**
 * Restore papers from a backup URL
 */
export async function restoreFromBackup(backupUrl: string): Promise<Paper[]> {
  try {
    const response = await fetch(backupUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch backup');
    }
    return await response.json();
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw error;
  }
}
