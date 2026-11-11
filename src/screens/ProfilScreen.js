import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import useTheme from '../hooks/useTheme';

function Statistik({ zahl, label }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  return (
    <View style={styles.statistik}>
      <Text style={styles.zahl}>{zahl}</Text>
      <Text style={styles.statistikLabel}>{label}</Text>
    </View>
  );
}

function ProfilKarte({ bild, name, rolle, beschreibung, beitraege, follower, folgt }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  return (
    <View style={styles.karte}>
      <Image source={{ uri: bild }} style={styles.bild} accessibilityLabel={`Profilbild von ${name}`} />
      <Text style={styles.name}>{name}</Text>
      <View style={styles.statistikZeile}>
        <Statistik zahl={beitraege} label="Beiträge" />
        <Statistik zahl={follower} label="Follower" />
        <Statistik zahl={folgt} label="Folgt" />
      </View>
      <Text style={styles.rolle}>{rolle}</Text>
      <Text style={styles.beschreibung}>{beschreibung}</Text>
    </View>
  );
}

// Tag-1-Aufgabe: noch nicht in die Navigation eingebunden
export default function ProfilScreen() {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inhalt}>
      <ProfilKarte
        bild="https://picsum.photos/150"
        name="Jannis Lüthi"
        rolle="Lernender Modul 335"
        beschreibung="Ich baue gerade meine erste React Native App und lerne Schritt für Schritt dazu."
        beitraege={12}
        follower={48}
        folgt={35}
      />
      <ProfilKarte
        bild="https://picsum.photos/seed/lernspot/150"
        name="Lea Muster"
        rolle="Beispielprofil"
        beschreibung="Lernt am liebsten in ruhigen Bibliotheken und teilt dort ihre besten Lernorte."
        beitraege={27}
        follower={130}
        folgt={84}
      />
    </ScrollView>
  );
}

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Flexbox: flexGrow füllt die Höhe, justifyContent und alignItems zentrieren die Karten
    inhalt: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 64,
      gap: 24,
    },
    karte: {
      width: '90%',
      alignItems: 'center',
      padding: 24,
      borderRadius: 16,
      backgroundColor: colors.surface,
      // Schatten für iOS
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      // Schatten für Android
      elevation: 5,
    },
    // Rundes Bild: borderRadius ist die halbe Breite und Höhe
    bild: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 16,
    },
    name: {
      fontSize: fontSizes.large,
      fontWeight: 'bold',
      color: colors.text,
    },
    // Flexbox: Die drei Zahlen stehen nebeneinander mit gleichmässigem Abstand
    statistikZeile: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignSelf: 'stretch',
      marginVertical: 16,
    },
    statistik: {
      alignItems: 'center',
    },
    zahl: {
      fontSize: fontSizes.title,
      fontWeight: 'bold',
      color: colors.text,
    },
    statistikLabel: {
      fontSize: fontSizes.small,
      color: colors.textMuted,
    },
    rolle: {
      fontSize: fontSizes.body,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 8,
    },
    beschreibung: {
      fontSize: fontSizes.body,
      lineHeight: 24,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
