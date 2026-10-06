import { OccupancyWidget } from '@/features/units';
import { OnboardingDashboard } from '@/features/organization';
export default function Page(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <OnboardingDashboard />
      <OccupancyWidget />
    </div>
  );
}
