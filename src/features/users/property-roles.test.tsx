import { it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderApp } from '../../test/render';
import { domainIdentity, domainServices, propertyFixture } from '../../test/domain-fixture';
import { TestSession } from '../../test/identity';
import { ManageRolesDialog } from './components/ManageRolesDialog';
it('assigns a property-scoped role and hides the owner role for property scope', async () => {
  const services = domainServices();
  const me = domainIdentity();
  const user = { ...me.user, roles: me.roles };
  vi.spyOn(services.users, 'roles').mockResolvedValue([
    'ORG_OWNER',
    'PROPERTY_MANAGER',
    'SUPER_ADMIN',
  ]);
  vi.spyOn(services.users, 'get').mockResolvedValue(user);
  const assign = vi.spyOn(services.users, 'assign').mockResolvedValue();
  renderApp(
    <TestSession me={me}>
      <ManageRolesDialog user={user} onClose={() => undefined} />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByRole('option', { name: 'Property manager' });
  fireEvent.change(screen.getByLabelText('Access scope'), { target: { value: 'PROPERTY' } });
  await screen.findByRole('option', { name: 'Garden House' });
  fireEvent.change(screen.getByLabelText('Choose a property'), {
    target: { value: propertyFixture().id },
  });
  fireEvent.change(screen.getByLabelText('Roles'), { target: { value: 'PROPERTY_MANAGER' } });
  expect(screen.queryByRole('option', { name: 'Organization owner' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Assign role' }));
  await waitFor(() => {
    expect(assign).toHaveBeenCalledWith(
      user.id,
      'PROPERTY_MANAGER',
      'PROPERTY',
      propertyFixture().id,
    );
  });
});
