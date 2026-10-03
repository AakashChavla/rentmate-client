import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderApp, testServices } from '../../test/render';
import { AdminShell } from './AdminShell';
import { TenantShell } from './TenantShell';
describe('application shells', () => {
  it('renders permitted admin items and collapses the sidebar', () => {
    const services = testServices();
    services.health = {
      ready: () => Promise.resolve({ status: 'ok', postgres: true, redis: true }),
    };
    renderApp(
      <AdminShell permissions={new Set(['dashboard:read'])}>
        <h1>Fixture content</h1>
      </AdminShell>,
      'en',
      services,
    );
    expect(screen.queryByRole('link', { name: 'Properties' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });
  it('renders the mobile tenant shell and passes a11y smoke', async () => {
    const { container } = renderApp(
      <TenantShell>
        <h1>Fixture content</h1>
      </TenantShell>,
    );
    expect(screen.getByRole('navigation', { name: 'My home' })).toBeInTheDocument();
    expect(
      (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([]);
  });
});
