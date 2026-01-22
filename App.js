import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import RootNavigator from './src/navigation';

import { AppProvider } from './src/context/AppContext';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Hide the bottom navigation bar (home, back, recents)
      // Note: setBehaviorAsync is not supported with edge-to-edge in SDK 54
      NavigationBar.setVisibilityAsync('hidden');
    }
  }, []);

  return (
    <AppProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
