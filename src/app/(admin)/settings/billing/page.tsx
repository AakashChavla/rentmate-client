import { PlaceholderPage } from '@/features/foundation';
import { messageKey } from '@/lib/i18n/message-key';
export default function Page(): React.JSX.Element {
  return <PlaceholderPage title={messageKey('common.billing')} />;
}
