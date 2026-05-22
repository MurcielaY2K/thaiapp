import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { PixelText } from '../../components/pixel/PixelText';
import { Colors } from '../../constants/colors';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <PixelText size={focused ? 22 : 18}>{emoji}</PixelText>
      <PixelText
        size={8}
        color={focused ? Colors.neon.pink : Colors.ui.textDim}
        style={{ letterSpacing: 0.5 }}
      >
        {label}
      </PixelText>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="HOME" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💕" label="CARE" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎮" label="GAMES" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="SOCIAL" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛍️" label="SHOP" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg.dark,
    borderTopColor: Colors.ui.border,
    borderTopWidth: 2,
    height: 70,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 52,
  },
  tabItemActive: {
    backgroundColor: Colors.bg.mid,
    shadowColor: Colors.neon.pink,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
