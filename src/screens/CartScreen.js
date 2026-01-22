import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';

export default function CartScreen({ navigation }) {
    const { cart, updateCartQuantity, removeFromCart, placeOrder, setActiveTab, theme, isDarkMode, t } = useApp();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 25; // Adjusted to Rs for Mauritius
    const serviceFee = 15; // Adjusted to Rs for Mauritius
    const total = subtotal + (cart.length > 0 ? (deliveryFee + serviceFee) : 0);

    const handleCheckout = () => {
        placeOrder();
        Alert.alert(t('success') || "Success!", t('order_placed') || "Your order has been placed.", [
            { text: t('track_order') || "Track Order", onPress: () => setActiveTab('Map') },
            { text: "OK", onPress: () => setActiveTab('Home') }
        ]);
    };

    if (cart.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }]}>
                <View style={styles.emptyIconContainer}>
                    <Ionicons name="cart" size={100} color={isDarkMode ? '#374151' : '#F3F4F6'} />
                </View>
                <Text style={[styles.emptyTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{t('empty_cart_title')}</Text>
                <Text style={styles.emptySubtitle}>{t('empty_cart_subtitle')}</Text>
                <TouchableOpacity onPress={() => setActiveTab('Home')} style={[styles.exploreBtn, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.exploreText}>{t('explore_restaurants')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{cart[0]?.restaurantName || t('my_basket')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={cart}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.cartItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                        <View style={styles.qtySelector}>
                            <TouchableOpacity onPress={() => updateCartQuantity(item.id, -1)} style={styles.qtyActionBtn}>
                                <Ionicons name="remove" size={20} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                            </TouchableOpacity>
                            <Text style={[styles.qtyText, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => updateCartQuantity(item.id, 1)} style={styles.qtyActionBtn}>
                                <Ionicons name="add" size={20} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.details}>
                            <Text style={[styles.name, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{item.name}</Text>
                            <Text style={[styles.price, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Rs {item.price.toFixed(2)}</Text>
                        </View>
                        <Image source={{ uri: item.image }} style={styles.image} />
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListHeaderComponent={() => (
                    <View style={styles.listHeader}>
                        <TouchableOpacity style={[styles.instructionBox, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                            <Ionicons name="add-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.instructionText, { color: theme.colors.primary }]}>{t('add_instructions')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListFooterComponent={() => (
                    <View style={styles.footer}>
                        <Text style={[styles.summaryTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{t('payment_summary')}</Text>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{t('subtotal')}</Text>
                            <Text style={[styles.value, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Rs {subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{t('delivery_fee')}</Text>
                            <Text style={[styles.value, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Rs {deliveryFee.toFixed(2)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{t('service_fee')}</Text>
                            <Text style={[styles.value, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Rs {serviceFee.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.row, styles.totalRow]}>
                            <Text style={[styles.totalLabel, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{t('total')}</Text>
                            <Text style={[styles.totalValue, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Rs {total.toFixed(2)}</Text>
                        </View>
                    </View>
                )}
            />

            <View style={[styles.checkoutContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
                <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: theme.colors.primary }]} onPress={handleCheckout}>
                    <Text style={styles.checkoutBtnText}>{t('next_checkout')}</Text>
                    <View style={styles.checkoutPriceBadge}>
                        <Text style={styles.checkoutPriceText}>Rs {total.toFixed(2)}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    closeBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    instructionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    instructionText: {
        marginLeft: 10,
        fontWeight: 'bold',
        fontSize: 15
    },
    cartItem: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    qtySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        paddingHorizontal: 5
    },
    qtyActionBtn: {
        padding: 8
    },
    qtyText: {
        fontSize: 15,
        fontWeight: '900',
        marginHorizontal: 10,
        minWidth: 15,
        textAlign: 'center'
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    details: {
        flex: 1,
        marginHorizontal: 15
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4
    },
    price: {
        fontSize: 14,
    },
    footer: {
        padding: 20,
        marginTop: 10
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 20
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    label: {
        fontSize: 15
    },
    value: {
        fontSize: 15,
        fontWeight: '600'
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5'
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '900',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    checkoutContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5'
    },
    checkoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    checkoutBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        flex: 1,
        textAlign: 'center',
        marginLeft: 40
    },
    checkoutPriceBadge: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10
    },
    checkoutPriceText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
    },
    emptyIconContainer: {
        marginBottom: 30
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22
    },
    exploreBtn: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 2
    },
    exploreText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 16
    }
});

