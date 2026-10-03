import { AuthPlaceholder } from '@/features/foundation';
import { messageKey } from '@/lib/i18n/message-key';
export default function Page(): React.JSX.Element {
  return <AuthPlaceholder title={messageKey('common.verifyOtp')} />;
}
