import Corkboard from './components/Corkboard';
import { getPapers, checkAuth } from './actions';

export default async function Home() {
  const papers = await getPapers();
  const isAuthenticated = await checkAuth();

  return <Corkboard initialPapers={papers} initialAuth={isAuthenticated} />;
}
