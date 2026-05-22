import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { PixelText } from '../../components/pixel/PixelText';
import { Colors } from '../../constants/colors';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
  badge?: number;
}

function TabIcon({ emoji, label, focused, badge }: TabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View>
        <PixelText size={focused ? 20 : 17}>{emoji}</PixelText>
        {badge != null && badge > 0 && (
          <View style={styles.badge}>
            <PixelText size={7} color={Colors.bg.deep}>{badge > 9 ? '9+' : badge}</PixelText>
          </View>
        )}
      </View>
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
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="PROFILE" focused={focused} />,
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
    height: 68,
    paddingBottom: 6,
    paddingTop: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 44,
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: Colors.bg.mid,
    shadowColor: Colors.neon.pink,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -5,
    backgroundColor: Colors.neon.pink,
    borderRadius: 6,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
