'use client';
import { OccupancyWidget } from '../../units';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../../providers/ServicesProvider';
import { useAuthSubmission, AuthErrorNotice, useCan } from '../../auth';
import { TeamPage } from '../../team';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import {
  DETAIL_TAB as T,
  DOMAIN_QUERY,
  DOMAIN_PERMISSION as P,
  PROPERTY_STATUS,
  TYPE_KEYS,
  STATUS_KEYS,
  propertyRoute,
} from '../../../config/property.constants';
import type { Property, PropertyConfig } from '../api/properties-api';
import { ConfigFields } from './ConfigFields';
import { CONFIG_SCHEMAS } from '../schemas/property.schema';
export function PropertyDetail({ id }: { id: string }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const query = useQuery({
    queryKey: [...DOMAIN_QUERY.PROPERTIES, id],
    queryFn: () => services.properties.get(id),
    retry: false,
  });
  if (query.isPending) return <p role="status">{t('common.loading')}</p>;
  if (!query.data) return <p role="alert">{t('property.loadError')}</p>;
  return <DetailContent property={query.data} />;
}
function DetailContent({ property: p }: { property: Property }): React.JSX.Element {
  const t = useTranslations();
  const update = useCan(P.UPDATE, { propertyId: p.id });
  const invite = useCan(P.INVITE, { propertyId: p.id });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-sm text-secondary">{t(TYPE_KEYS[p.type])}</p>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <p className="mt-2 text-muted-foreground">{t(STATUS_KEYS[p.status])}</p>
        </div>
        {update ? (
          <Button asChild variant="outline">
            <Link href={propertyRoute(p.id, true)}>{t('property.edit')}</Link>
          </Button>
        ) : null}
      </div>
      <Tabs defaultValue={T.OVERVIEW}>
        <TabsList aria-label={t('property.tabs')}>
          <TabsTrigger value={T.OVERVIEW}>{t('property.overview')}</TabsTrigger>
          <TabsTrigger value={T.SETTINGS}>{t('common.settings')}</TabsTrigger>
          {invite ? <TabsTrigger value={T.TEAM}>{t('team.title')}</TabsTrigger> : null}
        </TabsList>
        <TabsContent
          value={T.OVERVIEW}
          className="mt-6 rounded-2xl border border-border bg-card p-6"
        >
          <PropertyOverview property={p} />
          <OccupancyWidget propertyId={p.id} />
        </TabsContent>
        <TabsContent value={T.SETTINGS} className="mt-6">
          <ConfigurationEditor property={p} />
          {update && p.status === PROPERTY_STATUS.ACTIVE ? <ArchiveProperty id={p.id} /> : null}
        </TabsContent>
        {invite ? (
          <TabsContent value={T.TEAM} className="mt-6">
            <TeamPage scopeId={p.id} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
function ConfigurationEditor({ property }: { property: Property }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const query = useQuery({
    queryKey: [...DOMAIN_QUERY.PROPERTIES, property.id, 'config'],
    queryFn: () => services.properties.config(property.id),
    retry: false,
  });
  if (query.isPending) return <p role="status">{t('common.loading')}</p>;
  if (!query.data) return <p role="alert">{t('property.loadError')}</p>;
  return <ConfigForm key={property.id} property={property} initial={query.data} />;
}
function ConfigForm({
  property,
  initial,
}: {
  property: Property;
  initial: PropertyConfig;
}): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const allowed = useCan(P.UPDATE, { propertyId: property.id });
  const submission = useAuthSubmission();
  const [value, set] = useState(initial);
  const [invalid, setInvalid] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <form
      noValidate
      className="max-w-xl space-y-4 rounded-2xl border border-border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = CONFIG_SCHEMAS[property.type].safeParse(value);
        setInvalid(!parsed.success);
        if (!allowed || !parsed.success) return;
        void submission.run(async () => {
          await services.properties.setConfig(property.id, value);
          setSaved(true);
          await client.invalidateQueries({
            queryKey: [...DOMAIN_QUERY.PROPERTIES, property.id, 'config'],
          });
        });
      }}
    >
      <h2 className="text-xl font-semibold">{t('property.configuration')}</h2>
      <fieldset disabled={!allowed || submission.busy}>
        <ConfigFields type={property.type} value={value} onChange={set} invalid={invalid} />
      </fieldset>
      {allowed ? <Button disabled={submission.busy}>{t('auth.save')}</Button> : null}
      <AuthErrorNotice {...submission} />
      {saved ? <p role="status">{t('auth.saved')}</p> : null}
    </form>
  );
}
function ArchiveProperty({ id }: { id: string }): React.JSX.Element {
  const t = useTranslations();
  const services = useServices();
  const client = useQueryClient();
  const submission = useAuthSubmission();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 space-y-3">
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true);
        }}
      >
        {t('property.archive')}
      </Button>
      <AuthErrorNotice {...submission} />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t('property.archive')}
        description={t('property.archiveHint')}
        pending={submission.busy}
        onConfirm={() => {
          void submission.run(async () => {
            await services.properties.update(id, { status: PROPERTY_STATUS.ARCHIVED });
            await client.invalidateQueries({ queryKey: DOMAIN_QUERY.PROPERTIES });
            await client.invalidateQueries({ queryKey: DOMAIN_QUERY.MINE });
            setOpen(false);
          });
        }}
      />
    </div>
  );
}

function PropertyOverview({ property: p }: { property: Property }): React.JSX.Element {
  const t = useTranslations();
  return (
    <>
      <h2 className="mb-3 font-semibold">{t('property.location')}</h2>
      <p>{p.addressLine1}</p>
      {p.addressLine2 ? <p>{p.addressLine2}</p> : null}
      <p>
        {p.city}, {p.state} {p.postalCode}
      </p>
      <p>{p.country}</p>
      <p className="mt-4 text-sm text-muted-foreground">
        {p.timezone ?? t('property.inheritTimezone')}
      </p>
    </>
  );
}
