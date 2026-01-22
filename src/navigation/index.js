import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/AuthScreen';
import SignInScreen from '../screens/SignInScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import RestaurantDetailsScreen from '../screens/RestaurantDetailsScreen';
import OwnerDashboardScreen from '../screens/OwnerDashboardScreen';
import DeliveryScreen from '../screens/DeliveryScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CartScreen from '../screens/CartScreen';
import theme from '../styles/theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, hasSeenWelcome, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasSeenWelcome ? (
        // 1. Onboarding Flow
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      ) : !user ? (
        // 2. Authentication Flow
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        </>
      ) : (
        // 3. Main App Flow (Authenticated)
        <>
          <Stack.Screen name="Home" component={TabNavigator} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
          <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
          <Stack.Screen name="Map" component={DeliveryScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
