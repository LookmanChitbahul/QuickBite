import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, StatusBar, ImageBackground, Animated, Easing, Dimensions, Modal, TouchableWithoutFeedback, Platform, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import RestaurantList from '../components/RestaurantList';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { restaurants, orders, theme, isDarkMode, user, toggleFavorite, settings, setActiveTab, t, userAddress } = useApp();
  const isTablet = Dimensions.get('window').width > 768;
  const [searchQuery, setSearchQuery] = useState('');
  // Filter out duplicate brands for display - only show first instance of each brand
  const uniqueBrandRestaurants = useMemo(() => {
    const distinct = [];
    const map = new Map();
    for (const r of restaurants) {
      const key = r.brand || r.name; // Fallback to name if brand missing
      if (!map.has(key)) {
        map.set(key, true);
        // Create a display copy with the brand name (e.g. "KFC") instead of specific location
        const displayRest = { ...r, name: r.brand || r.name };
        distinct.push(displayRest);
      }
    }
    return distinct;
  }, [restaurants]);

  const [filteredRestaurants, setFilteredRestaurants] = useState(uniqueBrandRestaurants);
  const [showNotifications, setShowNotifications] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  // Carousel state
  const promoListRef = useRef(null);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const currentPromoIndexRef = useRef(0);
  const [scrollDirection, setScrollDirection] = useState(1);

  const categories = [
    { id: '1', name: t('chicken') || 'Chicken', icon: 'food-drumstick', type: 'MCI' },
    { id: '2', name: t('pizza') || 'Pizza', icon: 'pizza', type: 'Ionicons' },
    { id: '3', name: t('burgers') || 'Burgers', icon: 'fast-food' },
    { id: '4', name: t('indian') || 'Indian', icon: 'flame' },
    { id: '5', name: t('seafood') || 'Seafood', icon: 'fish' },
    { id: '6', name: t('bakery') || 'Bakery', icon: 'cafe' },
  ];

  // Derive dynamic promotions from restaurants menus - ONE per restaurant
  const promotions = useMemo(() => {
    const promoItems = [];
    const seenBrands = new Set();

    restaurants.forEach(rest => {
      const brandKey = rest.brand || rest.name;
      // Only add if we haven't seen this brand yet
      if (!seenBrands.has(brandKey) && rest.menu && rest.menu.length > 0) {
        seenBrands.add(brandKey);
        const item = rest.menu[0];
        promoItems.push({
          id: `promo-${rest.id}`,
          title: item.name,
          subtitle: `Special at ${rest.brand || rest.name}`,
          itemPrice: item.price,
          image: item.image || rest.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
          color: promoItems.length % 2 === 0 ? '#F97316' : '#EA580C',
          restaurant: rest
        });
      }
    });
    return promoItems;
  }, [restaurants]);

  const [activeCategory, setActiveCategory] = useState(null);

  const activeOrderCount = useMemo(() => orders.filter(o => o.status !== 'Picked Up').length, [orders]);
  const activeOrders = useMemo(() => orders.filter(o => o.status !== 'Picked Up'), [orders]);
  const latestOrder = useMemo(() => activeOrders.length > 0 ? activeOrders[0] : null, [activeOrders]);

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
        toValue: width,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setShowNotifications(false));
    }
  };

  useEffect(() => {
    let filtered = uniqueBrandRestaurants;
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

  // Fixed Carousel Auto-scroll Logic
  // Simplified Carousel Auto-scroll Logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (promoListRef.current && promotions.length > 0) {
        let nextIndex = currentPromoIndexRef.current + 1;
        if (nextIndex >= promotions.length) {
          nextIndex = 0; // Loop back to start
        }
        currentPromoIndexRef.current = nextIndex;
        setCurrentPromoIndex(nextIndex);
        promoListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('RestaurantDetails', { restaurant });
  };

  const handleToggleFavorite = (restaurant) => {
    toggleFavorite(restaurant.id);
  };

  const restaurantsWithLikes = filteredRestaurants.map(r => ({
    ...r,
    isFavorite: user.favorites ? user.favorites.includes(r.id) : false
  }));

  const NotificationPopup = () => {
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
                      <Text style={[styles.notiInfo, { color: theme.colors.text }]}>Your order from {latestOrder.restaurantName} is being {latestOrder.status.toLowerCase()}.</Text>

                      <View style={[styles.notiDivider, { backgroundColor: theme.colors.border }]} />

                      <Text style={[styles.notiSummaryTitle, { color: theme.colors.textLight }]}>{t('payment_summary')}</Text>
                      {latestOrder.items.map((item, idx) => (
                        <Text key={idx} style={[styles.notiItem, { color: theme.colors.text }]}>
                          {item.quantity}x {item.name}
                        </Text>
                      ))}
                      <Text style={[styles.notiTotal, { color: theme.colors.text }]}>{t('total')}: Rs {latestOrder.total.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.notiAction, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        // Robust lookup: try ID first, then name fallback
                        let restaurant = restaurants.find(r => r.id === latestOrder.restaurantId);
                        if (!restaurant) {
                          restaurant = restaurants.find(r => r.name === latestOrder.restaurantName);
                        }

                        // If still not found, search by Brand substring (e.g. 'KFC')
                        if (!restaurant && latestOrder.restaurantName) {
                          const brand = latestOrder.restaurantName.split(' ')[0];
                          restaurant = restaurants.find(r => r.brand === brand || r.name.includes(brand));
                        }

                        toggleNotifications(false);

                        // Fallback Hardcoded Coordinates for accuracy
                        let targetLoc = restaurant ? restaurant.location : null;

                        if (!targetLoc && latestOrder.restaurantName) {
                          const name = latestOrder.restaurantName.toLowerCase();
                          if (name.includes('bagatelle')) targetLoc = { latitude: -20.22427, longitude: 57.49660 };
                          else if (name.includes('port louis')) targetLoc = { latitude: -20.16325, longitude: 57.49749 };
                          else if (name.includes('curepipe')) targetLoc = { latitude: -20.32165, longitude: 57.52648 };
                          else if (name.includes('grand baie')) targetLoc = { latitude: -20.02163, longitude: 57.57792 };
                          else if (name.includes('phoenix')) targetLoc = { latitude: -20.27648, longitude: 57.50576 };
                        }

                        if (!targetLoc) targetLoc = latestOrder.location; // Final fallback

                        setTimeout(() => {
                          setActiveTab('Map');
                          navigation.navigate('Map', {
                            restaurant: restaurant || {
                              name: latestOrder.restaurantName,
                              location: targetLoc,
                              description: 'Order Pickup Location',
                              address: 'Mauritius'
                            },
                            location: targetLoc
                          });
                        }, 350);
                      }}
                    >
                      <Text style={styles.notiActionText}>Show Location</Text>
                      <Ionicons name="location-outline" size={16} color="#fff" />
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
    const activeOrders = orders.filter(o => o.status !== 'Picked Up');
    if (activeOrders.length === 0) return null;
    const latestOrder = activeOrders[0];

    return (
      <View style={styles.activeOrderContainer}>
        <View style={styles.activeOrderHeader}>
          <Text style={[styles.activeOrderTitle, { color: theme.colors.text }]}>{t('active_order')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.activeOrderCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.primary }]}
          onPress={() => {
            if (!showNotifications) {
              toggleNotifications(true);
            }
          }}
        >
          <View style={[styles.orderIcon, { backgroundColor: theme.colors.primary }]}>
            {/* Changed icon to map/location style */}
            <Ionicons name="map" size={24} color="#fff" />
          </View>
          <View style={styles.getOrderInfo}>
            <Text style={[styles.orderStatus, { color: theme.colors.primary }]}>{latestOrder.status}</Text>
            <Text style={[styles.orderRestaurant, { color: theme.colors.text }]}>{latestOrder.restaurantName}</Text>
            {/* Cleaned up text, removed potential underscore artifacts */}
            <Text style={[styles.orderItems, { color: theme.colors.textLight }]}>
              {latestOrder.status === 'Picked Up' ? 'Order Completed' : 'Track Order'} • {latestOrder.items.length} items
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
        </TouchableOpacity>
      </View>
    );
  };



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
            activeCategory?.id === cat.id && {
              backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
              borderColor: theme.colors.primary,
              borderWidth: 1
            }
          ]}
          onPress={() => setActiveCategory(activeCategory?.id === cat.id ? null : cat)}
        >
          <View style={[styles.categoryIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
            {cat.type === 'MCI' ? (
              <MaterialCommunityIcons name={cat.icon} size={24} color={activeCategory?.id === cat.id ? theme.colors.primary : theme.colors.text} />
            ) : (
              <Ionicons name={cat.icon} size={24} color={activeCategory?.id === cat.id ? theme.colors.primary : theme.colors.text} />
            )}
          </View>
          <Text style={[styles.categoryName, { color: theme.colors.text, fontWeight: activeCategory?.id === cat.id ? '700' : '500' }]}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const PromoCarousel = () => (
    <FlatList
      ref={promoListRef}
      data={promotions}
      keyExtractor={(item) => item.id}
      horizontal
      scrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.promoCarousel}
      decelerationRate="fast"
      snapToInterval={width - 25}
      snapToAlignment="start"
      getItemLayout={(data, index) => ({
        length: width - 25,
        offset: (width - 25) * index,
        index,
      })}
      renderItem={({ item: promo }) => (
        <TouchableOpacity
          key={promo.id}
          style={[styles.promoCard, { backgroundColor: promo.color }]}
          onPress={() => handleRestaurantPress(promo.restaurant)}
        >
          <ImageBackground source={{ uri: promo.image }} style={styles.promoBg} imageStyle={{ borderRadius: 20 }}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={styles.promoGradient}
            >
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>LIMITED OFFER</Text>
              </View>
              <Text style={styles.promoTitle} numberOfLines={1}>{promo.title}</Text>
              <View style={styles.promoFooter}>
                <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
                <View style={styles.pricePill}>
                  <Text style={styles.pricePillText}>Rs {promo.itemPrice}</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <NotificationPopup />

      <View style={{ backgroundColor: theme.colors.background }}>
        <SafeAreaView style={styles.safeArea}>

          <View style={styles.topHeaderImageContainer}>
            <Image
              source={require('../assets/images/light_food_header.png')}
              style={styles.headerFoodImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', isDarkMode ? theme.colors.background : 'rgba(255,255,255,1)']}
              style={styles.headerImageOverlay}
            />
          </View>

          <View style={styles.headerContent}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.greeting, { color: theme.colors.textLight }]}>Delivering to</Text>
                <Ionicons name="caret-down" size={12} color={theme.colors.textLight} style={{ marginLeft: 4 }} />
              </View>
              <Text style={[styles.locationTextHeader, { color: theme.colors.text }]}>
                {userAddress ? (
                  userAddress.includes(',')
                    ? userAddress.split(',').slice(0, 2).join(',').trim()
                    : userAddress
                ) : 'Location not set'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: isDarkMode ? theme.colors.card : '#fff' }]}
                onPress={() => toggleNotifications(true)}
              >
                <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
                {activeOrderCount > 0 && (
                  <View key="notification-badge" style={[styles.notiBadge, { backgroundColor: theme.colors.error }]} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: isDarkMode ? theme.colors.card : '#fff', marginLeft: 10 }]}
                onPress={() => setActiveTab('Profile')}
              >
                <Ionicons name="person-outline" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </View>
          </View>


        </SafeAreaView>
      </View>

      <RestaurantList
        restaurants={restaurantsWithLikes}
        onPress={handleRestaurantPress}
        onToggleFavorite={handleToggleFavorite}
        numColumns={isTablet ? 2 : 1}
        key={isTablet ? 'tablet' : 'mobile'} // Force re-render on orientation/size change
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
  container: { flex: 1 },
  safeArea: { paddingTop: Platform.OS === 'android' ? 10 : 0 },
  topHeaderImageContainer: {
    height: 120,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  headerFoodImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  headerImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  greeting: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  locationTextHeader: { fontSize: 16, fontWeight: '700' },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchRow: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, zIndex: 10 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },

  categoryStrip: { paddingLeft: 20, paddingVertical: 20 },
  categoryItem: { alignItems: 'center', marginRight: 24 },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  categoryName: { fontSize: 12, fontWeight: '600' },
  promoCarousel: { paddingLeft: 20, paddingBottom: 30 },
  promoCard: {
    width: width - 40,
    height: 160,
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
  },
  promoBg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  promoGradient: { padding: 15, height: '100%', justifyContent: 'flex-end' },
  promoBadge: { backgroundColor: '#F97316', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  promoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  promoTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 2 },
  promoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  promoSubtitle: { color: '#fff', fontSize: 13, fontWeight: '600', opacity: 0.9, flex: 1 },
  pricePill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  pricePillText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  activeOrderContainer: { paddingHorizontal: 20, marginBottom: 30 },
  activeOrderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activeOrderTitle: { fontSize: 18, fontWeight: 'bold' },
  trackText: { fontSize: 14, fontWeight: '600' },
  activeOrderCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, elevation: 4, shadowOpacity: 0.1 },
  orderIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  getOrderInfo: { flex: 1 },
  orderStatus: { fontSize: 14, fontWeight: 'bold' },
  orderRestaurant: { fontSize: 16, fontWeight: '600' },
  orderItems: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', flexDirection: 'row' },
  sideDrawer: { width: '80%', height: '100%', paddingHorizontal: 20, paddingTop: 20, elevation: 8 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  drawerTitle: { fontSize: 22, fontWeight: 'bold' },
  drawerContent: { flex: 1, marginTop: 20 },
  notiCard: { padding: 20, borderRadius: 20, elevation: 3, marginBottom: 20 },
  notiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  notiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notiType: { fontSize: 16, fontWeight: 'bold' },
  notiTime: { fontSize: 12 },
  notiDetails: { marginBottom: 20 },
  notiStatus: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
  notiInfo: { fontSize: 15, lineHeight: 22 },
  notiDivider: { height: 1, marginVertical: 16 },
  notiSummaryTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
  notiItem: { fontSize: 14, marginBottom: 4 },
  notiTotal: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  notiAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  notiActionText: { color: '#fff', fontWeight: 'bold', marginRight: 8 },
  emptyNoti: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyNotiText: { marginTop: 16, fontSize: 16 },
  notiBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff'
  }
});
