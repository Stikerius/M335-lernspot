import { useLayoutEffect, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { getCategory } from '../data/categories';
import PrimaryButton from '../components/PrimaryButton';
import useTheme from '../hooks/useTheme';
import { fontSizes, spacing, touch } from '../theme';

// S4 · Detail (Stack)
// Grundgerüst: Daten anzeigen, Favorit, Bearbeiten (Modal), Löschen mit Bestätigung.
// TODO (Mockup S4):
//  - «🧭 Route starten» → Linking.openURL (Google Maps Android / Apple Maps iOS)
//  - Mini-Karte mit Pin, Tap → Karte zentriert auf Spot
//  - Distanz zum aktuellen Standort
//  - Toast «Zu Favoriten hinzugefügt»
export default function SpotDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { getSpot, deleteSpot, toggleFavorite } = useApp();
  const spot = getSpot(route.params?.spotId);

  useLayoutEffect(() => {
    if (!spot) return;
    navigation.setOptions({
      title: spot.name,
      headerRight: () => (
        <Pressable
          onPress={() => toggleFavorite(spot.id)}
          hitSlop={12}
          style={{ minWidth: touch.min, minHeight: touch.min, alignItems: 'center', justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel={spot.favorit ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        >
          <Text style={{ fontSize: 22, color: colors.star }}>{spot.favorit ? '★' : '☆'}</Text>
        </Pressable>
      ),
    });
  }, [navigation, spot, toggleFavorite, colors]);

  // Spot wurde gelöscht oder existiert nicht (mehr)
  if (!spot) {
    return (
      <View style={styles.center}>
        <Text style={styles.value}>Dieser Spot existiert nicht mehr.</Text>
      </View>
    );
  }

  function confirmDelete() {
    Alert.alert('Spot löschen?', `«${spot.name}» wird endgültig gelöscht.`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
          deleteSpot(spot.id);
        },
      },
    ]);
  }

  const cat = getCategory(spot.kategorie);
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Row label="Kategorie" value={`${cat.icon} ${cat.label}`} />
      <Row label="Ruhe" value={stars(spot.ruhe)} />
      <Row label="Gesamt" value={stars(spot.gesamt)} />
      <Row label="WLAN / Steckdosen" value={`${spot.wlan ? 'Ja' : 'Nein'} / ${spot.steckdosen ? 'Ja' : 'Nein'}`} />
      <Row label="Öffnungszeiten" value={spot.oeffnungszeiten || '–'} />
      <Row label="Notiz" value={spot.notiz || '–'} />

      <View style={styles.actions}>
        <PrimaryButton
          title="✎ Bearbeiten"
          variant="secondary"
          style={styles.action}
          onPress={() => navigation.navigate('SpotForm', { spotId: spot.id })}
        />
        <PrimaryButton title="🗑 Löschen" variant="danger" style={styles.action} onPress={confirmDelete} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { padding: spacing.m },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.s + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    label: { color: colors.textMuted, fontSize: fontSizes.body },
    value: { color: colors.text, fontSize: fontSizes.body, flexShrink: 1, textAlign: 'right', marginLeft: spacing.m },
    actions: { flexDirection: 'row', marginTop: spacing.l, gap: spacing.s },
    action: { flex: 1 },
  });
