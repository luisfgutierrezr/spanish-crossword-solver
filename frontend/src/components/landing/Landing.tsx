import { Nav } from './Nav';
import { Hero } from './Hero';
import { Features } from './Features';
import { Benefits } from './Benefits';
import { Footer } from './Footer';

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-white">
      <Nav onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <Benefits onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}
