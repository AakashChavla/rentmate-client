import { LeaseDetail } from '../../../../features/leases';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  return <LeaseDetail id={id} />;
}
