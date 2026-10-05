import { redirect } from 'next/navigation';
import { USERS_ROUTE } from '@/config/auth.constants';
export default function Page(): never {
  redirect(USERS_ROUTE);
}
