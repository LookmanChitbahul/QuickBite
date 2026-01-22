import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNavbar from '../components/BottomNavbar';
// import Header from '../components/Header';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeliveryScreen from '../screens/DeliveryScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

import { useApp } from '../context/AppContext';

const screens = {
  Home: HomeScreen,
  Cart: CartScreen,
  Orders: OrdersScreen,
  Chatbot: ChatbotScreen,
  Map: DeliveryScreen,
  Profile: ProfileScreen,
};

const TabNavigator = ({ navigation }) => {
  const { activeTab, setActiveTab } = useApp();

  const renderScreen = () => {
    const Screen = screens[activeTab];
    return <Screen navigation={navigation} />;
  };

  return (
    <View style={styles.container}>
      {/* Header removed as per user request */}
      <View style={styles.content}>{renderScreen()}</View>
      <BottomNavbar activeScreen={activeTab} setActiveScreen={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default TabNavigator;
