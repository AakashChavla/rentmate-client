'use client';
import { messageKey } from '../../../lib/i18n/message-key';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice } from '../../auth';
import { Button } from '../../../components/ui/Button';
import {
  RENTAL_KEYS,
  DOCUMENT_TYPES,
  TYPE_MESSAGES,
  RENTAL_LIMIT as L,
} from '../../../config/lease.constants';
import { uploadValidation } from '../schemas/tenant.schema';
import type { DocumentType } from '../api/tenants-api';
export function DocumentUpload({ tenant }: { tenant: string }): React.JSX.Element {
  return <DocumentUploadView {...useDocumentUploadModel({ tenant })} />;
}
function useDocumentUploadModel({ tenant }: { tenant: string }): DocumentUploadModelResult {
  const t = useTranslations(),
    services = useServices(),
    client = useQueryClient(),
    submission = useAuthSubmission();
  const [file, setFile] = useState<File | null>(null),
    [type, setType] = useState<DocumentType>(DOCUMENT_TYPES[0]),
    [progress, setProgress] = useState(0),
    [invalid, setInvalid] = useState<ReturnType<typeof uploadValidation>>(null);
  const preview = useFilePreview(file);
  const choose = (next: File | undefined): void => {
    if (!next) return;
    const error = uploadValidation(next);
    setInvalid(error);
    setFile(error ? null : next);
    setProgress(0);
  };
  const upload = (): void => {
    if (!file) return;
    void submission.run(async () => {
      await services.tenants.upload(tenant, type, file, setProgress);
      setProgress(L.PROGRESS);
      setFile(null);
      await client.invalidateQueries({ queryKey: RENTAL_KEYS.documents(tenant) });
      await client.invalidateQueries({ queryKey: RENTAL_KEYS.tenant(tenant) });
    });
  };
  return { t, submission, file, type, setType, progress, invalid, preview, choose, upload };
}
function DocumentUploadView(model: DocumentUploadViewProps): React.JSX.Element {
  const { t, submission, file, type, setType, progress, invalid, upload } = model;

  return (
    <section className="space-y-3" aria-label={t('rental.documents')}>
      <label className="block">
        {t('rental.fileType')}
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as DocumentType);
          }}
          className="ms-3 rounded border bg-surface p-2"
        >
          {DOCUMENT_TYPES.map((v) => (
            <option key={v} value={v}>
              {t(TYPE_MESSAGES[v])}
            </option>
          ))}
        </select>
      </label>
      <UploadDropZone {...model} />
      {invalid ? <p role="alert">{t(invalid)}</p> : null}
      <progress
        className="w-full accent-primary"
        value={progress}
        max={L.PROGRESS}
        aria-label={t('rental.uploadProgress')}
      />
      <AuthErrorNotice {...submission} />
      <Button type="button" disabled={!file || submission.busy} onClick={upload}>
        {t(submission.message ? messageKey('rental.retry') : messageKey('rental.upload'))}
      </Button>
    </section>
  );
}
function useFilePreview(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const value = URL.createObjectURL(file);
    setUrl(value);
    return () => {
      URL.revokeObjectURL(value);
    };
  }, [file]);
  return url;
}

function UploadDropZone(model: UploadDropZoneProps): React.JSX.Element {
  const { t, submission, file, preview, choose } = model;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        choose(e.dataTransfer.files[0]);
      }}
      className="rounded-xl border-2 border-dashed p-6"
    >
      <label>
        {t('rental.drop')}
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => {
            choose(e.target.files?.[0]);
          }}
          disabled={submission.busy}
          className="mt-3 block w-full"
        />
      </label>
      {preview ? (
        <a href={preview} target="_blank" rel="noreferrer" className="mt-3 block underline">
          {t('rental.preview')}: {file?.name}
        </a>
      ) : null}
    </div>
  );
}

type DocumentUploadModelResult = {
  t: ReturnType<typeof useTranslations<never>>;
  submission: ReturnType<typeof useAuthSubmission>;
  file: File | null;
  type: DocumentType;
  setType: React.Dispatch<React.SetStateAction<DocumentType>>;
  progress: number;
  invalid: ReturnType<typeof uploadValidation>;
  preview: string | null;
  choose: (next: File | undefined) => void;
  upload: () => void;
};

type DocumentUploadViewProps = ReturnType<typeof useDocumentUploadModel>;

type UploadDropZoneProps = Pick<
  ReturnType<typeof useDocumentUploadModel>,
  't' | 'submission' | 'file' | 'type' | 'preview' | 'choose'
>;
