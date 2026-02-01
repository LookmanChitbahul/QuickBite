import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function PrivacyPolicyScreen({ navigation }) {
    const { theme, isDarkMode } = useApp();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Privacy Policy</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={[styles.lastUpdated, { color: theme.colors.textLight }]}>Last Updated: February 1, 2026</Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Introduction</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        Welcome to QuickBite. We are committed to protecting your personal information and your right to privacy.
                        This Privacy Policy explains how we collect, use, and share information when you use our food delivery application.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Information We Collect</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We collect the following types of information:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Personal Information: Name, email address, phone number, and profile photo
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Location Data: Your current location to show nearby restaurants and enable delivery
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Payment Information: Payment card details (securely processed through third-party providers)
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Order History: Details of your past orders and preferences
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Device Information: Device type, operating system, and app usage data
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. How We Use Your Information</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We use your information to:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Process and deliver your food orders
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Provide customer support and respond to your inquiries
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Send order updates and notifications
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Improve our services and personalize your experience
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Prevent fraud and ensure platform security
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. Location Services</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        QuickBite uses your location to show nearby restaurants, estimate delivery times, and enable our AR Street View feature.
                        You can disable location services in your device settings, but this may limit app functionality.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>5. Payment Information</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We do not store your complete payment card details. All payment processing is handled securely by certified third-party payment processors.
                        We only retain the last 4 digits of your card for reference purposes.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>6. Data Sharing</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We share your information only with:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Restaurant partners to fulfill your orders
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Delivery service providers
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Payment processors for transaction processing
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Service providers who assist with app functionality
                    </Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We do not sell your personal information to third parties.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>7. Data Security</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet
                        is 100% secure, and we cannot guarantee absolute security.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>8. Your Rights</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        You have the right to:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Access and update your personal information
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Delete your account and associated data
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Opt-out of marketing communications
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        • Request a copy of your data
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>9. Children's Privacy</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        QuickBite is not intended for users under the age of 13. We do not knowingly collect personal information from children.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>10. Changes to This Policy</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page
                        and updating the "Last Updated" date.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>11. Contact Us</Text>
                    <Text style={[styles.paragraph, { color: theme.colors.text }]}>
                        If you have questions about this Privacy Policy, please contact us at:
                    </Text>
                    <Text style={[styles.bulletPoint, { color: theme.colors.text }]}>
                        Email: privacy@quickbite.mu
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
