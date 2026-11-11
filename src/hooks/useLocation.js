import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

// Standort-Hook (Paket P02), genutzt von S1 (Distanz), S2 (Standort übernehmen) und S3 (Karte).
//
// Rückgabe:
//   coords   { lat, lng, accuracy } | null   accuracy in Metern (für «Genauigkeit ±12 m»)
//   status   'loading' | 'denied' | 'error' | 'ready'
//   error    verständliche Fehlermeldung auf Deutsch | null
//   servicesOff  true, wenn die Standortdienste des Geräts ausgeschaltet sind (status ist dann 'error')
//   refresh  () => Promise   Berechtigung erneut prüfen und Position neu ermitteln
//
// Beispiel:
//   const { coords, status, error, refresh } = useLocation();

// getCurrentPositionAsync kann auf Android ohne GPS-Fix sehr lange hängen,
// darum brechen wir nach dieser Zeit ab und nehmen die letzte bekannte Position.
const TIMEOUT_MS = 10000;

function toCoords(location) {
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    accuracy: location.coords.accuracy ?? null,
  };
}

const STANDARD_FEHLER = 'Standort konnte nicht ermittelt werden. Bitte erneut versuchen.';

// Native Fehlermeldungen sind englisch und technisch, darum zeigen wir nur eigene Texte an
function userError(message) {
  const e = new Error(message);
  e.userMessage = message;
  return e;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export function useLocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [servicesOff, setServicesOff] = useState(false);

  // Verhindert setState nach dem Verlassen des Screens und doppelte Abfragen
  const mounted = useRef(true);
  const running = useRef(false);

  const refresh = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    // Alte Position bleibt sichtbar, während neu gesucht wird
    setStatus('loading');
    setError(null);
    setServicesOff(false);

    try {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (permission !== 'granted') {
        if (mounted.current) {
          setCoords(null);
          setStatus('denied');
          setError('Standortzugriff ist deaktiviert.');
        }
        return;
      }

      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        // Eigener Zustand, damit die Karte dieselbe Hilfe wie bei verweigerter Berechtigung anbieten kann
        if (mounted.current) setServicesOff(true);
        throw userError('Die Standortdienste sind ausgeschaltet. Bitte in den Systemeinstellungen einschalten.');
      }

      let location;
      try {
        location = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          TIMEOUT_MS
        );
      } catch (e) {
        // Fallback: lieber eine etwas ältere Position als gar keine
        location = await Location.getLastKnownPositionAsync();
        if (!location) throw userError(STANDARD_FEHLER);
      }

      if (mounted.current) {
        setCoords(toCoords(location));
        setStatus('ready');
      }
    } catch (e) {
      console.warn('Standort fehlgeschlagen', e);
      if (mounted.current) {
        setStatus('error');
        setError(e?.userMessage || STANDARD_FEHLER);
      }
    } finally {
      running.current = false;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  return { coords, status, error, servicesOff, refresh };
}

export default useLocation;
