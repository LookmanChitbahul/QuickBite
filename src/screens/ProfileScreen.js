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

  // Safe color access
  const primaryColor = theme?.colors?.primary || '#F59E0B';
  const successColor = theme?.colors?.success || '#10B981';

  // Dynamic Glass Styles
  const glassColor = isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.55)';
  const glassBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const subTextColor = isDarkMode ? '#9CA3AF' : '#4B5563';
  const iconColor = isDarkMode ? '#FFFFFF' : primaryColor;
  const iconBg = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)';
  const dividerColor = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
  const overlayColors = isDarkMode ? ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)'] : ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)'];

  const logoutBg = isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 226, 226, 0.7)';
  const logoutBorder = isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.5)';

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
    ...(user.isOwner ? [{ title: t('owner_dashboard'), icon: 'business-outline', screen: 'OwnerDashboard' }] : []),
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
      <ImageBackground
        source={require('../assets/images/night_mountain.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={overlayColors}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>
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
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="person-outline" size={32} color="rgba(255,255,255,0.8)" />
              </View>
            )}

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: '#FFFFFF' }]}>{user.name}</Text>
                  <Text style={[styles.email, { color: '#E5E7EB' }]}>{user.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.headerSettingsBtn}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Ionicons name="settings-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme?.colors?.primaryLight || 'rgba(245, 158, 11, 0.2)' }]}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={[styles.editButtonText, { color: theme?.colors?.primaryDark || '#D97706' }]}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: glassColor, borderColor: glassBorder, borderWidth: 1 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{orders?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{t('my_orders')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{user.favorites?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>{t('favorites')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>0</Text>
              <Text style={[styles.statLabel, { color: subTextColor }]}>Reviews</Text>
            </View>
          </View>

          {/* Direct Owner Dashboard Link (for dev/current use) */}
          <TouchableOpacity
            style={[styles.ownerAccessBtn, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)', borderColor: primaryColor }]}
            onPress={() => navigation.navigate('OwnerDashboard')}
          >
            <LinearGradient
              colors={isDarkMode ? ['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)'] : ['rgba(245,158,11,0.1)', 'rgba(245,158,11,0.02)']}
              style={styles.ownerBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Ionicons name="speedometer-outline" size={20} color={primaryColor} />
            <Text style={[styles.ownerAccessText, { color: textColor }]}>Open Owner Dashboard</Text>
            <Ionicons name="arrow-forward" size={18} color={primaryColor} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>{t('account')}</Text>
        <View style={[styles.glassContainer, { backgroundColor: glassColor, borderColor: glassBorder }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: dividerColor, borderBottomWidth: index === menuItems.length - 1 ? 0 : 1 }]}
              onPress={() => handleNavigation(item.screen)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
                <Ionicons name={item.icon} size={22} color={iconColor} />
              </View>
              <Text style={[styles.menuText, { color: textColor }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={subTextColor} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.glassContainer, { marginTop: 10, borderColor: logoutBorder, backgroundColor: logoutBg }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={logout}>
            <View style={[styles.menuIconContainer, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            </View>
            <Text style={[styles.menuText, { color: '#EF4444' }]}>{t('logout')}</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(239, 68, 68, 0.5)" />
          </TouchableOpacity>
        </View>

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
    marginTop: 8
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
  }
});
