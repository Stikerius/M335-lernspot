import { distanceToSpot } from './distance';

// Sortierung der Spot-Liste (S1), getrennt vom Screen, damit sie ohne Gerät prüfbar ist.

export const SORT_OPTIONS = [
  { value: 'naechste', label: 'Nächste' },
  { value: 'ruhe', label: 'Beste Ruhe' },
  { value: 'neueste', label: 'Neueste' },
];

// Deutsche Sortierung, Gross-/Kleinschreibung und Umlaute zählen nicht als Unterschied
function byName(a, b) {
  return (a.name ?? '').localeCompare(b.name ?? '', 'de-CH', { sensitivity: 'base' });
}

function time(iso) {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

// Gibt eine neue, sortierte Liste zurück (Original bleibt unverändert).
// Ohne Standort immer alphabetisch, damit die Reihenfolge vorhersehbar bleibt (Konzept S1).
export function sortSpots(spots, coords, sortierung) {
  const list = [...spots];
  if (!coords) return list.sort(byName);

  switch (sortierung) {
    case 'ruhe':
      return list.sort((a, b) => (b.ruhe ?? 0) - (a.ruhe ?? 0) || byName(a, b));
    case 'neueste':
      return list.sort((a, b) => time(b.erstelltAm) - time(a.erstelltAm) || byName(a, b));
    case 'naechste':
    default: {
      // Distanz einmal pro Spot berechnen; Spots ohne Koordinaten ans Ende
      const dist = new Map(list.map((s) => [s.id, distanceToSpot(coords, s)]));
      return list.sort((a, b) => {
        const da = dist.get(a.id);
        const db = dist.get(b.id);
        if (da == null && db == null) return byName(a, b);
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
      });
    }
  }
}
