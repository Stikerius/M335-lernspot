import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategory } from '../data/categories';
import { formatDistance } from '../utils/distance';
import useTheme from '../hooks/useTheme';
import { radius, spacing, touch } from '../theme';

// Eine Zeile in der Spot-Liste (S1). Ganze Zeile antippbar, 72 dp hoch.
// distance in Metern; ohne Standort (null) wird keine Distanz angezeigt.
export default function SpotListItem({ spot, distance = null, onPress }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  const cat = getCategory(spot.kategorie);
  const distanzText = distance != null ? `${formatDistance(distance)} entfernt` : null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={distanzText ? `${spot.name}, ${distanzText}, öffnen` : `${spot.name} öffnen`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.thumb}>
        <Text style={styles.icon}>{cat.icon}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={1}>
          {spot.favorit ? '★ ' : ''}{spot.name}
        </Text>
        {distanzText ? (
          <Text style={styles.distance} numberOfLines={1}>
            {distanzText}
          </Text>
        ) : null}
        <Text style={styles.meta} numberOfLines={1}>
          Ruhe {'★'.repeat(spot.ruhe)}{'☆'.repeat(5 - spot.ruhe)}
          {spot.wlan ? ' · 📶' : ''}
          {spot.steckdosen ? ' · 🔌' : ''}
        </Text>
        {spot.oeffnungszeiten?.trim() ? (
          <Text style={styles.meta} numberOfLines={1}>
            🕐 {spot.oeffnungszeiten}
          </Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
    row: {
      minHeight: touch.listItem,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.m,
      backgroundColor: colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    pressed: { backgroundColor: colors.primaryLight },
    thumb: {
      width: 44,
      height: 44,
      borderRadius: radius.m,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.m,
    },
    icon: { fontSize: fontSizes.title },
    texts: { flex: 1 },
    name: { fontSize: fontSizes.body, fontWeight: 'bold', color: colors.text },
    distance: { fontSize: fontSizes.small, color: colors.primary, fontWeight: 'bold', marginTop: 2 },
    meta: { fontSize: fontSizes.small, color: colors.textMuted, marginTop: 2 },
    chevron: { fontSize: fontSizes.large, color: colors.textMuted, marginLeft: spacing.s },
  });
