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
    const { isDarkMode, colorBlindType, restaurantLocation, restaurants, ownerRestaurantId } = useApp();
    const mapRef = useRef(null);

    const myRestaurant = useMemo(() => restaurants.find(r => r.id === ownerRestaurantId), [restaurants, ownerRestaurantId]);
    const location = useMemo(() => route?.params?.location || restaurantLocation || DEFAULT_LOC, [route?.params?.location, restaurantLocation]);
    const restaurantName = useMemo(() => route?.params?.restaurantName || myRestaurant?.name || "QuickBite Restaurant", [route?.params?.restaurantName, myRestaurant]);

    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setTracksViewChanges(false), 500);
        return () => clearTimeout(timer);
    }, [location]);

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
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                }}
            >
                {/* 
                  Using a cohesive Pin design that sits exactly on the coordinate.
                  The Text is sitting above the Pin.
                */}
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
    }
});
