import React, { useEffect } from 'react';
import { Platform, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import RootNavigator from './src/navigation';

import { AppProvider } from './src/context/AppContext';

// Ignore specific warnings that are unavoidable in Expo Go or SDK 54 environment
LogBox.ignoreLogs([
  '`expo-notifications` functionality is not fully supported in Expo Go',
  '`setBehaviorAsync` is not supported with edge-to-edge enabled',
  'expo-notifications: Android Push notifications (remote notifications) functionality'
]);

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      const setNavBehavior = async () => {
        try {
          // In SDK 54 with edge-to-edge, we use setVisibilityAsync.
          // setBehaviorAsync triggers a warning with edge-to-edge, 
          // so we'll just stick to visibility if we can.
          await NavigationBar.setVisibilityAsync('hidden');
        } catch (e) {
          console.log("Nav bar management error:", e);
        }
      };
      setNavBehavior();
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
