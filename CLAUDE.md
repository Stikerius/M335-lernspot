# LernSpots – Projektkontext für Claude Code

Schulprojekt Modul 335 «Mobile-Applikation realisieren» (BZZ), 2er-Gruppe.
App zum Erfassen, Bewerten und Wiederfinden von Lernorten (Bibliothek, Café, Schule, Draussen).

**Vollständiges Konzept (Mockups, Workflow, EN-9241-110-Begründungen, Persistenz): `docs/`**
Vor jeder Arbeit an einem Screen das passende Mockup in `docs/` ansehen und genau umsetzen.

## Harte Regeln (Vorgaben des Moduls)

- **JavaScript, KEIN TypeScript.** Dateien `.js`.
- **KEIN Expo Router.** Navigation ausschliesslich mit **React Navigation** (`src/navigation/`).
  Einstieg bleibt `index.js` → `App.js` (`"main": "index.js"` in package.json nicht ändern).
- Muss in **Expo Go** auf dem Handy laufen – keine Pakete, die einen Development Build brauchen.
- Pakete immer mit `npx expo install <paket>` installieren (nicht `npm install`), damit die Version zum Expo SDK passt.
- Persistenz nur lokal mit **AsyncStorage**, alle Zugriffe über `src/storage/storage.js`. Kein Server, kein Login.
- Code und UI-Texte auf **Deutsch (Schweiz, kein ß)**, Kommentare kurz und erklären das *Warum*.

## Struktur

```
App.js                       Provider + NavigationContainer
src/navigation/RootNavigator Native Stack: MainTabs, SpotDetail (push), SpotForm (modal)
src/navigation/MainTabs      Bottom Tabs: Spots · Karte · Einstellungen
src/screens/                 S1 SpotsList · S2 SpotForm · S3 Map · S4 SpotDetail · S5 Settings
src/context/AppContext.js    globaler State (spots, settings) + CRUD, speichert sofort
src/storage/storage.js       AsyncStorage-Keys und Lese-/Schreibfunktionen
src/components/              wiederverwendbare UI (PrimaryButton, SpotListItem)
src/data/                    Kategorien, Beispiel-Spots (Seed beim ersten Start)
src/utils/distance.js        Haversine-Distanz + Formatierung
src/theme.js                 Farben, Abstände, Touch-Grössen, Schriftgrössen
docs/                        Konzept-PDF und Mockups
```

## Datenmodell Spot

```js
{ id, name, kategorie: 'bibliothek'|'cafe'|'schule'|'draussen'|'andere',
  ruhe: 1-5, gesamt: 1-5, wlan: bool, steckdosen: bool,
  oeffnungszeiten: string, notiz: string, favorit: bool,
  lat: number|null, lng: number|null, erstelltAm: ISO, geaendertAm: ISO }
```
Distanz wird nie gespeichert, sondern aus dem aktuellen Standort berechnet.

## Design- und Ergonomie-Regeln (werden bewertet!)

- Farben, Abstände, Grössen **nur aus `src/theme.js`** – keine Hex-Werte in Screens.
- Jedes antippbare Element **min. 48 × 48 dp** (`touch.min`), kleine Elemente mit `hitSlop`; Abstand ≥ 8 dp.
  FAB 56 dp, Listenzeilen 72 dp, Einstellungszeilen 56 dp (ganze Zeile antippbar).
- Hauptaktionen unten im Daumenbereich (FAB, Speichern, Route starten).
- Schrift: Body 16, Minimum 12.
- Jede Aktion gibt Feedback (Pressed-State, Toast/Meldung, Spinner beim Laden).
- Destruktive Aktionen rot + Bestätigungsdialog (`Alert.alert`).
- Icons immer mit Text-Label. Infos nie nur über Farbe.
- Jeder Screen braucht seine **Sonderzustände**: leer, ladend, Fehler, keine Standort-Berechtigung, kein Netz.
- Formular-Validierung in Echtzeit, Fehlermeldung direkt am Feld, Speichern deaktiviert solange ungültig.
- `accessibilityLabel` / `accessibilityRole` bei allen Buttons.

## Special Feature

GPS + Karte: `expo-location` (Standort, Berechtigung) und `react-native-maps` (bereits installiert).
Route starten über `Linking.openURL` (Google Maps / Apple Maps).

## Mindestanforderungen (LB3)

4–5 Screens mit Navigation · Eingabeformular mit Validierung · Persistenz · 1 Geräte-Feature ·
Error States · konsistentes Styling · läuft auf eigenem Gerät · Testkonzept.

## Status Grundgerüst

Fertig: Navigation (Tabs/Stack/Modal), AppContext + AsyncStorage, Seed-Daten, Liste → Detail,
Formular (nur Name), Bearbeiten, Löschen mit Bestätigung, Favorit, Einstellungen (Schalter + Alles löschen).
Offen: alle `TODO (Mockup Sx)`-Kommentare in `src/screens/`.

## Befehle

```bash
npm install
npx expo start            # QR-Code mit Expo Go scannen
npx expo start --tunnel   # falls Schul-WLAN Geräte trennt
npx expo start --clear    # Cache leeren bei komischen Fehlern
```

## Arbeitsweise

- Pro Feature eigener Branch (`feature/karte`, `feature/formular`), Merge per Pull Request.
- Kleine Commits mit klarer Nachricht.
- Nach jeder Änderung prüfen, dass `npx expo start` ohne Fehler bündelt.
