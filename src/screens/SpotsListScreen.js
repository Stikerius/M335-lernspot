import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '../context/AppContext';
import SpotListItem from '../components/SpotListItem';
import FilterChips from '../components/FilterChips';
import PrimaryButton from '../components/PrimaryButton';
import useTheme from '../hooks/useTheme';
import { filterSpots } from '../utils/filterSpots';
import { radius, spacing, touch } from '../theme';

// S1 · Spots (Startscreen)
// Suchfeld (Name) und Filter-Chips wirken zusammen; die Chips werden im AppContext gespeichert,
// der Suchtext nicht. Tap → Detail, FAB → Formular (Modal).
// TODO (Mockup S1):
//  - Sortierung nach Distanz (expo-location + utils/distance.js), Fallback alphabetisch
export default function SpotsListScreen({ navigation }) {
  const { colors, fontSizes, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  const { spots, loading, filter, updateFilter } = useApp();
  const [query, setQuery] = useState('');

  // Reihenfolge der Spots bleibt unverändert, gefiltert wird nur
  const visible = useMemo(() => filterSpots(spots, { query, filter }), [spots, query, filter]);

  const resetFilter = () => {
    setQuery('');
    updateFilter([]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const noSpotsAtAll = spots.length === 0;

  return (
    <View style={styles.container}>
      {/* Suche und Chips bleiben beim Scrollen sichtbar */}
      {!noSpotsAtAll ? (
        <View style={styles.header}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon} importantForAccessibility="no">🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Spot suchen, z. B. Bibliothek"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              keyboardAppearance={isDark ? 'dark' : 'light'}
              accessibilityLabel="Spots nach Name suchen"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Suchtext löschen"
                style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
              >
                <Text style={styles.clearLabel}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          <FilterChips value={filter} onChange={updateFilter} />

          <Text style={styles.count} accessibilityLiveRegion="polite">
            {visible.length === 1 ? '1 Spot' : `${visible.length} Spots`}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <SpotListItem
            spot={item}
            onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })}
          />
        )}
        ListEmptyComponent={
          noSpotsAtAll ? (
            <Text style={styles.empty}>
              Noch keine Spots gespeichert.{'\n'}Tippe auf «＋ Spot», um deinen ersten Lernort zu erfassen.
            </Text>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Keine Spots gefunden</Text>
              <Text style={styles.emptyText}>Kein Spot passt zur Suche oder zum Filter.</Text>
              <PrimaryButton title="Filter zurücksetzen" onPress={resetFilter} style={styles.resetButton} />
            </View>
          )
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

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

    header: {
      paddingTop: spacing.s,
      gap: spacing.s,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    searchBox: {
      marginHorizontal: spacing.m,
      minHeight: touch.min,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.m,
      backgroundColor: colors.surface,
      paddingLeft: spacing.m,
    },
    searchIcon: { fontSize: fontSizes.body, marginRight: spacing.s },
    searchInput: {
      flex: 1,
      minHeight: touch.min,
      fontSize: fontSizes.body,
      color: colors.text,
    },
    clearButton: {
      width: touch.min,
      height: touch.min,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.m,
    },
    pressed: { backgroundColor: colors.primaryLight },
    clearLabel: { fontSize: fontSizes.title, color: colors.textMuted },
    count: {
      paddingHorizontal: spacing.m,
      paddingBottom: spacing.s,
      fontSize: fontSizes.small,
      color: colors.textMuted,
    },

    empty: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: fontSizes.body,
      padding: spacing.xl,
    },
    emptyBox: { alignItems: 'center', padding: spacing.xl },
    emptyTitle: { fontSize: fontSizes.title, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
    emptyText: {
      fontSize: fontSizes.body,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.s,
    },
    resetButton: { marginTop: spacing.m, alignSelf: 'stretch' },

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
