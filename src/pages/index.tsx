import { LandingPage } from '@/components/pages';
import { SeoHead } from '@/components/SeoHead';

export default function App() {
  return (
    <>
      <SeoHead
        title="PyViz – Learn Python Visually"
        description="PyViz: Learn Python and programming with interactive lessons and projects."
        url="/"
      />
      <LandingPage />
    </>
  );
}