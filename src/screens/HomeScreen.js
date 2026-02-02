import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, StatusBar, ImageBackground, Animated, Easing, Dimensions, Modal, TouchableWithoutFeedback, Platform, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import RestaurantList from '../components/RestaurantList';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { restaurants, orders, theme, isDarkMode, user, toggleFavorite, settings, setActiveTab, t, userAddress, promotions: customPromotions } = useApp();
  const isTablet = Dimensions.get('window').width > 768;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out duplicate brands for display - only show first instance of each brand
  const uniqueBrandRestaurants = useMemo(() => {
    const distinct = [];
    const map = new Map();
    for (const r of restaurants) {
      const key = r.brand || r.name;
      if (!map.has(key)) {
        map.set(key, true);
        const displayRest = { ...r, name: r.brand || r.name };
        distinct.push(displayRest);
      }
    }
    return distinct;
  }, [restaurants]);

  const [filteredRestaurants, setFilteredRestaurants] = useState(uniqueBrandRestaurants);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const slideAnimOffers = useRef(new Animated.Value(width)).current;

  const categories = [
    { id: '1', name: t('chicken') || 'Chicken', icon: 'food-drumstick', type: 'MCI' },
    { id: '2', name: t('pizza') || 'Pizza', icon: 'pizza', type: 'Ionicons' },
    { id: '3', name: t('burgers') || 'Burgers', icon: 'fast-food' },
    { id: '4', name: t('indian') || 'Indian', icon: 'flame' },
    { id: '5', name: t('seafood') || 'Seafood', icon: 'fish' },
    { id: '6', name: t('bakery') || 'Bakery', icon: 'cafe' },
  ];

  // Derive dynamic promotions with fallback and custom promotions from DB
  const promotions = useMemo(() => {
    // ONLY use custom promotions added by Owners (Admin) as primary
    const allPromos = [...customPromotions];

    if (allPromos.length === 0) {
      // Fallback promo if none in DB
      allPromos.push({
        id: 'default-promo',
        title: 'Delicious Deals',
        subtitle: 'Explore our latest offers',
        itemPrice: 0,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        color: '#F97316',
        restaurant: null
      });
    }

    // De-duplicate in case logic overlaps
    const unique = [];
    const ids = new Set();
    for (const p of allPromos) {
      if (!ids.has(p.id)) {
        unique.push(p);
        ids.add(p.id);
      }
    }
    return unique;
  }, [restaurants, customPromotions]);

  const [activeCategory, setActiveCategory] = useState(null);

  // Memos for active orders (excluding picked up and rejected) - filtered for current user
  const activeOrders = useMemo(() => orders.filter(o => o.userId === user?.uid && o.status !== 'Picked Up' && o.status !== 'Payment Rejected'), [orders, user]);
  const activeOrderCount = useMemo(() => activeOrders.length, [activeOrders]);

  useEffect(() => {
    let filtered = uniqueBrandRestaurants;
    if (searchQuery) {
      filtered = filtered.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeCategory) {
      filtered = filtered.filter((restaurant) =>
        restaurant.tags?.some(tag => tag.toLowerCase().includes(activeCategory.name.toLowerCase()))
      );
    }
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants, activeCategory]);

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

  const toggleOffers = (show) => {
    if (show) {
      setShowOffers(true);
      Animated.timing(slideAnimOffers, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.back(0.5)),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimOffers, {
        toValue: width,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setShowOffers(false));
    }
  };

  const handleRestaurantPress = (restaurant) => {
    if (!restaurant) return;
    navigation.navigate('RestaurantDetails', { restaurant });
  };

  const handleToggleFavorite = (restaurant) => {
    toggleFavorite(restaurant.id);
  };

  const restaurantsWithLikes = filteredRestaurants.map(r => ({
    ...r,
    isFavorite: user.favorites ? user.favorites.includes(r.id) : false
  }));

  const renderNotificationPopup = () => (
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
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
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

              <ScrollView
                style={styles.drawerContent}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 60 }}
                nestedScrollEnabled={true}
                alwaysBounceVertical={true}
              >
                {/* Active Orders Section */}
                <View style={styles.notiSectionHeader}>
                  <Text style={[styles.notiSectionTitle, { color: theme.colors.text }]}>Active Orders</Text>
                </View>

                {activeOrders.length > 0 ? (
                  activeOrders.map((order) => (
                    <View key={order.id} style={[styles.notiCard, { backgroundColor: theme.colors.card }]}>
                      <View style={styles.notiHeader}>
                        <View style={[styles.notiIcon, { backgroundColor: order.status === 'Confirmed' ? '#10B98120' : theme.colors.primaryLight }]}>
                          <Ionicons
                            name={order.status === 'Confirmed' ? "checkmark-circle" : "time-outline"}
                            size={20}
                            color={order.status === 'Confirmed' ? '#10B981' : theme.colors.primary}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.notiType, { color: theme.colors.text }]}>Order Update</Text>
                          <Text style={[styles.notiTime, { color: theme.colors.textLight }]}>{t('now')}</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: order.status === 'Confirmed' ? '#10B981' : '#F97316' }]}>
                          <Text style={styles.statusPillText}>{order.status.toUpperCase()}</Text>
                        </View>
                      </View>

                      <View style={styles.notiDetails}>
                        <Text style={[styles.notiInfo, { color: theme.colors.text }]}>Your order from {order.restaurantName} is {order.status.toLowerCase()}.</Text>
                        <View style={[styles.notiDivider, { backgroundColor: theme.colors.border }]} />
                        <Text style={[styles.notiSummaryTitle, { color: theme.colors.textLight }]}>{t('payment_summary')}</Text>
                        {order.items.map((item, idx) => (
                          <Text key={idx} style={[styles.notiItem, { color: theme.colors.text }]}>
                            {item.quantity}x {item.name}
                          </Text>
                        ))}
                        <Text style={[styles.notiTotal, { color: theme.colors.text }]}>{t('total')}: Rs {order.total.toFixed(2)}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.notiAction, { backgroundColor: theme.colors.primary }]}
                        onPress={() => {
                          let restaurant = restaurants.find(r => r.id === order.restaurantId) || restaurants.find(r => r.name === order.restaurantName);
                          toggleNotifications(false);
                          let targetLoc = restaurant ? restaurant.location : order.location;
                          setTimeout(() => {
                            setActiveTab('Map');
                            navigation.navigate('Map', {
                              restaurant: restaurant || { name: order.restaurantName, location: targetLoc },
                              location: targetLoc
                            });
                          }, 350);
                        }}
                      >
                        <Text style={styles.notiActionText}>Show Location</Text>
                        <Ionicons name="location-outline" size={16} color="#fff" />
                      </TouchableOpacity>

                      {order.status === 'Confirmed' && (
                        <View style={styles.notiQRSection}>
                          <Text style={[styles.notiQRTitle, { color: theme.colors.text }]}>Verification QR Code</Text>
                          <View style={styles.notiQRInside}>
                            <QRCode
                              value={JSON.stringify({ orderId: order.id, type: 'pickup' })}
                              size={120}
                              color={isDarkMode ? '#FFF' : '#000'}
                              backgroundColor='transparent'
                            />
                          </View>
                          <Text style={[styles.notiQRHint, { color: theme.colors.textLight }]}>Show this at the counter for pickup</Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.notiCardEmpty}>
                    <Text style={[styles.notiEmptyText, { color: theme.colors.textLight }]}>No active orders at the moment.</Text>
                  </View>
                )}

                {/* Order History Section */}
                <View style={[styles.notiSectionHeader, { marginTop: 30 }]}>
                  <Text style={[styles.notiSectionTitle, { color: theme.colors.text }]}>Recent History</Text>
                </View>

                {orders.filter(o => o.status === 'Picked Up' || o.status === 'Payment Rejected').slice(0, 5).map((order) => (
                  <View key={order.id} style={[styles.notiHistoryItem, { borderBottomColor: theme.colors.border }]}>
                    <View style={[styles.historyIcon, { backgroundColor: order.status === 'Picked Up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                      <Ionicons name={order.status === 'Picked Up' ? "checkmark" : "close"} size={14} color={order.status === 'Picked Up' ? '#10B981' : '#EF4444'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.historyTitle, { color: theme.colors.text }]} numberOfLines={1}>{order.restaurantName}</Text>
                      <Text style={[styles.historySubtitle, { color: theme.colors.textLight }]}>{order.status} • Rs {order.total.toFixed(0)}</Text>
                    </View>
                    <Text style={[styles.historyDate, { color: theme.colors.textLight }]}>{new Date(order.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.viewAllHistoryBtn, { marginTop: 15 }]}
                  onPress={() => {
                    toggleNotifications(false);
                    setActiveTab('Orders');
                  }}
                >
                  <Text style={[styles.viewAllHistoryText, { color: theme.colors.primary }]}>View Detailed History</Text>
                  <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );

  const renderOffersPopup = () => (
    <Modal
      visible={showOffers}
      transparent={true}
      animationType="none"
      onRequestClose={() => toggleOffers(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => toggleOffers(false)}
      >
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[
              styles.sideDrawer,
              {
                backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                transform: [{ translateX: slideAnimOffers }]
              }
            ]}
          >
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.drawerHeader}>
                <Text style={[styles.drawerTitle, { color: theme.colors.text }]}>Limited Offers</Text>
                <TouchableOpacity onPress={() => toggleOffers(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 40 }}>
                {promotions.map((promo) => (
                  <TouchableOpacity
                    key={promo.id}
                    style={[styles.offerRowCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => {
                      toggleOffers(false);
                      handleRestaurantPress(promo.restaurant);
                    }}
                  >
                    <ImageBackground source={{ uri: promo.image }} style={styles.offerRowBg} imageStyle={{ borderRadius: 15 }}>
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.offerRowGradient}
                      >
                        <View style={styles.priceBadgeTopRight}>
                          <Text style={styles.offerRowPrice}>Rs {promo.itemPrice}</Text>
                        </View>
                        <Text style={styles.offerRowTitle}>{promo.title}</Text>
                        <View style={styles.offerRowFooter}>
                          <Text style={styles.offerRowSubtitle}>{promo.subtitle}</Text>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );

  const renderActiveOrderPanel = () => {
    if (activeOrders.length === 0) return null;
    const latestActiveOrder = activeOrders[0];

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
            <Ionicons name="map" size={24} color="#fff" />
          </View>
          <View style={styles.getOrderInfo}>
            <Text style={[styles.orderStatus, { color: theme.colors.primary }]}>{latestActiveOrder.status}</Text>
            <Text style={[styles.orderRestaurant, { color: theme.colors.text }]}>{latestActiveOrder.restaurantName}</Text>
            <Text style={[styles.orderItems, { color: theme.colors.textLight }]}>
              {latestActiveOrder.status === 'Picked Up' ? 'Order Completed' : 'Track Order'} • {latestActiveOrder.items.length} items
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

  const LimitedOffersPanel = () => {
    const hasPromos = promotions && promotions.length > 0;
    const featuredPromo = hasPromos ? promotions[0] : null;

    if (!featuredPromo) return null;

    return (
      <View style={styles.promoContainer}>
        <TouchableOpacity
          style={styles.promoMainCard}
          onPress={() => toggleOffers(true)}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={{ uri: featuredPromo?.image }}
            style={styles.promoMainBg}
            imageStyle={{ borderRadius: 24 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.promoMainGradient}
            >
              <View style={[styles.promoMainBadge, { backgroundColor: '#EA580C' }]}>
                <Ionicons name="flash" size={12} color="#fff" />
                <Text style={styles.promoMainBadgeText}>EXCLUSIVE DEALS</Text>
              </View>
              <View style={styles.promoMainBottom}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoMainTitle}>{featuredPromo.title}</Text>
                  <Text style={styles.promoMainSubtitle}>{featuredPromo.subtitle}</Text>
                </View>
                <View style={[styles.promoMainIcon, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {renderNotificationPopup()}
      {renderOffersPopup()}

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
                  <View style={[styles.notiBadge, { backgroundColor: theme.colors.error }]} />
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
        key={isTablet ? 'tablet' : 'mobile'}
        ListHeaderComponent={() => (
          <View>
            <CategoryStrip />
            <LimitedOffersPanel />
            {renderActiveOrderPanel()}
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
  promoContainer: { paddingHorizontal: 20, marginBottom: 25 },
  promoMainCard: { height: 180, borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  promoMainBg: { width: '100%', height: '100%' },
  promoMainGradient: { flex: 1, padding: 20, justifyContent: 'space-between' },
  promoMainBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  promoMainBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', marginLeft: 4, letterSpacing: 1 },
  promoMainBottom: { flexDirection: 'row', alignItems: 'center' },
  promoMainTitle: { color: '#fff', fontSize: 26, fontWeight: '900' },
  promoMainSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', marginTop: 2 },
  promoMainIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  offerRowCard: { height: 160, borderRadius: 20, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  offerRowBg: { width: '100%', height: '100%' },
  offerRowGradient: { flex: 1, padding: 15, justifyContent: 'flex-end', position: 'relative' },
  offerRowTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 10 },
  offerRowFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  offerRowSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },
  offerRowPrice: { color: '#fff', fontSize: 14, fontWeight: '900' },
  priceBadgeTopRight: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  activeOrderContainer: { paddingHorizontal: 20, marginBottom: 30 },
  activeOrderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activeOrderTitle: { fontSize: 18, fontWeight: 'bold' },
  activeOrderCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, elevation: 4, shadowOpacity: 0.1 },
  orderIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  getOrderInfo: { flex: 1 },
  orderStatus: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  orderRestaurant: { fontSize: 16, fontWeight: '600' },
  orderItems: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', flexDirection: 'row' },
  sideDrawer: { width: '85%', height: '100%', paddingHorizontal: 20, paddingTop: 20, elevation: 8 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  drawerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  drawerContent: { flex: 1, marginTop: 20 },
  notiCard: { padding: 20, borderRadius: 20, elevation: 3, marginBottom: 20 },
  notiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  notiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notiType: { fontSize: 13, fontWeight: '800', letterSpacing: 0, marginBottom: 2 },
  notiTime: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  notiDetails: { marginBottom: 20 },
  notiInfo: { fontSize: 15, lineHeight: 24, fontWeight: '500', letterSpacing: 0.2 },
  notiDivider: { height: 1, marginVertical: 18, opacity: 0.5 },
  notiSummaryTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1.2 },
  notiItem: { fontSize: 14, marginBottom: 6 },
  notiTotal: { fontSize: 17, fontWeight: '900', marginTop: 10, letterSpacing: 0.5 },
  notiAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  notiActionText: { color: '#fff', fontWeight: 'bold', marginRight: 8 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 10 },
  statusPillText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  notiQRSection: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', alignItems: 'center' },
  notiQRTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  notiQRInside: { padding: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  notiQRHint: { fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  notiBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
    zIndex: 20
  },
  notiSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  notiSectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7 },
  notiCardEmpty: { padding: 30, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center' },
  notiEmptyText: { fontSize: 14, textAlign: 'center' },
  notiHistoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  historyIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  historyTitle: { fontSize: 14, fontWeight: '700' },
  historySubtitle: { fontSize: 11, marginTop: 2 },
  historyDate: { fontSize: 10, fontWeight: '600' },
  viewAllHistoryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  viewAllHistoryText: { fontSize: 13, fontWeight: '700', marginRight: 5 }
});
