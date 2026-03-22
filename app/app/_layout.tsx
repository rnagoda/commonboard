import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactElement } from 'react';
import { colors } from '../src/constants/theme';

export default function RootLayout(): ReactElement {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="org/[id]"
          options={{ title: 'Organization' }}
        />
        <Stack.Screen
          name="category/[slug]"
          options={{ title: 'Category' }}
        />
      </Stack>
    </>
  );
}
