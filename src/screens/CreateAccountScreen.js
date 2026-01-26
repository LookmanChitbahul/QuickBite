import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, ScrollView, Platform, KeyboardAvoidingView, Animated, Easing, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function CreateAccountScreen({ navigation }) {
    const [agree, setAgree] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { isDarkMode, theme, setUser } = useApp();

    const handleSignUp = async () => {
        if (!fullName || !phone || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (!agree) {
            Alert.alert("Error", "You must agree to the terms and conditions");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save additional user info to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name: fullName, // Map to name for consistency with profile
                phone,
                email,
                role: 'user',
                createdAt: new Date().toISOString()
            });

            // Navigation will be handled by AppContext state change
        } catch (error) {
            Alert.alert("Registration Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        try {
            // Simulated Browser-based Google Sign-Up Pop-up
            const result = await WebBrowser.openAuthSessionAsync(
                'https://accounts.google.com/o/oauth2/v2/auth?client_id=demo&response_type=token&scope=email%20profile&redirect_uri=' +
                AuthSession.makeRedirectUri(),
                'quickbite'
            );

            if (result.type === 'success') {
                setTimeout(() => {
                    const mockGoogleUser = {
                        uid: 'google-mock-' + Math.random().toString(36).substr(2, 9),
                        name: 'New Google User',
                        email: 'user' + Math.floor(Math.random() * 1000) + '@gmail.com',
                        photoUrl: 'https://i.pravatar.cc/150?u=google',
                        isOwner: false,
                        role: 'user'
                    };
                    setUser(mockGoogleUser);
                    setLoading(false);
                }, 800);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Google Sign Up Error:", error);
            setLoading(false);
        }
    };

    // Animation Values
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Light Mode Rotation Animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 20000, // Slow rotation
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Dark Mode Pulse/Breathing Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 4000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    // Interpolations
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const pulseScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2]
    });

    return (
        <View style={styles.container}>
            {/* Background Animation Layer */}
            <View style={StyleSheet.absoluteFill}>
                {!isDarkMode ? (
                    // LIGHT MODE: Rotating Gradient
                    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: '#FAFAFA' }}>
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
                                colors={['#F0F9FF', '#E0F2FE', '#F0F9FF', '#FAFAFA']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ flex: 1 }}
                            />
                        </Animated.View>
                    </View>
                ) : (
                    // DARK MODE: Pulsing Background
                    <View style={{ flex: 1, backgroundColor: '#111827' }}>
                        <Animated.View
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                opacity: 0.6,
                                transform: [{ scale: pulseScale }]
                            }}
                        >
                            <LinearGradient
                                colors={['#1F2937', '#111827', '#374151']}
                                style={{ flex: 1 }}
                            />
                        </Animated.View>
                    </View>
                )}
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={[styles.backBtn, { borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#F3F4F6' }]}
                        >
                            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={[styles.title, { color: isDarkMode ? '#FACC15' : theme.colors.text }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textLight }]}>Connect with your favorite restaurants</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : theme.colors.text }]}>Full Name</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Ionicons name="person-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.text }]}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={theme.colors.muted}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : theme.colors.text }]}>Phone Number</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Ionicons name="call-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.text }]}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor={theme.colors.muted}
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : theme.colors.text }]}>Email Address</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Ionicons name="mail-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.text }]}
                                    placeholder="Enter your email"
                                    placeholderTextColor={theme.colors.muted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : theme.colors.text }]}>Password</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.text }]}
                                    placeholder="Create a password"
                                    placeholderTextColor={theme.colors.muted}
                                    secureTextEntry={!isPasswordVisible}
                                    value={password}
                                    onChangeText={setPassword}
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

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDarkMode ? '#FFFFFF' : theme.colors.text }]}>Confirm Password</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.text }]}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={theme.colors.muted}
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                                    <Ionicons
                                        name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color={theme.colors.muted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setAgree(!agree)}
                        >
                            <View style={[styles.checkbox, agree && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, { borderColor: isDarkMode ? '#374151' : '#D1D5DB' }]}>
                                {agree && <Ionicons name="checkmark" size={12} color="#fff" />}
                            </View>
                            <Text style={[styles.checkboxLabel, { color: theme.colors.textLight }]}>
                                I agree to the <Text style={[styles.linkText, { color: theme.colors.primary }]}>Terms of Service</Text> and <Text style={[styles.linkText, { color: theme.colors.primary }]}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.signUpBtn, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }, (!agree || loading) && styles.disabledBtn]}
                            onPress={handleSignUp}
                            disabled={!agree || loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.signUpText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={[styles.divider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />
                            <Text style={[styles.dividerText, { color: theme.colors.textLight }]}>or sign up with</Text>
                            <View style={[styles.divider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={[styles.socialBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#E5E7EB', width: '48%' }]}
                                onPress={handleGoogleSignUp}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                                        style={{ width: 22, height: 22, marginRight: 8 }}
                                        resizeMode="contain"
                                    />
                                    <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>Google</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialBtn, { backgroundColor: isDarkMode ? '#000' : '#000', borderColor: isDarkMode ? '#374151' : '#000', width: '48%' }]}
                                onPress={() => {
                                    setLoading(true);
                                    setTimeout(() => {
                                        setUser({
                                            uid: 'apple-mock-id',
                                            name: 'Apple User',
                                            email: 'appleuser@icloud.com',
                                            isOwner: false,
                                            role: 'user'
                                        });
                                        setLoading(false);
                                    }, 1000);
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="logo-apple" size={22} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Apple</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.colors.textLight }]}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                                <Text style={[styles.signInLinkText, { color: theme.colors.primary }]}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
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
    scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
    title: { fontSize: 32, fontWeight: '800', marginBottom: 8 },
    subtitle: { fontSize: 16, marginBottom: 32 },

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

    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 30 },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2
    },
    checkboxLabel: { flex: 1, fontSize: 13, lineHeight: 20 },
    linkText: { fontWeight: '600' },

    signUpBtn: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    disabledBtn: { opacity: 0.6, shadowOpacity: 0 },

    signUpText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    divider: { flex: 1, height: 1 },
    dividerText: { marginHorizontal: 16, fontSize: 14 },

    socialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
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
    signInLinkText: { fontSize: 15, fontWeight: '700' }
});
