import { fireEvent, screen, waitFor } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { renderApp } from '../../test/render';
import { rentalServices, tenantFixture } from '../../test/lease-fixture';
import { DocumentUpload } from './components/DocumentUpload';
import { uploadValidation } from './schemas/tenant.schema';
import { RENTAL_LIMIT } from '../../config/lease.constants';
it('validates upload type and size before sending', () => {
  expect(uploadValidation(new File(['text'], 'fake.pdf', { type: 'text/plain' }))).toBe(
    'rental.uploadTypeError',
  );
  const file = new File(['%PDF'], 'document.pdf', { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: RENTAL_LIMIT.UPLOAD_BYTES + 1 });
  expect(uploadValidation(file)).toBe('rental.uploadSizeError');
});
it('retains a failed upload for retry and displays upload progress accessibly', async () => {
  vi.stubGlobal(
    'URL',
    Object.assign(URL, { createObjectURL: () => 'blob:fixture', revokeObjectURL: () => undefined }),
  );
  const services = rentalServices();
  const upload = vi.spyOn(services.tenants, 'upload');
  renderApp(<DocumentUpload tenant={tenantFixture().id} />, 'en', services);
  fireEvent.change(screen.getByLabelText(/Drop/), {
    target: { files: [new File(['%PDF'], 'document.pdf', { type: 'application/pdf' })] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Upload document' }));
  await waitFor(() => {
    expect(upload).toHaveBeenCalledTimes(1);
  });
  expect(await screen.findByRole('button', { name: 'Retry upload' })).toBeEnabled();
  expect(screen.getByRole('progressbar')).toHaveAccessibleName();
  fireEvent.click(screen.getByRole('button', { name: 'Retry upload' }));
  await waitFor(() => {
    expect(upload).toHaveBeenCalledTimes(2);
  });
});
