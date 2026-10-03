import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingSteps } from './LandingSteps';
import { LandingFaq } from './LandingFaq';
import { LandingFooter } from './LandingFooter';
export function LandingPage(): React.JSX.Element {
  return (
    <>
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingSteps />
        <LandingFaq />
        <LandingFooter />
      </main>
    </>
  );
}
