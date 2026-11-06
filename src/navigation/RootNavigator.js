import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import SpotDetailScreen from '../screens/SpotDetailScreen';
import SpotFormScreen from '../screens/SpotFormScreen';
import useTheme from '../hooks/useTheme';

// Navigationsstruktur gemäss Workflow-Diagramm im Konzept:
//
//   RootStack (Native Stack)
//   ├── MainTabs  (Bottom Tabs: Spots · Karte · Einstellungen)
//   ├── SpotDetail (Stack push von Spots oder Karte)
//   └── SpotForm   (Modal: Neuer Spot / Spot bearbeiten)
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SpotDetail"
        component={SpotDetailScreen}
        options={{ title: 'Spot', headerBackTitle: 'Spots' }}
      />
      <Stack.Screen
        name="SpotForm"
        component={SpotFormScreen}
        options={({ route }) => ({
          presentation: 'modal',
          title: route.params?.spotId ? 'Spot bearbeiten' : 'Neuer Spot',
        })}
      />
    </Stack.Navigator>
  );
}
