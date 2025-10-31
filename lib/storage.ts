import { put, head } from '@vercel/blob';

const BLOB_FILENAME = 'papers.json';

// Check if Blob is configured
const isBlobConfigured = () => {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
};

export async function getAllPapers() {
  if (!isBlobConfigured()) {
    return [];
  }

  try {
    // Check if the blob exists
    const metadata = await head(BLOB_FILENAME);
    if (!metadata) {
      return [];
    }

    // Fetch the blob content
    const response = await fetch(metadata.url);
    if (!response.ok) {
      return [];
    }

    const papers = await response.json();
    return papers || [];
  } catch (error) {
    console.error('Error reading papers from blob:', error);
    return [];
  }
}

export async function savePapers(papers: any[]) {
  if (!isBlobConfigured()) {
    console.warn('Blob not configured, skipping save');
    return;
  }

  try {
    const blob = new Blob([JSON.stringify(papers, null, 2)], {
      type: 'application/json',
    });

    await put(BLOB_FILENAME, blob, {
      access: 'public',
      addRandomSuffix: false,
    });
  } catch (error) {
    console.error('Error saving papers to blob:', error);
  }
}
