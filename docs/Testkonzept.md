# Testkonzept LernSpots

## 1. Ziel und Testumgebung

Ziel der Tests ist der Nachweis, dass die App LernSpots alle Anforderungen aus dem Konzept erfüllt. Geprüft werden das Erfassen, Bearbeiten und Löschen von Spots, die Speicherung auf dem Gerät, die Standortfunktion mit Karte, die Sonderzustände sowie das dunkle Design. Alle Tests werden von Hand auf einem echten Gerät durchgeführt. Die Spalte Ergebnis wird beim Testen ausgefüllt, zum Beispiel mit "bestanden" oder "fehlgeschlagen".

Testumgebung

| Bereich | Wert |
|---|---|
| Testgerät | iPhone mit Expo Go |
| Entwicklungsrechner | Mac |
| Laufzeit | Node 20 |
| Start der App | npx expo start, danach QR Code mit der Kamera scannen |
| Ausgangslage | App frisch gestartet, Beispiel Spots vorhanden, Einstellungen im Standardzustand |

## 2. Testarten

1. Manueller Funktionstest. Jede Funktion wird mit gültigen Eingaben durchgespielt und mit dem erwarteten Ergebnis verglichen.
2. Fehlerfalltest. Ungültige Eingaben, fehlende Berechtigungen, fehlendes Netz und leere Zustände werden gezielt herbeigeführt. Die App muss verständlich reagieren und benutzbar bleiben.
3. Gerätetest. Funktionen, die Hardware oder das Betriebssystem brauchen, werden auf dem iPhone geprüft. Dazu gehören Standort, Berechtigungsdialog, Flugmodus, Tastatur und Neustart der App.

## 3. Testfälle

Die Spalten Ergebnis und Datum bleiben leer und werden auf dem Gerät ausgefüllt.

