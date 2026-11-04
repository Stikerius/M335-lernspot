import AsyncStorage from '@react-native-async-storage/async-storage';

// Alle AsyncStorage-Zugriffe laufen über diese Datei.
// Screens greifen NIE direkt auf AsyncStorage zu, sondern über den AppContext.

export const KEYS = {
  spots: '@lernspots/spots',
  settings: '@lernspots/settings',
  filter: '@lernspots/filter',
  draft: '@lernspots/draft',
  seeded: '@lernspots/seeded',
};

export const DEFAULT_SETTINGS = {
  sortierung: 'distanz',          // 'distanz' | 'bewertung'
  geschlosseneAusblenden: false,
  autoStandort: true,
  darkMode: false,
  grosseSchrift: false,
};

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Lesen von ${key} fehlgeschlagen`, e);
    return fallback;
  }
}

async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`Speichern von ${key} fehlgeschlagen`, e);
    return false;
  }
}

export const loadSpots = () => readJson(KEYS.spots, []);
export const saveSpots = (spots) => writeJson(KEYS.spots, spots);

export const loadSettings = async () => ({
  ...DEFAULT_SETTINGS,
  ...(await readJson(KEYS.settings, {})),
});
export const saveSettings = (settings) => writeJson(KEYS.settings, settings);

export const loadFilter = () => readJson(KEYS.filter, []);
export const saveFilter = (filter) => writeJson(KEYS.filter, filter);

export const loadDraft = () => readJson(KEYS.draft, null);
export const saveDraft = (draft) => writeJson(KEYS.draft, draft);
export const clearDraft = () => AsyncStorage.removeItem(KEYS.draft);

export const isSeeded = () => readJson(KEYS.seeded, false);
export const markSeeded = () => writeJson(KEYS.seeded, true);

// «Alle Daten löschen» in den Einstellungen
export async function clearAll() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
