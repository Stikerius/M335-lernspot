import { distanceToSpot } from './distance';

// Filterlogik für die Spot-Liste (S1), getrennt vom Screen, damit sie ohne Gerät prüfbar ist.
// Chip-Zustand = Array der aktiven Schlüssel, leeres Array bedeutet «Alle».

// Ab 4 Sternen gilt ein Spot als ruhig (Konzept: «nur ruhig ≥ 4»)
export const RUHIG_AB = 4;

export const FILTER_CHIPS = [
  { key: 'steckdose', label: 'Steckdose', test: (s) => s.steckdosen === true },
  { key: 'ruhig', label: 'Ruhig', test: (s) => (s.ruhe ?? 0) >= RUHIG_AB },
  { key: 'favoriten', label: 'Favoriten', test: (s) => s.favorit === true },
];

const VALID_KEYS = FILTER_CHIPS.map((c) => c.key);

// Gespeicherten Wert absichern: alte oder kaputte Einträge sollen die Liste nicht leeren
export function sanitizeFilter(value) {
  if (!Array.isArray(value)) return [];
  return VALID_KEYS.filter((key) => value.includes(key));
}

// Chip an- oder abwählen; Reihenfolge bleibt fix, damit der gespeicherte Wert stabil ist
export function toggleFilter(filter, key) {
  const next = filter.includes(key) ? filter.filter((k) => k !== key) : [...filter, key];
  return sanitizeFilter(next);
}

function normalize(text) {
  return (text ?? '').toString().trim().toLowerCase();
}

// Suche und Chips wirken zusammen (UND-Verknüpfung). Die Reihenfolge der Spots bleibt erhalten.
export function filterSpots(spots, { query = '', filter = [] } = {}) {
  const q = normalize(query);
  const tests = FILTER_CHIPS.filter((c) => filter.includes(c.key)).map((c) => c.test);
  return spots.filter(
    (spot) => (q === '' || normalize(spot.name).includes(q)) && tests.every((test) => test(spot))
  );
}

// Suchradius für die Karte (S3), Wert in Metern; null = «Alle»
export const RADIUS_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: null, label: 'Alle' },
];

export function radiusLabel(radius) {
  return RADIUS_OPTIONS.find((o) => o.value === radius)?.label ?? 'Alle';
}

// Nur Spots im Umkreis behalten. Ohne Radius oder ohne Standort bleibt die Liste unverändert,
// Spots ohne Koordinaten fallen bei aktivem Radius raus (Distanz unbekannt).
export function filterByRadius(spots, coords, radius) {
  if (radius == null || !coords) return spots;
  return spots.filter((spot) => {
    const d = distanceToSpot(coords, spot);
    return d != null && d <= radius;
  });
}
