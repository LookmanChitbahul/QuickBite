import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const BottomNavbar = ({ activeScreen, setActiveScreen }) => {
  const context = useApp();

  // Guard against missing context
  if (!context) return null;

  const { theme } = context;

  // Safe color access
  const cardColor = theme?.colors?.card || '#FFFFFF';
  const borderColor = theme?.colors?.border || '#E5E7EB';
  const primaryColor = theme?.colors?.primary || '#F59E0B';
  const textLightColor = theme?.colors?.textLight || '#6B7280';

  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Cart', icon: 'cart-outline', activeIcon: 'cart' },
    { name: 'Chatbot', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
    { name: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
    { name: 'Map', icon: 'map-outline', activeIcon: 'map' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={[styles.container, {
      backgroundColor: cardColor,
      borderTopColor: borderColor,
    }]}>
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => setActiveScreen(tab.name)}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? primaryColor : textLightColor}
            />
            <Text
              style={[
                styles.text,
                { color: isActive ? primaryColor : textLightColor },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomNavbar;
