'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import { InputField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import {
  RENTAL_KEYS,
  RENTAL_STATE as S,
  STATUS_MESSAGES,
  TYPE_MESSAGES,
} from '../../../config/lease.constants';
import type { TenantDocument } from '../api/tenants-api';
import { environment } from '../../../lib/env';
import { DocumentUpload } from './DocumentUpload';
export function DocumentPanel({
  tenant,
  staff,
  canUpload,
}: {
  tenant: string;
  staff: boolean;
  canUpload: boolean;
}): React.JSX.Element {
  const t = useTranslations(),
    services = useServices();
  const docs = useQuery({
    queryKey: RENTAL_KEYS.documents(tenant),
    queryFn: () => services.tenants.documents(tenant),
  });
  return (
    <div className="space-y-5">
      {canUpload ? <DocumentUpload tenant={tenant} /> : null}
      {docs.isError ? <p role="alert">{t('errors.INTERNAL_ERROR')}</p> : null}
      {docs.data?.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} staff={staff} />
      ))}
      {!docs.data?.length ? <p>{t('rental.empty')}</p> : null}
    </div>
  );
}
function DocumentRow({ doc, staff }: { doc: TenantDocument; staff: boolean }): React.JSX.Element {
  return <DocumentRowView {...useDocumentRowModel({ doc, staff })} />;
}
function useDocumentRowModel({
  doc,
  staff,
}: {
  doc: TenantDocument;
  staff: boolean;
}): DocumentRowModelResult {
  const t = useTranslations(),
    services = useServices(),
    client = useQueryClient(),
    submission = useAuthSubmission();
  const [reason, setReason] = useState('');
  const review = (status: TenantDocument['status']): void => {
    void submission.run(async () => {
      await services.tenants.reviewDocument(doc.id, status, reason);
      await client.invalidateQueries({ queryKey: RENTAL_KEYS.documents(doc.tenantId) });
      await client.invalidateQueries({ queryKey: RENTAL_KEYS.tenant(doc.tenantId) });
    });
  };
  const download = (): void => {
    void submission.run(async () => {
      const signed = await services.tenants.download(doc.id);
      window.open(
        new URL(signed.url, environment.NEXT_PUBLIC_API_URL).toString(),
        '_blank',
        'noopener,noreferrer',
      );
    });
  };
  return { t, submission, reason, setReason, review, download, doc, staff };
}
function DocumentRowView(model: DocumentRowViewProps): React.JSX.Element {
  return <DocumentRecord {...model} />;
}

type DocumentRowModelResult = {
  t: ReturnType<typeof useTranslations<never>>;
  submission: ReturnType<typeof useAuthSubmission>;
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
  review: (status: typeof S.VERIFIED | typeof S.REJECTED) => void;
  download: () => void;
  doc: TenantDocument;
  staff: boolean;
};

type DocumentRowViewProps = ReturnType<typeof useDocumentRowModel>;

function DocumentRecord(model: DocumentRowViewProps): React.JSX.Element {
  const { t, submission, reason, setReason, review, download, doc, staff } = model;
  return (
    <article className="space-y-3 rounded-xl border p-4">
      <p>
        {t(TYPE_MESSAGES[doc.type])} · {t(STATUS_MESSAGES[doc.status])}
      </p>
      {doc.reviewReason ? <p>{doc.reviewReason}</p> : null}
      <Button type="button" variant="outline" onClick={download}>
        {t('rental.download')}
      </Button>
      {staff ? (
        <>
          <InputField
            label={t('rental.reason')}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={submission.busy}
              onClick={() => {
                review(S.VERIFIED);
              }}
            >
              {t('rental.verify')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!reason.trim() || submission.busy}
              onClick={() => {
                review(S.REJECTED);
              }}
            >
              {t('rental.reject')}
            </Button>
          </div>
        </>
      ) : null}
      <AuthErrorNotice {...submission} />
    </article>
  );
}
