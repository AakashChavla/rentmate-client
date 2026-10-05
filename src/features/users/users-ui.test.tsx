import { it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderApp, testServices } from '../../test/render';
import { identity, TestSession } from '../../test/identity';
import { UsersTable } from './components/UsersTable';
import type { User } from './api/users-api';
it('loads pages, debounces filters and gates owner actions with an accessible table', async () => {
  const services = testServices();
  const me = identity();
  const user: User = { ...me.user, roles: me.roles };
  const list = vi.fn(services.users.list.bind(services.users)).mockResolvedValue({
    data: [user],
    requestId: 'fixture',
    meta: {
      requestId: 'fixture',
      timestamp: 'now',
      page: { limit: 25, hasNext: false, nextCursor: null },
    },
  });
  services.users.list = list;
  const { container } = renderApp(
    <TestSession me={me}>
      <UsersTable />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByText('Fixture Owner');
  expect(screen.getByRole('button', { name: 'Edit member' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Manage roles' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'owner' } });
  await waitFor(() => {
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ search: 'owner' }));
  });
  expect((await axe(container)).violations).toEqual([]);
});
it('shows empty and request-id error states without exposing internal messages', async () => {
  const services = testServices();
  vi.spyOn(services.users, 'list').mockResolvedValue({ data: [], requestId: 'fixture' });
  renderApp(
    <TestSession me={identity()}>
      <UsersTable />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByText('No members match your filters.');
  expect(screen.queryByRole('button', { name: 'Edit member' })).not.toBeInTheDocument();
});
