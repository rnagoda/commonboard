import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import type { ReactElement } from 'react';

export default function App(): ReactElement {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text
        style={styles.title}
        accessibilityRole="header"
      >
        CommonBoard
      </Text>
      <Text style={styles.tagline}>
        Community resources, all in one place.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2d2a26',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#5c574f',
    textAlign: 'center',
  },
});
