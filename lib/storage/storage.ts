import { put, head } from '@vercel/blob';
import { Paper, PaperColor } from '@/types/paper';
import {
  incrementVersion,
  hasVersionConflict,
  mergePaperUpdates,
} from './versioning';
import { createBackup } from './backup';

const BLOB_FILENAME = 'papers.json';

// Check if Blob is configured
const isBlobConfigured = () => {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
};

/**
 * Migrate a paper object to the latest schema
 */
function migratePaper(paper: any): Paper {
  return {
    id: paper.id,
    text: paper.text || '',
    x: paper.x || 0,
    y: paper.y || 0,
    rotation: paper.rotation || 0,
    zIndex: paper.zIndex ?? 0,
    color: paper.color || PaperColor.Yellow,
    width: paper.width || 192, // Default 48 * 4 (Tailwind w-48)
    height: paper.height || 192,
    createdAt: paper.createdAt || Date.now(),
    updatedAt: paper.updatedAt || Date.now(),
    version: paper.version ?? 1,
    tags: paper.tags || [],
    isLocked: paper.isLocked ?? false,
  };
}

/**
 * Get all papers with migration
 */
export async function getAllPapers(): Promise<Paper[]> {
  if (!isBlobConfigured()) {
    return [];
  }

  try {
    const metadata = await head(BLOB_FILENAME);
    if (!metadata) {
      return [];
    }

    const response = await fetch(metadata.url);
    if (!response.ok) {
      return [];
    }

    const rawPapers = await response.json();
    return (rawPapers || []).map(migratePaper);
  } catch (error) {
    console.error('Error reading papers from blob:', error);
    return [];
  }
}

/**
 * Save papers with backup
 */
export async function savePapers(papers: Paper[]): Promise<void> {
  if (!isBlobConfigured()) {
    console.warn('Blob not configured, skipping save');
    return;
  }

  try {
    // Create backup before saving
    await createBackup(papers);

    const blob = new Blob([JSON.stringify(papers, null, 2)], {
      type: 'application/json',
    });

    await put(BLOB_FILENAME, blob, {
      access: 'public',
      addRandomSuffix: false,
    });
  } catch (error) {
    console.error('Error saving papers to blob:', error);
    throw error;
  }
}

/**
 * Add a new paper
 */
export async function addPaperToStore(
  paperData: Partial<Paper>
): Promise<Paper> {
  const papers = await getAllPapers();

  // Find max z-index
  const maxZIndex = papers.reduce((max, p) => Math.max(max, p.zIndex), 0);

  const newPaper: Paper = {
    id: paperData.id || '',
    text: paperData.text || '',
    x: paperData.x || 0,
    y: paperData.y || 0,
    rotation: paperData.rotation ?? (Math.random() - 0.5) * 10,
    zIndex: maxZIndex + 1,
    color: paperData.color || PaperColor.Yellow,
    width: paperData.width || 192,
    height: paperData.height || 192,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    tags: paperData.tags || [],
    isLocked: false,
  };

  papers.push(newPaper);
  await savePapers(papers);

  return newPaper;
}

/**
 * Update a paper with optimistic locking
 */
export async function updatePaperInStore(
  id: string,
  updates: Partial<Paper>,
  expectedVersion: number
): Promise<{
  paper?: Paper;
  conflict: boolean;
  currentPaper?: Paper;
}> {
  const papers = await getAllPapers();
  const index = papers.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error('Paper not found');
  }

  const currentPaper = papers[index];

  // Check for version conflict
  if (hasVersionConflict(currentPaper.version, expectedVersion)) {
    return { conflict: true, currentPaper };
  }

  // Merge updates
  const updatedPaper = mergePaperUpdates(currentPaper, updates);
  updatedPaper.version = incrementVersion(currentPaper.version);

  papers[index] = updatedPaper;
  await savePapers(papers);

  return { paper: updatedPaper, conflict: false };
}

/**
 * Delete a paper
 */
export async function deletePaperFromStore(id: string): Promise<void> {
  const papers = await getAllPapers();
  const filtered = papers.filter((p) => p.id !== id);
  await savePapers(filtered);
}

/**
 * Batch update paper positions (for performance)
 */
export async function batchUpdatePositions(
  updates: Array<{ id: string; x: number; y: number; version: number }>
): Promise<{ success: boolean; errors: string[] }> {
  const papers = await getAllPapers();
  const errors: string[] = [];

  const papersMap = new Map(papers.map((p) => [p.id, p]));

  for (const update of updates) {
    const paper = papersMap.get(update.id);
    if (!paper) {
      errors.push(`Paper ${update.id} not found`);
      continue;
    }

    if (hasVersionConflict(paper.version, update.version)) {
      errors.push(`Paper ${update.id} version conflict`);
      continue;
    }

    paper.x = update.x;
    paper.y = update.y;
    paper.version = incrementVersion(paper.version);
    paper.updatedAt = Date.now();
  }

  if (errors.length === 0) {
    await savePapers(Array.from(papersMap.values()));
    return { success: true, errors: [] };
  }

  return { success: false, errors };
}
