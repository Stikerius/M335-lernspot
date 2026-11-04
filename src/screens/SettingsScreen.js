import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { colors, fontSizes, spacing, touch } from '../theme';

// S5 · Einstellungen (Tab)
// Grundgerüst: Schalter werden sofort in AsyncStorage gespeichert, «Alle Daten löschen» mit Bestätigung.
// TODO (Mockup S5):
//  - Segment «Nach Distanz / Nach Bewertung»
//  - Export als JSON über Teilen-Menü (Share API) mit Lade-Zustand
//  - Dark Mode und grosse Schrift tatsächlich anwenden
export default function SettingsScreen() {
  const { settings, updateSettings, resetAll, spots } = useApp();

  function confirmReset() {
    Alert.alert('Alle Daten löschen?', 'Alle Spots und Einstellungen werden endgültig gelöscht.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: resetAll },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <Section title="Liste" />
      <SwitchRow
        label="Geschlossene Spots ausblenden"
        value={settings.geschlosseneAusblenden}
        onChange={(v) => updateSettings({ geschlosseneAusblenden: v })}
      />

      <Section title="Erfassen" />
      <SwitchRow
        label="Standort automatisch übernehmen"
        value={settings.autoStandort}
        onChange={(v) => updateSettings({ autoStandort: v })}
      />

      <Section title="Darstellung" />
      <SwitchRow label="Dunkles Design" value={settings.darkMode} onChange={(v) => updateSettings({ darkMode: v })} />
      <SwitchRow label="Grosse Schrift" value={settings.grosseSchrift} onChange={(v) => updateSettings({ grosseSchrift: v })} />

      <Section title="Daten" />
      <Pressable
        onPress={confirmReset}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <Text style={[styles.rowLabel, { color: colors.danger }]}>🗑 Alle Daten löschen …</Text>
      </Pressable>

      <Text style={styles.footer}>LernSpots v1.0 · {spots.length} Spots gespeichert</Text>
    </ScrollView>
  );
}

function Section({ title }) {
  return <Text style={styles.section}>{title.toUpperCase()}</Text>;
}

// Ganze Zeile antippbar, nicht nur der kleine Switch (56 dp)
function SwitchRow({ label, value, onChange }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View pointerEvents="none">
        <Switch value={value} trackColor={{ true: colors.primary }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: {
    fontSize: fontSizes.small,
    fontWeight: 'bold',
    color: colors.primary,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.l,
    paddingBottom: spacing.xs,
  },
  row: {
    minHeight: touch.settingsRow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.primaryLight },
  rowLabel: { fontSize: fontSizes.body, color: colors.text, flex: 1, marginRight: spacing.m },
  footer: { textAlign: 'center', color: colors.textMuted, fontSize: fontSizes.small, padding: spacing.l },
});
