import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Platform, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';

export default function CartScreen({ navigation }) {
    const { cart, updateCartQuantity, removeFromCart, placeOrder, setActiveTab, theme, isDarkMode, t, restaurants, addToCart, setCart, userLocation } = useApp();
    const [tempProof, setTempProof] = useState(null);
    const [finalProof, setFinalProof] = useState(null);
    const [isOutletPickerVisible, setIsOutletPickerVisible] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFee = 15;
    const total = subtotal + (cart.length > 0 ? serviceFee : 0);

    // Get the restaurant for bank details
    const restaurantId = cart[0]?.restaurantId;
    const currentRestaurant = restaurants.find(r => r.id === restaurantId);
    // Find all branches of this brand
    const availableOutlets = currentRestaurant?.brand
        ? restaurants.filter(r => r.brand === currentRestaurant.brand)
        : (currentRestaurant ? [currentRestaurant] : []);

    // Simple distance sort (if user location exists)
    // Distance sort & Formatting
    const sortedOutlets = React.useMemo(() => {
        if (!userLocation || !availableOutlets.length) return availableOutlets;

        const withDist = availableOutlets.map(r => {
            const dist = Math.sqrt(
                Math.pow(r.location.latitude - userLocation.latitude, 2) +
                Math.pow(r.location.longitude - userLocation.longitude, 2)
            ) * 111; // Approx km for 1 deg lat
            return { ...r, calculatedDistance: dist };
        });

        return withDist.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    }, [availableOutlets, userLocation]);

    // Auto-select nearest outlet
    React.useEffect(() => {
        if (sortedOutlets.length > 0 && cart.length > 0) {
            const nearest = sortedOutlets[0];
            const currentId = cart[0].restaurantId;
            // Only switch if different and belongs to the same brand/group
            if (nearest.id !== currentId) {
                // Silently update cart or prompt? User said "default to closest". 
                // Auto-updating is smoothest for "default" behavior.
                setCart(prevCart => prevCart.map(item => ({
                    ...item,
                    restaurantId: nearest.id,
                    restaurantName: nearest.name
                })));
                // Optional: show a small toast or just let it be seamless
                // Alert.alert("Location Optimized", `Switched to nearest branch: ${nearest.name}`);
            }
        }
    }, [sortedOutlets, cart.length]); // Check when outlets or cart init

    const bankDetails = currentRestaurant?.bankDetails || { bank: 'MCB', account: '000445566778', name: 'QuickBite Ltd', juice: '57778888' };

    const changeOutlet = (newOutlet) => {
        setCart(prevCart => prevCart.map(item => ({
            ...item,
            restaurantId: newOutlet.id,
            restaurantName: newOutlet.name
        })));
        setIsOutletPickerVisible(false);
        Alert.alert("Location Updated", `Order will be placed at ${newOutlet.name}`);
    };

    const handleCheckout = async () => {
        if (!finalProof) {
            Alert.alert("Payment Proof Required", "Please upload and INSERT a screenshot of your internet banking transfer to place the order.");
            return;
        }
        const success = await placeOrder(finalProof);
        if (success) {
            Alert.alert("Success!", "Your order has been placed and is awaiting validation. We will verify your payment proof shortly.", [
                { text: "View Order", onPress: () => { setActiveTab('Orders'); navigation.navigate('Home'); } }, // Navigate to Home tab which holds Orders? No, Orders is a tab.
                { text: "OK", onPress: () => { setActiveTab('Home'); navigation.navigate('Home'); } }
            ]);
        }
    };

    const pickProof = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your gallery to upload the payment proof.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true, // This enables the "Crop" button in the OS picker
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setTempProof(result.assets[0].uri);
            // User now needs to click "INSERT" to confirm the cropped image
        }
    };

    const confirmInsert = () => {
        setFinalProof(tempProof);
        setTempProof(null);
        Alert.alert("Success", "Payment proof inserted successfully!");
    };

    if (cart.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }]}>
                <View style={styles.emptyIconContainer}>
                    <Ionicons name="cart" size={100} color={isDarkMode ? '#374151' : '#F3F4F6'} />
                </View>
                <Text style={[styles.emptyTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{t('empty_cart_title')}</Text>
                <Text style={styles.emptySubtitle}>{t('empty_cart_subtitle')}</Text>
                <TouchableOpacity onPress={() => { setActiveTab('Home'); navigation.navigate('Home'); }} style={[styles.exploreBtn, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.exploreText}>{t('explore_restaurants')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }]}>
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{t('my_basket')}</Text>
                    {currentRestaurant && (
                        <TouchableOpacity
                            style={[styles.locationSelector, { backgroundColor: theme.colors.primary + '20' }]}
                            onPress={() => setIsOutletPickerVisible(true)}
                        >
                            <Ionicons name="location-sharp" size={14} color={theme.colors.primary} />
                            <Text style={[styles.locationText, { color: theme.colors.primary }]}>{currentRestaurant.name}</Text>
                            <Ionicons name="chevron-down" size={14} color={theme.colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
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
                        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.trashBtn}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.muted} />
                        </TouchableOpacity>
                        <Image source={{ uri: item.image }} style={styles.image} />
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListHeaderComponent={() => (
                    <View style={styles.listHeader}>
                        {(currentRestaurant) && (
                            <TouchableOpacity
                                style={[styles.instructionBox, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                                onPress={() => navigation.navigate('RestaurantDetails', { restaurant: currentRestaurant })}
                            >
                                <Ionicons name="restaurant-outline" size={20} color={theme.colors.primary} />
                                <Text style={[styles.instructionText, { color: theme.colors.primary }]}>Add More Food</Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                ListFooterComponent={() => (
                    <View style={styles.footer}>

                        {/* Upsell Section */}
                        {currentRestaurant?.menu && currentRestaurant.menu.length > 0 && (
                            <View style={styles.upsellContainer}>
                                <Text style={[styles.upsellTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>You might also like</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.upsellScroll}>
                                    {currentRestaurant.menu
                                        .filter(m => !cart.find(c => c.id === m.id))
                                        .slice(0, 5)
                                        .map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[styles.upsellCard, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                                                onPress={() => addToCart(item, currentRestaurant)}
                                            >
                                                <Image source={{ uri: item.image }} style={styles.upsellImage} />
                                                <View style={styles.upsellInfo}>
                                                    <Text numberOfLines={1} style={[styles.upsellName, { color: isDarkMode ? '#fff' : '#000' }]}>{item.name}</Text>
                                                    <Text style={[styles.upsellPrice, { color: theme.colors.primary }]}>Rs {item.price}</Text>
                                                </View>
                                                <View style={[styles.upsellAddBtn, { backgroundColor: theme.colors.primary }]}>
                                                    <Ionicons name="add" size={16} color="#fff" />
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                </ScrollView>
                            </View>
                        )}
                        <Text style={[styles.summaryTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Payment Details</Text>

                        <View style={[styles.paymentMethodBox, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
                            <View style={styles.paymentMethodHeader}>
                                <Ionicons name="business" size={24} color={theme.colors.primary} />
                                <Text style={[styles.paymentMethodTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Internet Banking ({bankDetails.bank})</Text>
                            </View>

                            <View style={styles.bankDetailRow}>
                                <Text style={styles.bankLabel}>A/C Name:</Text>
                                <Text style={[styles.bankValue, { color: isDarkMode ? '#fff' : '#000' }]}>{bankDetails.name}</Text>
                            </View>
                            <View style={styles.bankDetailRow}>
                                <Text style={styles.bankLabel}>A/C Number:</Text>
                                <Text style={[styles.bankValue, { color: theme.colors.primary, fontWeight: '900' }]}>{bankDetails.account}</Text>
                            </View>
                            {bankDetails.juice && (
                                <View style={styles.bankDetailRow}>
                                    <Text style={styles.bankLabel}>Juice No:</Text>
                                    <Text style={[styles.bankValue, { color: '#10B981', fontWeight: '900' }]}>{bankDetails.juice}</Text>
                                </View>
                            )}

                            <Text style={styles.paymentMethodDesc}>1. Open your banking app.{"\n"}2. Transfer Rs {total.toFixed(2)}.{"\n"}3. Take a screenshot & INSERT it below.</Text>

                            <View style={styles.uploadContainer}>
                                <TouchableOpacity
                                    style={[styles.uploadBox, { borderColor: (finalProof || tempProof) ? '#10B981' : theme.colors.primary }]}
                                    onPress={pickProof}
                                >
                                    {(tempProof || finalProof) ? (
                                        <View style={styles.proofSelected}>
                                            <Image source={{ uri: tempProof || finalProof }} style={styles.proofThumb} />
                                            <Text style={[styles.uploadText, { color: '#10B981' }]}>
                                                {tempProof ? "Photo Selected" : "Photo Inserted"}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={styles.proofSelected}>
                                            <Ionicons name="crop" size={24} color={theme.colors.primary} />
                                            <Text style={[styles.uploadText, { color: theme.colors.primary }]}>Select & Crop Photo</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {tempProof && (
                                    <TouchableOpacity style={[styles.insertBtn, { backgroundColor: theme?.colors?.primary || '#CC0000' }]} onPress={confirmInsert}>
                                        <Text style={styles.insertBtnText}>INSERT PHOTO</Text>
                                        <Ionicons name="cloud-upload" size={18} color="#fff" />
                                    </TouchableOpacity>
                                )}

                                {finalProof && (
                                    <View style={styles.insertedBadge}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.insertedBadgeText}>INSERTED</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <Text style={[styles.summaryTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937', marginTop: 20 }]}>{t('payment_summary')}</Text>
                        <View style={styles.row}>
                            <Text style={[styles.label, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{t('subtotal')}</Text>
                            <Text style={[styles.value, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Rs {subtotal.toFixed(2)}</Text>
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
                <TouchableOpacity
                    style={[styles.checkoutBtn, { backgroundColor: finalProof ? theme.colors.primary : '#9CA3AF' }]}
                    onPress={handleCheckout}
                >
                    <Text style={styles.checkoutBtnText}>Place Order</Text>
                    <View style={styles.checkoutPriceBadge}>
                        <Text style={styles.checkoutPriceText}>Rs {total.toFixed(2)}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Outlet Picker Modal */}
            <Modal visible={isOutletPickerVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1F2937' : '#fff' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Select Location</Text>
                            <TouchableOpacity onPress={() => setIsOutletPickerVisible(false)}>
                                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 13, color: '#666', marginBottom: 15 }}>Sorted by distance to you</Text>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {sortedOutlets.map((outlet, index) => (
                                <TouchableOpacity
                                    key={outlet.id}
                                    style={[styles.outletItem, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                                    onPress={() => changeOutlet(outlet)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.outletName, { color: isDarkMode ? '#fff' : '#000', fontWeight: outlet.id === restaurantId ? 'bold' : 'normal' }]}>
                                            {outlet.name}
                                        </Text>
                                        <Text style={[styles.outletAddr, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                            {outlet.address} • {outlet.calculatedDistance ? `${outlet.calculatedDistance.toFixed(1)} km` : (outlet.distance || 'N/A')}
                                        </Text>
                                    </View>
                                    {outlet.id === restaurantId && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
                                    {index === 0 && outlet.id !== restaurantId && (
                                        <View style={{ backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>NEAREST</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    closeBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    listHeader: { paddingHorizontal: 20, paddingVertical: 10 },
    instructionBox: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
    instructionText: { marginLeft: 10, fontWeight: 'bold', fontSize: 15 },
    cartItem: { flexDirection: 'row', padding: 20, alignItems: 'center', borderBottomWidth: 1 },
    qtySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20, paddingHorizontal: 5 },
    qtyActionBtn: { padding: 8 },
    qtyText: { fontSize: 15, fontWeight: '900', marginHorizontal: 10, minWidth: 15, textAlign: 'center' },
    image: { width: 70, height: 70, borderRadius: 8 },
    details: { flex: 1, marginHorizontal: 15 },
    name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    price: { fontSize: 14 },
    footer: { padding: 20, marginTop: 10 },
    upsellContainer: { marginBottom: 25 },
    upsellTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    upsellScroll: { paddingBottom: 10 },
    upsellCard: {
        width: 140,
        marginRight: 12,
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        elevation: 2
    },
    upsellImage: { width: '100%', height: 90, borderRadius: 8, marginBottom: 8 },
    upsellInfo: { paddingHorizontal: 4 },
    upsellName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
    upsellPrice: { fontSize: 12, fontWeight: '700' },
    upsellAddBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
    paymentMethodBox: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },
    paymentMethodHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    paymentMethodTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    bankDetailRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
    bankLabel: { fontSize: 13, color: '#6B7280', width: 90 },
    bankValue: { fontSize: 14, fontWeight: '600' },
    paymentMethodDesc: { fontSize: 13, color: '#6B7280', marginVertical: 15, lineHeight: 20 },
    uploadContainer: { marginTop: 5 },
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    proofSelected: { flexDirection: 'row', alignItems: 'center' },
    proofThumb: { width: 40, height: 40, borderRadius: 4, marginRight: 10 },
    uploadText: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 10 },
    insertBtn: {
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    insertBtnText: { color: '#fff', fontWeight: 'bold', marginRight: 8 },
    insertedBadge: {
        backgroundColor: '#10B981',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    insertedBadgeText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    label: { fontSize: 15 },
    value: { fontSize: 15, fontWeight: '600' },
    totalRow: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E5E5E5' },
    totalLabel: { fontSize: 18, fontWeight: '900' },
    totalValue: { fontSize: 18, fontWeight: '900' },
    checkoutContainer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E5E5E5' },
    checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
    checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: '900', flex: 1, textAlign: 'center', marginLeft: 40 },
    checkoutPriceBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 10 },
    checkoutPriceText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyIconContainer: { marginBottom: 30 },
    emptyTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
    emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
    exploreBtn: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, elevation: 2 },
    exploreText: { color: '#fff', fontWeight: '900', fontSize: 16 },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 4
    },
    locationText: { fontWeight: 'bold', fontSize: 13, marginHorizontal: 6 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    outletItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
    outletName: { fontSize: 16 },
    outletAddr: { fontSize: 12, marginTop: 2 },
    trashBtn: {
        padding: 8,
        marginHorizontal: 5
    }
});
