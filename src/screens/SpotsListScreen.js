import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '../context/AppContext';
import SpotListItem from '../components/SpotListItem';
import FilterChips from '../components/FilterChips';
import PrimaryButton from '../components/PrimaryButton';
import useTheme from '../hooks/useTheme';
import { useLocation } from '../hooks/useLocation';
import { filterSpots } from '../utils/filterSpots';
import { sortSpots } from '../utils/sortSpots';
import { distanceToSpot } from '../utils/distance';
import { radius, spacing, touch } from '../theme';

// S1 · Spots (Startscreen)
// Suchfeld (Name) und Filter-Chips wirken zusammen; die Chips werden im AppContext gespeichert,
// der Suchtext nicht. Tap → Detail, FAB → Formular (Modal).
// Sortierung gemäss Einstellung; ohne Standort alphabetisch. Die Liste ist schon während der
// Standortsuche sichtbar und sortiert sich neu, sobald die Position da ist.
export default function SpotsListScreen({ navigation }) {
  const { colors, fontSizes, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  const { spots, loading, filter, updateFilter, settings } = useApp();
  const { coords, status } = useLocation();
  const [query, setQuery] = useState('');

  // Zuerst filtern (weniger zu sortieren), dann sortieren
  const visible = useMemo(
    () => sortSpots(filterSpots(spots, { query, filter }), coords, settings.sortierung),
    [spots, query, filter, coords, settings.sortierung]
  );
  const locating = status === 'loading' && !coords;
  const ohneStandort = !coords && (status === 'denied' || status === 'error');

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

          <View style={styles.countRow}>
            <Text style={styles.count} accessibilityLiveRegion="polite">
              {visible.length === 1 ? '1 Spot' : `${visible.length} Spots`}
            </Text>
            {locating ? (
              <View style={styles.status}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.statusText}>Standort wird ermittelt …</Text>
              </View>
            ) : ohneStandort ? (
              <Text style={styles.statusText}>Ohne Standort – alphabetisch sortiert</Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <SpotListItem
            spot={item}
            distance={distanceToSpot(coords, item)}
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
    countRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.s,
      paddingHorizontal: spacing.m,
      paddingBottom: spacing.s,
    },
    count: { fontSize: fontSizes.small, color: colors.textMuted },
    status: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    statusText: { fontSize: fontSizes.small, color: colors.textMuted },

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
