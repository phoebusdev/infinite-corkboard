import Corkboard from './components/Corkboard';
import { getPapers, checkAuth } from './actions';

// Force dynamic rendering since we need KV at runtime
export const dynamic = 'force-dynamic';

export default async function Home() {
  const papers = await getPapers();
  const isAuthenticated = await checkAuth();

  return <Corkboard initialPapers={papers} initialAuth={isAuthenticated} />;
}
