import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { colors } from '../../src/constants/theme';

type TabIconProps = {
  color: string;
  size: number;
};

export default function TabLayout(): ReactElement {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: TabIconProps): ReactElement => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
              accessibilityLabel="Home"
              accessibilityHint="Navigate to home screen"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }: TabIconProps): ReactElement => (
            <Ionicons
              name="search-outline"
              size={size}
              color={color}
              accessibilityLabel="Search"
              accessibilityHint="Navigate to search screen"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }: TabIconProps): ReactElement => (
            <Ionicons
              name="grid-outline"
              size={size}
              color={color}
              accessibilityLabel="Categories"
              accessibilityHint="Navigate to categories screen"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }: TabIconProps): ReactElement => (
            <Ionicons
              name="ellipsis-horizontal"
              size={size}
              color={color}
              accessibilityLabel="More options"
              accessibilityHint="Navigate to more options"
            />
          ),
        }}
      />
    </Tabs>
  );
}
