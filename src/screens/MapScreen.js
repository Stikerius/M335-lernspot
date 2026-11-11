import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';

import { useApp } from '../context/AppContext';
import { useLocation } from '../hooks/useLocation';
import PrimaryButton from '../components/PrimaryButton';
import SpotInfoCard from '../components/SpotInfoCard';
import { distanceToSpot, hasCoords } from '../utils/distance';
import { filterByRadius, radiusLabel } from '../utils/filterSpots';
import { isOnline } from '../utils/network';
import useTheme from '../hooks/useTheme';
import { radius, spacing, touch } from '../theme';

// S3 · Karte (Special Feature GPS)
// Alle Spots als Pins, eigener Standort als «Du», Zentrier-Button 48 × 48,
// Tipp auf Pin → Infokarte unten → «Details ›» → S4.
// Von S4 kommt optional der Parameter focusSpotId: Karte zentriert auf diesen Spot und öffnet die Infokarte.
// Mit Standort zeigt die Karte nur Spots im Suchradius aus den Einstellungen, ohne Standort alle.
// Sonderzustände: Laden, Standort aus (Berechtigung/Dienste), Standortfehler, kein Netz,
// keine Spots mit Standort, keine Spots im Radius.

// Fallback, wenn weder Standort noch Spots mit Koordinaten vorhanden sind (Winterthur)
const FALLBACK_REGION = { latitude: 47.4997, longitude: 8.7241, latitudeDelta: 0.05, longitudeDelta: 0.05 };
const USER_DELTA = 0.02;
const METER_PRO_GRAD = 111320;

// «Ohne Standort weiter» gilt für die ganze App-Sitzung, auch wenn der Tab neu aufgebaut wird
let standortHinweisAusgeblendet = false;

function regionForSpot(spot) {
  return { latitude: spot.lat, longitude: spot.lng, latitudeDelta: USER_DELTA / 2, longitudeDelta: USER_DELTA / 2 };
}

// Ausschnitt um den Standort, gross genug, dass der ganze Suchradius sichtbar ist
function regionAround(coords, radius) {
  const delta = radius ? Math.max(USER_DELTA, (radius * 2.4) / METER_PRO_GRAD) : USER_DELTA;
  return { latitude: coords.lat, longitude: coords.lng, latitudeDelta: delta, longitudeDelta: delta };
}

// Startausschnitt so wählen, dass alle Spots sichtbar sind
function regionForSpots(spots) {
  if (spots.length === 0) return FALLBACK_REGION;
  const lats = spots.map((s) => s.lat);
  const lngs = spots.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, USER_DELTA),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, USER_DELTA),
  };
}

