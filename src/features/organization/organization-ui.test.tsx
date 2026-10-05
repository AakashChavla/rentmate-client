import { it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderApp } from '../../test/render';
import { domainIdentity, domainServices } from '../../test/domain-fixture';
import { TestSession } from '../../test/identity';
import { OrganizationSettings, OnboardingDashboard } from './index';
it('validates organization settings and submits name, timezone and default language', async () => {
  const services = domainServices();
  const update = vi.spyOn(services.organization, 'update');
  const { container } = renderApp(
    <TestSession me={domainIdentity()}>
      <OrganizationSettings />
    </TestSession>,
    'en',
    services,
  );
  await screen.findByLabelText('Organization timezone');
  fireEvent.change(screen.getByLabelText('Organization timezone'), {
    target: { value: 'Not/AZone' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(update).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Organization timezone'), {
    target: { value: 'Asia/Kolkata' },
  });
  fireEvent.change(screen.getByLabelText('Organization name'), {
    target: { value: 'Updated org' },
  });
  fireEvent.change(screen.getByLabelText('Default language'), { target: { value: 'hi' } });
  expect((await axe(container)).violations).toEqual([]);
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => {
    expect(update).toHaveBeenCalledWith({
      name: 'Updated org',
      timezone: 'Asia/Kolkata',
      defaultLocale: 'hi',
    });
  });
});
it('shows real onboarding progress with a permission-gated first-property link', async () => {
  const { container } = renderApp(
    <TestSession me={domainIdentity()}>
      <OnboardingDashboard />
    </TestSession>,
    'en',
    domainServices(),
  );
  await screen.findByText('1 of 2 steps complete');
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute(
    'href',
    '/properties/new',
  );
  expect((await axe(container)).violations).toEqual([]);
});
it('hides organization update actions for a read-only grant', async () => {
  const me = domainIdentity();
  for (const role of me.roles) role.permissions = ['organization:read'];
  me.permissions = ['organization:read'];
  renderApp(
    <TestSession me={me}>
      <OrganizationSettings />
    </TestSession>,
    'en',
    domainServices(),
  );
  await screen.findByLabelText('Organization name');
  expect(screen.getByLabelText('Organization name')).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
});
