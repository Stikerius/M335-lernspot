# Technische Dokumentation

## Überblick

LernSpots ist eine App zum Erfassen, Bewerten und Wiederfinden von Lernorten wie Bibliothek, Café, Schule oder Draussen. Sie entsteht als Schulprojekt im Modul 335 "Mobile-Applikation realisieren" am BZZ in einer 2er Gruppe.

Die App ist mit Expo und React Native in JavaScript geschrieben und läuft in Expo Go auf iPhone und Android. Alle Daten bleiben lokal auf dem Gerät in AsyncStorage. Es gibt keinen Server und kein Login.

Die App hat fünf Screens. Drei davon liegen in einer Tab Leiste unten, nämlich "Spots", "Karte" und "Einstellungen". Dazu kommen die Detailansicht eines Spots und das Formular zum Erfassen und Bearbeiten. Das Geräte-Feature ist GPS mit Karte über "expo-location" und "react-native-maps".

Die Einstiegsdatei ist "index.js". Sie registriert "App.js" mit "registerRootComponent". "App.js" legt drei Ebenen übereinander. "SafeAreaProvider" berücksichtigt Notch und Home Indicator, "AppProvider" lädt Spots und Einstellungen und stellt sie allen Screens bereit, und "ThemedNavigation" enthält den "NavigationContainer" mit den Farben des gewählten Designs und die Statusleiste.

## Technologien

| Technologie | Version laut "package.json" | Einsatz |
|---|---|---|
| Expo | ~58.0.23 | Entwicklungsumgebung, Start in Expo Go |
| React | 19.3.0 | UI Bibliothek |
| React Native | 0.88.1 | Native Bausteine für iOS und Android |
| @react-navigation/native | ^7.5.1 | Grundlage der Navigation, "NavigationContainer" |
| @react-navigation/native-stack | ^7.21.0 | Stack für Detail und Modal für das Formular |
| @react-navigation/bottom-tabs | ^7.21.0 | Tab Leiste unten |
| @react-navigation/elements | ^2.9.45 | "useHeaderHeight" im Formular |
| react-native-screens | ~4.30.1 | Native Screens für React Navigation |
| react-native-safe-area-context | ~5.11.1 | Abstände für Notch und Home Indicator |
| @react-native-async-storage/async-storage | 2.2.0 | Lokale Speicherung aller Daten |
| expo-location | ~58.0.20 | Standort und Berechtigung |
| react-native-maps | 1.29.11 | Kartenansicht und Mini Karte |
| expo-status-bar | ~58.0.4 | Statusleiste passend zum Design |

In "app.json" ist das Plugin "expo-location" mit dem Text für die Standortberechtigung eingetragen. Die App ist auf Hochformat festgelegt und auf dem iPad nicht als Tablet App vorgesehen.

## Projektstruktur

