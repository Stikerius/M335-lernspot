import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import SpotListItem from '../components/SpotListItem';
import useTheme from '../hooks/useTheme';
import { fontSizes, radius, spacing, touch } from '../theme';

// S1 · Spots (Startscreen)
// Grundgerüst: Liste aus AsyncStorage, Tap → Detail, FAB → Formular (Modal).
// TODO (Mockup S1):
//  - Sortierung nach Distanz (expo-location + utils/distance.js), Fallback alphabetisch
//  - Filter-Chips (Alle / Steckdose / Ruhig / Favoriten), Filter in AsyncStorage merken
//  - Leer-Zustand «Kein Spot passt zum Filter» mit «Filter zurücksetzen»
export default function SpotsListScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { spots, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={spots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SpotListItem
            spot={item}
            onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Noch keine Spots gespeichert.{'\n'}Tippe auf «＋ Spot», um deinen ersten Lernort zu erfassen.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: touch.fab + spacing.xl }}
      />

      {/* FAB: Hauptaktion unten rechts im Daumenbereich, 56 dp */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => navigation.navigate('SpotForm')}
        accessibilityRole="button"
        accessibilityLabel="Neuen Spot hinzufügen"
      >
        <Text style={styles.fabLabel}>＋ Spot</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: fontSizes.body,
      padding: spacing.xl,
    },
    fab: {
      position: 'absolute',
      right: spacing.m,
      bottom: spacing.m,
      height: touch.fab,
      paddingHorizontal: spacing.l,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      // Schatten iOS + Android
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    fabLabel: { color: colors.onPrimary, fontSize: fontSizes.body, fontWeight: 'bold' },
  });
