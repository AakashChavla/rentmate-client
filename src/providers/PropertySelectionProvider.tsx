'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useServices } from './ServicesProvider';
import { PROPERTY_PREFERENCE } from '../config/property.constants';
interface Selection {
  propertyId: string;
  select: (id: string) => void;
}
const Context = createContext<Selection>({ propertyId: '', select: () => undefined });
export function PropertySelectionProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const { preferences } = useServices();
  const [propertyId, set] = useState('');
  useEffect(() => {
    const saved = preferences.get(PROPERTY_PREFERENCE.KEY);
    if (saved && PROPERTY_PREFERENCE.PATTERN.test(saved)) set(saved);
  }, [preferences]);
  const select = (id: string): void => {
    if (id && !PROPERTY_PREFERENCE.PATTERN.test(id)) return;
    preferences.set(PROPERTY_PREFERENCE.KEY, id);
    set(id);
  };
  return <Context.Provider value={{ propertyId, select }}>{children}</Context.Provider>;
}
export function usePropertySelection(): Selection {
  return useContext(Context);
}