// Eigener Standort als blauer Punkt mit Beschriftung «Du» (Info nie nur über Farbe)
function UserMarker({ coords }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  // Android zeichnet eigene Marker-Views nur, solange tracksViewChanges aktiv ist.
  // Nach dem ersten Zeichnen ausschalten, sonst ruckelt die Karte.
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setTracks(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Marker
      coordinate={{ latitude: coords.lat, longitude: coords.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracks}
      zIndex={1000}
      accessibilityLabel="Dein Standort"
    >
      <View style={styles.userMarker}>
        <View style={styles.userDot} />
        <Text style={styles.userLabel}>Du</Text>
      </View>
    </Marker>
  );
}

export default function MapScreen({ navigation, route }) {
  const { colors, fontSizes } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontSizes), [colors, fontSizes]);
  const { spots, loading, settings } = useApp();
  const { coords, status, error, servicesOff, refresh } = useLocation();
  const mapRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [online, setOnline] = useState(true);
  const [checkingNet, setCheckingNet] = useState(false);
  const [hinweisAus, setHinweisAus] = useState(standortHinweisAusgeblendet);
  const userMoved = useRef(false);
  const centeredOnce = useRef(false);

  const spotsWithCoords = useMemo(() => spots.filter(hasCoords), [spots]);
  const missingCoords = spots.length - spotsWithCoords.length;
  const focusSpotId = route.params?.focusSpotId;
  // Startausschnitt nur einmal nach dem Laden festlegen, danach bestimmt der Nutzer.
  // Kommt der erste Aufruf von S4, gleich auf den Spot starten statt erst alle Spots zu zeigen.
  const initialRegion = useRef(null);
  if (!initialRegion.current && !loading) {
    const focus = spotsWithCoords.find((s) => s.id === focusSpotId);
    initialRegion.current = focus ? regionForSpot(focus) : regionForSpots(spotsWithCoords);
  }

  // Radius nur mit gültigem Standort anwenden, sonst würde die Karte grundlos leer
  const suchradius = settings.suchradius ?? null;
  const radiusActive = status === 'ready' && !!coords && suchradius != null;
  const visibleSpots = useMemo(
    () => (radiusActive ? filterByRadius(spotsWithCoords, coords, suchradius) : spotsWithCoords),
    [radiusActive, spotsWithCoords, coords, suchradius]
  );

  // Gelöschte Spots: Infokarte nicht mehr anzeigen. Der gewählte Spot bleibt sichtbar,
  // auch wenn er ausserhalb des Radius liegt (z. B. von S4 aus «auf Karte» geöffnet).
  const selected = spotsWithCoords.find((s) => s.id === selectedId) ?? null;
  const pins = selected && !visibleSpots.includes(selected) ? [...visibleSpots, selected] : visibleSpots;

  const checkNetwork = useCallback(async () => {
    setCheckingNet(true);
    setOnline(await isOnline());
    setCheckingNet(false);
  }, []);

  // Netz bei jedem Wechsel auf den Tab prüfen
  useFocusEffect(
    useCallback(() => {
      checkNetwork();
    }, [checkNetwork])
  );

  // Zurück aus den System-Einstellungen: Berechtigung neu prüfen
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && (status === 'denied' || status === 'error')) refresh();
    });
    return () => sub.remove();
  }, [status, refresh]);

  const centerOnUser = useCallback(() => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion(regionAround(coords, suchradius), 500);
  }, [coords, suchradius]);

  // Einmal automatisch zentrieren, sobald der Standort da ist – aber nur,
  // wenn der Nutzer die Karte noch nicht selbst verschoben hat (Steuerbarkeit)
  useEffect(() => {
    if (status === 'ready' && coords && !centeredOnce.current && !userMoved.current) {
      centeredOnce.current = true;
      centerOnUser();
    }
  }, [status, coords, centerOnUser]);

  // Fokus von S4: zentrieren, Infokarte öffnen und Parameter zurücksetzen,
  // damit ein späterer Tab-Wechsel nicht wieder auf denselben Spot springt
  useEffect(() => {
    if (!focusSpotId || loading) return;
    const spot = spotsWithCoords.find((s) => s.id === focusSpotId);
    if (spot) {
      // Automatisches Zentrieren auf «Du» darf den Fokus nicht überschreiben
      userMoved.current = true;
      centeredOnce.current = true;
      setSelectedId(spot.id);
      mapRef.current?.animateToRegion(regionForSpot(spot), 500);
    }
    navigation.setParams({ focusSpotId: undefined });
  }, [focusSpotId, loading, spotsWithCoords, navigation]);

  const onCenterPress = () => {
    if (status === 'ready' && coords) centerOnUser();
    else refresh();
  };

  const onMapPress = (e) => {
    // Android meldet den Tipp auf einen Pin zusätzlich als Karten-Tipp
    if (e?.nativeEvent?.action === 'marker-press') return;
    setSelectedId(null);
  };

  const ohneStandortWeiter = () => {
    standortHinweisAusgeblendet = true;
    setHinweisAus(true);
  };

  const openDetails = () => {
    if (selected) navigation.navigate('SpotDetail', { spotId: selected.id });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>Spots werden geladen …</Text>
      </View>
    );
  }

  const distance = selected ? distanceToSpot(coords, selected) : null;
  const locating = status === 'loading';
  // Berechtigung verweigert und ausgeschaltete Standortdienste haben dieselbe Lösung (Einstellungen)
  const standortAus = status === 'denied' || (status === 'error' && servicesOff);
  const radiusText = radiusLabel(suchradius);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion.current}
        onPress={onMapPress}
        onPanDrag={() => {
          userMoved.current = true;
        }}
        // Eigener «Du»-Marker und eigener Zentrier-Button statt der nativen Varianten
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        accessibilityLabel="Karte mit allen Spots"
      >
        {pins.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.lat, longitude: spot.lng }}
            pinColor={spot.id === selectedId ? colors.danger : colors.primary}
            onPress={(e) => {
              e.stopPropagation?.();
              setSelectedId(spot.id);
            }}
            accessibilityLabel={spot.name}
          />
        ))}
        {coords ? <UserMarker coords={coords} /> : null}
      </MapView>

      {/* Hinweise oben: ersetzen nichts, die Pins bleiben sichtbar (keine Sackgasse) */}
      <View style={styles.banners} pointerEvents="box-none">
        {standortAus && !hinweisAus ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>⚠ Standort ist ausgeschaltet</Text>
            <Text style={styles.bannerText}>
              {status === 'denied'
                ? 'LernSpots darf deinen Standort nicht verwenden.'
                : 'Die Standortdienste deines Geräts sind ausgeschaltet.'}{' '}
              Alle Spots werden angezeigt, aber «Du», die Distanzen und der Suchradius fehlen.
            </Text>
            <View style={styles.bannerRow}>
              <PrimaryButton
                title="Einstellungen öffnen"
                onPress={() => Linking.openSettings()}
                style={[styles.bannerButton, styles.flex]}
              />
              <PrimaryButton
                title="Ohne Standort weiter"
                variant="secondary"
                onPress={ohneStandortWeiter}
                style={[styles.bannerButton, styles.flex]}
              />
            </View>
          </View>
        ) : null}

        {status === 'error' && !servicesOff ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>⚠ Standort nicht verfügbar</Text>
            <Text style={styles.bannerText}>{error}</Text>
            <PrimaryButton title="Erneut versuchen" variant="secondary" onPress={refresh} style={styles.bannerButton} />
          </View>
        ) : null}

        {!online ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>⚠ Kein Netz</Text>
            <Text style={styles.bannerText}>
              Kartenbild kann nicht geladen werden. Deine Spots sind lokal gespeichert.
            </Text>
            <View style={styles.bannerRow}>
              <PrimaryButton
                title="Liste anzeigen"
                onPress={() => navigation.navigate('Spots')}
                style={[styles.bannerButton, styles.flex]}
              />
              <PrimaryButton
                title={checkingNet ? 'Prüfe …' : 'Erneut prüfen'}
                variant="secondary"
                disabled={checkingNet}
                onPress={checkNetwork}
                style={[styles.bannerButton, styles.flex]}
              />
            </View>
          </View>
        ) : null}

        {locating ? (
          <View style={styles.pill}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.pillText}>Standort wird ermittelt …</Text>
          </View>
        ) : null}

        {spotsWithCoords.length === 0 ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Noch keine Spots auf der Karte</Text>
            <Text style={styles.bannerText}>
              {spots.length === 0
                ? 'Erfasse deinen ersten Lernort, er erscheint dann hier als Pin.'
                : 'Deine Spots haben keinen Standort gespeichert. Du findest sie in der Liste.'}
            </Text>
            <PrimaryButton title="Liste anzeigen" variant="secondary" onPress={() => navigation.navigate('Spots')} style={styles.bannerButton} />
          </View>
        ) : radiusActive && visibleSpots.length === 0 && !selected ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Keine Spots im Umkreis von {radiusText}</Text>
            <Text style={styles.bannerText}>
              In deiner Nähe ist noch kein Spot gespeichert. Vergrössere den Suchradius, um weiter entfernte Spots zu sehen.
            </Text>
            <PrimaryButton
              title="Radius ändern"
              variant="secondary"
              onPress={() => navigation.navigate('Settings')}
              style={styles.bannerButton}
            />
          </View>
        ) : radiusActive ? (
          <View style={styles.pill} accessibilityLiveRegion="polite">
            <Text style={styles.pillText}>
              {visibleSpots.length === 1 ? '1 Spot' : `${visibleSpots.length} Spots`} im Umkreis von {radiusText}
            </Text>
          </View>
        ) : missingCoords > 0 && !selected ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {missingCoords === 1 ? '1 Spot hat' : `${missingCoords} Spots haben`} keinen Standort und fehlt auf der Karte.
            </Text>
          </View>
        ) : null}
      </View>

      {/* Unten im Daumenbereich: Zentrier-Button rechts, darunter die Infokarte */}
      <View style={styles.bottom} pointerEvents="box-none">
        <Pressable
          onPress={onCenterPress}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel={status === 'ready' ? 'Karte auf meinen Standort zentrieren' : 'Standort erneut ermitteln'}
          accessibilityState={{ disabled: locating, busy: locating }}
          style={({ pressed }) => [styles.centerButton, pressed && styles.pressed]}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Text style={styles.centerIcon}>◎</Text>
              <Text style={styles.centerLabel}>Du</Text>
            </>
          )}
        </Pressable>

        {selected ? (
          <SpotInfoCard
            spot={selected}
            distance={distance}
            onDetails={openDetails}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors, fontSizes) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    centerText: { marginTop: spacing.s, fontSize: fontSizes.body, color: colors.textMuted },
    flex: { flex: 1 },

    banners: { position: 'absolute', top: spacing.s, left: spacing.s, right: spacing.s, gap: spacing.s },
    banner: {
      backgroundColor: colors.surface,
      borderRadius: radius.l,
      padding: spacing.m,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 4,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    bannerTitle: { fontSize: fontSizes.body, fontWeight: 'bold', color: colors.text },
    bannerText: { fontSize: fontSizes.small, color: colors.textMuted, marginTop: spacing.xs },
    bannerRow: { flexDirection: 'row', gap: spacing.s },
    bannerButton: { marginTop: spacing.s },
    pill: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s,
      backgroundColor: colors.surface,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
      elevation: 3,
    },
    pillText: { fontSize: fontSizes.small, color: colors.text },

    bottom: { position: 'absolute', left: spacing.m, right: spacing.m, bottom: spacing.m, gap: spacing.s },
    centerButton: {
      alignSelf: 'flex-end',
      minWidth: touch.min,
      minHeight: touch.min,
      borderRadius: radius.m,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    pressed: { backgroundColor: colors.primaryLight },
    centerIcon: { fontSize: fontSizes.title, color: colors.primary, lineHeight: fontSizes.title + 2 },
    centerLabel: { fontSize: fontSizes.small, color: colors.primary, fontWeight: 'bold', lineHeight: fontSizes.small + 2 },

    userMarker: { alignItems: 'center' },
    userDot: {
      width: spacing.m,
      height: spacing.m,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      borderWidth: 3,
      borderColor: colors.surface,
    },
    userLabel: {
      marginTop: spacing.xs / 2,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.s,
      overflow: 'hidden',
      backgroundColor: colors.primary,
      color: colors.surface,
      fontSize: fontSizes.small,
      fontWeight: 'bold',
    },
  });
