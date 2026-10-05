import { it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderApp, testServices } from '../../test/render';
import { TestSession, identity, fakeAuth } from '../../test/identity';
import { navigation } from '../../test/navigation';
import { RegistrationWizard } from './components/RegistrationWizard';
import { LoginForm } from './components/LoginForm';
import { OtpCodeInput } from './components/OtpCodeInput';
import { PermissionGate } from './components/PermissionGate';
import { AuthGuard } from './components/AuthGuard';
import { useCan } from './hooks/use-permission';
import { ApiError } from '../../lib/api/api-error';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { act } from '@testing-library/react';
function ScopeProbe(): React.JSX.Element {
  const allowed = useCan('user:read');
  return <span>{String(allowed)}</span>;
}
function CacheProbe({ onReady }: { onReady: (client: QueryClient) => void }): React.JSX.Element {
  const client = useQueryClient();
  useEffect(() => {
    client.setQueryData(['private-fixture'], { value: 'fixture' });
    onReady(client);
  }, [client, onReady]);
  return (
    <PermissionGate anyOf={['user:read']}>
      <p>Authenticated fixture</p>
    </PermissionGate>
  );
}
it('clears private queries and redirects once when the session expires', async () => {
  const services = testServices();
  const ready = vi.fn<(client: QueryClient) => void>();
  renderApp(
    <TestSession me={identity()}>
      <CacheProbe onReady={ready} />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByText('Authenticated fixture');
  act(() => {
    services.refresh.expire();
    services.refresh.expire();
  });
  await waitFor(() => {
    expect(screen.queryByText('Authenticated fixture')).not.toBeInTheDocument();
  });
  expect(ready.mock.calls[0]?.[0].getQueryData(['private-fixture'])).toBeUndefined();
  expect(navigation.replace).toHaveBeenCalledTimes(1);
  expect(navigation.replace).toHaveBeenCalledWith(expect.stringContaining('/login?next='));
});
it('gates permission content and blocks unauthenticated route groups', async () => {
  renderApp(
    <AuthGuard>
      <p>Private fixture</p>
    </AuthGuard>,
  );
  await waitFor(() => {
    expect(navigation.replace).toHaveBeenCalledWith('/login?next=%2Fdashboard');
  });
  expect(screen.queryByText('Private fixture')).not.toBeInTheDocument();
});
it('exposes scope-aware permission hooks and both any/all gates', async () => {
  renderApp(
    <TestSession me={identity()}>
      <ScopeProbe />
      <PermissionGate anyOf={['user:read']} allOf={['role:assign']}>
        <p>Allowed fixture</p>
      </PermissionGate>
      <PermissionGate anyOf={['platform:delete']}>
        <p>Denied fixture</p>
      </PermissionGate>
    </TestSession>,
  );
  await screen.findByText('Allowed fixture');
  expect(screen.getByText('true')).toBeInTheDocument();
  expect(screen.queryByText('Denied fixture')).not.toBeInTheDocument();
});
it('validates the registration steps, submits only the contract and opens verified onboarding', async () => {
  const services = testServices();
  services.auth = fakeAuth();
  const register = vi.spyOn(services.auth, 'register');
  const verify = vi.spyOn(services.auth, 'verify');
  renderApp(<RegistrationWizard />, 'en', services);
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Fixture Owner' } });
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'new@fixture.rentmate.test' },
  });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'FixturePassword123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByLabelText('Organization name');
  fireEvent.change(screen.getByLabelText('Organization name'), {
    target: { value: 'Fixture org' },
  });
  expect(screen.getByRole('button', { name: 'Create your account' })).toBeDisabled();
  for (const checkbox of screen.getAllByRole('checkbox')) fireEvent.click(checkbox);
  fireEvent.click(screen.getByRole('button', { name: 'Create your account' }));
  await screen.findByLabelText('Verification code');
  expect(register).toHaveBeenCalledWith(
    expect.objectContaining({ acceptTerms: true, termsVersion: '2026-10-05' }),
  );
  expect(register.mock.calls[0]?.[0]).not.toHaveProperty('acceptPrivacy');
  fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '123456' } });
  await screen.findByText('Your workspace is ready.');
  expect(verify).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Create your first property' })).toBeDisabled();
});
it('maps account suspension and lockouts without displaying raw server error text', async () => {
  const services = testServices();
  services.auth = fakeAuth();
  vi.spyOn(services.auth, 'login').mockRejectedValue(
    new ApiError('TOO_MANY_ATTEMPTS', 429, 'fixture-request', 'raw-server', [], 60),
  );
  renderApp(<LoginForm />, 'en', services);
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'owner@fixture.rentmate.test' },
  });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'FixturePassword123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  await screen.findByRole('alert');
  expect(screen.getByRole('alert')).toHaveTextContent('fixture-request');
  expect(screen.getByRole('alert')).not.toHaveTextContent('raw-server');
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
});
it('labels six-digit OTP entry and has no automated accessibility violations', async () => {
  const complete = vi.fn();
  const { container } = renderApp(
    <OtpCodeInput code="" onChange={() => undefined} onComplete={complete} />,
  );
  expect(screen.getByLabelText('Verification code')).toHaveAttribute(
    'autocomplete',
    'one-time-code',
  );
  expect((await axe(container)).violations).toEqual([]);
});
