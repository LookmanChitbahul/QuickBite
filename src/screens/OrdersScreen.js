import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, StatusBar, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

import QRCode from 'react-native-qrcode-svg';

export default function OrdersScreen({ navigation }) {
  const { orders, theme, isDarkMode, setActiveTab, t, language } = useApp();
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

  const renderOrderItem = ({ item, index }) => {
    const isLatest = index === 0;

    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: theme.colors.card }]}
        activeOpacity={0.9}
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
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[
              styles.statusBadge,
              (item.status === 'Confirmed' || item.status === 'Picked Up')
                ? { backgroundColor: theme.colors.successLight, color: theme.colors.success }
                : { backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }
            ]}>
              {item.status}
            </Text>
            {item.status === 'Picked Up' && (
              <Ionicons name="checkmark-done-circle" size={28} color={theme.colors.success} style={{ marginTop: 8 }} />
            )}
            {item.status === 'Confirmed' && (
              <TouchableOpacity
                style={styles.qrIconBtn}
                onPress={() => setSelectedOrderForQR(item)}
              >
                <Ionicons name="qr-code" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.itemsList}>
          {item.items.map((cartItem, i) => (
            <Text key={i} style={[styles.itemText, { color: theme.colors.textLight }]}>{cartItem.quantity}x {cartItem.name}</Text>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.totalText, { color: theme.colors.text }]}>{t('total')}: Rs {item.total.toFixed(2)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.status === 'Confirmed' && (
              <TouchableOpacity
                style={[styles.trackBtn, { backgroundColor: theme.colors.successLight }]}
                onPress={() => setSelectedOrderForQR(item)}
              >
                <Text style={[styles.trackText, { color: theme.colors.success }]}>Tap for QR</Text>
                <Ionicons name="qr-code-outline" size={14} color={theme.colors.success} />
              </TouchableOpacity>
            )}
            {item.status === 'Awaiting Validation' && (
              <View style={[styles.trackBtn, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.trackText, { color: theme.colors.primaryDark }]}>Awaiting Owner</Text>
                <Ionicons name="hourglass-outline" size={14} color={theme.colors.primaryDark} />
              </View>
            )}
          </View>
        </View>

        {item.paymentProof && (
          <View style={styles.paymentProofThumbContainer}>
            <Text style={[styles.proofLabel, { color: theme.colors.textLight }]}>Payment Photo:</Text>
            <Image source={{ uri: item.paymentProof }} style={styles.proofThumbSmall} />
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
        data={orders.filter(o => o.status !== 'Picked Up' && o.status !== 'Payment Rejected')}
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

import { Modal } from 'react-native';

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
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoPlaceholder: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  storeName: { fontSize: 16, fontWeight: 'bold' },
  orderDate: { fontSize: 12, marginTop: 2 },
  statusBadge: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  divider: { height: 1, marginVertical: 12 },
  itemsList: { marginBottom: 12 },
  itemText: { fontSize: 14, marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontSize: 16, fontWeight: 'bold' },
  trackBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  trackText: { fontSize: 12, fontWeight: 'bold', marginRight: 4 },
  qrIconBtn: { marginTop: 10, padding: 5 },
  orderId: { fontSize: 12, fontWeight: '700', marginVertical: 2 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { textAlign: 'center', marginTop: 10, fontSize: 16, lineHeight: 24, marginBottom: 30 },
  exploreBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  exploreText: { fontWeight: 'bold', fontSize: 16 },
  paymentProofThumbContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 8,
    borderRadius: 8
  },
  proofLabel: { fontSize: 12, marginRight: 10, fontWeight: '600' },
  proofThumbSmall: { width: 40, height: 40, borderRadius: 4 },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '90%',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 20
  },
  orderRef: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30
  },
  closeBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
