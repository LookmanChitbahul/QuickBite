import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Easing, ImageBackground, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';
import StatusCard from '../components/StatusCard';
import ProgressDots from '../components/ProgressDots';
import PrimaryButton from '../components/PrimaryButton';
import OnboardingCard from '../components/OnboardingCard';

import { useApp } from '../context/AppContext';

export default function WelcomeScreen({ navigation }) {
  const { completeOnboarding } = useApp();
  const [page, setPage] = useState(0);

  // Animated Values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoWobble = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const titleScale = useRef(new Animated.Value(0)).current;

  const pages = [
    {
      key: 'track',
      icon: 'fast-food',
      titleTop: 'Welcome to',
      titleMain: 'QuickBite!',
      body: <StatusCard />,
    },
    {
      key: 'browse',
      icon: 'map',
      titleMain: 'Find\nRestaurants',
      body: <OnboardingCard
        description="Explore thousands of restaurants and cuisines from around the world"
        imageSource="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />,
    },
    {
      key: 'fast',
      icon: 'rocket',
      titleTop: 'Fast',
      titleMain: 'Delivery',
      body: <OnboardingCard description="Get your order delivered hot and fresh with real-time tracking." />,
    }
  ];

  const isLast = page === pages.length - 1;

  useEffect(() => {
    // Reset animations
    logoScale.setValue(0);
    logoRotate.setValue(0);
    logoWobble.setValue(0);
    textOpacity.setValue(0);
    textTranslateY.setValue(20);
    titleScale.setValue(0.5);

    // Start animations sequence
    Animated.sequence([
      // 1. Entrance
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        })
      ]),
      // 2. Interaction / Pop
      Animated.parallel([
        // Wiggle Icon
        Animated.sequence([
          Animated.timing(logoWobble, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(logoWobble, { toValue: -1, duration: 100, useNativeDriver: true }),
          Animated.timing(logoWobble, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]),
        // Pop Text
        Animated.sequence([
          Animated.timing(titleScale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
          Animated.spring(titleScale, { toValue: 1, friction: 4, useNativeDriver: true })
        ])
      ])
    ]).start();

    // Continuous rotation for icon if needed, or just initial spin
    Animated.timing(logoRotate, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true
    }).start();

  }, [page]); // Re-run animation when page changes

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
    } else {
      setPage(p => p + 1);
    }
  };

  const handleBack = () => {
    setPage(p => Math.max(0, p - 1));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 30;
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx < -50) {
            if (!isLast) handleNext();
          } else if (gestureState.dx > 50) {
            handleBack();
          }
        },
      }),
    [page, isLast] // Ensure closure has correct state
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }} // Delicious food background
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
        style={styles.gradientOverlay}
        {...panResponder.panHandlers}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safe}>
          {/* Top Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.skipContainer}
              onPress={completeOnboarding}
            >
              <Text style={styles.skipText}>Skip</Text>
              <Ionicons name="play-skip-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Logo Section */}
          <View style={styles.logoCenter}>
            <Animated.View style={[
              styles.logoCircle,
              {
                transform: [
                  { scale: logoScale },
                  { rotate: logoRotate.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] }) },
                  { rotate: logoWobble.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] }) }
                ]
              }
            ]}>
              <Ionicons name={pages[page].icon} size={50} color={theme.colors.primary} />
            </Animated.View>
          </View>

          {/* Welcome Text */}
          <Animated.View style={[
            styles.textCenter,
            {
              opacity: textOpacity,
              transform: [
                { translateY: textTranslateY },
                { scale: titleScale }
              ]
            }
          ]}>
            {pages[page].titleTop && <Text style={styles.welcomeText}>{pages[page].titleTop}</Text>}
            <Text style={styles.brandText}>{pages[page].titleMain}</Text>
          </Animated.View>

          {/* Dynamic Content Card */}
          <View style={styles.contentCardWrap}>
            {pages[page].body}
          </View>

          {/* Bottom Controls */}
          <View style={styles.footer}>
            <ProgressDots active={page} total={pages.length} style={styles.dots} />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.backButton, page === 0 && { opacity: 0 }]}
                onPress={handleBack}
                disabled={page === 0}
              >
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <PrimaryButton
                label={isLast ? "Get Started" : "Next"}
                onPress={handleNext}
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientOverlay: { flex: 1 },
  safe: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  skipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  skipText: { color: '#fff', fontSize: 15, fontWeight: '600', marginRight: 6 },
  logoCenter: { alignItems: 'center', marginTop: 10 },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  textCenter: { alignItems: 'center', marginTop: 20 },
  welcomeText: { color: '#fff', fontSize: 24, fontWeight: '500', marginBottom: -5 },
  brandText: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -1,
    textAlign: 'center'
  },
  contentCardWrap: { flex: 1, justifyContent: 'center' },
  footer: { alignItems: 'center', paddingBottom: 20 },
  dots: { marginBottom: 30 },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
