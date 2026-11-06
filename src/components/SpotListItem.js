import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategory } from '../data/categories';
import useTheme from '../hooks/useTheme';
import { fontSizes, radius, spacing, touch } from '../theme';

// Eine Zeile in der Spot-Liste (S1). Ganze Zeile antippbar, 72 dp hoch.
// TODO (Mockup S1): Distanz und Öffnungszeit ergänzen, sobald Standort verfügbar ist.
export default function SpotListItem({ spot, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const cat = getCategory(spot.kategorie);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${spot.name} öffnen`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.thumb}>
        <Text style={styles.icon}>{cat.icon}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={1}>
          {spot.favorit ? '★ ' : ''}{spot.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          Ruhe {'★'.repeat(spot.ruhe)}{'☆'.repeat(5 - spot.ruhe)}
          {spot.wlan ? ' · 📶' : ''}
          {spot.steckdosen ? ' · 🔌' : ''}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const makeStyles = (colors) =>
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
    icon: { fontSize: 22 },
    texts: { flex: 1 },
    name: { fontSize: fontSizes.body, fontWeight: 'bold', color: colors.text },
    meta: { fontSize: fontSizes.small, color: colors.textMuted, marginTop: 2 },
    chevron: { fontSize: 24, color: colors.textMuted, marginLeft: spacing.s },
  });
