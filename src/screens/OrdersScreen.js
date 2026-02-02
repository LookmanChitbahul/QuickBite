import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, StatusBar, Animated, Easing, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

export default function OrdersScreen({ navigation }) {
  const { orders, user, theme, isDarkMode, setActiveTab, t, language } = useApp();
  const [selectedOrderForQR, setSelectedOrderForQR] = useState(null);

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

  const StatusTimeline = ({ status }) => {
    const steps = [
      { id: 'validation', label: 'Payment Verification', icon: 'shield-checkmark', active: ['Awaiting Validation', 'Confirmed', 'Picked Up'].includes(status) },
      { id: 'pickup', label: 'Ready for Pick Up', icon: 'restaurant', active: ['Confirmed', 'Picked Up'].includes(status) }
    ];

    return (
      <View style={styles.timelineContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <View style={styles.timelineStep}>
              <View style={[
                styles.timelineIcon,
                { backgroundColor: step.active ? theme.colors.success : theme.colors.input }
              ]}>
                <Ionicons
                  name={step.icon}
                  size={16}
                  color={step.active ? '#fff' : theme.colors.muted}
                />
              </View>
              <Text style={[
                styles.timelineLabel,
                { color: step.active ? theme.colors.text : theme.colors.muted, fontWeight: step.active ? '700' : '400' }
              ]}>
                {step.label}
              </Text>
              {step.active && status === (step.id === 'validation' ? 'Awaiting Validation' : 'Confirmed') && (
                <View style={styles.activeDot} />
              )}
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.timelineLine,
                { backgroundColor: steps[index + 1].active ? theme.colors.success : theme.colors.border }
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderOrderItem = ({ item }) => {
    const isReady = item.status === 'Confirmed';
    const isAwaiting = item.status === 'Awaiting Validation';

    return (
      <View style={[styles.orderCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={styles.storeInfo}>
            <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="restaurant" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.storeName, { color: theme.colors.text }]}>{item.restaurantName || "Restaurant"}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.orderId, { color: theme.colors.primary }]}>#{item.id.slice(-6).toUpperCase()}</Text>
                <Text style={[styles.dotSeparator, { color: theme.colors.muted }]}> • </Text>
                <Text style={[styles.orderDateSmall, { color: theme.colors.textLight }]}>
                  {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            isReady ? { backgroundColor: theme.colors.successLight } : { backgroundColor: theme.colors.primaryLight }
          ]}>
            <Text style={[
              styles.statusBadgeText,
              isReady ? { color: theme.colors.success } : { color: theme.colors.primary }
            ]}>
              {item.status}
            </Text>
          </View>
        </View>

        <StatusTimeline status={item.status} />

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.itemsList}>
          {item.items.map((cartItem, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>{cartItem.quantity}x {cartItem.name}</Text>
              <Text style={[styles.itemPrice, { color: theme.colors.textLight }]}>Rs {(cartItem.price * cartItem.quantity).toFixed(0)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={[styles.totalLabelSmall, { color: theme.colors.textLight }]}>Total Amount</Text>
            <Text style={[styles.totalText, { color: theme.colors.text }]}>Rs {item.total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.mapBtn, { backgroundColor: theme.colors.input }]}
            onPress={() => navigation.navigate('Map', {
              restaurant: {
                name: item.restaurantName,
                location: item.location || { latitude: -20.2443, longitude: 57.4882 },
                description: item.restaurantAddress
              }
            })}
          >
            <Ionicons name="location-outline" size={16} color={theme.colors.text} />
            <Text style={[styles.mapBtnText, { color: theme.colors.text }]}>Map</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.qrSection, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
          <View style={styles.qrHeader}>
            <Ionicons name="qr-code-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.qrTitle, { color: theme.colors.text }]}>Verification QR Code</Text>
          </View>

          <View style={styles.qrContainerWrapper}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={JSON.stringify({ orderId: item.id, type: 'pickup' })}
                size={140}
                color="#000"
                backgroundColor="#fff"
              />
              {isAwaiting && (
                <View style={[styles.qrOverlay, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                  <View style={styles.lockCircle}>
                    <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.qrOverlayText, { color: theme.colors.text, marginTop: 10 }]}>Locked</Text>
                  <Text style={{ fontSize: 10, color: theme.colors.textLight, textAlign: 'center', paddingHorizontal: 10 }}>Wait for confirmation</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[styles.qrHint, { color: theme.colors.textLight }]}>
            {isReady
              ? "Payment verified! Show this to collect your order."
              : "Code will unlock once the owner verifies your payment proof."}
          </Text>
        </View>
      </View>
    );
  };

  // Memoized filtered orders for personal view
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // For owners, we MUST filter to separate personal orders from business orders
      // For non-owners, the listener already filters by userId
      const isPersonal = user?.isOwner ? (o.userId === user?.uid) : true;
      return isPersonal &&
        o.status !== 'Picked Up' &&
        o.status !== 'Payment Rejected' &&
        o.status !== 'Cancelled';
    });
  }, [orders, user?.uid, user?.isOwner]);

  if (filteredOrders.length === 0) {
    return (
      <LinearGradient
        colors={isDarkMode ? [theme.colors.background, '#111827'] : ['#FAFAFA', '#E0F2FE']}
        style={styles.emptyContainer}
      >
        <Ionicons name="receipt-outline" size={80} color={theme.colors.muted} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Active Orders</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textLight }]}>
          {orders.length > 0 && user?.isOwner
            ? "You have incoming business orders, but no personal food orders."
            : t('explore_desc')}
        </Text>
        {orders.length > 0 && user?.isOwner && (
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: '#10B981', marginTop: 10 }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.exploreText, { color: '#fff' }]}>Go to Dashboard</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: theme.colors.primary, marginTop: 15 }]} onPress={() => setActiveTab('Home')}>
          <Text style={[styles.exploreText, { color: theme.colors.white }]}>{t('explore_restaurants')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('my_orders')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* QR Code Modal */}
      <Modal
        visible={!!selectedOrderForQR}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedOrderForQR(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Verification QR Code</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textLight }]}>
              Show this to the restaurant owner at pickup.
            </Text>

            <View style={styles.qrContainer}>
              {selectedOrderForQR && (
                <QRCode
                  value={JSON.stringify({ orderId: selectedOrderForQR.id, type: 'pickup' })}
                  size={200}
                  color={isDarkMode ? '#FFF' : '#000'}
                  backgroundColor='transparent'
                />
              )}
            </View>

            <Text style={[styles.orderRef, { color: theme.colors.primary }]}>
              Ref: #{selectedOrderForQR?.id.slice(-6).toUpperCase()}
            </Text>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => setSelectedOrderForQR(null)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  listContent: { padding: 20 },
  orderCard: {
    borderRadius: 24,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoPlaceholder: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  storeName: { fontSize: 18, fontWeight: '800' },
  orderDate: { fontSize: 12, marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, marginVertical: 16 },
  itemsList: { marginBottom: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemText: { fontSize: 15, fontWeight: '500' },
  itemPrice: { fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  totalLabelSmall: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  totalText: { fontSize: 20, fontWeight: '900' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  mapBtnText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  qrSection: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center'
  },
  qrHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  qrTitle: { fontSize: 14, fontWeight: '800', marginLeft: 8, textTransform: 'uppercase' },
  qrContainerWrapper: {
    width: 170,
    height: 170,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  qrWrapper: { position: 'relative' },
  qrOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  qrOverlayText: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  qrHint: { fontSize: 11, marginTop: 15, fontWeight: '600', textAlign: 'center', lineHeight: 16, paddingHorizontal: 10 },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 5
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  timelineLabel: {
    fontSize: 10,
    textAlign: 'center'
  },
  timelineLine: {
    width: 30,
    height: 2,
    marginTop: -20
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 13
  },
  dotSeparator: { fontSize: 12, marginHorizontal: 4 },
  orderDateSmall: { fontSize: 12, fontWeight: '500' },
  orderId: { fontSize: 12, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 24 },
  emptySubtitle: { textAlign: 'center', marginTop: 12, fontSize: 16, lineHeight: 24, marginBottom: 32 },
  exploreBtn: { paddingHorizontal: 40, paddingVertical: 18, borderRadius: 35, elevation: 4 },
  exploreText: { fontWeight: 'bold', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 32, padding: 32, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  modalSubtitle: { textAlign: 'center', marginBottom: 24, fontSize: 15 },
  qrContainer: { padding: 20, backgroundColor: 'white', borderRadius: 24, marginBottom: 20 },
  orderRef: { fontSize: 16, fontWeight: 'bold', marginBottom: 32 },
  closeBtn: { width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  closeBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