- "App.js" verbindet Provider, Design und Navigation
- "index.js" registriert "App.js" als Startkomponente
- "app.json" enthält Name, Icons, Ausrichtung und das Plugin "expo-location"
- "package.json" enthält die Pakete und die Startskripte
- "docs" enthält Konzept, Testkonzept und diese Dokumentation
- "src"
  - "components" enthält wiederverwendbare Bausteine der Oberfläche
    - "FilterChips.js" ist die Chip Leiste "Alle", "Steckdose", "Ruhig" und "Favoriten" der Liste
    - "PrimaryButton.js" ist der Standard Button mit mindestens 48 dp Höhe in den Varianten "primary", "secondary" und "danger"
    - "SpotInfoCard.js" ist die Infokarte auf der Karte nach dem Tipp auf einen Pin
    - "SpotListItem.js" ist eine Zeile der Spot Liste mit 72 dp Höhe
    - "StandortAbschnitt.js" ist der Abschnitt "Standort" im Formular mit Ermitteln, Neu und den Sonderzuständen
    - "StarRating.js" ist die Sterne Auswahl von 1 bis 5 für Ruhe und Gesamt
    - "Toast.js" zeigt eine kurze Bestätigung oben mittig an
  - "context"
    - "AppContext.js" hält Spots, Einstellungen und Filter und bietet die Funktionen zum Anlegen, Ändern und Löschen
  - "data"
    - "categories.js" enthält die fünf Kategorien mit Text und Symbol
    - "seedSpots.js" enthält die Beispiel Spots für den ersten Start
  - "hooks"
    - "useLocation.js" fragt Berechtigung und Position ab und liefert die Zustände
    - "useTheme.js" liefert Farben und Schriftgrössen passend zu "Dunkles Design" und "Grosse Schrift"
  - "navigation"
    - "MainTabs.js" ist die Tab Leiste mit Spots, Karte und Einstellungen
    - "RootNavigator.js" ist der Stack mit Tabs, Detail und Formular
  - "screens"
    - "SpotsListScreen.js" ist der Startscreen S1 mit Suche, Filter und Liste
    - "SpotFormScreen.js" ist das Formular S2 zum Erfassen und Bearbeiten
    - "MapScreen.js" ist die Karte S3 mit Pins, eigenem Standort und Suchradius
    - "SpotDetailScreen.js" ist die Detailansicht S4 mit Mini Karte, Favorit und Route
    - "SettingsScreen.js" ist der Screen S5 für die Einstellungen und das Löschen aller Daten
  - "storage"
    - "storage.js" enthält alle Schlüssel und Lese und Schreibfunktionen für AsyncStorage
  - "utils"
    - "distance.js" berechnet die Distanz nach Haversine und formatiert sie
    - "filterSpots.js" enthält Suche, Filter Chips und den Suchradius
    - "network.js" prüft, ob das Gerät online ist
    - "sortSpots.js" sortiert die Liste nach Nähe, Ruhe oder Datum
  - "theme.js" enthält Farben für Hell und Dunkel, Abstände, Touch Grössen und Schriftgrössen

## Navigation

Die Navigation ist ausschliesslich mit React Navigation gebaut. Expo Router wird nicht verwendet.

Der äussere Navigator ist ein Native Stack in "RootNavigator.js" mit drei Screens.

| Screen im Stack | Komponente | Übergang | Titel |
|---|---|---|---|
| "MainTabs" | "MainTabs.js" | Basis, ohne eigenen Header | keiner |
| "SpotDetail" | "SpotDetailScreen.js" | Stack, wird hineingeschoben | Name des Spots, Zurück heisst "Spots" |
| "SpotForm" | "SpotFormScreen.js" | Modal | "Neuer Spot" oder "Spot bearbeiten" |

Darin liegt der Bottom Tab Navigator in "MainTabs.js" mit drei Tabs.

| Tab | Komponente | Titel | Beschriftung |
|---|---|---|---|
| "Spots" | "SpotsListScreen.js" | "LernSpots" | "Spots" |
| "Map" | "MapScreen.js" | "Karte" | "Karte" |
| "Settings" | "SettingsScreen.js" | "Einstellungen" | "Einstellungen" |

Die Tab Leiste ist mindestens 56 dp hoch. Jeder Tab hat ein Symbol und eine Beschriftung.

Die Wechsel zwischen den Screens laufen so.

- Ein Tipp auf eine Zeile der Liste ruft "navigate" mit "SpotDetail" und der "spotId" auf und schiebt die Detailansicht auf den Stack.
- Der Button "Spot" unten rechts in der Liste öffnet "SpotForm" als Modal zum Erfassen.
- "Bearbeiten" in der Detailansicht öffnet "SpotForm" als Modal mit der "spotId". Das Formular ist dann vorausgefüllt.
- Ein Tipp auf die Mini Karte in der Detailansicht ruft "navigate" mit "MainTabs", dem Screen "Map" und dem Parameter "focusSpotId" auf. Die Karte zentriert auf diesen Spot, öffnet die Infokarte und setzt den Parameter danach mit "setParams" zurück, damit ein späterer Tabwechsel nicht wieder auf denselben Spot springt.
- Auf der Karte führt der Tipp auf einen Pin zur Infokarte. Der Button "Details" darin schiebt "SpotDetail" auf den Stack.
- Die Hinweise auf der Karte führen mit "Liste anzeigen" zum Tab "Spots" und mit "Radius ändern" zum Tab "Einstellungen".
- Zurück aus der Detailansicht geht es über den Header, die Zurück Taste von Android oder die Wischgeste von iOS.
- Das Formular schliesst sich mit "Abbrechen" oben links oder nach dem Speichern. Nach dem Speichern erscheint 1200 ms lang "Spot gespeichert" und danach schliesst sich das Modal. Hat man etwas eingegeben, fängt ein Listener auf "beforeRemove" Abbrechen, Zurück und Wischen ab und fragt "Änderungen verwerfen?".
- Nach "Löschen" in der Detailansicht und der Bestätigung geht die App mit "goBack" zurück und löscht den Spot.

