import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import useTheme from '../hooks/useTheme';
import { FILTER_CHIPS, toggleFilter } from '../utils/filterSpots';
import { fontSizes, radius, spacing, touch } from '../theme';

// Horizontale Chip-Leiste der Spot-Liste (S1): Alle · Steckdose · Ruhig · Favoriten.
// Mehrere Chips kombinierbar, «Alle» setzt zurück.
// Aktiv = gefüllt UND mit «✓», damit der Zustand nicht nur über die Farbe erkennbar ist.
function Chip({ label, active, onPress, styles }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter ${label}`}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>
        {active ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

export default function FilterChips({ value, onChange }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      <Chip label="Alle" active={value.length === 0} onPress={() => onChange([])} styles={styles} />
      {FILTER_CHIPS.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          active={value.includes(chip.key)}
          onPress={() => onChange(toggleFilter(value, chip.key))}
          styles={styles}
        />
      ))}
    </ScrollView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    // 8 dp Abstand zwischen den Chips und zum Rand
    row: { paddingHorizontal: spacing.m, gap: spacing.s },
    chip: {
      minHeight: touch.min,
      paddingHorizontal: spacing.m,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    pressed: { opacity: 0.7 },
    label: { fontSize: fontSizes.body, color: colors.text },
    labelActive: { color: colors.onPrimary, fontWeight: 'bold' },
  });