| ID | Funktion | Schritte | Erwartetes Ergebnis | Ergebnis | Datum |
|---|---|---|---|---|---|
| T01 | Spot anlegen | Im Tab Spots auf den Button "Spot" unten rechts tippen. Im Feld Name "Stadtbibliothek" eingeben. Auf "Speichern" tippen. | Das Formular zeigt kurz "Spot gespeichert" und schliesst sich. Der neue Spot steht oben in der Liste. | | |
| T02 | Validierung Name leer | Formular für einen neuen Spot öffnen. In das Feld Name tippen, ein Zeichen eingeben und wieder löschen. | Unter dem Feld erscheint ein roter Hinweis, der mit "Bitte gib dem Spot einen Namen" beginnt. Das Feld ist rot umrandet. "Speichern" ist deaktiviert. | | |
| T03 | Validierung Name zu kurz | Im Feld Name nur den Buchstaben "A" eingeben. | Der rote Hinweis bleibt sichtbar und "Speichern" bleibt deaktiviert. Mit einem zweiten Zeichen verschwindet der Hinweis sofort und "Speichern" wird aktiv. | | |
| T04 | Validierung Name zu lang | Im Feld Name einen Text mit 61 Zeichen eingeben. | Unter dem Feld erscheint "Der Name darf höchstens 60 Zeichen lang sein." und "Speichern" ist deaktiviert. Nach dem Kürzen auf 60 Zeichen wird "Speichern" aktiv. | | |
| T05 | Alle Felder speichern | Neuen Spot mit Name, Kategorie "Bibliothek", Ruhe 5 Sterne, Gesamt 4 Sterne, WLAN an, Steckdosen an, Öffnungszeiten und Notiz anlegen. Speichern und den Spot in der Liste öffnen. | Die Detailansicht zeigt genau die eingegebenen Werte. Ruhe, Gesamt und die Antworten zu WLAN und Steckdosen stimmen. | | |
| T06 | Abbrechen mit Eingaben | Neues Formular öffnen und einen Namen eingeben. Oben links auf "Abbrechen" tippen. | Es erscheint die Rückfrage "Änderungen verwerfen" mit "Weiter bearbeiten" und "Verwerfen". Mit "Weiter bearbeiten" bleiben die Eingaben erhalten, mit "Verwerfen" schliesst sich das Formular ohne zu speichern. | | |
| T07 | Abbrechen ohne Eingaben | Neues Formular öffnen und sofort auf "Abbrechen" tippen. | Das Formular schliesst sich ohne Rückfrage. Es wird kein Spot angelegt. | | |
| T08 | Spot bearbeiten | Einen Spot öffnen und auf "Bearbeiten" tippen. Den Namen ändern und speichern. | Die Felder sind mit den bisherigen Werten vorausgefüllt. Nach dem Speichern zeigen Detail und Liste den neuen Namen. Alle anderen Werte sind unverändert. | | |
| T09 | Spot löschen | Einen Spot öffnen und auf "Löschen" tippen. In der Rückfrage "Spot löschen" auf "Löschen" tippen. | Die Detailansicht schliesst sich und der Spot ist aus der Liste verschwunden. | | |
| T10 | Löschen abbrechen | Einen Spot öffnen, auf "Löschen" tippen und in der Rückfrage "Abbrechen" wählen. | Der Spot bleibt erhalten und die Detailansicht bleibt offen. | | |
| T11 | Favorit setzen und entfernen | Einen Spot öffnen und oben rechts auf den Stern tippen. Danach die Liste ansehen. Anschliessend erneut auf den Stern tippen. | Der Stern ist gefüllt und der Spot trägt in der Liste einen Stern vor dem Namen. Nach dem zweiten Tippen sind beide Sterne wieder weg. | | |
| T12 | Persistenz der Spots | Einen neuen Spot anlegen. Die App im App Umschalter vollständig schliessen und neu starten. | Der Spot ist weiterhin in der Liste vorhanden, mit allen Werten und dem Favoritenstatus. | | |
| T13 | Beispiel Spots beim ersten Start | Expo Go Daten der App löschen oder die App neu laden lassen, sodass es ein erster Start ist. App öffnen. | Die Liste zeigt die vorinstallierten Beispiel Spots und ist nicht leer. | | |
| T14 | Standort erlaubt | Neues Formular öffnen. Im Berechtigungsdialog "Beim Verwenden der App erlauben" wählen. | Während der Suche steht "Standort wird ermittelt" mit Anzeige der Ladeaktivität. Danach zeigt der Abschnitt Standort die Koordinaten mit 4 Nachkommastellen, die Genauigkeit in Metern und in Grün "Standort übernommen". | | |
| T15 | Standort verweigert | Berechtigung in den iPhone Einstellungen für Expo Go auf "Nie" stellen. Neues Formular öffnen. Name eingeben und speichern. | Der Abschnitt Standort zeigt "Standortzugriff ist deaktiviert." und den Button "Einstellungen öffnen". Das Formular bleibt voll nutzbar und der Spot lässt sich ohne Standort speichern. | | |
| T16 | Standort Timeout | Standortdienste an lassen, aber an einem Ort ohne GPS Empfang testen, zum Beispiel im Keller, und keine frühere Position verfügbar haben. Neues Formular öffnen und etwa 15 Sekunden warten. | Die Suche bricht nach etwa 10 Sekunden ab. Es erscheint entweder die letzte bekannte Position oder die Meldung "Standort konnte nicht ermittelt werden. Bitte erneut versuchen." mit dem Button "Erneut versuchen". Speichern ohne Standort funktioniert. | | |
| T17 | Standortdienste ausgeschaltet | Auf dem iPhone die Ortungsdienste ausschalten. Neues Formular öffnen. | Es erscheint eine verständliche Meldung, dass die Standortdienste ausgeschaltet sind, und der Button "Erneut versuchen". Das Formular bleibt nutzbar. | | |
| T18 | Standort neu ermitteln | Einen Spot mit gespeichertem Standort bearbeiten. Zuerst nichts am Standort ändern und speichern. Danach erneut bearbeiten und auf "Neu" tippen. | Ohne Tippen auf "Neu" bleiben die alten Koordinaten erhalten. Nach dem Tippen auf "Neu" werden die Koordinaten durch die aktuelle Position ersetzt. | | |
| T19 | Automatische Standortübernahme aus | In den Einstellungen "Standort automatisch übernehmen" ausschalten. Neues Formular öffnen. | Es erscheint keine Standortabfrage. Der Abschnitt Standort zeigt "Noch kein Standort gespeichert." und den Button "Aktuellen Standort verwenden". | | |
| T20 | Karte mit Pins | Tab Karte öffnen. | Die Karte zeigt für jeden gespeicherten Spot einen Pin und den eigenen Standort. Der Button zum Zentrieren auf den eigenen Standort ist erreichbar. | | |
| T21 | Karte Pin antippen | Auf der Karte einen Pin antippen und in der Infokarte auf "Details" tippen. | Unten erscheint eine Infokarte mit den Kurzinfos zum Spot. Mit "Details" öffnet sich die Detailansicht dieses Spots. | | |
| T22 | Karte ohne Berechtigung | Standortberechtigung für Expo Go verweigern. Tab Karte öffnen. | Ein Banner weist auf die fehlende Standort Berechtigung hin und bietet "Einstellungen öffnen" an. Die Pins der Spots bleiben sichtbar. | | |
| T23 | Kein Netz Banner | Flugmodus einschalten. Tab Karte öffnen. | Ein Banner "Kein Netz" erscheint mit dem Button "Liste anzeigen". Mit dem Button gelangt man zur Liste. Alle gespeicherten Spots bleiben benutzbar. | | |
| T24 | Filter | In der Liste den Filter "Steckdose" antippen. | Die Liste zeigt nur Spots mit Steckdosen. Der aktive Filter ist nicht nur an der Farbe erkennbar. Der Filter bleibt nach einem Neustart erhalten. | | |
| T25 | Filter ohne Treffer | Einen Filter wählen, zu dem kein Spot passt, zum Beispiel Favoriten ohne Favoriten. | Statt der Liste erscheint ein Hinweis mit dem Button "Filter zurücksetzen". Mit dem Button erscheinen wieder alle Spots. | | |
| T26 | Suche | In der Liste im Suchfeld einen Teil eines Spotnamens eingeben. | Die Liste zeigt nur Spots, deren Name den Suchbegriff enthält. Nach dem Löschen des Begriffs erscheinen wieder alle Spots. | | |
| T27 | Dunkles Design einschalten | In den Einstellungen den Schalter "Dunkles Design" einschalten. Danach Spots, Detail, Formular, Karte und Einstellungen ansehen. | Die App wechselt sofort ohne Neustart auf dunkle Farben. Alle Texte sind gut lesbar, Fehlermeldungen und Akzentfarbe sind auch im Dunkeln erkennbar, die Statusleiste ist hell. | | |
| T28 | Dunkles Design bleibt | Dunkles Design einschalten und die App vollständig schliessen und neu starten. Danach ausschalten. | Nach dem Neustart ist das dunkle Design noch aktiv. Nach dem Ausschalten wechselt die App sofort zurück auf das helle Design. | | |
| T29 | Leerer Zustand | In den Einstellungen "Alle Daten löschen" wählen und in der Rückfrage mit "Löschen" bestätigen. Tab Spots öffnen. | Die Liste zeigt den Hinweis "Noch keine Spots gespeichert." mit der Aufforderung, den ersten Lernort zu erfassen. Es erscheinen keine Beispiel Spots mehr. | | |
| T30 | Tastatur im Formular | Neues Formular öffnen und in das Feld Notiz tippen, sodass die Tastatur erscheint. | Das Feld Notiz bleibt sichtbar und der Button "Speichern" ist erreichbar, entweder über dem Inhalt oder nach dem Ausblenden der Tastatur durch Wischen. | | |

