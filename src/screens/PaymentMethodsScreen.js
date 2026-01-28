import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function PaymentMethodsScreen({ navigation }) {
    const context = useApp();

    if (!context) return null;

    const { theme, isDarkMode, orders, paymentMethods, addPaymentMethod, deletePaymentMethod } = context;
    const [tempProof, setTempProof] = useState(null);
    const [paymentProofs, setPaymentProofs] = useState([]); // This stays local for session or could be synced too, but user specifically asked for "cards"
    const [isAddCardVisible, setIsAddCardVisible] = useState(false);
    const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', type: 'Visa' });

    const bgColor = theme?.colors?.background || '#F9FAFB';
    const cardColor = theme?.colors?.card || '#FFFFFF';
    const textColor = theme?.colors?.text || '#111827';
    const textLightColor = theme?.colors?.textLight || '#6B7280';
    const primaryColor = theme?.colors?.primary || '#F59E0B';
    const borderColor = theme?.colors?.border || '#E5E7EB';
    const successColor = theme?.colors?.success || '#10B981';
    const primaryLightColor = theme?.colors?.primaryLight || 'rgba(245, 158, 11, 0.1)';

    const banks = [
        { name: 'MCB Juice', logo: 'wallet', color: '#E11D48', url: 'https://www.mcb.mu/en/personal/banking/juice' },
        { name: 'SBM Pocket', logo: 'business', color: '#1E40AF', url: 'https://www.sbmgroup.mu/personal/digital-banking/sbm-pocket' },
    ];

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setTempProof(result.assets[0].uri);
        }
    };

    const confirmInsert = () => {
        const newProof = {
            id: Date.now().toString(),
            uri: tempProof,
            date: new Date().toLocaleString()
        };
        setPaymentProofs([newProof, ...paymentProofs]);
        setTempProof(null);
        Alert.alert('Success', 'Payment proof inserted and saved to your profile.');
    };

    const handleAddCard = () => {
        if (newCard.number.length < 16) {
            Alert.alert("Error", "Please enter a valid card number");
            return;
        }
        const card = {
            id: Date.now().toString(),
            type: newCard.type,
            last4: newCard.number.slice(-4),
            expiry: newCard.expiry,
            icon: newCard.type === 'Visa' ? 'card' : 'card-outline'
        };
        addPaymentMethod(card);
        setNewCard({ number: '', expiry: '', cvc: '', type: 'Visa' });
        setIsAddCardVisible(false);
        Alert.alert("Success", "Card added successfully");
    };

    const handleDeleteCard = (id) => {
        Alert.alert(
            "Delete Card",
            "Are you sure you want to remove this card?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deletePaymentMethod(id) }
            ]
        );
    };

    const openBankLink = (url) => {
        Linking.openURL(url).catch(err => Alert.alert("Error", "Could not open banking link. Please ensure the app is installed."));
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: cardColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Internet Banking</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <Text style={[styles.sectionHeading, { color: textLightColor }]}>Quick Access to Banking</Text>
                <View style={styles.bankLinksRow}>
                    {banks.map((bank, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.bankLinkItem, { backgroundColor: cardColor, borderColor: borderColor, width: (width - 60) / 2 }]}
                            onPress={() => openBankLink(bank.url)}
                        >
                            <View style={[styles.bankCircle, { backgroundColor: bank.color }]}>
                                <Ionicons name={bank.logo} size={24} color="#fff" />
                            </View>
                            <Text style={[styles.bankLinkLabel, { color: textColor }]}>{bank.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.cardSection}>
                    <View style={styles.uploadHeader}>
                        <Text style={[styles.sectionHeading, { color: textLightColor, marginBottom: 0 }]}>Saved Cards</Text>
                        <TouchableOpacity
                            style={[styles.plusButton, { backgroundColor: primaryColor }]}
                            onPress={() => setIsAddCardVisible(!isAddCardVisible)}
                        >
                            <Ionicons name={isAddCardVisible ? "close" : "add"} size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {isAddCardVisible && (
                        <View style={[styles.addCardForm, { backgroundColor: cardColor, borderColor: borderColor }]}>
                            <TextInput
                                style={[styles.cardInput, { color: textColor, borderColor: borderColor }]}
                                placeholder="Card Number"
                                placeholderTextColor={textLightColor}
                                keyboardType="numeric"
                                maxLength={16}
                                value={newCard.number}
                                onChangeText={(val) => setNewCard({ ...newCard, number: val })}
                            />
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                <TextInput
                                    style={[styles.cardInput, { flex: 1, color: textColor, borderColor: borderColor }]}
                                    placeholder="MM/YY"
                                    placeholderTextColor={textLightColor}
                                    maxLength={5}
                                    value={newCard.expiry}
                                    onChangeText={(val) => setNewCard({ ...newCard, expiry: val })}
                                />
                                <TextInput
                                    style={[styles.cardInput, { flex: 1, color: textColor, borderColor: borderColor }]}
                                    placeholder="CVC"
                                    placeholderTextColor={textLightColor}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    secureTextEntry
                                    value={newCard.cvc}
                                    onChangeText={(val) => setNewCard({ ...newCard, cvc: val })}
                                />
                            </View>
                            <TouchableOpacity style={[styles.saveCardBtn, { backgroundColor: primaryColor }]} onPress={handleAddCard}>
                                <Text style={styles.saveCardBtnText}>Save Card</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => (
                            <View key={method.id} style={[styles.proofCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
                                <View style={[styles.bankCircle, { backgroundColor: primaryLightColor, marginRight: 15 }]}>
                                    <Ionicons name={method.icon || 'card'} size={24} color={primaryColor} />
                                </View>
                                <View style={styles.proofDetails}>
                                    <Text style={[styles.proofDate, { color: textColor, fontSize: 16 }]}>{method.type} **** {method.last4}</Text>
                                    <Text style={[styles.proofDate, { color: textLightColor }]}>Expires {method.expiry || 'N/A'}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteCard(method.id)}>
                                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        <View style={[styles.emptyState, { borderColor: borderColor }]}>
                            <Text style={{ color: textLightColor }}>No saved cards yet</Text>
                        </View>
                    )}
                </View>

                <View style={styles.uploadSection}>
                    <View style={styles.uploadHeader}>
                        <Text style={[styles.sectionHeading, { color: textLightColor, marginBottom: 0 }]}>Manual Bank Transfer Proofs</Text>
                        <TouchableOpacity style={[styles.plusButton, { backgroundColor: primaryColor }]} onPress={pickImage}>
                            <Ionicons name="camera" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {tempProof && (
                        <View style={[styles.tempProofContainer, { backgroundColor: cardColor, borderColor: primaryColor }]}>
                            <Image source={{ uri: tempProof }} style={styles.tempImage} />
                            <View style={styles.tempControls}>
                                <Text style={[styles.tempText, { color: textColor }]}>Image Cropped & Ready</Text>
                                <TouchableOpacity style={styles.insertBtn} onPress={confirmInsert}>
                                    <Text style={styles.insertBtnText}>INSERT TO PROFILE</Text>
                                    <Ionicons name="cloud-upload" size={18} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setTempProof(null)}>
                                    <Text style={{ color: '#EF4444', marginTop: 10 }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {paymentProofs.length > 0 && (
                        paymentProofs.map((proof) => (
                            <View key={proof.id} style={[styles.proofCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
                                <Image source={{ uri: proof.uri }} style={styles.proofImage} />
                                <View style={styles.proofDetails}>
                                    <Text style={[styles.proofDate, { color: textColor }]}>Saved on {proof.date}</Text>
                                    <TouchableOpacity onPress={() => removeProof(proof.id)}>
                                        <Text style={{ color: '#EF4444', fontWeight: 'bold', marginTop: 5 }}>Delete Asset</Text>
                                    </TouchableOpacity>
                                </View>
                                <Ionicons name="bookmark" size={24} color={primaryColor} />
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.ordersSection}>
                    <Text style={[styles.sectionHeading, { color: textLightColor, marginTop: 20 }]}>Order Verification Photos</Text>

                    {orders && orders.length > 0 ? (
                        orders.map((order) => (
                            <View key={order.id} style={[styles.orderProofCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
                                <View style={styles.orderProofHeader}>
                                    <View>
                                        <Text style={[styles.orderResName, { color: textColor }]}>{order.restaurantName}</Text>
                                        <Text style={[styles.orderIdText, { color: textLightColor }]}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: order.status === 'Delivered' ? '#D1FAE5' : '#FEF3C7' }]}>
                                        <Text style={[styles.statusText, { color: order.status === 'Delivered' ? '#065F46' : '#92400E' }]}>{order.status}</Text>
                                    </View>
                                </View>

                                {order.paymentProof ? (
                                    <View style={styles.orderProofContent}>
                                        <Image source={{ uri: order.paymentProof }} style={styles.orderProofImg} />
                                        <View style={styles.verificationStatus}>
                                            <Ionicons name="shield-checkmark" size={18} color={successColor} />
                                            <Text style={[styles.verificationText, { color: successColor }]}>Payment Verified</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.noProofPlaceholder}>
                                        <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
                                        <Text style={{ color: '#EF4444', marginLeft: 8 }}>No verification photo found</Text>
                                    </View>
                                )}
                                <Text style={[styles.orderTotal, { color: textColor }]}>Total Paid: Rs {order.total.toFixed(2)}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={[styles.emptyOrders, { borderColor: borderColor }]}>
                            <Ionicons name="receipt-outline" size={48} color={textLightColor} />
                            <Text style={[styles.emptyText, { color: textLightColor }]}>No orders placed yet.</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '800' },
    content: { padding: 20 },
    sectionHeading: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16
    },
    bankLinksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30
    },
    bankLinkItem: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    bankCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    bankLinkLabel: { fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
    uploadSection: { marginTop: 10 },
    uploadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    plusButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    tempProofContainer: {
        borderRadius: 20,
        padding: 15,
        borderWidth: 2,
        borderStyle: 'dashed',
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center'
    },
    tempImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
    tempControls: { flex: 1 },
    tempText: { fontWeight: 'bold', marginBottom: 10 },
    insertBtn: {
        backgroundColor: '#F59E0B',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    insertBtnText: { color: '#fff', fontWeight: 'bold', marginRight: 5, fontSize: 12 },
    proofCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12
    },
    proofImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
    proofDetails: { flex: 1 },
    proofDate: { fontSize: 12, fontWeight: '600' },
    ordersSection: { marginTop: 10 },
    orderProofCard: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16
    },
    orderProofHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    orderResName: { fontSize: 16, fontWeight: 'bold' },
    orderIdText: { fontSize: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    orderProofContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)', padding: 10, borderRadius: 12 },
    orderProofImg: { width: 70, height: 70, borderRadius: 8, marginRight: 15 },
    verificationStatus: { flexDirection: 'row', alignItems: 'center' },
    verificationText: { fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
    orderTotal: { marginTop: 12, fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
    noProofPlaceholder: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#FEF2F2', borderRadius: 12 },
    emptyOrders: { height: 120, borderWidth: 1, borderStyle: 'dashed', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    emptyText: { marginTop: 10, fontSize: 14 },
    addCardForm: {
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20
    },
    cardInput: {
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16
    },
    saveCardBtn: {
        marginTop: 15,
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    saveCardBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    emptyState: {
        height: 80,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    }
});
