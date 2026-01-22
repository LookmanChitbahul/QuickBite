import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated, Dimensions, Platform, StatusBar, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { useApp } from '../context/AppContext';

export default function SignInScreen({ navigation }) {
    const [rememberMe, setRememberMe] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const { login, isDarkMode, theme } = useApp();

    const handleSignIn = () => {
        login({ name: "Demo User", email: "demo@example.com" });
    };

    return (
        <LinearGradient
            colors={isDarkMode ? ['#111827', '#1F2937'] : ['#FAFAFA', '#F0F9FF']}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={[styles.backBtn, { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#F3F4F6' }]}
                            >
                                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.content}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Let's Sign You In</Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textLight }]}>
                                Welcome back
                            </Text>

                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.colors.text }]}>Email or Phone</Text>
                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                        <Ionicons name="mail-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: theme.colors.text }]}
                                            placeholder="Enter your email or phone"
                                            placeholderTextColor={theme.colors.muted}
                                        />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
                                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: theme.colors.text }]}
                                            placeholder="Enter your password"
                                            placeholderTextColor={theme.colors.muted}
                                            secureTextEntry={!isPasswordVisible}
                                        />
                                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                            <Ionicons
                                                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                                size={20}
                                                color={theme.colors.muted}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={styles.checkboxContainer}
                                        onPress={() => setRememberMe(!rememberMe)}
                                    >
                                        <View style={[styles.checkbox, rememberMe && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, { borderColor: isDarkMode ? '#374151' : '#D1D5DB' }]}>
                                            {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
                                        </View>
                                        <Text style={[styles.checkboxLabel, { color: theme.colors.textLight }]}>Remember me</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Forgot password?</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.signInBtn, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                                    onPress={handleSignIn}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.signInText}>Sign In</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dividerRow}>
                                <View style={[styles.divider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />
                                <Text style={[styles.dividerText, { color: theme.colors.textLight }]}>or continue with</Text>
                                <View style={[styles.divider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />
                            </View>
                            <View style={styles.socialRow}>
                                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                    <Image
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                                        style={{ width: 28, height: 28 }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                    <Image
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/12183/12183827.png' }}
                                        style={{ width: 28, height: 28, tintColor: isDarkMode ? '#fff' : undefined }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <Text style={[styles.footerText, { color: theme.colors.textLight }]}>{"Don't have an account? "}</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                                    <Text style={[styles.createOneText, { color: theme.colors.primary }]}>Create one</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        height: 65
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1 },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
    title: { fontSize: 32, fontWeight: '800', marginBottom: 8 },
    subtitle: { fontSize: 16, marginBottom: 32 },

    form: { marginBottom: 24 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16 },

    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8
    },
    checkboxLabel: { fontSize: 14, fontWeight: '500' },
    forgotText: { fontSize: 14, fontWeight: '600' },

    signInBtn: {
        width: '100%',
        height: 58,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8
    },
    signInText: { color: '#fff', fontSize: 18, fontWeight: '700' },

    dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    divider: { flex: 1, height: 1 },
    dividerText: { marginHorizontal: 16, fontSize: 14 },

    socialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    socialBtn: {
        width: '47%',
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { fontSize: 15 },
    createOneText: { fontSize: 15, fontWeight: '700' }
});
