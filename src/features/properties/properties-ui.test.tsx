import { it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderApp } from '../../test/render';
import { domainIdentity, domainServices, propertyFixture } from '../../test/domain-fixture';
import { TestSession } from '../../test/identity';
import { PropertyWizard, PropertySwitcher, PropertyList, PropertyDetail } from './index';
import { PropertySelectionProvider } from '../../providers/PropertySelectionProvider';
import { CONFIG_SCHEMAS } from './schemas/property.schema';
import { PROPERTY_TYPES } from '../../config/property.constants';
import { navigation } from '../../test/navigation';
it('validates a property wizard, switches configuration by type, creates and navigates', async () => {
  const services = domainServices();
  const create = vi.spyOn(services.properties, 'create');
  renderApp(
    <TestSession me={domainIdentity()}>
      <PropertyWizard />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByLabelText('Property name');
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByRole('alert')).toHaveTextContent('required fields');
  fireEvent.change(screen.getByLabelText('Property name'), { target: { value: 'New residence' } });
  fireEvent.change(screen.getByLabelText('Property type'), { target: { value: 'PG_HOSTEL' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  for (const [label, value] of [
    ['Address line 1', 'Fixture Road'],
    ['City', 'Pune'],
    ['State', 'Maharashtra'],
    ['Postal code', '411001'],
  ])
    fireEvent.change(screen.getByLabelText(label ?? ''), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.queryByLabelText('Check-in time')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Rent due day (1–28)'), { target: { value: '29' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(create).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Rent due day (1–28)'), { target: { value: '7' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => {
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PG_HOSTEL',
        configuration: { currency: 'INR', rentDueDay: 7, graceDays: 5 },
      }),
    );
  });
  await waitFor(() => {
    expect(navigation.push).toHaveBeenCalledWith('/properties/' + propertyFixture().id);
  });
});
it('saves property configuration and confirms archiving through the detail tabs', async () => {
  const services = domainServices();
  const update = vi.spyOn(services.properties, 'update');
  const config = vi.spyOn(services.properties, 'setConfig');
  renderApp(
    <TestSession me={domainIdentity()}>
      <PropertyDetail id={propertyFixture().id} />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByRole('heading', { name: 'Garden House' });
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Settings' }), { button: 0, ctrlKey: false });
  await screen.findByLabelText('Check-in time');
  fireEvent.change(screen.getByLabelText('Check-in time'), { target: { value: '15:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => {
    expect(config).toHaveBeenCalledWith(propertyFixture().id, {
      currency: 'INR',
      checkInTime: '15:00',
      checkOutTime: '11:00',
    });
  });
  fireEvent.click(screen.getByRole('button', { name: 'Archive property' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  await waitFor(() => {
    expect(update).toHaveBeenCalledWith(propertyFixture().id, { status: 'ARCHIVED' });
  });
});
it('edits a property with an immutable type and clears its timezone override', async () => {
  const services = domainServices();
  const update = vi.spyOn(services.properties, 'update');
  renderApp(
    <TestSession me={domainIdentity()}>
      <PropertyWizard id={propertyFixture().id} />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByLabelText('Property name');
  expect(screen.getByLabelText('Property type')).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Property name'), {
    target: { value: 'Edited residence' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => {
    expect(update).toHaveBeenCalledWith(
      propertyFixture().id,
      expect.objectContaining({ name: 'Edited residence', timezone: null }),
    );
  });
});
it('persists a switcher preference and always passes it as a list filter', async () => {
  const services = domainServices();
  const list = vi.spyOn(services.properties, 'list');
  const set = vi.spyOn(services.preferences, 'set');
  const { container } = renderApp(
    <TestSession me={domainIdentity()}>
      <PropertySelectionProvider>
        <PropertySwitcher />
        <PropertyList />
      </PropertySelectionProvider>
    </TestSession>,
    'en',
    services,
  );
  await screen.findByRole('option', { name: 'Garden House' });
  fireEvent.change(screen.getByLabelText('Choose a property'), {
    target: { value: propertyFixture().id },
  });
  await waitFor(() => {
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({ propertyId: propertyFixture().id }),
    );
  });
  expect(list).toHaveBeenCalledWith(expect.objectContaining({ mine: true }));
  expect(set).toHaveBeenCalledWith('rm_property', propertyFixture().id);
  expect((await axe(container)).violations).toEqual([]);
});
it('hides create actions for a property-scoped manager', async () => {
  const me = domainIdentity();
  for (const role of me.roles) {
    role.role = 'PROPERTY_MANAGER';
    role.scope = 'PROPERTY';
    role.scopeId = propertyFixture().id;
    role.permissions = ['property:read'];
  }
  me.permissions = ['property:read'];
  renderApp(
    <TestSession me={me}>
      <PropertyList />
    </TestSession>,
    'en',
    domainServices(),
  );
  await screen.findByText('Garden House');
  expect(screen.queryByRole('link', { name: 'Create property' })).not.toBeInTheDocument();
});
it.each(PROPERTY_TYPES)('validates client config schema for %s', (type) => {
  expect(
    CONFIG_SCHEMAS[type].safeParse(
      type === 'HOTEL'
        ? { currency: 'INR', checkInTime: '25:00', checkOutTime: '11:00' }
        : { currency: 'INR', rentDueDay: 29, graceDays: 5 },
    ).success,
  ).toBe(false);
  expect(
    CONFIG_SCHEMAS[type].safeParse(
      type === 'HOTEL'
        ? { currency: 'INR', checkInTime: '14:00', checkOutTime: '11:00' }
        : { currency: 'INR', rentDueDay: 1, graceDays: 5 },
    ).success,
  ).toBe(true);
});
