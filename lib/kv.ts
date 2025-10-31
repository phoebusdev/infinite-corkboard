import { kv } from '@vercel/kv';

const PAPERS_KEY = 'papers';

export async function getAllPapers() {
  const papers = await kv.get(PAPERS_KEY);
  return papers || [];
}

export async function savePapers(papers: any[]) {
  await kv.set(PAPERS_KEY, papers);
}
