import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../styles/theme';

const UserProfile = ({ navigation }) => {
  const handleLogout = () => {
    // Navigate to the Auth screen
    navigation.navigate('Auth');
  };

  const menuItems = [
    { title: 'Settings', screen: 'Settings' },
    { title: 'Help & Support', screen: 'Help' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  infoContainer: {
    backgroundColor: theme.colors.white,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: theme.colors.muted,
    marginTop: 8,
  },
  menu: {
    marginTop: 32,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 32,
    marginHorizontal: 16,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default UserProfile;
