// Einfache Online-Prüfung für den Sonderzustand «Kein Netz» auf der Karte.
// Bewusst ohne @react-native-community/netinfo, damit package.json unverändert bleibt.
// Die Google-URL antwortet sehr schnell mit 204 und ohne Inhalt; dieselbe Methode nutzt Android selbst.
const PROBE_URL = 'https://clients3.google.com/generate_204';
const TIMEOUT_MS = 5000;

export async function isOnline() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(PROBE_URL, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
    return res.status === 204 || res.ok;
  } catch (e) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
