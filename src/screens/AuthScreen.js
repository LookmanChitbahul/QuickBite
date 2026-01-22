import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

import { useApp } from '../context/AppContext';

export default function AuthScreen({ navigation }) {
    const { login } = useApp();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;



    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 20,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
                style={styles.overlay}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="fast-food" size={40} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.appName}>QuickBite</Text>
                        <Text style={styles.tagline}>Fast. Fresh. Local.</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.signInBtn}
                            onPress={() => navigation.navigate('SignIn')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.createBtn}
                            onPress={() => navigation.navigate('CreateAccount')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.createText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    content: { flex: 1, justifyContent: 'space-between', paddingVertical: 60 },
    header: { alignItems: 'center', marginTop: 80 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10
    },
    appName: {
        fontSize: 42,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
        marginBottom: 8
    },
    tagline: {
        fontSize: 18,
        color: '#E5E7EB',
        fontWeight: '500',
        letterSpacing: 0.5
    },
    buttonContainer: { width: '100%', marginBottom: 40 },
    signInBtn: {
        width: '100%',
        height: 56,
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8
    },
    signInText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    createBtn: {
        width: '100%',
        height: 56,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24
    },
    createText: { color: theme.colors.primary, fontSize: 18, fontWeight: '700' }
});
