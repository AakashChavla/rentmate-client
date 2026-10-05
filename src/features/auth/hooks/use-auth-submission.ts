'use client';
import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ApiError } from '../../../lib/api/api-error';
import { useApiErrorMessage } from '../../../lib/api/use-api-error-message';
import { useCountdown } from './use-countdown';
export function useAuthSubmission(notify = false): {
  busy: boolean;
  message: string | null;
  requestId: string | null;
  remaining: number;
  run(action: () => Promise<void>): Promise<void>;
} {
  const t = useTranslations();
  const translate = useApiErrorMessage();
  const guard = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const countdown = useCountdown();
  const run = async (action: () => Promise<void>): Promise<void> => {
    if (guard.current || countdown.remaining) return;
    guard.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await action();
    } catch (error) {
      const translated = error instanceof ApiError ? translate(error) : t('errors.INTERNAL_ERROR');
      setMessage(translated);
      if (notify) toast.error(translated);
      setRequestId(error instanceof ApiError ? error.requestId : null);
      if (error instanceof ApiError && error.retryAfterSeconds)
        countdown.start(error.retryAfterSeconds);
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };
  return { busy, message, requestId, remaining: countdown.remaining, run };
}
