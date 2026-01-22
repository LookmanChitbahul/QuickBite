import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, StatusBar, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrdersScreen({ navigation }) {
  const { orders, theme, isDarkMode, setActiveTab, t, language } = useApp();
  // We'll simulate messages for the active order (first one in list if exists)
  const [activeMessage, setActiveMessage] = useState("Waiting for restaurant confirmation...");
  const [messageOpacity] = useState(new Animated.Value(0));

  const activeOrder = orders.length > 0 ? orders[0] : null;

  // Background Animation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Timeline data for the active order
  const [trackingSteps, setTrackingSteps] = useState([]);

  useEffect(() => {
    if (activeOrder) {
      // Simulate accumulating messages over time (Temu-style)
      // In a real app, this would come from the backend.
      const steps = [
        { time: t('now'), message: "Order confirmed by restaurant", completed: true },
        { time: '2 mins ago', message: "Chef started preparing your food", completed: true },
        { time: '5 mins ago', message: "Order placed successfully", completed: true },
      ];
      setTrackingSteps(steps);

      // Simulate a new message coming in after a few seconds
      const timer = setTimeout(() => {
        setTrackingSteps(prev => [
          { time: t('now'), message: "Driver is heading to the restaurant", completed: true },
          ...prev
        ]);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [activeOrder, language]); // Added language to dependency to refresh simulation text if needed

  const renderOrderItem = ({ item, index }) => {
    const isLatest = index === 0;

    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: theme.colors.card }]}
        activeOpacity={0.9}
        onPress={() => isLatest ? setActiveTab('Map') : null}
      >
        <View style={styles.cardHeader}>
          <View style={styles.storeInfo}>
            <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="restaurant" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.storeName, { color: theme.colors.text }]}>{item.restaurantName || "Unknown Restaurant"}</Text>
              <Text style={[styles.orderId, { color: theme.colors.primary }]}>{t('order_id')}: #{item.id.slice(-6).toUpperCase()}</Text>
              <Text style={[styles.orderDate, { color: theme.colors.textLight }]}>{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
          <Text style={[
            styles.statusBadge,
            isLatest
              ? { backgroundColor: theme.colors.successLight, color: theme.colors.success }
              : { backgroundColor: theme.colors.input, color: theme.colors.muted }
          ]}>
            {isLatest ? item.status : "Completed"}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.itemsList}>
          {item.items.map((cartItem, i) => (
            <Text key={i} style={[styles.itemText, { color: theme.colors.textLight }]}>{cartItem.quantity}x {cartItem.name}</Text>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.totalText, { color: theme.colors.text }]}>{t('total')}: Rs {item.total.toFixed(2)}</Text>
          {isLatest && (
            <View style={[styles.trackBtn, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={[styles.trackText, { color: theme.colors.primaryDark }]}>{t('track_order')}</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.primaryDark} />
            </View>
          )}
          {!isLatest && (
            <TouchableOpacity style={[styles.reorderBtn, { backgroundColor: theme.colors.input }]}>
              <Ionicons name="refresh" size={14} color={theme.colors.primary} />
              <Text style={[styles.reorderText, { color: theme.colors.primary }]}>{t('reorder')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLatest && (
          <View style={[styles.timelineContainer, { backgroundColor: isDarkMode ? theme.colors.background : '#F0F9FF', borderColor: theme.colors.primaryLight }]}>
            <Text style={[styles.timelineHeader, { color: theme.colors.primaryDark }]}>{t('order_updates')}</Text>
            {trackingSteps.map((step, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: i === 0 ? theme.colors.primary : theme.colors.muted }]} />
                  {i !== trackingSteps.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineMessage, { color: i === 0 ? theme.colors.text : theme.colors.textLight, fontWeight: i === 0 ? '600' : '400' }]}>{step.message}</Text>
                  <Text style={[styles.timelineTime, { color: theme.colors.muted }]}>{step.time}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (orders.length === 0) {
    return (
      <LinearGradient
        colors={isDarkMode ? [theme.colors.background, '#111827'] : ['#FAFAFA', '#E0F2FE']}
        style={styles.emptyContainer}
      >
        <Ionicons name="receipt-outline" size={80} color={theme.colors.muted} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t('no_orders_yet')}</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textLight }]}>{t('explore_desc')}</Text>
        <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: theme.colors.primary }]} onPress={() => setActiveTab('Home')}>
          <Text style={[styles.exploreText, { color: theme.colors.white }]}>{t('explore_restaurants')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, overflow: 'hidden', backgroundColor: theme.colors.background }}>
          <Animated.View
            style={{
              position: 'absolute',
              top: -Dimensions.get('window').height * 0.5,
              left: -Dimensions.get('window').height * 0.5,
              width: Dimensions.get('window').height * 2,
              height: Dimensions.get('window').height * 2,
              transform: [{ rotate: spin }]
            }}
          >
            <LinearGradient
              colors={isDarkMode ? ['#1F2937', '#111827', '#374151'] : ['#F0F9FF', '#E0F2FE', '#F0F9FF', '#FAFAFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      </View>

      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('my_orders')}</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center',
    borderBottomWidth: 0, // Removed border for cleaner look over gradient
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  listContent: {
    padding: 20
  },
  orderCard: {
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    marginTop: 2
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden'
  },
  divider: {
    height: 1,
    marginVertical: 12
  },
  itemsList: {
    marginBottom: 12
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  trackText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  reorderText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    marginVertical: 2
  },
  timelineContainer: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  timelineHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 40
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
    marginRight: 10
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1
  },
  timelineLine: {
    width: 1,
    flex: 1,
    marginVertical: 4
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16
  },
  timelineMessage: {
    fontSize: 14,
    marginBottom: 2
  },
  timelineTime: {
    fontSize: 11
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20
  },
  emptySubtitle: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30
  },
  exploreBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30
  },
  exploreText: {
    fontWeight: 'bold',
    fontSize: 16
  }
});

