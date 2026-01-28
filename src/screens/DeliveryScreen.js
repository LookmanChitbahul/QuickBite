import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useApp } from '../context/AppContext';
import { darkMapStyle, deuteranopiaMapStyle, protanopiaMapStyle, tritanopiaMapStyle } from '../data/mapStyles';

const { width, height } = Dimensions.get('window');

// Default Mauritius Coordinates
const DEFAULT_LOC = { latitude: -20.2443, longitude: 57.4882 }; // Port Louis/Bagatelle Area

export default function DeliveryScreen({ navigation, route }) {
    const { isDarkMode, colorBlindType, restaurantLocation, restaurants, ownerRestaurantId, userLocation, theme } = useApp();
    const mapRef = useRef(null);

    const myRestaurant = useMemo(() => restaurants.find(r => r.id === ownerRestaurantId), [restaurants, ownerRestaurantId]);
    const location = useMemo(() => route?.params?.location || restaurantLocation || DEFAULT_LOC, [route?.params?.location, restaurantLocation]);
    const restaurantName = useMemo(() => route?.params?.restaurantName || myRestaurant?.name || "QuickBite Restaurant", [route?.params?.restaurantName, myRestaurant]);
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    // Dynamic initial region: prioritize Route Param > User Location > Default
    const initialRegion = useMemo(() => {
        const baseLoc = route?.params?.location || userLocation || restaurantLocation || DEFAULT_LOC;
        return {
            latitude: baseLoc.latitude,
            longitude: baseLoc.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
        };
    }, [route?.params?.location, userLocation, restaurantLocation]);

    useEffect(() => {
        const timer = setTimeout(() => setTracksViewChanges(false), 500);
        return () => clearTimeout(timer);
    }, [location]);

    // Animate to user location when it becomes available (and if no restaurant is being viewed)
    useEffect(() => {
        if (userLocation && !route?.params?.location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            }, 1000);
        }
    }, [userLocation, route?.params?.location]);

    const centerOnUser = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            }, 1000);
        }
    };

    const getMapStyle = () => {
        if (colorBlindType === 'deuteranopia') return deuteranopiaMapStyle;
        if (colorBlindType === 'protanopia') return protanopiaMapStyle;
        if (colorBlindType === 'tritanopia') return tritanopiaMapStyle;
        if (isDarkMode) return darkMapStyle;
        return [];
    };

    const markerColor = colorBlindType !== 'none' ? '#0072B2' : '#EF4444'; // Use Okabe-Ito Blue for accessibility

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

            <MapView
                ref={mapRef}
                style={styles.map}
                customMapStyle={getMapStyle()}
                initialRegion={initialRegion}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        coordinate={userLocation}
                        title="You"
                        description="Your current position"
                    >
                        <View style={styles.userMarkerWrapper}>
                            <View style={styles.userMarkerPulse} />
                            <View style={styles.userMarkerInner} />
                        </View>
                    </Marker>
                )}

                {/* Restaurant Marker */}
                <Marker
                    coordinate={location}
                    anchor={{ x: 0.5, y: 1 }}
                    tracksViewChanges={tracksViewChanges}
                >
                    <View style={styles.finalMarkerWrapper}>
                        <Text style={[styles.pureTextName, { color: markerColor }]}>{restaurantName}</Text>

                        <View style={styles.pinBodyWithDot}>
                            <Ionicons name="location" size={54} color={markerColor} />
                            <View style={styles.dotInsidePin} />
                        </View>
                    </View>
                </Marker>
            </MapView>

            <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
            >
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>

            {/* Center on Me Button */}
            {userLocation && (
                <TouchableOpacity
                    style={[styles.centerOnMeBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                    onPress={centerOnUser}
                >
                    <Ionicons name="locate" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    map: {
        width: width,
        height: height,
    },
    floatingBackBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 100,
    },
    finalMarkerWrapper: {
        alignItems: 'center',
        padding: 10,
    },
    pureTextName: {
        fontSize: 14,
        fontWeight: '900',
        color: '#EF4444',
        marginBottom: -10, // Overlap slightly for cohesive look
        zIndex: 10,
        textShadowColor: '#fff',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    pinBodyWithDot: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotInsidePin: {
        position: 'absolute',
        top: 10, // Center of the location icon's circle
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    userMarkerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
    },
    userMarkerPulse: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
    },
    userMarkerInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    centerOnMeBtn: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 100,
    }
});