Die Farben der Navigation kommen aus "useTheme". "App.js" baut daraus ein Theme für den "NavigationContainer", damit Header und Tab Leiste beim Umschalten auf "Dunkles Design" sofort mitwechseln.

## Datenmodell

### Spot

Ein Spot ist ein JavaScript Objekt. Alle Spots liegen als Array im AppContext und in AsyncStorage.

| Feld | Typ | Bedeutung |
|---|---|---|
| id | String | Eindeutige ID aus Zeitstempel und Zufallsteil, Beispiel Spots haben "seed-1" bis "seed-4" |
| name | String | Name, Pflichtfeld mit 2 bis 60 Zeichen nach dem Entfernen von Leerzeichen am Rand |
| kategorie | String | "bibliothek", "cafe", "schule", "draussen" oder "andere" |
| ruhe | Zahl | Bewertung der Ruhe von 1 bis 5, Standard 3 |
| gesamt | Zahl | Gesamtbewertung von 1 bis 5, Standard 3 |
| wlan | Boolean | WLAN vorhanden |
| steckdosen | Boolean | Steckdosen vorhanden |
| oeffnungszeiten | String | Freier Text, darf leer sein |
| notiz | String | Freier Text, darf leer sein |
| favorit | Boolean | Als Favorit markiert, neue Spots starten mit false |
| lat | Zahl oder null | Breitengrad, null ohne Standort |
| lng | Zahl oder null | Längengrad, null ohne Standort |
| erstelltAm | String | Zeitpunkt der Erfassung als ISO Datum |
| geaendertAm | String | Zeitpunkt der letzten Änderung als ISO Datum |

"id", "erstelltAm" und "geaendertAm" setzt der AppContext beim Anlegen. Bei jeder Änderung setzt er "geaendertAm" neu.

### Einstellungen

| Feld | Werte | Standard |
|---|---|---|
| sortierung | "naechste", "ruhe" oder "neueste" | "naechste" |
| suchradius | 1000, 5000, 10000 Meter oder null für "Alle" | null |
| autoStandort | true oder false | true |
| darkMode | true oder false | false |
| grosseSchrift | true oder false | false |

Beim Laden prüft "storage.js" die Werte. Ein unbekannter Suchradius wird zu null, eine unbekannte Sortierung zum Standard. Die alten Werte "distanz" und "bewertung" werden zu "naechste" und "ruhe" umgewandelt.

### Filter

Der Filter der Liste ist ein Array mit den Schlüsseln der aktiven Chips, also "steckdose", "ruhig" oder "favoriten". Ein leeres Array bedeutet "Alle". Als ruhig gilt ein Spot ab 4 Sternen bei der Ruhe. Mehrere Chips und der Suchtext wirken zusammen, ein Spot muss also alle Bedingungen erfüllen. Unbekannte oder kaputte Werte werden beim Laden entfernt.

### Nicht gespeicherte Werte

- Die Distanz zu einem Spot wird nie gespeichert, sondern bei jeder Anzeige aus dem aktuellen Standort berechnet.
- Der aktuelle Standort selbst wird nicht gespeichert.
- Der Suchtext der Liste wird bewusst nicht gespeichert.
- Der gewählte Pin auf der Karte und die Wahl "Ohne Standort weiter" gelten nur, solange die App läuft.

## Persistenz

Gespeichert wird lokal mit AsyncStorage als JSON. Die Schlüssel stehen in "storage.js".

| Schlüssel | Inhalt | Verwendung |
|---|---|---|
| "@lernspots/spots" | Array aller Spots | wird bei jeder Änderung an einem Spot gespeichert |
| "@lernspots/settings" | Objekt mit den Einstellungen | wird bei jeder geänderten Einstellung gespeichert |
| "@lernspots/filter" | Array der aktiven Filter Chips | wird bei jedem Wechsel eines Chips gespeichert |
| "@lernspots/draft" | Entwurf des Formulars | Funktionen sind vorhanden, werden aber nicht verwendet |
| "@lernspots/seeded" | true nach dem ersten Start | verhindert, dass die Beispiel Spots erneut eingefügt werden |

