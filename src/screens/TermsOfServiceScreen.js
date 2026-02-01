import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function TermsOfServiceScreen({ navigation }) {
    const { theme, isDarkMode } = useApp();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Terms of Service</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={[styles.lastUpdated, { color: theme.colors.textLight }]}>Last Updated: February 1, 2026</Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Acceptance of Terms</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        By accessing and using QuickBite, you accept and agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use our service.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Service Description</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        QuickBite is a food delivery platform that connects users with local restaurants in Mauritius.
                        We facilitate orders and deliveries but do not prepare or deliver the food ourselves.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. User Accounts</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        To use QuickBite, you must:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Be at least 13 years of age
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Provide accurate and complete registration information
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Maintain the security of your account credentials
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Accept responsibility for all activities under your account
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. Ordering and Payment</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        When placing an order:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • All orders are subject to restaurant acceptance
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Prices are set by individual restaurants and may change without notice
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Payment is processed at the time of order placement
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • You are responsible for providing accurate delivery information
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Service fees and delivery charges may apply
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>5. Delivery</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        Delivery times are estimates and may vary based on restaurant preparation time, traffic, and weather conditions.
                        QuickBite is not liable for delays caused by circumstances beyond our control.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>6. Cancellations and Refunds</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        Order cancellation policies:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Orders can be cancelled before restaurant acceptance for a full refund
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Once accepted by the restaurant, cancellations may incur fees
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Refunds for quality issues are handled on a case-by-case basis
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Refunds are processed within 5-7 business days
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>7. User Conduct</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        You agree not to:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Use the service for any illegal purposes
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Harass or abuse restaurant staff or delivery personnel
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Attempt to manipulate ratings or reviews
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Interfere with the proper functioning of the service
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Share your account credentials with others
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>8. Intellectual Property</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        All content, features, and functionality of QuickBite are owned by us and are protected by copyright, trademark, and other intellectual property laws.
                        You may not copy, modify, or distribute any part of our service without permission.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>9. Limitation of Liability</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        QuickBite acts as an intermediary between users and restaurants. We are not responsible for:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Food quality, preparation, or safety
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Allergic reactions or foodborne illnesses
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Delivery delays or errors
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Restaurant availability or menu accuracy
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>10. Restaurant Partners</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        Restaurant partners are independent businesses. QuickBite does not employ restaurant staff and is not responsible for their actions or the quality of their products.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>11. AI Chatbot</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        Our AI chatbot is powered by Gemini and provides recommendations based on available restaurant data.
                        Recommendations are automated and should be verified before ordering.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>12. AR Street View</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        The AR Street View feature uses Google Maps Street View to show restaurant locations.
                        This feature requires location permissions and an internet connection.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>13. Modifications to Service</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We reserve the right to modify, suspend, or discontinue any part of our service at any time without notice.
                        We are not liable for any modifications or interruptions to the service.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>14. Termination</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We may terminate or suspend your account at any time for violations of these Terms of Service or for any other reason at our discretion.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>15. Governing Law</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        These Terms of Service are governed by the laws of Mauritius. Any disputes shall be resolved in the courts of Mauritius.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>16. Changes to Terms</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We may update these Terms of Service from time to time. Continued use of QuickBite after changes constitutes acceptance of the new terms.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>17. Contact Information</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        For questions about these Terms of Service, contact us at:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        Email: support@quickbite.mu
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        Phone: +230 5555 0000
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20
    },
    section: {
        marginBottom: 20
    },
    lastUpdated: {
        fontSize: 12,
        fontStyle: 'italic',
        marginBottom: 20,
        textAlign: 'center'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12
    },
    bulletPoint: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 6,
        marginLeft: 10
    }
});
