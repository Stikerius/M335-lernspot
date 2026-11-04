// Kategorien eines Spots – gleiche Icons überall (Liste, Karte, Formular, Detail)
export const CATEGORIES = [
  { key: 'bibliothek', label: 'Bibliothek', icon: '📚' },
  { key: 'cafe', label: 'Café', icon: '☕' },
  { key: 'schule', label: 'Schule', icon: '🏫' },
  { key: 'draussen', label: 'Draussen', icon: '🌳' },
  { key: 'andere', label: 'Andere', icon: '📍' },
];

export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}
