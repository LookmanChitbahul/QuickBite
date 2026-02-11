import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Alert, Switch, ImageBackground, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen({ navigation }) {
  const context = useApp();

  // Guard against missing context or missing data
  if (!context || !context.user) return null;

  const { user, orders, theme, isDarkMode, toggleTheme, settings, toggleSettings, logout, scheduleNotification, paymentMethods, t } = context;

  const logoutBg = theme?.colors?.logout || '#FFA500';
  const logoutTextColor = '#FFFFFF';

  // Safe color access
  const primaryColor = theme?.colors?.primary || '#CC0000';
  const successColor = theme?.colors?.success || '#10B981';

  // Dynamic Styles
  const glassColor = isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 1)';
  const glassBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const subTextColor = isDarkMode ? '#9CA3AF' : '#4B5563';
  const iconColor = isDarkMode ? '#FFFFFF' : primaryColor;
  const iconBg = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const dividerColor = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';

  const handleNavigation = (screen) => {
    if (screen === 'Orders') {
      context.setActiveTab('Orders');
      navigation.navigate('Home');
    } else if (screen) {
      navigation.navigate(screen);
    } else {
      Alert.alert("Coming Soon", "This feature is under development.");
    }
  };

  const menuItems = [
    ...(user.isOwner ? [{ title: 'Owner Dashboard', icon: 'speedometer-outline', screen: 'OwnerDashboard', isOwner: true }] : []),
    { title: 'Order History', icon: 'receipt-outline', screen: 'OrderHistory' },
    { title: t('payment_methods'), icon: 'card-outline', screen: 'PaymentMethods' },
    { title: t('settings'), icon: 'settings-outline', screen: 'Settings' },
    { title: t('favorites'), icon: 'heart-outline', screen: 'Favorites' },
    { title: t('help'), icon: 'help-circle-outline', screen: 'Help' },
  ];

  const safePaymentMethods = paymentMethods || [];

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]} />
      <LinearGradient
        colors={isDarkMode ? ['#0F172A', '#1E293B'] : ['#FFF7ED', '#FFEDD5']}
        style={styles.headerGradientBg}
      />
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.profileSection}>
            {user.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
                <Ionicons name="person-outline" size={32} color={isDarkMode ? "rgba(255,255,255,0.8)" : theme.colors.primary} />
              </View>
            )}

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: textColor }]}>{user.name}</Text>
                  <Text style={[styles.email, { color: subTextColor }]}>{user.email}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: glassColor, borderColor: glassBorder, borderWidth: 1 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{(orders || []).filter(o => o.userId === user.uid).length}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{t('my_orders')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{(user.favorites || []).length}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{t('favorites')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>0</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>Reviews</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>{t('account')}</Text>
        <View style={[styles.glassContainer, { backgroundColor: glassColor, borderColor: glassBorder }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                { borderBottomColor: dividerColor, borderBottomWidth: index === menuItems.length - 1 ? 0 : 1 },
                item.isOwner && { backgroundColor: '#F97316', borderRadius: 12, marginBottom: 8, marginHorizontal: 0, paddingVertical: 16, borderBottomWidth: 0 }
              ]}
              onPress={() => handleNavigation(item.screen)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.isOwner ? 'rgba(255,255,255,0.2)' : iconBg }]}>
                <Ionicons name={item.icon} size={22} color={item.isOwner ? '#FFFFFF' : iconColor} />
              </View>
              <Text style={[styles.menuText, { color: item.isOwner ? '#FFFFFF' : textColor, fontWeight: item.isOwner ? '600' : '400' }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={item.isOwner ? '#FFFFFF' : subTextColor} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: logoutBg }]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={22} color={logoutTextColor} />
          <Text style={[styles.logoutButtonText, { color: logoutTextColor }]}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: 'rgba(255,255,255,0.5)' }]}>{t('version')} 1.1.0</Text>
        </View>
      </ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent' // Handled by gradient, but content needs bg below
  },
  header: {
    marginBottom: 16,
    backgroundColor: 'transparent'
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff'
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    marginBottom: 8
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 20
  },
  glassContainer: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500'
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 32
  },
  versionText: {
    fontSize: 12
  },
  ownerAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  ownerBtnGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  ownerAccessText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  headerSettingsBtn: {
    padding: 8,
    marginLeft: 10
  },
  headerGradientBg: {
    ...StyleSheet.absoluteFillObject,
    height: 300,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  }
});
