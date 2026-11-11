import { useMemo } from 'react';

import { useApp } from '../context/AppContext';
import { darkColors, fontSizes as baseFontSizes, lightColors } from '../theme';

// Faktor für die Einstellung «Grosse Schrift»
const GROSSE_SCHRIFT_FAKTOR = 1.25;

// Liefert Farbpalette und Schriftgrössen passend zu den Einstellungen «Dunkles Design» und «Grosse Schrift».
// Beim Umschalten in den Einstellungen rendern alle Screens, die den Hook nutzen, sofort neu.
//
// Beispiel:
//   const { colors, fontSizes, isDark } = useTheme();
//   const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
export function useTheme() {
  const { settings } = useApp();
  const isDark = !!settings.darkMode;
  const gross = !!settings.grosseSchrift;
  return useMemo(() => {
    const faktor = gross ? GROSSE_SCHRIFT_FAKTOR : 1;
    const fontSizes = Object.fromEntries(
      Object.entries(baseFontSizes).map(([name, size]) => [name, Math.round(size * faktor)])
    );
    return { colors: isDark ? darkColors : lightColors, fontSizes, isDark };
  }, [isDark, gross]);
}

export default useTheme;
