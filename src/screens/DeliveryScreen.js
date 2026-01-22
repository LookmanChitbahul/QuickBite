import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

// Default Mauritius Coordinates
const DEFAULT_LOC = { latitude: -20.2443, longitude: 57.4882 }; // Port Louis/Bagatelle Area

export default function DeliveryScreen({ navigation, route }) {
    const { isDarkMode, restaurantLocation, restaurants, ownerRestaurantId } = useApp();
    const mapRef = useRef(null);

    const myRestaurant = useMemo(() => restaurants.find(r => r.id === ownerRestaurantId), [restaurants, ownerRestaurantId]);

    const location = useMemo(() => route?.params?.location || restaurantLocation || DEFAULT_LOC, [route?.params?.location, restaurantLocation]);

    const restaurantName = useMemo(() => route?.params?.restaurantName || myRestaurant?.name || "QuickBite Restaurant", [route?.params?.restaurantName, myRestaurant]);

    // Optimize marker rendering by disabling tracksViewChanges after initial render
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
        // Allow the marker to render once, then freeze it to save performance
        const timer = setTimeout(() => {
            setTracksViewChanges(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [location]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

            <MapView
                ref={mapRef}
                style={styles.map}
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
                        {/* THE NAME - Above the pin */}
                        <Text style={styles.pureTextName}>{restaurantName}</Text>

                        {/* THE PIN - Using a standard Icon with a dot. 
                            Icons are much more stable in custom markers. */}
                        <View style={styles.pinBodyWithDot}>
                            <Ionicons name="location" size={54} color="#EF4444" />
                            <View style={styles.dotInsidePin} />
                        </View>
                    </View>
                </Marker>
            </MapView>

            <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                onPress={() => navigation.goBack()}
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
