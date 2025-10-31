import { kv } from '@vercel/kv';

const PAPERS_KEY = 'papers';

// Check if KV is configured
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

export async function getAllPapers() {
  if (!isKVConfigured()) {
    return [];
  }
  const papers = await kv.get(PAPERS_KEY);
  return papers || [];
}

export async function savePapers(papers: any[]) {
  if (!isKVConfigured()) {
    console.warn('KV not configured, skipping save');
    return;
  }
  await kv.set(PAPERS_KEY, papers);
}
