import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import useTheme from '../hooks/useTheme';
import { radius, spacing } from '../theme';

const TOAST_DAUER = 1500;

// Kurze Bestätigung oben mittig, gleicher Stil wie «Spot gespeichert ✓» im Formular.
// Nimmt keine Taps an, damit darunter alles bedienbar bleibt. Screenreader lesen den Text höflich vor.
// Der Elternteil blendet den Toast nach onHide aus. Für eine neue Meldung einen neuen key setzen,
// dann startet der Timer neu.
export default function Toast({ message, onHide, duration = TOAST_DAUER }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);

  // Timer beim Ausblenden oder Verlassen des Screens aufräumen, sonst läuft onHide ins Leere
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => onHide?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onHide]);

  if (!message) return null;

  return (
    <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
    toast: {
      position: 'absolute',
      top: spacing.m,
      alignSelf: 'center',
      paddingVertical: spacing.s,
      paddingHorizontal: spacing.m,
      borderRadius: radius.pill,
      backgroundColor: colors.text,
    },
    toastText: { color: colors.surface, fontSize: fontSizes.body, fontWeight: 'bold' },
  });
