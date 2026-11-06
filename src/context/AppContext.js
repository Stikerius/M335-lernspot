import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as storage from '../storage/storage';
import { SEED_SPOTS } from '../data/seedSpots';
import { sanitizeFilter } from '../utils/filterSpots';

// Globaler App-Zustand: Spots, Einstellungen und Listen-Filter (Chips).
// Jede Änderung wird sofort in AsyncStorage gespeichert (Persistenz).
const AppContext = createContext(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppProvider({ children }) {
  const [spots, setSpots] = useState([]);
  const [settings, setSettings] = useState(storage.DEFAULT_SETTINGS);
  // Aktive Chips der Spot-Liste, [] = «Alle». Der Suchtext wird bewusst nicht gespeichert.
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  // Beim App-Start laden; beim allerersten Start Beispiel-Spots einfügen
  useEffect(() => {
    (async () => {
      let loadedSpots = await storage.loadSpots();
      if (!(await storage.isSeeded())) {
        loadedSpots = [...SEED_SPOTS, ...loadedSpots];
        await storage.saveSpots(loadedSpots);
        await storage.markSeeded();
      }
      setSpots(loadedSpots);
      setSettings(await storage.loadSettings());
      setFilter(sanitizeFilter(await storage.loadFilter()));
      setLoading(false);
    })();
  }, []);

  const persistSpots = useCallback((next) => {
    setSpots(next);
    storage.saveSpots(next);
  }, []);

  const addSpot = useCallback(
    (data) => {
      const now = new Date().toISOString();
      const spot = { favorit: false, ...data, id: createId(), erstelltAm: now, geaendertAm: now };
      persistSpots([spot, ...spots]);
      return spot;
    },
    [spots, persistSpots]
  );

  const updateSpot = useCallback(
    (id, changes) => {
      persistSpots(
        spots.map((s) =>
          s.id === id ? { ...s, ...changes, geaendertAm: new Date().toISOString() } : s
        )
      );
    },
    [spots, persistSpots]
  );

  const deleteSpot = useCallback(
    (id) => persistSpots(spots.filter((s) => s.id !== id)),
    [spots, persistSpots]
  );

  const toggleFavorite = useCallback(
    (id) => {
      const spot = spots.find((s) => s.id === id);
      if (spot) updateSpot(id, { favorit: !spot.favorit });
    },
    [spots, updateSpot]
  );

  const updateSettings = useCallback(
    (changes) => {
      const next = { ...settings, ...changes };
      setSettings(next);
      storage.saveSettings(next);
    },
    [settings]
  );

  const updateFilter = useCallback((next) => {
    const clean = sanitizeFilter(next);
    setFilter(clean);
    storage.saveFilter(clean);
  }, []);

  const resetAll = useCallback(async () => {
    await storage.clearAll();
    setSpots([]);
    setSettings(storage.DEFAULT_SETTINGS);
    setFilter([]);
    await storage.markSeeded(); // nach «Alles löschen» keine Beispiel-Spots mehr
  }, []);

  const value = useMemo(
    () => ({
      spots,
      settings,
      filter,
      loading,
      getSpot: (id) => spots.find((s) => s.id === id),
      addSpot,
      updateSpot,
      deleteSpot,
      toggleFavorite,
      updateSettings,
      updateFilter,
      resetAll,
    }),
    [spots, settings, filter, loading, addSpot, updateSpot, deleteSpot, toggleFavorite, updateSettings, updateFilter, resetAll]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp muss innerhalb von <AppProvider> verwendet werden');
  return ctx;
}
