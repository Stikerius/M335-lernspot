import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import useLocation from '../hooks/useLocation';
import useTheme from '../hooks/useTheme';
import { fontSizes, radius, spacing, touch } from '../theme';

// Abschnitt «Standort» im Formular S2.
// Der Hook useLocation fragt beim Einbinden sofort nach Berechtigung und Position. Darum steckt er
// in einer eigenen Komponente, die nur geladen wird, wenn der Standort wirklich gebraucht wird
// (automatisch bei «Standort automatisch übernehmen» oder nach Tipp auf den Button).

function Aktion({ title, accessibilityLabel, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [styles.aktion, pressed && styles.pressed]}
    >
      <Text style={styles.aktionText}>{title}</Text>
    </Pressable>
  );
}

// status: 'idle' (noch nicht abgefragt) | 'loading' | 'denied' | 'error' | 'ready'
function StandortAnzeige({ value, status, error, uebernommen, onErmitteln, onEinstellungen }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const laedt = status === 'loading';
  const fehler = status === 'error';
  const denied = status === 'denied';

  return (
    <View>
      <Text style={styles.label}>Standort</Text>

      {value ? (
        <View style={styles.wertZeile}>
          <View style={styles.wert}>
            <Text style={styles.koordinaten}>
              📍 {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
            </Text>
            {value.accuracy != null ? (
              <Text style={styles.genauigkeit}>Genauigkeit ± {Math.round(value.accuracy)} m</Text>
            ) : null}
          </View>
          {!laedt && !fehler ? (
            <Aktion title="↻ Neu" accessibilityLabel="Standort neu ermitteln" onPress={onErmitteln} />
          ) : null}
        </View>
      ) : null}

      {!value && !laedt && !fehler ? (
        <View style={styles.block}>
          {!denied ? <Text style={styles.hinweis}>Noch kein Standort gespeichert.</Text> : null}
          <Aktion title="Aktuellen Standort verwenden" onPress={onErmitteln} />
        </View>
      ) : null}

      {laedt ? (
        <View style={[styles.block, styles.ladeZeile]} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.hinweis}>Standort wird ermittelt …</Text>
        </View>
      ) : null}

      {uebernommen && !laedt ? (
        <Text style={[styles.block, styles.bestaetigung]} accessibilityLiveRegion="polite">
          ✓ Standort übernommen
        </Text>
      ) : null}

      {denied ? (
        <View style={styles.block}>
          <Text style={styles.hinweis}>
            📍 {error ?? 'Standortzugriff ist deaktiviert.'} Du kannst den Spot auch ohne Standort speichern.
          </Text>
          <Aktion title="Einstellungen öffnen" onPress={onEinstellungen} />
        </View>
      ) : null}

      {fehler ? (
        <View style={styles.block}>
          <Text style={styles.fehler}>⚠ {error}</Text>
          <Aktion title="Erneut versuchen" onPress={onErmitteln} />
        </View>
      ) : null}
    </View>
  );
}

function StandortMitHook({ value, startManuell, onChange }) {
  const { coords, status, error, refresh } = useLocation();
  // Automatisch übernommene Werte zählen nicht als Änderung des Nutzers (siehe Formular)
  const manuell = useRef(startManuell);
  const [uebernommen, setUebernommen] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      setUebernommen(false);
      return;
    }
    if (status === 'ready' && coords) {
      onChange(coords, manuell.current);
      setUebernommen(true);
      AccessibilityInfo.announceForAccessibility('Standort übernommen');
    }
  }, [status, coords, onChange]);

  function ermitteln() {
    manuell.current = true;
    refresh();
  }

  return (
    <StandortAnzeige
      value={value}
      status={status}
      error={error}
      uebernommen={uebernommen}
      onErmitteln={ermitteln}
      onEinstellungen={() => Linking.openSettings().catch(() => {})}
    />
  );
}

// value: { lat, lng, accuracy } | null – aktueller Standort des Formulars
// autoStart: Position sofort ermitteln und übernehmen
// onChange(coords, manuell): wird bei jeder übernommenen Position aufgerufen
export default function StandortAbschnitt({ value, autoStart, onChange }) {
  const [aktiv, setAktiv] = useState(autoStart);
  // Wer den Button selbst antippt, hat den Standort bewusst gewählt
  const startManuell = useRef(!autoStart);

  if (!aktiv) {
    return <StandortAnzeige value={value} status="idle" onErmitteln={() => setAktiv(true)} />;
  }
  return <StandortMitHook value={value} startManuell={startManuell.current} onChange={onChange} />;
}

const makeStyles = (colors) =>
  StyleSheet.create({
    label: { fontSize: fontSizes.small, color: colors.textMuted, marginBottom: spacing.xs },
    block: { marginTop: spacing.s, gap: spacing.s },
    wertZeile: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
    wert: { flex: 1 },
    koordinaten: { fontSize: fontSizes.body, color: colors.text },
    genauigkeit: { fontSize: fontSizes.small, color: colors.textMuted },
    hinweis: { fontSize: fontSizes.body, color: colors.textMuted },
    ladeZeile: { flexDirection: 'row', alignItems: 'center' },
    bestaetigung: { fontSize: fontSizes.body, fontWeight: 'bold', color: colors.success },
    fehler: { fontSize: fontSizes.body, color: colors.danger },
    aktion: {
      minHeight: touch.min,
      paddingHorizontal: spacing.m,
      borderRadius: radius.m,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aktionText: { fontSize: fontSizes.body, fontWeight: 'bold', color: colors.primary },
    pressed: { opacity: 0.7 },
  });
