import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, StatusBar, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

export default function OrderHistoryScreen({ navigation }) {
    const { orders, theme, isDarkMode, t } = useApp();

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

    const renderOrderItem = ({ item }) => {
        const isCompleted = item.status === 'Picked Up';

        return (
            <View style={[styles.orderCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.storeInfo}>
                        <View style={[styles.logoPlaceholder, { backgroundColor: isCompleted ? theme.colors.success : theme.colors.primary }]}>
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
                            isCompleted
                                ? { backgroundColor: theme.colors.successLight, color: theme.colors.success }
                                : { backgroundColor: theme.colors.input, color: theme.colors.muted }
                        ]}>
                            {item.status}
                        </Text>
                        {isCompleted && (
                            <Ionicons name="checkmark-done-circle" size={24} color={theme.colors.success} style={{ marginTop: 4 }} />
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
                </View>

                {item.paymentProof && (
                    <View style={styles.proofSection}>
                        <Text style={[styles.proofTitle, { color: theme.colors.textLight }]}>Payment Verification Photo:</Text>
                        <Image source={{ uri: item.paymentProof }} style={styles.proofImage} resizeMode="cover" />
                    </View>
                )}

                {!isCompleted && (
                    <View style={styles.qrSection}>
                        <Text style={[styles.qrTitle, { color: theme.colors.text }]}>Pickup QR Code</Text>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={JSON.stringify({ orderId: item.id, restaurantId: item.restaurantId })}
                                size={140}
                                color="black"
                                backgroundColor="white"
                            />
                        </View>
                        <Text style={[styles.qrHint, { color: theme.colors.textLight }]}>Show this to the restaurant staff to confirm pickup</Text>
                    </View>
                )}
            </View>
        );
    };

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
                <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Order History</Text>
                <View style={{ width: 44 }} />
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={80} color={theme.colors.muted} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No History Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.textLight }]}>Complete your first order to see it here.</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    storeInfo: { flexDirection: 'row', alignItems: 'center' },
    logoPlaceholder: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    storeName: { fontSize: 16, fontWeight: 'bold' },
    orderDate: { fontSize: 12, marginTop: 2 },
    statusBadge: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
    divider: { height: 1, marginVertical: 12 },
    itemsList: { marginBottom: 12 },
    itemText: { fontSize: 14, marginBottom: 4 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalText: { fontSize: 16, fontWeight: 'bold' },
    orderId: { fontSize: 12, fontWeight: '700', marginVertical: 2 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
    emptySubtitle: { textAlign: 'center', marginTop: 10, fontSize: 16, lineHeight: 24, marginBottom: 30 },
    qrSection: {
        marginTop: 15,
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)'
    },
    qrTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10
    },
    qrWrapper: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    qrHint: {
        fontSize: 11,
        marginTop: 8,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    proofSection: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)'
    },
    proofTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8
    },
    proofImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        backgroundColor: '#F3F4F6'
    }
});
