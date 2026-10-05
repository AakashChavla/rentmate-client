import { it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderApp } from '../../test/render';
import { domainIdentity, domainServices, propertyFixture } from '../../test/domain-fixture';
import { TestSession } from '../../test/identity';
import { navigation } from '../../test/navigation';
import { ApiError } from '../../lib/api/api-error';
import { TeamPage, AcceptInvite } from './index';
it('sends a scoped invitation, hides SUPER_ADMIN, and has an accessible dialog', async () => {
  const services = domainServices();
  const create = vi.spyOn(services.invitations, 'create');
  const { container } = renderApp(
    <TestSession me={domainIdentity()}>
      <TeamPage />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByRole('button', { name: 'Invite a teammate' });
  fireEvent.click(screen.getByRole('button', { name: 'Invite a teammate' }));
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'invited@fixture.rentmate.test' },
  });
  fireEvent.change(screen.getByLabelText('Access scope'), { target: { value: 'PROPERTY' } });
  await screen.findByRole('option', { name: 'Garden House' });
  fireEvent.change(screen.getByLabelText('Choose a property'), {
    target: { value: propertyFixture().id },
  });
  fireEvent.change(screen.getByLabelText('Roles'), { target: { value: 'PROPERTY_MANAGER' } });
  expect(screen.queryByRole('option', { name: 'Super admin' })).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Organization owner' })).not.toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
  fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));
  await waitFor(() => {
    expect(create).toHaveBeenCalledWith({
      email: 'invited@fixture.rentmate.test',
      roleKey: 'PROPERTY_MANAGER',
      scopeType: 'PROPERTY',
      scopeId: propertyFixture().id,
    });
  });
});
it.each(['INVITE_EXPIRED', 'INVITE_USED', 'INVITE_INVALID'])(
  'localizes accept-invite error %s without leaking server text',
  async (code) => {
    navigation.search = 'token=' + 'a'.repeat(64);
    const services = domainServices();
    vi.spyOn(services.invitations, 'accept').mockRejectedValue(
      new ApiError(code, 400, 'fixture-request', 'raw-internal'),
    );
    renderApp(<AcceptInvite />, 'en', services);
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Invited member' } });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'FixturePassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Accept invitation' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('fixture-request');
    });
    expect(screen.getByRole('alert')).not.toHaveTextContent('raw-internal');
  },
);
it('rejects a missing URL token before submitting and renders Hindi', () => {
  navigation.search = '';
  const services = domainServices();
  const accept = vi.spyOn(services.invitations, 'accept');
  renderApp(<AcceptInvite />, 'hi', services);
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(accept).not.toHaveBeenCalled();
});
it('accepts the token once and directs a tenant to sign in for their role', async () => {
  navigation.search = 'token=' + 'a'.repeat(64);
  const services = domainServices();
  const accept = vi
    .spyOn(services.invitations, 'accept')
    .mockResolvedValue({ accepted: true, roleKey: 'TENANT', locale: 'hi' });
  const { container } = renderApp(<AcceptInvite />, 'en', services);
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Invited member' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'FixturePassword123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Accept invitation' }));
  await screen.findByText('You’re on the team');
  expect(accept).toHaveBeenCalledTimes(1);
  expect((await axe(container)).violations).toEqual([]);
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(navigation.replace).toHaveBeenCalledWith('/login?next=%2Ftenant%2Fdashboard');
});
it('resends and revokes pending invitations from the table', async () => {
  const services = domainServices();
  const item = await services.invitations.create({
    email: 'invite@fixture.rentmate.test',
    roleKey: 'PROPERTY_MANAGER',
    scopeType: 'ORGANIZATION',
  });
  vi.spyOn(services.invitations, 'list').mockResolvedValue({ data: [item], requestId: 'fixture' });
  const resend = vi.spyOn(services.invitations, 'resend');
  const revoke = vi.spyOn(services.invitations, 'revoke');
  renderApp(
    <TestSession me={domainIdentity()}>
      <TeamPage />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByText('Pending');
  fireEvent.click(screen.getByRole('button', { name: 'Resend' }));
  await waitFor(() => {
    expect(resend).toHaveBeenCalledWith(item.id);
  });
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Revoke' })).toBeEnabled();
  });
  fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
  await waitFor(() => {
    expect(revoke).toHaveBeenCalledWith(item.id);
  });
});
