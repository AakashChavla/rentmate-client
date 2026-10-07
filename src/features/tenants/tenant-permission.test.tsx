import { screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import { renderApp } from '../../test/render';
import { TestSession } from '../../test/identity';
import { rentalServices, tenantFixture } from '../../test/lease-fixture';
import { unitIdentity } from '../../test/unit-fixture';
import { TenantDetail } from './components/TenantDetail';
it('hides tenant verification, invitations and uploads for read-only staff', async () => {
  const me = unitIdentity(['tenant:read']);
  renderApp(
    <TestSession me={me}>
      <TenantDetail id={tenantFixture().id} />
    </TestSession>,
    'en',
    rentalServices(),
  );
  expect(await screen.findByText('••••9012')).toBeInTheDocument();
  for (const name of ['Verify', 'Reject', 'Invite to portal', 'Upload document'])
    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
});
