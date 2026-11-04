import { useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { useApp } from '../context/AppContext';
import PrimaryButton from '../components/PrimaryButton';
import { colors, fontSizes, radius, spacing, touch } from '../theme';

// S2 · Neuer Spot / Spot bearbeiten (Modal)
// Grundgerüst: Name-Feld mit Validierung (2–60 Zeichen), Speichern/Abbrechen.
// TODO (Mockup S2):
//  - Kategorie (Segment-Control), Ruhe + Gesamt (Sterne 1–5), WLAN/Steckdosen (Switch),
//    Öffnungszeiten, Notiz
//  - Standort automatisch per expo-location übernehmen, Button «↻ Neu»
//  - Duplikat-Warnung (gleicher Name < 50 m)
//  - «Änderungen verwerfen?» beim Abbrechen mit Eingaben
//  - Entwurf in AsyncStorage (storage.saveDraft) sichern
export default function SpotFormScreen({ navigation, route }) {
  const { getSpot, addSpot, updateSpot } = useApp();
  const editing = route.params?.spotId ? getSpot(route.params.spotId) : null;

  const [name, setName] = useState(editing?.name ?? '');
  const [touched, setTouched] = useState(false);

  const nameError =
    name.trim().length < 2
      ? 'Bitte gib dem Spot einen Namen (mind. 2 Zeichen).'
      : name.trim().length > 60
      ? 'Der Name darf höchstens 60 Zeichen lang sein.'
      : null;

  // «Abbrechen» oben links im Header (weit weg von «Speichern»)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          style={{ minHeight: touch.min, justifyContent: 'center' }}
        >
          <Text style={{ color: colors.primary, fontSize: fontSizes.body }}>Abbrechen</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  function handleSave() {
    if (nameError) {
      setTouched(true);
      return;
    }
    const data = {
      name: name.trim(),
      // Platzhalter-Werte bis die restlichen Felder gebaut sind
      kategorie: editing?.kategorie ?? 'andere',
      ruhe: editing?.ruhe ?? 3,
      gesamt: editing?.gesamt ?? 3,
      wlan: editing?.wlan ?? false,
      steckdosen: editing?.steckdosen ?? false,
      oeffnungszeiten: editing?.oeffnungszeiten ?? '',
      notiz: editing?.notiz ?? '',
      lat: editing?.lat ?? null,
      lng: editing?.lng ?? null,
    };
    if (editing) updateSpot(editing.id, data);
    else addSpot(data);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name *</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        onBlur={() => setTouched(true)}
        placeholder="z. B. Stadtbibliothek"
        style={[styles.input, touched && nameError && styles.inputError]}
        maxLength={80}
        accessibilityLabel="Name des Spots"
      />
      {touched && nameError ? <Text style={styles.error}>⚠ {nameError}</Text> : null}

      <Text style={styles.todo}>Weitere Felder folgen gemäss Mockup S2.</Text>

      <PrimaryButton
        title="Speichern"
        onPress={handleSave}
        disabled={!!nameError}
        style={{ marginTop: spacing.l }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.m },
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
  todo: { color: colors.textMuted, fontStyle: 'italic', marginTop: spacing.l },
});
