import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import PrimaryButton from '../components/PrimaryButton';
import StandortAbschnitt from '../components/StandortAbschnitt';
import StarRating from '../components/StarRating';
import { CATEGORIES } from '../data/categories';
import useTheme from '../hooks/useTheme';
import { fontSizes, radius, spacing, touch } from '../theme';

// S2 · Neuer Spot / Spot bearbeiten (Modal)
// TODO (Mockup S2):
//  - Duplikat-Warnung (gleicher Name < 50 m)
//  - Entwurf in AsyncStorage (storage.saveDraft) sichern

const NAME_MIN = 2;
const NAME_MAX = 60;
const TOAST_DAUER = 1200;

function validateName(name) {
  const laenge = name.trim().length;
  if (laenge < NAME_MIN) return `Bitte gib dem Spot einen Namen (mind. ${NAME_MIN} Zeichen).`;
  if (laenge > NAME_MAX) return `Der Name darf höchstens ${NAME_MAX} Zeichen lang sein.`;
  return null;
}

// Startwerte des Formulars: leer beim Erfassen, vorausgefüllt beim Bearbeiten
function toForm(spot) {
  return {
    name: spot?.name ?? '',
    kategorie: spot?.kategorie ?? 'andere',
    ruhe: spot?.ruhe ?? 3,
    gesamt: spot?.gesamt ?? 3,
    wlan: spot?.wlan ?? false,
    steckdosen: spot?.steckdosen ?? false,
    oeffnungszeiten: spot?.oeffnungszeiten ?? '',
    notiz: spot?.notiz ?? '',
  };
}

function Chip({ icon, label, selected, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Kategorie ${label}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
    >
      {/* Auswahl nie nur über Farbe: zusätzlich Häkchen und fette Schrift */}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {selected ? '✓ ' : ''}
        {icon} {label}
      </Text>
    </Pressable>
  );
}

// Ganze Zeile antippbar, der Schalter selbst nimmt keine Taps an
function SwitchRow({ icon, label, value, onChange }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [styles.switchRow, pressed && styles.pressed]}
    >
      <Text style={styles.switchLabel}>
        {icon} {label}
      </Text>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Switch
          value={value}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={value ? colors.onPrimary : colors.surface}
          ios_backgroundColor={colors.border}
        />
      </View>
    </Pressable>
  );
}

const istZahl = (n) => typeof n === 'number' && Number.isFinite(n);

// Startstandort: beim Bearbeiten der gespeicherte, beim Erfassen die Stelle, auf die man lange gedrückt hat
function toStandort(spot, params) {
  if (spot) return istZahl(spot.lat) && istZahl(spot.lng) ? { lat: spot.lat, lng: spot.lng, accuracy: null } : null;
  return istZahl(params?.lat) && istZahl(params?.lng) ? { lat: params.lat, lng: params.lng, accuracy: null } : null;
}

