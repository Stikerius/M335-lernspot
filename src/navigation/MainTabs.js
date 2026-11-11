import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SpotsListScreen from '../screens/SpotsListScreen';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';
import useTheme from '../hooks/useTheme';
import { touch } from '../theme';

const Tab = createBottomTabNavigator();

// Einfache Text-Icons, damit keine zusätzliche Icon-Library nötig ist.
// Kann später durch @expo/vector-icons ersetzt werden.
function TabIcon({ symbol, color }) {
  const { fontSizes } = useTheme();
  return <Text style={{ fontSize: fontSizes.title, color }}>{symbol}</Text>;
}

export default function MainTabs() {
  const { colors, fontSizes } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        // Tab-Bar mind. 56 dp hoch (Touch-Target, siehe Konzept)
        tabBarStyle: { minHeight: touch.tabBar },
        tabBarLabelStyle: { fontSize: fontSizes.small },
        headerTitleStyle: { color: colors.text, fontSize: fontSizes.body },
      }}
    >
      <Tab.Screen
        name="Spots"
        component={SpotsListScreen}
        options={{
          title: 'LernSpots',
          tabBarLabel: 'Spots',
          tabBarIcon: ({ color }) => <TabIcon symbol="📍" color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Karte',
          tabBarLabel: 'Karte',
          tabBarIcon: ({ color }) => <TabIcon symbol="🗺" color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Einstellungen',
          tabBarLabel: 'Einstellungen',
          tabBarIcon: ({ color }) => <TabIcon symbol="⚙" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
