import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import useTheme from '../hooks/useTheme';
import { fontSizes, spacing, touch } from '../theme';

// Sterne-Auswahl von 1 bis 5. Jeder Stern ist eine 48 × 48 dp Tap-Fläche mit 8 dp Abstand.
// Der Wert steht zusätzlich als Text da («3 von 5»), damit er nicht nur an den Sternen abzulesen ist.
export default function StarRating({ label, value, onChange }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value} von 5</Text>
      </View>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${n} von 5 Sternen`}
            accessibilityState={{ selected: n === value }}
            style={({ pressed }) => [styles.star, pressed && styles.pressed]}
          >
            <Text style={n <= value ? styles.starFilled : styles.starEmpty}>{n <= value ? '★' : '☆'}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
    label: { fontSize: fontSizes.small, color: colors.textMuted },
    value: { fontSize: fontSizes.small, color: colors.textMuted },
    stars: { flexDirection: 'row', gap: spacing.s },
    star: { width: touch.min, height: touch.min, alignItems: 'center', justifyContent: 'center' },
    starFilled: { fontSize: fontSizes.large, color: colors.star },
    starEmpty: { fontSize: fontSizes.large, color: colors.textMuted },
    pressed: { opacity: 0.7 },
  });
