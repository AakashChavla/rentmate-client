import { PropertyDetail } from '@/features/properties';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  return <PropertyDetail id={id} />;
}