## 4. Fehlerprotokoll

Gefundene Fehler werden hier eingetragen. Die Schwere ist Kritisch, Hoch, Mittel oder Niedrig. Der Status ist Offen, In Arbeit, Behoben oder Geprüft.

| ID | Beschreibung | Schwere | Status |
|---|---|---|---|
| | | | |

## 5. Abnahmekriterien

Die App gilt als abgenommen, wenn alle folgenden Punkte erfüllt sind.

1. Alle Testfälle aus Abschnitt 3 sind auf dem iPhone mit Expo Go durchgeführt und mit Ergebnis und Datum eingetragen.
2. Alle Testfälle zu Spot anlegen, bearbeiten, löschen und zur Persistenz sind bestanden.
3. Es gibt keinen offenen Fehler mit der Schwere Kritisch oder Hoch.
4. Die App startet in Expo Go ohne Absturz und ohne Fehlermeldung.
5. Gespeicherte Spots und Einstellungen sind nach einem Neustart der App unverändert vorhanden.
6. Bei verweigerter Standortberechtigung, ohne Netz und bei leerer Liste bleibt die App benutzbar und zeigt eine verständliche Meldung.
7. Alle antippbaren Flächen sind mindestens 48 dp gross und lassen sich mit dem Daumen sicher treffen.
8. Im hellen und im dunklen Design sind alle Texte gut lesbar.
