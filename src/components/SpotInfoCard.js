import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from './PrimaryButton';
import { getCategory } from '../data/categories';
import { formatDistance } from '../utils/distance';
import useTheme from '../hooks/useTheme';
import { radius, spacing, touch } from '../theme';

// Infokarte unten auf der Karte (S3) nach Tap auf einen Pin.
// Zeigt dieselben Kurzinfos wie die Listenzeile, «Details ›» über die ganze Breite.
export default function SpotInfoCard({ spot, distance, onDetails, onClose }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  const cat = getCategory(spot.kategorie);
  const ruhe = '★'.repeat(spot.ruhe) + '☆'.repeat(5 - spot.ruhe);
  const ausstattung = [spot.wlan && '📶 WLAN', spot.steckdosen && '🔌 Steckdose'].filter(Boolean).join(' · ');

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.header}>
        <View style={styles.thumb}>
          <Text style={styles.icon}>{cat.icon}</Text>
        </View>
        <View style={styles.texts}>
          <Text style={styles.name} numberOfLines={1}>
            {spot.favorit ? '★ ' : ''}{spot.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {formatDistance(distance)} · Ruhe {ruhe}
          </Text>
          {(ausstattung || spot.oeffnungszeiten) ? (
            <Text style={styles.meta} numberOfLines={1}>
              {[ausstattung, spot.oeffnungszeiten && `🕐 ${spot.oeffnungszeiten}`].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
        {/* Schliessen zusätzlich zum Tipp daneben, damit es auch mit Screenreader geht */}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Infokarte schliessen"
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>
      </View>
      <PrimaryButton title="Details ›" onPress={onDetails} style={styles.details} />
    </View>
  );
}

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.l,
      padding: spacing.m,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 6,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    header: { flexDirection: 'row', alignItems: 'center', minHeight: touch.min },
    thumb: {
      width: touch.min,
      height: touch.min,
      borderRadius: radius.m,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.m,
    },
    icon: { fontSize: fontSizes.large },
    texts: { flex: 1 },
    name: { fontSize: fontSizes.body, fontWeight: 'bold', color: colors.text },
    meta: { fontSize: fontSizes.small, color: colors.textMuted, marginTop: spacing.xs / 2 },
    close: {
      width: touch.min,
      height: touch.min,
      marginLeft: spacing.s,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
    },
    pressed: { backgroundColor: colors.primaryLight },
    closeLabel: { fontSize: fontSizes.title, color: colors.textMuted },
    details: { marginTop: spacing.s },
  });
