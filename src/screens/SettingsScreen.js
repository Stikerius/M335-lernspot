import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import useTheme from '../hooks/useTheme';
import { RADIUS_OPTIONS } from '../utils/filterSpots';
import { SORT_OPTIONS } from '../utils/sortSpots';
import { radius, spacing, touch } from '../theme';

// S5 · Einstellungen (Tab)
// Grundgerüst: Schalter werden sofort in AsyncStorage gespeichert, «Alle Daten löschen» mit Bestätigung.
// TODO (Mockup S5):
//  - Export als JSON über Teilen-Menü (Share API) mit Lade-Zustand
export default function SettingsScreen() {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
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
      <SegmentRow
        label="Sortierung"
        hint="Ohne Standort wird die Liste immer alphabetisch sortiert."
        options={SORT_OPTIONS}
        value={settings.sortierung}
        onChange={(v) => updateSettings({ sortierung: v })}
      />

      <Section title="Erfassen" />
      <SwitchRow
        label="Standort automatisch übernehmen"
        value={settings.autoStandort}
        onChange={(v) => updateSettings({ autoStandort: v })}
      />

      <Section title="Karte" />
      <SegmentRow
        label="Suchradius"
        hint="Die Karte zeigt nur Spots in diesem Umkreis um deinen Standort."
        options={RADIUS_OPTIONS}
        value={settings.suchradius}
        onChange={(v) => updateSettings({ suchradius: v })}
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
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  return <Text style={styles.section}>{title.toUpperCase()}</Text>;
}

// Ganze Zeile antippbar, nicht nur der kleine Switch (56 dp)
function SwitchRow({ label, value, onChange }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
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

// Auswahl aus wenigen festen Werten. Die Zeile ist mind. 56 dp hoch, jedes Segment 48 dp;
// das gewählte Segment ist zusätzlich mit «✓» markiert (Info nicht nur über Farbe).
function SegmentRow({ label, hint, options, value, onChange }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  return (
    <View style={styles.segmentRow}>
      <Text style={styles.segmentTitle}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.segment} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              accessibilityRole="radio"
              accessibilityLabel={`${label}: ${o.label}`}
              accessibilityState={{ checked: active, selected: active }}
              style={({ pressed }) => [
                styles.segmentItem,
                active && styles.segmentItemActive,
                pressed && !active && styles.pressed,
              ]}
            >
              <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                {active ? `✓ ${o.label}` : o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
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
    segmentRow: {
      minHeight: touch.settingsRow,
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
      gap: spacing.s,
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    segmentTitle: { fontSize: fontSizes.body, color: colors.text },
    hint: { fontSize: fontSizes.small, color: colors.textMuted },
    segment: { flexDirection: 'row', gap: spacing.s },
    segmentItem: {
      flex: 1,
      minHeight: touch.min,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
      borderRadius: radius.m,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    segmentItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    segmentLabel: { fontSize: fontSizes.body, color: colors.text },
    segmentLabelActive: { color: colors.onPrimary, fontWeight: 'bold' },
    footer: { textAlign: 'center', color: colors.textMuted, fontSize: fontSizes.small, padding: spacing.l },
  });
