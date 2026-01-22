import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PaymentMethodsScreen({ navigation }) {
    const context = useApp();

    // Guard against missing context
    if (!context) return null;

    const { theme, isDarkMode, paymentMethods, addPaymentMethod } = context;
    const [showAddForm, setShowAddForm] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: '',
        zip: '',
        name: ''
    });

    // Safe variables
    const bgColor = theme?.colors?.background || '#F9FAFB';
    const cardColor = theme?.colors?.card || '#FFFFFF';
    const textColor = theme?.colors?.text || '#111827';
    const textLightColor = theme?.colors?.textLight || '#6B7280';
    const primaryColor = theme?.colors?.primary || '#F59E0B';
    const inputColor = theme?.colors?.input || '#F3F4F6';
    const mutedColor = theme?.colors?.muted || '#9CA3AF';
    const borderColor = theme?.colors?.border || '#E5E7EB';
    const successColor = theme?.colors?.success || '#10B981';
    const primaryLightColor = theme?.colors?.primaryLight || 'rgba(245, 158, 11, 0.1)';

    const safePaymentMethods = paymentMethods || [];

    const handleAddCard = () => {
        if (cardDetails.number.length < 16 || cardDetails.expiry.length < 4 || cardDetails.cvc.length < 3) {
            Alert.alert('Invalid Input', 'Please fill in all fields correctly.');
            return;
        }

        const newMethod = {
            id: Date.now().toString(),
            type: 'Visa', // Auto-detect in real app
            last4: cardDetails.number.slice(-4),
            icon: 'card',
            expiry: cardDetails.expiry,
            name: cardDetails.name || 'Card Holder'
        };

        addPaymentMethod(newMethod);
        setShowAddForm(false);
        setCardDetails({ number: '', expiry: '', cvc: '', zip: '', name: '' });
        Alert.alert('Success', 'Payment method added successfully.');
    };

    const renderCard = (method) => (
        <LinearGradient
            key={method.id}
            colors={['#1e293b', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardEntry}
        >
            <View style={styles.cardHeader}>
                <Ionicons name="card" size={32} color="#fff" />
                <Text style={styles.cardTypeName}>{method.type}</Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.cardNumberText}>•••• •••• •••• {method.last4}</Text>
            </View>

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.cardLabel}>CARD HOLDER</Text>
                    <Text style={styles.cardValue}>{method.name || 'JOHN DOE'}</Text>
                </View>
                <View>
                    <Text style={styles.cardLabel}>EXPIRES</Text>
                    <Text style={styles.cardValue}>{method.expiry || '12/28'}</Text>
                </View>
            </View>
        </LinearGradient>
    );

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: cardColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Online Payment</Text>
                <TouchableOpacity onPress={() => setShowAddForm(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={primaryColor} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionHeading, { color: textLightColor }]}>Saved Cards</Text>

                {safePaymentMethods.length > 0 ? (
                    safePaymentMethods.map(renderCard)
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="card-outline" size={64} color={mutedColor} />
                        <Text style={[styles.emptyText, { color: mutedColor }]}>No cards saved yet.</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.addNewButton, { backgroundColor: cardColor, borderColor: borderColor }]}
                    onPress={() => setShowAddForm(true)}
                >
                    <View style={[styles.addIconBg, { backgroundColor: primaryLightColor }]}>
                        <Ionicons name="add" size={24} color={primaryColor} />
                    </View>
                    <Text style={[styles.addNewText, { color: textColor }]}>Add New Payment Method</Text>
                </TouchableOpacity>

                <View style={[styles.safetyInfo, { paddingBottom: 40 }]}>
                    <Ionicons name="shield-checkmark" size={16} color={successColor} />
                    <Text style={[styles.safetyText, { color: textLightColor }]}>
                        Your payment information is encrypted and secure.
                    </Text>
                </View>
            </ScrollView>

            {/* Modal for Adding Card */}
            {showAddForm && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <View style={[styles.formContainer, { backgroundColor: cardColor }]}>
                        <Text style={[styles.formTitle, { color: textColor }]}>Card Details</Text>

                        <TextInput
                            placeholder="Cardholder Name"
                            placeholderTextColor={textLightColor}
                            style={[styles.input, { backgroundColor: inputColor, color: textColor }]}
                            value={cardDetails.name}
                            onChangeText={t => setCardDetails({ ...cardDetails, name: t })}
                        />

                        <TextInput
                            placeholder="Card Number"
                            placeholderTextColor={textLightColor}
                            style={[styles.input, { backgroundColor: inputColor, color: textColor }]}
                            keyboardType="numeric"
                            maxLength={16}
                            value={cardDetails.number}
                            onChangeText={t => setCardDetails({ ...cardDetails, number: t })}
                        />

                        <View style={styles.row}>
                            <TextInput
                                placeholder="MM/YY"
                                placeholderTextColor={textLightColor}
                                style={[styles.input, styles.halfInput, { backgroundColor: inputColor, color: textColor }]}
                                maxLength={5}
                                value={cardDetails.expiry}
                                onChangeText={t => setCardDetails({ ...cardDetails, expiry: t })}
                            />
                            <TextInput
                                placeholder="CVC"
                                placeholderTextColor={textLightColor}
                                style={[styles.input, styles.halfInput, { backgroundColor: inputColor, color: textColor }]}
                                keyboardType="numeric"
                                maxLength={3}
                                value={cardDetails.cvc}
                                onChangeText={t => setCardDetails({ ...cardDetails, cvc: t })}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: primaryColor }]}
                            onPress={handleAddCard}
                        >
                            <Text style={styles.saveButtonText}>Save Card</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowAddForm(false)}
                        >
                            <Text style={[styles.cancelButtonText, { color: mutedColor }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    addButton: { padding: 4 },
    content: { padding: 20 },
    sectionHeading: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16
    },
    cardEntry: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30
    },
    cardTypeName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    cardBody: {
        marginBottom: 30
    },
    cardNumberText: {
        color: '#fff',
        fontSize: 22,
        letterSpacing: 2,
        fontWeight: '600'
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        marginBottom: 4
    },
    cardValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16
    },
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 10
    },
    addIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    addNewText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    safetyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        paddingHorizontal: 20
    },
    safetyText: {
        fontSize: 12,
        marginLeft: 8,
        textAlign: 'center'
    },
    overlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        justifyContent: 'center',
        padding: 24,
        zIndex: 100
    },
    formContainer: {
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 20
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center'
    },
    input: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        fontSize: 16
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    halfInput: {
        width: '48%'
    },
    saveButton: {
        padding: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 8
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center'
    },
    cancelButtonText: {
        fontWeight: '700'
    }
});
