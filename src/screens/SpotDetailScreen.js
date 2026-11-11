import { useLayoutEffect, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { useApp } from '../context/AppContext';
import { getCategory } from '../data/categories';
import PrimaryButton from '../components/PrimaryButton';
import useTheme from '../hooks/useTheme';
import { useLocation } from '../hooks/useLocation';
import { distanceToSpot, formatDistance, hasCoords } from '../utils/distance';
import { radius, sizes, spacing, touch } from '../theme';

// S4 · Detail (Stack)
// Daten anzeigen, Distanz zum Standort, Mini-Karte (Tap → Karte zentriert auf den Spot),
// Favorit, Bearbeiten (Modal), Löschen mit Bestätigung.
// TODO (Mockup S4):
//  - «🧭 Route starten» → Linking.openURL (Google Maps Android / Apple Maps iOS)
//  - Toast «Zu Favoriten hinzugefügt»

// Ausschnitt der Mini-Karte, ca. 500 m rund um den Spot
const MINI_DELTA = 0.005;

export default function SpotDetailScreen({ navigation, route }) {
  const { colors, fontSizes, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  const { getSpot, deleteSpot, toggleFavorite } = useApp();
  const { coords } = useLocation();
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
          <Text style={{ fontSize: fontSizes.title, color: colors.star }}>{spot.favorit ? '★' : '☆'}</Text>
        </Pressable>
      ),
    });
  }, [navigation, spot, toggleFavorite, colors, fontSizes]);

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
  const distance = distanceToSpot(coords, spot);
  const editSpot = () => navigation.navigate('SpotForm', { spotId: spot.id });
  // Über den Tab-Navigator zur Karte; MapScreen zentriert auf focusSpotId und setzt ihn zurück
  const showOnMap = () => navigation.navigate('MainTabs', { screen: 'Map', params: { focusSpotId: spot.id } });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {distance != null ? <Text style={styles.distance}>{formatDistance(distance)} entfernt</Text> : null}

      <Row label="Kategorie" value={`${cat.icon} ${cat.label}`} />
      <Row label="Ruhe" value={stars(spot.ruhe)} />
      <Row label="Gesamt" value={stars(spot.gesamt)} />
      <Row label="WLAN / Steckdosen" value={`${spot.wlan ? 'Ja' : 'Nein'} / ${spot.steckdosen ? 'Ja' : 'Nein'}`} />
      <Row label="Öffnungszeiten" value={spot.oeffnungszeiten || '–'} />
      <Row label="Notiz" value={spot.notiz || '–'} />

      {hasCoords(spot) ? (
        <View style={styles.mapSection}>
          <Pressable
            onPress={showOnMap}
            accessibilityRole="button"
            accessibilityLabel={`${spot.name} auf der Karte anzeigen`}
            style={({ pressed }) => [styles.miniMap, pressed && styles.pressed]}
          >
            {/* Karte nimmt keine Gesten an, damit der Tipp beim Pressable ankommt und die Seite scrollt */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={{ latitude: spot.lat, longitude: spot.lng, latitudeDelta: MINI_DELTA, longitudeDelta: MINI_DELTA }}
                liteMode
                scrollEnabled={false}
                zoomEnabled={false}
                zoomTapEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                toolbarEnabled={false}
                showsUserLocation={false}
                userInterfaceStyle={isDark ? 'dark' : 'light'}
                accessible={false}
              >
                <Marker coordinate={{ latitude: spot.lat, longitude: spot.lng }} pinColor={colors.primary} />
              </MapView>
            </View>
          </Pressable>
          <Text style={styles.mapCaption}>Karte zeigt den gespeicherten Ort</Text>
        </View>
      ) : (
        <View style={styles.noLocation}>
          <Text style={styles.noLocationText}>📍 Für diesen Spot ist kein Standort gespeichert.</Text>
          <PrimaryButton title="✎ Bearbeiten" variant="secondary" onPress={editSpot} style={styles.noLocationButton} />
        </View>
      )}

      <View style={styles.actions}>
        <PrimaryButton title="✎ Bearbeiten" variant="secondary" style={styles.action} onPress={editSpot} />
        <PrimaryButton title="🗑 Löschen" variant="danger" style={styles.action} onPress={confirmDelete} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { padding: spacing.m },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
    distance: { fontSize: fontSizes.body, fontWeight: 'bold', color: colors.primary, marginBottom: spacing.s },
    mapSection: { marginTop: spacing.l },
    miniMap: {
      height: sizes.miniMap,
      borderRadius: radius.l,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    pressed: { opacity: 0.7 },
    mapCaption: { fontSize: fontSizes.small, color: colors.textMuted, marginTop: spacing.xs },
    noLocation: {
      marginTop: spacing.l,
      padding: spacing.m,
      borderRadius: radius.l,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    noLocationText: { fontSize: fontSizes.body, color: colors.text },
    noLocationButton: { marginTop: spacing.s },
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
