import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

// Einstiegspunkt der App:
// - SafeAreaProvider: Notch / Statusbar / Home-Indicator berücksichtigen
// - AppProvider: lädt Spots + Einstellungen aus AsyncStorage und stellt sie allen Screens bereit
// - NavigationContainer: Wurzel für React Navigation
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
