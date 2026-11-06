// Zentrale Design-Werte – NIE Farben/Grössen direkt in Screens hardcoden,
// immer von hier importieren (Konsistenz = Erwartungskonformität).

export const colors = {
  primary: '#2F5BB7',      // Akzent-Blau: aktive / primäre Elemente
  primaryLight: '#E8EEFA',
  star: '#F2A900',         // nur für Sterne-Bewertungen
  danger: '#C62828',       // nur für destruktive Aktionen und Fehler
  success: '#1B7F3B',      // nur für Bestätigungen, immer zusammen mit Text und «✓»
  text: '#1D2329',
  textMuted: '#5B6670',
  border: '#C9D1D7',
  background: '#F4F6F8',
  surface: '#FFFFFF',
  disabled: '#B7C3DC',
};

export const spacing = {
  xs: 4,
  s: 8,    // Mindestabstand zwischen Touch-Targets
  m: 16,
  l: 24,
  xl: 32,
};

// Touch-Mindestgrössen (Material Design 48 dp / Apple HIG 44 pt)
export const touch = {
  min: 48,
  fab: 56,
  listItem: 72,
  settingsRow: 56,
  tabBar: 56,
};

export const fontSizes = {
  small: 12,   // Minimum
  body: 16,
  title: 20,
  large: 24,
};

export const radius = {
  s: 6,
  m: 8,
  l: 12,
  pill: 999,
};
