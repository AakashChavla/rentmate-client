import { FoundationHeader } from './FoundationHeader';
import { FoundationHero } from './FoundationHero';
import { FoundationCard } from './FoundationCard';
import { Entrance } from '../../../components/shared/Entrance';
export function FoundationPage(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-12">
      <FoundationHeader />
      <section className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-2">
        <Entrance>
          <FoundationHero />
        </Entrance>
        <Entrance>
          <FoundationCard />
        </Entrance>
      </section>
    </main>
  );
}
