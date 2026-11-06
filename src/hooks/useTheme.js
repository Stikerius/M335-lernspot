import { useMemo } from 'react';

import { useApp } from '../context/AppContext';
import { darkColors, lightColors } from '../theme';

// Liefert die Farbpalette passend zur Einstellung «Dunkles Design».
// Beim Umschalten in den Einstellungen rendern alle Screens, die den Hook nutzen, sofort neu.
//
// Beispiel:
//   const { colors, isDark } = useTheme();
//   const styles = useMemo(() => makeStyles(colors), [colors]);
export function useTheme() {
  const { settings } = useApp();
  const isDark = !!settings.darkMode;
  return useMemo(() => ({ colors: isDark ? darkColors : lightColors, isDark }), [isDark]);
}

export default useTheme;
