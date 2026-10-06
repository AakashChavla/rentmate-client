'use client';
import { useTranslations } from 'next-intl';
import { m, useReducedMotion } from 'motion/react';
import { CheckCircle, DoorOpen, Calendar, Wrench, Ban } from 'lucide-react';
import { STATUS_KEYS, STATUS_STYLE } from '../../../config/unit.constants';
import { MOTION } from '../../../config/motion';
import type { Unit } from '../api/units-api';
const icons = {
  VACANT: DoorOpen,
  OCCUPIED: CheckCircle,
  RESERVED: Calendar,
  MAINTENANCE: Wrench,
  BLOCKED: Ban,
};
export function UnitsGrid({
  units,
  open,
}: {
  units: Unit[];
  open: (unit: Unit) => void;
}): React.JSX.Element {
  const t = useTranslations();
  const groups = new Map<string, { name: string; rows: Unit[] }>();
  for (const unit of units) {
    const key = unit.floorId ?? unit.propertyId;
    const name =
      [unit.wing, unit.floorName, unit.floorLevel?.toString()].filter(Boolean).join(' · ') ||
      t('unit.noFloor');
    const group = groups.get(key) ?? { name, rows: [] };
    group.rows.push(unit);
    groups.set(key, group);
  }
  return (
    <div className="space-y-6">
      {[...groups].map(([key, { name, rows }]) => (
        <section key={key} aria-label={name}>
          <h2 className="mb-3 text-lg font-semibold">{name}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {rows.map((unit, i) => (
              <UnitTile key={unit.id} unit={unit} index={i} open={open} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
function UnitTile({
  unit,
  index,
  open,
}: {
  unit: Unit;
  index: number;
  open: (unit: Unit) => void;
}): React.JSX.Element {
  const t = useTranslations();
  const Icon = icons[unit.status];
  const reduced = useReducedMotion();
  return (
    <m.button
      type="button"
      aria-label={unit.code + ' ' + t(STATUS_KEYS[unit.status])}
      onClick={() => {
        open(unit);
      }}
      className={
        'rounded-2xl border p-4 text-start focus-visible:outline ' + STATUS_STYLE[unit.status]
      }
      initial={reduced ? false : { opacity: 0, y: MOTION.OFFSET }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * MOTION.STAGGER }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon aria-hidden className="mb-2 h-5 w-5" />
      <strong className="block">{unit.code}</strong>
      <span className="text-sm">{t(STATUS_KEYS[unit.status])}</span>
    </m.button>
  );
}
