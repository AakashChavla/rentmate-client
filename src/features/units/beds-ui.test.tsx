import { it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { TestSession } from '../../test/identity';
import { unitFixture, unitIdentity, unitServices } from '../../test/unit-fixture';
import { propertyFixture } from '../../test/domain-fixture';
import { ApiError } from '../../lib/api/api-error';
import { BedManager } from './components/BedManager';
it('manages PG bed labels and rolls back a rejected optimistic status change', async () => {
  const services = unitServices();
  const unit = unitFixture();
  const bed = {
    id: 'bed',
    organizationId: unit.organizationId,
    propertyId: unit.propertyId,
    unitId: unit.id,
    label: 'A',
    status: 'VACANT',
    createdAt: unit.createdAt,
  } as const;
  vi.spyOn(services.properties, 'get').mockResolvedValue({
    ...propertyFixture(),
    type: 'PG_HOSTEL',
  });
  vi.spyOn(services.units, 'beds').mockResolvedValue([{ ...bed }]);
  const update = vi.spyOn(services.units, 'updateBed').mockResolvedValue({ ...bed, label: 'A1' });
  const status = vi
    .spyOn(services.units, 'bedStatus')
    .mockRejectedValue(new ApiError('ILLEGAL_UNIT_TRANSITION', 409, 'fixture'));
  renderApp(
    <TestSession me={unitIdentity()}>
      <BedManager unit={unit} />
    </TestSession>,
    'en',
    services,
  );
  const input = await screen.findByDisplayValue('A');
  fireEvent.change(input, { target: { value: 'A1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await vi.waitFor(() => {
    expect(update).toHaveBeenCalledWith(bed.id, 'A1');
  });
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'OCCUPIED' } });
  await screen.findByText('This status transition is not allowed.');
  expect(screen.getByLabelText('Status')).toHaveValue('VACANT');
  expect(status).toHaveBeenCalledWith(bed.id, 'OCCUPIED', 'VACANT');
});