Alle Zugriffe auf AsyncStorage laufen über "storage.js". Die Screens greifen nie direkt darauf zu, sondern nutzen den AppContext. Das hat drei Gründe. Erstens sind die Schlüssel nur an einer Stelle definiert und können nicht falsch geschrieben werden. Zweitens fangen die Hilfsfunktionen "readJson" und "writeJson" jeden Fehler ab, schreiben eine Warnung ins Log und liefern einen Standardwert, sodass ein Speicherfehler die App nicht zum Absturz bringt. Drittens hält der AppContext den Zustand im Speicher und schreibt ihn bei jeder Änderung sofort weg. So zeigen alle Screens dieselben Daten und es gibt keinen eigenen Speichern Button für Einstellungen.

Beim Start der App lädt der AppContext Spots, Einstellungen und Filter. Solange er lädt, zeigen Liste und Karte einen Ladekreis. Beim allerersten Start ist "@lernspots/seeded" noch nicht gesetzt. Dann fügt der AppContext die vier Beispiel Spots "Stadtbibliothek Winterthur", "ZHAW Hochschulbibliothek", "Café Steinberggasse" und "Zentralbibliothek Zürich" vor allen vorhandenen Spots ein, speichert die Liste und setzt "@lernspots/seeded" auf true. Bei jedem weiteren Start werden keine Beispiel Spots mehr eingefügt, auch nicht, wenn man sie gelöscht hat.

"Alle Daten löschen" in den Einstellungen fragt zuerst mit einem Dialog nach. Danach entfernt "clearAll" alle Schlüssel, der AppContext setzt Spots, Einstellungen und Filter zurück und setzt "@lernspots/seeded" gleich wieder auf true. Darum erscheinen auch danach keine Beispiel Spots.

## Geräte-Feature

Das Geräte-Feature ist GPS mit Karte. Es besteht aus dem Standort über "expo-location", der Karte über "react-native-maps", der Distanzberechnung und dem Starten einer Route in einer Karten App.

### Standort mit "useLocation"

Der Hook "useLocation" in "src/hooks/useLocation.js" fragt beim Einbinden sofort die Berechtigung an und ermittelt die Position. Er wird in der Liste, auf der Karte, in der Detailansicht und im Standort Abschnitt des Formulars verwendet.

Der Ablauf ist so. Zuerst fragt "requestForegroundPermissionsAsync" die Berechtigung an. Dann prüft "hasServicesEnabledAsync", ob die Standortdienste des Geräts eingeschaltet sind. Danach holt "getCurrentPositionAsync" die Position mit mittlerer Genauigkeit. Weil das auf Android ohne GPS Empfang sehr lange dauern kann, bricht der Hook nach 10 Sekunden ab und nimmt die letzte bekannte Position von "getLastKnownPositionAsync".

Der Hook liefert diese Werte.

| Wert | Bedeutung |
|---|---|
| coords | Objekt mit lat, lng und accuracy in Metern oder null |
| status | "loading", "denied", "error" oder "ready" |
| error | Verständliche Fehlermeldung auf Deutsch oder null |
| servicesOff | true, wenn die Standortdienste des Geräts aus sind |
| refresh | Funktion, die Berechtigung und Position neu abfragt |

Die Zustände bedeuten Folgendes.

- "loading" heisst, die Position wird gerade gesucht. Eine alte Position bleibt dabei sichtbar.
- "denied" heisst, die Berechtigung wurde verweigert. Die Meldung lautet "Standortzugriff ist deaktiviert."
- "error" heisst, die Standortdienste sind aus oder es gab weder eine aktuelle noch eine letzte bekannte Position. Die Meldung ist dann ein eigener deutscher Text und nie die technische Meldung des Systems.
- "ready" heisst, eine Position ist da.

Der Hook verhindert doppelte Abfragen und ändert keinen Zustand mehr, wenn der Screen schon verlassen wurde.

### Karte mit "react-native-maps"

Die Karte in "MapScreen.js" zeigt alle Spots mit Koordinaten als Pins. Der eigene Standort erscheint als blauer Punkt mit der Beschriftung "Du", damit die Information nicht nur über die Farbe läuft. Der Button "Du" unten rechts zentriert auf den eigenen Standort oder fragt den Standort neu an, wenn noch keiner da ist. Beim ersten Öffnen zeigt die Karte alle Spots oder den Spot aus "focusSpotId". Sobald der Standort da ist, zentriert sie einmal automatisch darauf, aber nur, wenn man die Karte noch nicht selbst verschoben hat.