export default function SpotFormScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { getSpot, addSpot, updateSpot, settings } = useApp();
  const insets = useSafeAreaInsets();
  const editing = route.params?.spotId ? getSpot(route.params.spotId) : null;

  const [initial] = useState(() => toForm(editing));
  const [form, setForm] = useState(initial);
  const [standort, setStandort] = useState(() => toStandort(editing, route.params));
  const [standortGeaendert, setStandortGeaendert] = useState(false);
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);
  // Automatisch nur beim Erfassen und nur ohne vorgegebene Stelle von der Karte
  const [autoStandort] = useState(() => !editing && !toStandort(null, route.params) && settings.autoStandort);

  const nameError = validateName(form.name);
  const hasChanges = standortGeaendert || Object.keys(initial).some((key) => form[key] !== initial[key]);

  // Automatisch ermittelter Standort ist keine Eingabe des Nutzers, löst also keine Rückfrage beim Abbrechen aus
  const handleStandort = useCallback((coords, manuell) => {
    setStandort(coords);
    if (manuell) setStandortGeaendert(true);
  }, []);

  function setField(key, value) {
    setForm((alt) => ({ ...alt, [key]: value }));
  }

  // «Abbrechen» oben links im Header (weit weg von «Speichern»)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Abbrechen"
          style={styles.abbrechen}
        >
          <Text style={styles.abbrechenText}>Abbrechen</Text>
        </Pressable>
      ),
    });
  }, [navigation, styles]);

  // Fängt Abbrechen, System-Zurück und Wischen ab: mit Eingaben kommt erst eine Rückfrage
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (saved || !hasChanges) return;
        e.preventDefault();
        Alert.alert('Änderungen verwerfen?', 'Deine Eingaben wurden noch nicht gespeichert.', [
          { text: 'Weiter bearbeiten', style: 'cancel' },
          { text: 'Verwerfen', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]);
      }),
    [navigation, saved, hasChanges]
  );

  // Nach dem Speichern kurz die Bestätigung zeigen, dann das Modal schliessen
  useEffect(() => {
    if (!saved) return undefined;
    const timer = setTimeout(() => navigation.goBack(), TOAST_DAUER);
    return () => clearTimeout(timer);
  }, [saved, navigation]);

  function handleSave() {
    if (nameError || saved) {
      setTouched(true);
      return;
    }
    const data = {
      ...form,
      name: form.name.trim(),
      oeffnungszeiten: form.oeffnungszeiten.trim(),
      notiz: form.notiz.trim(),
      // Ohne Standort bleiben lat und lng null, beim Bearbeiten gilt der alte Wert bis «Neu»
      lat: standort?.lat ?? null,
      lng: standort?.lng ?? null,
    };
    if (editing) updateSpot(editing.id, data);
    else addSpot(data);
    setSaved(true);
    AccessibilityInfo.announceForAccessibility('Spot gespeichert');
  }

  // Spot wurde inzwischen gelöscht: klare Meldung statt leerem Formular
  if (route.params?.spotId && !editing) {
    return (
      <View style={[styles.container, styles.nichtGefunden]}>
        <Text style={styles.nichtGefundenText}>Dieser Spot existiert nicht mehr.</Text>
        <PrimaryButton title="Zurück" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={styles.label}>Name *</Text>
        <TextInput
          value={form.name}
          onChangeText={(text) => {
            setField('name', text);
            setTouched(true); // Echtzeit: Meldung erscheint ab der ersten Eingabe
          }}
          onBlur={() => setTouched(true)}
          placeholder="z. B. Stadtbibliothek"
          placeholderTextColor={colors.textMuted}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          style={[styles.input, touched && nameError && styles.inputError]}
          maxLength={80}
          accessibilityLabel="Name des Spots"
        />
        {touched && nameError ? <Text style={styles.error}>⚠ {nameError}</Text> : null}

        <Text style={[styles.label, styles.abschnitt]}>Kategorie</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              icon={c.icon}
              label={c.label}
              selected={form.kategorie === c.key}
              onPress={() => setField('kategorie', c.key)}
            />
          ))}
        </View>

        <View style={styles.abschnitt}>
          <StarRating label="Ruhe" value={form.ruhe} onChange={(v) => setField('ruhe', v)} />
        </View>
        <View style={styles.abschnitt}>
          <StarRating label="Gesamt" value={form.gesamt} onChange={(v) => setField('gesamt', v)} />
        </View>

        <View style={[styles.switches, styles.abschnitt]}>
          <SwitchRow icon="📶" label="WLAN vorhanden" value={form.wlan} onChange={(v) => setField('wlan', v)} />
          <SwitchRow
            icon="🔌"
            label="Steckdosen vorhanden"
            value={form.steckdosen}
            onChange={(v) => setField('steckdosen', v)}
          />
        </View>

        <Text style={[styles.label, styles.abschnitt]}>Öffnungszeiten</Text>
        <TextInput
          value={form.oeffnungszeiten}
          onChangeText={(text) => setField('oeffnungszeiten', text)}
          placeholder="z. B. Mo–Fr 9–20, Sa 10–16"
          placeholderTextColor={colors.textMuted}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          style={styles.input}
          accessibilityLabel="Öffnungszeiten"
        />

        <Text style={[styles.label, styles.abschnitt]}>Notiz</Text>
        <TextInput
          value={form.notiz}
          onChangeText={(text) => setField('notiz', text)}
          placeholder="z. B. 2. Stock hinten am ruhigsten"
          placeholderTextColor={colors.textMuted}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          style={[styles.input, styles.notiz]}
          multiline
          accessibilityLabel="Notiz"
        />

        <View style={styles.abschnitt}>
          <StandortAbschnitt value={standort} autoStart={autoStandort} onChange={handleStandort} />
        </View>
      </ScrollView>

      {/* Speichern fest unten im Daumenbereich */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.m) }]}>
        <PrimaryButton title="Speichern" onPress={handleSave} disabled={!!nameError || saved} />
      </View>

      {saved ? (
        <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>Spot gespeichert ✓</Text>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { padding: spacing.m },
    nichtGefunden: { padding: spacing.m, justifyContent: 'center', gap: spacing.m },
    nichtGefundenText: { fontSize: fontSizes.body, color: colors.text, textAlign: 'center' },
    abschnitt: { marginTop: spacing.m },
    label: { fontSize: fontSizes.small, color: colors.textMuted, marginBottom: spacing.xs },
    input: {
      minHeight: touch.min,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.s,
      paddingHorizontal: spacing.s,
      fontSize: fontSizes.body,
      color: colors.text,
    },
    inputError: { borderWidth: 2, borderColor: colors.danger },
    error: { color: colors.danger, fontSize: fontSizes.small, marginTop: spacing.xs },
    notiz: { minHeight: touch.min * 2, paddingTop: spacing.s, textAlignVertical: 'top' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
    chip: {
      minHeight: touch.min,
      paddingHorizontal: spacing.m,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primaryLight },
    chipText: { fontSize: fontSizes.body, color: colors.text },
    chipTextSelected: { fontWeight: 'bold', color: colors.primary },
    switches: { gap: spacing.s },
    switchRow: {
      minHeight: touch.min,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switchLabel: { flex: 1, fontSize: fontSizes.body, color: colors.text },
    pressed: { opacity: 0.7 },
    abbrechen: { minHeight: touch.min, minWidth: touch.min, justifyContent: 'center' },
    abbrechenText: { color: colors.primary, fontSize: fontSizes.body },
    footer: {
      paddingTop: spacing.m,
      paddingHorizontal: spacing.m,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
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
