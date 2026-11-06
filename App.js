import { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from './src/context/AppContext';
import useTheme from './src/hooks/useTheme';
import RootNavigator from './src/navigation/RootNavigator';

// Navigation und Statusleiste folgen der Einstellung «Dunkles Design».
// Muss innerhalb von AppProvider stehen, weil useTheme die Einstellungen liest.
function ThemedNavigation() {
  const { colors, isDark } = useTheme();
  const navigationTheme = useMemo(() => {
    const basis = isDark ? DarkTheme : DefaultTheme;
    return {
      ...basis,
      colors: {
        ...basis.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, isDark]);

  return (
    <>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

// Einstiegspunkt der App:
// - SafeAreaProvider: Notch / Statusbar / Home-Indicator berücksichtigen
// - AppProvider: lädt Spots + Einstellungen aus AsyncStorage und stellt sie allen Screens bereit
// - ThemedNavigation: NavigationContainer (Wurzel für React Navigation) mit Farben und Statusleiste
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemedNavigation />
      </AppProvider>
    </SafeAreaProvider>
  );
}
