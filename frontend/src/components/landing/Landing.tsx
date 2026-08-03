import { Hero } from './Hero';
import { Examples } from './Examples';
import { Modes } from './Modes';
import { Closing } from './Closing';
import { Footer } from './Footer';

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-orange-50/60">
      <Hero onGetStarted={onGetStarted} />
      <Examples />
      <Modes />
      <Closing onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}
