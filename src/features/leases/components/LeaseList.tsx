'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePermissionChecker } from '../../auth';
import { useAccessibleProperties } from '../../properties';
import { usePropertySelection } from '../../../providers/PropertySelectionProvider';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { RENTAL_PERMISSION as P } from '../../../config/lease.constants';
import { LeaseWizard } from './LeaseWizard';
import { LeaseHistory } from './LeaseHistory';
export function LeaseList(): React.JSX.Element {
  const t = useTranslations(),
    can = usePermissionChecker(),
    selection = usePropertySelection(),
    properties = useAccessibleProperties();
  const [creating, setCreating] = useState(false);
  const available = properties.data?.pages.flatMap((p) => p.data) ?? [],
    property = selection.propertyId || available[0]?.id;
  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('rental.leases')}</h1>
        {property && can(P.LEASE_CREATE, { propertyId: property }) ? (
          <Button
            onClick={() => {
              setCreating(true);
            }}
          >
            {t('rental.createLease')}
          </Button>
        ) : null}
      </header>
      {property ? <LeaseHistory property={property} /> : <p>{t('rental.selectProperty')}</p>}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <div className="mb-4">
            <DialogTitle>{t('rental.createLease')}</DialogTitle>
          </div>
          {property ? (
            <LeaseWizard
              property={property}
              done={() => {
                setCreating(false);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
export function MyLease(): React.JSX.Element {
  const t = useTranslations();
  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-bold">{t('rental.myLease')}</h1>
      <p>{t('rental.readOnly')}</p>
      <LeaseHistory readOnly />
    </main>
  );
}