Ein Tipp auf einen Pin öffnet unten die Infokarte mit Kategorie, Distanz, Ruhe, Ausstattung und Öffnungszeiten. Ein Tipp auf die Karte daneben oder auf "Schliessen" schliesst sie.

In der Detailansicht zeigt eine kleine Karte von 160 dp Höhe den gespeicherten Ort. Sie nimmt selbst keine Gesten an. Ein Tipp darauf führt zur grossen Karte.

### Suchradius

In den Einstellungen wählt man als Suchradius 1 km, 5 km, 10 km oder "Alle". Mit Standort zeigt die Karte dann nur Spots in diesem Umkreis und eine Zeile wie "3 Spots im Umkreis von 5 km". Ohne Standort gilt der Radius nicht, damit die Karte nicht grundlos leer ist. Ein Spot, den man aus der Detailansicht auf der Karte öffnet, bleibt sichtbar, auch wenn er ausserhalb des Radius liegt.

### Distanz nach Haversine

"distance.js" berechnet die Distanz zwischen zwei Koordinaten mit der Haversine Formel auf einer Kugel mit dem Erdradius 6371000 Meter. Unter 1000 Metern wird auf 10 Meter gerundet und in Metern angezeigt, darüber in Kilometern mit einer Nachkommastelle. Fehlt der Standort oder hat der Spot keine Koordinaten, liefert "distanceToSpot" null und es wird keine Distanz angezeigt.

Die Liste sortiert bei "naechste" nach dieser Distanz. Spots ohne Koordinaten kommen ans Ende. Ohne Standort sortiert die Liste immer alphabetisch.

### Route starten

In der Detailansicht liegt unten im Daumenbereich der Button "Route starten". Er erscheint nur, wenn der Spot Koordinaten hat. Ein Tipp öffnet mit "Linking.openURL" die Karten App mit dem Spot als Ziel. Auf iOS ist das Apple Maps mit der Adresse "maps.apple.com" und dem Parameter "daddr", auf Android Google Maps mit der Adresse "www.google.com/maps/dir" und dem Parameter "destination". Die Wahl trifft "Platform.select". Schlägt das Öffnen fehl, erscheint der Dialog "Die Karten App konnte nicht geöffnet werden." mit dem Button "OK".

### Sonderzustände

| Zustand | Reaktion |
|---|---|
| Standort wird gesucht | Liste zeigt "Standort wird ermittelt" mit Ladekreis und ist schon bedienbar, Karte zeigt denselben Hinweis und einen Ladekreis im Button "Du", Formular zeigt einen Ladehinweis |
| Berechtigung verweigert | Karte zeigt einen Hinweis mit "Einstellungen öffnen" und "Ohne Standort weiter", die Pins bleiben sichtbar, Liste sortiert alphabetisch und zeigt "Ohne Standort", Formular bietet "Einstellungen öffnen" an |
| Standortdienste aus | Karte zeigt denselben Hinweis wie bei verweigerter Berechtigung mit angepasstem Text |
| Anderer Standortfehler | Karte zeigt "Standort nicht verfügbar" mit "Erneut versuchen", Formular zeigt die Meldung mit "Erneut versuchen" |
| Zurück aus den Systemeinstellungen | Karte fragt den Standort automatisch neu ab |
| Kein Netz | Karte zeigt "Kein Netz" mit "Liste anzeigen" und "Erneut prüfen", das Netz wird bei jedem Wechsel auf den Tab geprüft |
| Keine Spots mit Standort | Karte zeigt "Noch keine Spots auf der Karte" mit "Liste anzeigen" |
| Keine Spots im Radius | Karte zeigt "Keine Spots im Umkreis" mit "Radius ändern" |
| Einige Spots ohne Standort | Karte zeigt, wie viele Spots fehlen |
| Spot ohne Standort im Detail | Hinweis "Für diesen Spot ist kein Standort gespeichert." mit "Bearbeiten", keine Mini Karte und kein Button "Route starten" |
| Karten App öffnet nicht | Dialog "Die Karten App konnte nicht geöffnet werden." |

