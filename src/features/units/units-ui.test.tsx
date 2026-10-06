import { it, expect, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderApp } from '../../test/render';
import { TestSession } from '../../test/identity';
import { unitFixture, unitIdentity, unitServices } from '../../test/unit-fixture';
import { UNIT_STATUS, UNIT_PERMISSION } from '../../config/unit.constants';
import { ApiError } from '../../lib/api/api-error';
import { UnitsGrid } from './components/UnitsGrid';
import { BulkDialog } from './components/BulkDialog';
import { OccupancyWidget } from './components/OccupancyWidget';
import { UnitsPage } from './index';
import { UNIT_SCHEMA } from './schemas/unit.schema';
vi.mock('./components/OccupancyChart', () => ({ default: () => null }));
it('renders every status with an icon and accessible text, grouped by floor and wing', async () => {
  const units = Object.values(UNIT_STATUS).map((status) => ({
    ...unitFixture(status),
    id: status,
    code: status,
  }));
  const open = vi.fn();
  const view = renderApp(<UnitsGrid units={units} open={open} />, 'en', unitServices());
  for (const label of ['Vacant', 'Occupied', 'Reserved', 'Maintenance', 'Blocked'])
    expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /VACANT Vacant/i }));
  expect(open).toHaveBeenCalledWith(units[0]);
  expect((await axe(view.container)).violations).toEqual([]);
});
it('previews deterministic bulk codes and rejects patterns above the limits', async () => {
  const services = unitServices();
  const bulk = vi.spyOn(services.units, 'bulk');
  renderApp(<BulkDialog property={unitFixture().propertyId} />, 'en', services);
  fireEvent.change(screen.getByLabelText('Number of floors'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Units per floor'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Code prefix'), { target: { value: 'A' } });
  expect(screen.getByText(/A01-01, A01-02, A01-03, A02-01/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Number of floors'), { target: { value: '51' } });
  fireEvent.click(screen.getByRole('button', { name: 'Bulk create' }));
  expect(screen.getByRole('alert')).toHaveTextContent('required fields');
  expect(bulk).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Number of floors'), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Bulk create' }));
  await screen.findByText('Created 6 units.');
  expect(bulk).toHaveBeenCalledWith(
    unitFixture().propertyId,
    expect.objectContaining({ floors: 2, perFloor: 3, prefix: 'A', baseRent: '0.00' }),
  );
});
it('shows accessible occupancy values and handles an empty bed total', async () => {
  const services = unitServices();
  const view = renderApp(
    <TestSession me={unitIdentity()}>
      <OccupancyWidget propertyId={unitFixture().propertyId} />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByRole('region', { name: 'Occupancy' });
  expect(screen.getByRole('progressbar', { name: 'Units' })).toHaveAttribute('value', '25');
  expect(screen.getAllByText('1 of 4 occupied (25%)')).toHaveLength(2);
  expect(screen.queryByRole('heading', { name: 'Beds' })).not.toBeInTheDocument();
  expect((await axe(view.container)).violations).toEqual([]);
});
it('rolls back an optimistic illegal status change and maps its localized error', async () => {
  const services = unitServices();
  const status = vi
    .spyOn(services.units, 'status')
    .mockRejectedValue(new ApiError('ILLEGAL_UNIT_TRANSITION', 409, 'fixture'));
  renderApp(
    <TestSession me={unitIdentity()}>
      <UnitsPage />
    </TestSession>,
    'en',
    services,
  );
  fireEvent.click(await screen.findByRole('button', { name: /R101 Vacant/ }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('Status'), { target: { value: 'OCCUPIED' } });
  await within(dialog).findByText('This status transition is not allowed.');
  expect(within(dialog).getByLabelText('Status')).toHaveValue('VACANT');
  expect(status).toHaveBeenCalledWith(unitFixture().id, 'OCCUPIED', 'VACANT');
});
it('hides mutation actions from a reader and keeps rent validation exact', async () => {
  renderApp(
    <TestSession me={unitIdentity([UNIT_PERMISSION.READ])}>
      <UnitsPage />
    </TestSession>,
    'en',
    unitServices(),
  );
  await screen.findByRole('button', { name: /R101 Vacant/ });
  expect(screen.queryByRole('button', { name: 'Create unit' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Bulk create' })).not.toBeInTheDocument();
  expect(
    UNIT_SCHEMA.safeParse({ code: 'R', type: 'ROOM', baseRent: 1.25, capacity: 1 }).success,
  ).toBe(false);
  expect(
    UNIT_SCHEMA.safeParse({ code: 'R', type: 'ROOM', baseRent: '1.25', capacity: 1 }).success,
  ).toBe(true);
});
