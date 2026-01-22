import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, StatusBar, ImageBackground, Animated, Easing, Dimensions, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import RestaurantList from '../components/RestaurantList';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  const { restaurants, orders, theme, isDarkMode, user, toggleFavorite, settings, setActiveTab, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [showNotifications, setShowNotifications] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  const categories = [
    { id: '1', name: t('chicken') || 'Chicken', icon: 'nutrition' },
    { id: '2', name: t('pizza') || 'Pizza', icon: 'pizza' },
    { id: '3', name: t('burgers') || 'Burgers', icon: 'fast-food' },
    { id: '4', name: t('indian') || 'Indian', icon: 'flame' },
    { id: '5', name: t('seafood') || 'Seafood', icon: 'fish' },
    { id: '6', name: t('bakery') || 'Bakery', icon: 'cafe' },
  ];

  const promotions = [
    {
      id: 'p1',
      title: 'Rs 100 OFF',
      subtitle: t('promo_moka') || 'On your first order in Moka!',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      color: theme.colors.primary
    },
    {
      id: 'p2',
      title: t('promo_ocean') || 'Ocean Basket Spec',
      subtitle: t('promo_ocean_sub') || 'Fresh Seafood now delivery!',
      image: 'https://images.unsplash.com/photo-1551731591-a2432441f94a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      color: theme.colors.secondary
    },
    {
      id: 'p3',
      title: t('promo_sitar') || 'Sitar Express',
      subtitle: t('promo_sitar_sub') || 'Best Indian food in Bagatelle',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      color: '#10B981'
    }
  ];

  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleNotifications = (show) => {
    if (show) {
      setShowNotifications(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.back(0.5)),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setShowNotifications(false));
    }
  };

  useEffect(() => {
    let filtered = restaurants;
    if (searchQuery) {
      filtered = filtered.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeCategory) {
      filtered = filtered.filter((restaurant) =>
        restaurant.tags?.some(tag => tag.toLowerCase().includes(activeCategory.name.toLowerCase()))
      );
    }
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants, activeCategory]);

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('RestaurantDetails', { restaurant });
  };

  const handleToggleFavorite = (restaurant) => {
    toggleFavorite(restaurant.id);
  };

  // Enhance restaurants to show liked status
  const restaurantsWithLikes = filteredRestaurants.map(r => ({
    ...r,
    isFavorite: user.favorites ? user.favorites.includes(r.id) : false
  }));

  const NotificationPopup = () => {
    const latestOrder = orders.length > 0 ? orders[0] : null;

    return (
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="none"
        onRequestClose={() => toggleNotifications(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => toggleNotifications(false)}
        >
          <Animated.View
            style={[
              styles.sideDrawer,
              {
                backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.drawerHeader}>
                <Text style={[styles.drawerTitle, { color: theme.colors.text }]}>{t('notifications')}</Text>
                <TouchableOpacity onPress={() => toggleNotifications(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
                {latestOrder ? (
                  <View style={[styles.notiCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.notiHeader}>
                      <View style={[styles.notiIcon, { backgroundColor: theme.colors.primaryLight }]}>
                        <Ionicons name="receipt" size={20} color={theme.colors.primary} />
                      </View>
                      <View>
                        <Text style={[styles.notiType, { color: theme.colors.text }]}>Order Update</Text>
                        <Text style={[styles.notiTime, { color: theme.colors.textLight }]}>{t('now')}</Text>
                      </View>
                    </View>

                    <View style={styles.notiDetails}>
                      <Text style={[styles.notiStatus, { color: theme.colors.primary }]}>{latestOrder.status}</Text>
                      <Text style={[styles.notiInfo, { color: theme.colors.text }]}>{t('order_is')} {latestOrder.restaurantName} is being {latestOrder.status.toLowerCase()}.</Text>

                      <View style={[styles.notiDivider, { backgroundColor: theme.colors.border }]} />

                      <Text style={[styles.notiSummaryTitle, { color: theme.colors.textLight }]}>{t('payment_summary')}</Text>
                      {latestOrder.items.map((item, idx) => (
                        <Text key={idx} style={[styles.notiItem, { color: theme.colors.text }]}>
                          {item.quantity}x {item.name}
                        </Text>
                      ))}
                      <Text style={[styles.notiTotal, { color: theme.colors.text }]}>{t('total')}: ${latestOrder.total.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.notiAction, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        toggleNotifications(false);
                        setActiveTab('Map');
                      }}
                    >
                      <Text style={styles.notiActionText}>{t('track_live')}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.emptyNoti}>
                    <Ionicons name="notifications-off-outline" size={48} color={theme.colors.muted} />
                    <Text style={[styles.emptyNotiText, { color: theme.colors.muted }]}>{t('no_notifications')}</Text>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const ActiveOrderPanel = () => {
    if (orders.length === 0) return null;
    const latestOrder = orders[0];

    return (
      <View style={styles.activeOrderContainer}>
        <View style={styles.activeOrderHeader}>
          <Text style={[styles.activeOrderTitle, { color: theme.colors.text }]}>{t('active_order')}</Text>
          <TouchableOpacity onPress={() => setActiveTab('Map')}>
            <Text style={[styles.trackText, { color: theme.colors.primary }]}>{t('track_order')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.activeOrderCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.primary }]}
          onPress={() => toggleNotifications(true)}
        >
          <View style={[styles.orderIcon, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="fast-food" size={24} color="#fff" />
          </View>
          <View style={styles.getOrderInfo}>
            <Text style={[styles.orderStatus, { color: theme.colors.primary }]}>{latestOrder.status}</Text>
            <Text style={[styles.orderRestaurant, { color: theme.colors.text }]}>{latestOrder.restaurantName}</Text>
            <Text style={[styles.orderItems, { color: theme.colors.textLight }]}>{latestOrder.items.length} items • ${latestOrder.total.toFixed(2)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
        </TouchableOpacity>
      </View>
    );
  };

  const DeliveryTypeSwitcher = () => (
    <View style={[styles.switcherContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
      <TouchableOpacity
        style={[styles.switcherBtn, deliveryType === 'delivery' && { backgroundColor: theme.colors.white }]}
        onPress={() => setDeliveryType('delivery')}
      >
        <Text style={[styles.switcherText, { color: deliveryType === 'delivery' ? theme.colors.black : theme.colors.textLight }]}>{t('delivery')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.switcherBtn, deliveryType === 'pickup' && { backgroundColor: theme.colors.white }]}
        onPress={() => setDeliveryType('pickup')}
      >
        <Text style={[styles.switcherText, { color: deliveryType === 'pickup' ? theme.colors.black : theme.colors.textLight }]}>{t('pickup')}</Text>
      </TouchableOpacity>
    </View>
  );

  const CategoryStrip = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryStrip}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryItem,
            activeCategory?.id === cat.id && { backgroundColor: theme.colors.primaryLight }
          ]}
          onPress={() => setActiveCategory(activeCategory?.id === cat.id ? null : cat)}
        >
          <View style={[styles.categoryIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
            <Ionicons name={cat.icon} size={24} color={activeCategory?.id === cat.id ? theme.colors.primary : theme.colors.text} />
          </View>
          <Text style={[styles.categoryName, { color: theme.colors.text }]}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const PromoCarousel = () => (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.promoCarousel}
    >
      {promotions.map((promo) => (
        <TouchableOpacity key={promo.id} style={[styles.promoCard, { backgroundColor: promo.color }]}>
          <ImageBackground source={{ uri: promo.image }} style={styles.promoBg} imageStyle={{ borderRadius: 20 }}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.promoGradient}
            >
              <Text style={styles.promoTitle}>{promo.title}</Text>
              <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <NotificationPopup />

      {/* Visual Header */}
      <View style={{ backgroundColor: theme.colors.background }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.greeting, { color: theme.colors.textLight }]}>{t('greeting')}</Text>
                <Ionicons name="caret-down" size={12} color={theme.colors.textLight} style={{ marginLeft: 4 }} />
              </View>
              <Text style={[styles.locationTextHeader, { color: theme.colors.text }]}>Bagatelle Mall, Moka</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: theme.colors.card }]}
                onPress={() => toggleNotifications(true)}
              >
                <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: theme.colors.card, marginLeft: 10 }]}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person-outline" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </View>
            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="options-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <DeliveryTypeSwitcher />
        </SafeAreaView>
      </View>

      <RestaurantList
        restaurants={restaurantsWithLikes}
        onPress={handleRestaurantPress}
        onToggleFavorite={handleToggleFavorite}
        ListHeaderComponent={() => (
          <View>
            <CategoryStrip />
            <PromoCarousel />
            <ActiveOrderPanel />
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('featured_stores')}</Text>
              <TouchableOpacity>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    paddingTop: Platform.OS === 'android' ? 40 : 0
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  locationTextHeader: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  searchRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1
  },
  switcherContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 4,
    borderRadius: 25,
    marginBottom: 10,
    width: 200,
  },
  switcherBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switcherText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryStrip: {
    paddingLeft: 20,
    paddingVertical: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  promoCarousel: {
    paddingLeft: 20,
    paddingBottom: 30,
  },
  promoCard: {
    width: Dimensions.get('window').width - 40,
    height: 160,
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
  },
  promoBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  promoGradient: {
    padding: 20,
    paddingTop: 60,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  promoSubtitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  activeOrderContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  activeOrderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trackText: {
    fontSize: 14,
    fontWeight: '600'
  },
  activeOrderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  getOrderInfo: {
    flex: 1
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  orderItems: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    flexDirection: 'row'
  },
  sideDrawer: {
    width: '80%',
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  drawerContent: {
    flex: 1,
    marginTop: 20
  },
  notiCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20
  },
  notiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  notiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  notiType: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  notiTime: {
    fontSize: 12
  },
  notiDetails: {
    marginBottom: 20
  },
  notiStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  notiInfo: {
    fontSize: 15,
    lineHeight: 22
  },
  notiDivider: {
    height: 1,
    marginVertical: 16
  },
  notiSummaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  notiItem: {
    fontSize: 14,
    marginBottom: 4
  },
  notiTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8
  },
  notiAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10
  },
  notiActionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8
  },
  emptyNoti: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100
  },
  emptyNotiText: {
    marginTop: 16,
    fontSize: 16
  }
});


