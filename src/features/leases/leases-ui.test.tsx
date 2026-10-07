import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderApp } from '../../test/render';
import { rentalServices, leaseFixture } from '../../test/lease-fixture';
import { LeaseTimeline } from './components/LeaseTimeline';
import { LeaseDetail } from './components/LeaseDetail';
import { LEASE_SCHEMA } from './schemas/lease.schema';
import { LEASE_STATES } from '../../config/lease.constants';
describe('lease workflow', () => {
  it.each(LEASE_STATES)('identifies %s using accessible text and current step', (status) => {
    const { container } = renderApp(<LeaseTimeline lease={{ status }} />, 'en', rentalServices());
    expect(screen.getByRole('list', { name: 'Lease status timeline' })).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });
  it('keeps tenant lease details read-only', async () => {
    renderApp(<LeaseDetail id={leaseFixture().id} readOnly />, 'en', rentalServices());
    expect(await screen.findByText('12500.50')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Record deposit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Terminate lease' })).not.toBeInTheDocument();
  });
  it('rejects reversed dates, floating amounts and invalid due days', () => {
    const input = leaseFixture();
    expect(LEASE_SCHEMA.safeParse(input).success).toBe(true);
    for (const patch of [
      { endDate: input.startDate },
      { rent: 12500.5 },
      { rent: '1.234' },
      { dueDay: 29 },
    ])
      expect(LEASE_SCHEMA.safeParse({ ...input, ...patch }).success).toBe(false);
  });
});