Die Prüfung auf Netz in "network.js" schickt eine Anfrage an eine Adresse von Google, die sehr schnell mit Status 204 antwortet, und bricht nach 5 Sekunden ab. So braucht die App kein zusätzliches Paket.

## Installation und Start

Voraussetzung ist Node.js auf dem Computer und die App Expo Go auf dem Handy.

1. Im Projektordner "npm install" ausführen.
2. "npx expo start" ausführen.
3. Den QR Code mit dem Handy scannen und die App in Expo Go öffnen.

## Testergebnisse

Die Testfälle und die Ergebnisse auf iPhone und Android stehen im Testkonzept in "docs/Testkonzept.md".

## Abweichungen zum Konzept und bekannte Einschränkungen

Verglichen wurde der Code mit dem Konzept in "docs/LB1_Konzept_LernSpots.pdf".

### Nicht umgesetzt

- Das Speichern eines Entwurfs im Formular ist nicht umgesetzt. Der Schlüssel "@lernspots/draft" und die Funktionen "saveDraft", "loadDraft" und "clearDraft" sind in "storage.js" vorhanden, werden aber nirgends aufgerufen. Wird die App beim Erfassen beendet, gehen die Eingaben verloren.
- Die Duplikat Warnung "Diesen Spot hast du schon gespeichert" für einen gleichen Namen in weniger als 50 m ist nicht umgesetzt.
- Der Export der Spots als JSON über das Teilen Menü in den Einstellungen ist nicht umgesetzt.
- Die Einstellung "Geschlossene Spots ausblenden" fehlt. Die Öffnungszeiten sind freier Text und werden nicht ausgewertet.
- Auf der Karte gibt es kein langes Drücken zum Erfassen eines Spots an dieser Stelle und keinen Button "Spot hier hinzufügen". Das Formular kann zwar Koordinaten als Parameter annehmen, die Karte übergibt aber keine.
- Auf der Karte gibt es keinen Button "Filter". Die Filter Chips der Liste wirken nicht auf der Karte.
- Die Pins auf der Karte zeigen kein Symbol der Kategorie, sondern unterscheiden sich nur in der Farbe zwischen normal und ausgewählt.
- Die Infokarte auf der Karte lässt sich nicht durch Wischen nach unten schliessen, sondern mit "Schliessen" oder einem Tipp auf die Karte.
- Nach dem Löschen eines Spots erscheint kein Toast "gelöscht". Die App kehrt direkt zur vorherigen Ansicht zurück.
- In der Liste gibt es keinen Button "Sortieren" oben rechts. Die Sortierung wählt man nur in den Einstellungen.

### Anders umgesetzt als im Konzept

- Die Sortierung hat drei Werte "naechste", "ruhe" und "neueste" statt der zwei Werte "distanz" und "bewertung" aus dem Konzept. Alte gespeicherte Werte werden beim Laden umgewandelt.
- Neu ist die Einstellung "Suchradius" für die Karte. Sie steht nicht im Konzept.
- Neu ist ein Suchfeld nach Namen oben in der Liste. Es steht nicht im Konzept.
- Ohne Standort ersetzt die Liste die Distanz nicht durch einen Strich, sondern lässt sie weg und zeigt oben den Hinweis "Ohne Standort" mit alphabetischer Sortierung.
- In der Detailansicht führt eine Mini Karte zur grossen Karte. Das Konzept zeigt dort eine Zeile mit Distanz und "Auf Karte".
- Ob der Standort beim Erfassen automatisch übernommen wird, lässt sich in den Einstellungen mit "Standort automatisch übernehmen" ausschalten.
- Das dunkle Design folgt nur dem Schalter "Dunkles Design" in der App und nicht der Einstellung des Systems. In "app.json" ist "userInterfaceStyle" auf "light" gesetzt.

### Bekannte Einschränkungen

- Die Koordinaten der Beispiel Spots sind laut Kommentar in "seedSpots.js" ungefähre Werte.
- Die Prüfung auf Netz hängt davon ab, dass die Prüfadresse von Google erreichbar ist. Sie läuft nur beim Wechsel auf den Tab "Karte" und bei "Erneut prüfen".
- Die Tab Symbole sind Textzeichen und keine Icons aus einer Bibliothek.
- Die App hat keine Synchronisation und kein Backup. Wird die App gelöscht, sind alle Spots weg.
