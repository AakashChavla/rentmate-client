import { fireEvent, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { renderApp } from '../../test/render';
import { rentalServices, tenantFixture } from '../../test/lease-fixture';
import { unitFixture } from '../../test/unit-fixture';
import { LeaseWizard } from './components/LeaseWizard';
import { ApiError } from '../../lib/api/api-error';
it('validates the wizard and maps a database booking conflict before submission', async () => {
  const services = rentalServices(),
    available = vi
      .spyOn(services.leases, 'available')
      .mockRejectedValue(new ApiError('LEASE_OVERLAP', 409, 'fixture'));
  const view = renderApp(
    <LeaseWizard property={unitFixture().propertyId} done={() => undefined} />,
    'en',
    services,
  );
  expect(screen.getByRole('button', { name: 'Create lease' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
  expect(available).not.toHaveBeenCalled();
  await screen.findByRole('option', { name: 'Fixture Tenant' });
  fireEvent.change(screen.getByLabelText('Select a verified tenant'), {
    target: { value: tenantFixture().id },
  });
  fireEvent.click(await screen.findByRole('button', { name: /R101.*Vacant/i }));
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-01-01' } });
  fireEvent.change(screen.getByLabelText('End date (exclusive)'), {
    target: { value: '2027-01-01' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
  expect(
    await screen.findByText('The unit or bed is already booked for these dates.'),
  ).toBeInTheDocument();
  expect(available).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Create lease' })).toBeDisabled();
  expect((await axe(view.container)).violations).toEqual([]);
});
