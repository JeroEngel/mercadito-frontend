import React from 'react';
import { Navigation } from './src/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { View, StyleSheet, Platform } from 'react-native';

enableScreens();

export default function App() {
  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select<any>({
      web: {
        height: '100vh',
      },
    }),
  },
}); 