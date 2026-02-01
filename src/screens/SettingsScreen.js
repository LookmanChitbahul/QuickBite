import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function SettingsScreen({ navigation }) {
  const { user, theme, isDarkMode, colorBlindType, setColorBlindType, settings, toggleSettings, toggleTheme, language, changeLanguage, t } = useApp();

  // Safe color access
  const bgColor = theme?.colors?.background || '#F9FAFB';
  const cardColor = theme?.colors?.card || '#FFFFFF';
  const textColor = theme?.colors?.text || '#111827';
  const textLightColor = theme?.colors?.textLight || '#6B7280';
  const primaryColor = theme?.colors?.primary || '#F59E0B';
  const borderColor = theme?.colors?.border || '#E5E7EB';

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textLightColor }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: cardColor }]}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ icon, title, value, onPress, isSwitch, onToggle }) => (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: borderColor }]}
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={primaryColor} />
        </View>
        <Text style={[styles.itemTitle, { color: textColor }]}>{title}</Text>
      </View>

      {isSwitch ? (
        <Switch
          trackColor={{ false: "#D1D5DB", true: primaryColor }}
          thumbColor="#FFFFFF"
          onValueChange={onToggle}
          value={value}
        />
      ) : (
        <View style={styles.itemRight}>
          {value && <Text style={[styles.itemValue, { color: textLightColor }]}>{value}</Text>}
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: cardColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <SettingSection title={t('preferences')}>
          <SettingItem
            icon="notifications-outline"
            title={t('push_notifications')}
            isSwitch
            value={settings?.notifications}
            onToggle={() => toggleSettings('notifications')}
          />
          <SettingItem
            icon="moon-outline"
            title={t('dark_mode')}
            isSwitch
            value={isDarkMode}
            onToggle={toggleTheme}
          />
          <SettingItem
            icon="location-outline"
            title={t('location_services')}
            isSwitch
            value={settings?.location}
            onToggle={() => toggleSettings('location')}
          />
          <SettingItem
            icon="eye-outline"
            title={t('color_blind_mode')}
            value={colorBlindType === 'none' ? 'None' : colorBlindType.charAt(0).toUpperCase() + colorBlindType.slice(1)}
            onPress={() => {
              Alert.alert(
                t('color_blind_mode'),
                'Select your color vision type:',
                [
                  { text: 'None', onPress: () => setColorBlindType('none') },
                  { text: 'Protanopia', onPress: () => setColorBlindType('protanopia') },
                  { text: 'Deuteranopia', onPress: () => setColorBlindType('deuteranopia') },
                  { text: 'Tritanopia', onPress: () => setColorBlindType('tritanopia') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          />
          <SettingItem
            icon="globe-outline"
            title={t('language')}
            value={language === 'en' ? 'English' : 'Français'}
            onPress={() => {
              Alert.alert(
                t('select_language'),
                '',
                [
                  { text: 'English', onPress: () => changeLanguage('en') },
                  { text: 'Français', onPress: () => changeLanguage('fr') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          />
        </SettingSection>

        <SettingSection title={t('account')}>
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          {user?.isOwner && (
            <SettingItem
              icon="business-outline"
              title={t('owner_dashboard')}
              onPress={() => navigation.navigate('OwnerDashboard')}
            />
          )}
          <SettingItem
            icon="card-outline"
            title={t('payment_methods')}
            onPress={() => navigation.navigate('PaymentMethods')}
          />
        </SettingSection>

        <SettingSection title={t('more')}>
          <SettingItem
            icon="document-text-outline"
            title={t('privacy_policy')}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title={t('terms_of_service')}
            onPress={() => navigation.navigate('TermsOfService')}
          />
        </SettingSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
    padding: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconContainer: {
    width: 32,
    alignItems: 'flex-start'
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500'
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemValue: {
    fontSize: 14,
    marginRight: 8
  }
});
