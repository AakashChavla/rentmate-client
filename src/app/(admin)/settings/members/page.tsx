import { redirect } from 'next/navigation';
import { DOMAIN_ROUTE } from '@/config/property.constants';
export default function Page(): never {
  redirect(DOMAIN_ROUTE.TEAM);
}
