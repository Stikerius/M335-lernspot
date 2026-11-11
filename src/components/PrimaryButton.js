import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import useTheme from '../hooks/useTheme';
import { radius, spacing, touch } from '../theme';

// Wiederverwendbarer Button, garantiert min. 48 dp Höhe.
// variant: 'primary' | 'secondary' | 'danger'
export default function PrimaryButton({ title, onPress, variant = 'primary', disabled = false, style }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed, // visuelles Feedback
        style,
      ]}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{title}</Text>
    </Pressable>
  );
}

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
    base: {
      minHeight: touch.min,
      borderRadius: radius.m,
      paddingHorizontal: spacing.m,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: colors.primary },
    secondary: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface },
    danger: { borderWidth: 1.5, borderColor: colors.danger, backgroundColor: colors.surface },
    disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
    pressed: { opacity: 0.7 },
    label: { fontSize: fontSizes.body, fontWeight: 'bold' },
    primaryLabel: { color: colors.onPrimary },
    secondaryLabel: { color: colors.primary },
    dangerLabel: { color: colors.danger },
  });
