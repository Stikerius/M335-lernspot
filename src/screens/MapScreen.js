import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { colors, fontSizes, spacing } from '../theme';

// S3 · Karte (Special Feature GPS)
// Grundgerüst: Platzhalter. react-native-maps und expo-location sind bereits installiert.
// TODO (Mockup S3):
//  - <MapView> aus 'react-native-maps' mit <Marker> pro Spot (Icon je Kategorie)
//  - Standortberechtigung mit Location.requestForegroundPermissionsAsync()
//  - eigener Standort (showsUserLocation), Button «◎ Mein Standort» (48 dp)
//  - Tap auf Pin → Infokarte unten → «Details ›» → navigation.navigate('SpotDetail', { spotId })
//  - Lange drücken auf Karte → navigation.navigate('SpotForm', { lat, lng })
//  - Sonderzustände: keine Berechtigung (Banner + «Einstellungen öffnen» via Linking.openSettings()),
//    kein Netz (Hinweis + Link zur Liste), Laden (Spinner)
export default function MapScreen() {
  const { spots } = useApp();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺 Karte</Text>
      <Text style={styles.text}>{spots.length} Spots werden hier als Pins angezeigt.</Text>
      <Text style={styles.todo}>Kommt gemäss Mockup S3.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
    backgroundColor: colors.background,
  },
  title: { fontSize: fontSizes.large, fontWeight: 'bold', color: colors.text, marginBottom: spacing.s },
  text: { fontSize: fontSizes.body, color: colors.text, textAlign: 'center' },
  todo: { color: colors.textMuted, fontStyle: 'italic', marginTop: spacing.m },
});
