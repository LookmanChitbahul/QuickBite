import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useApp } from '../context/AppContext';
import { darkMapStyle, deuteranopiaMapStyle, protanopiaMapStyle, tritanopiaMapStyle } from '../data/mapStyles';

const { width, height } = Dimensions.get('window');

// Default Mauritius Coordinates
const DEFAULT_LOC = { latitude: -20.2443, longitude: 57.4882 }; // Port Louis/Bagatelle Area

const EMERGENCY_PLACES = [
    {
        id: 'e1',
        name: 'Moka Police Station',
        description: 'Local Police Station for emergencies.',
        address: 'Moka, Saint Pierre',
        location: { latitude: -20.2195, longitude: 57.4973 },
        type: 'police'
    },
    {
        id: 'e2',
        name: 'Wellkin Hospital',
        description: 'Private hospital offering 24/7 emergency services.',
        address: 'Moka',
        location: { latitude: -20.2241, longitude: 57.4947 },
        type: 'hospital'
    },
    {
        id: 'e3',
        name: 'Victoria Hospital',
        description: 'General Hospital.',
        address: 'Candos, Quatre Bornes',
        location: { latitude: -20.2641, longitude: 57.4767 },
        type: 'hospital'
    }
];

export default function DeliveryScreen({ navigation, route }) {
    const { isDarkMode, colorBlindType, restaurantLocation, restaurants, ownerRestaurantId, userLocation, theme } = useApp();
    const textColor = isDarkMode ? '#FFFFFF' : '#111827';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#4B5563';
    const mapRef = useRef(null);

    const myRestaurant = useMemo(() => restaurants.find(r => r.id === ownerRestaurantId), [restaurants, ownerRestaurantId]);
    const location = useMemo(() => route?.params?.location || restaurantLocation || DEFAULT_LOC, [route?.params?.location, restaurantLocation]);
    const restaurantName = useMemo(() => route?.params?.restaurantName || myRestaurant?.name || "QuickBite Restaurant", [route?.params?.restaurantName, myRestaurant]);
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    // Dynamic initial region: prioritize Order Location > Route Param > User Location > Default
    const initialRegion = useMemo(() => {
        const baseLoc = route?.params?.orderLocation || route?.params?.location || userLocation || restaurantLocation || DEFAULT_LOC;
        return {
            latitude: baseLoc.latitude,
            longitude: baseLoc.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
        };
    }, [route?.params?.orderLocation, route?.params?.location, userLocation, restaurantLocation]);

    useEffect(() => {
        const timer = setTimeout(() => setTracksViewChanges(false), 500);
        return () => clearTimeout(timer);
    }, [location]);

    // Animate to user location when it becomes available (and if no restaurant is being viewed)
    // Animate to target location when it becomes available
    useEffect(() => {
        const target = route?.params?.orderLocation || route?.params?.location;
        if (target && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: target.latitude,
                longitude: target.longitude,
                latitudeDelta: 0.005, // Zoom in closer for specific targets
                longitudeDelta: 0.005,
            }, 1000);
        } else if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            }, 1000);
        }
    }, [userLocation, route?.params?.location, route?.params?.orderLocation]);

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

                {/* All Restaurant Markers */}
                {restaurants.map((rest) => (
                    <Marker
                        key={rest.id}
                        coordinate={rest.location || DEFAULT_LOC}
                        anchor={{ x: 0.5, y: 1 }}
                        tracksViewChanges={tracksViewChanges}
                    >
                        <View style={styles.finalMarkerWrapper}>
                            <View style={styles.pinBodyWithDot}>
                                <Ionicons name="fast-food" size={44} color={theme.colors.primary} />
                                <View style={styles.dotInsidePin} />
                            </View>
                        </View>
                        <Callout
                            onPress={() => {
                                // Due to iOS/Android differences in Callout interactivity, 
                                // it's often safer to rely on the Callout's generic press 
                                // or assume the user wants to Order from here.
                                // But we have specific buttons. 
                                // If standard onPress captures everything, we might need a workaround or just navigate to Details which has AR button too.
                                // For now, we'll try to support interactions.
                            }}
                            tooltip
                        >
                            <View style={[styles.calloutContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', minHeight: 120 }]}>
                                <Text style={[styles.calloutTitle, { color: textColor }]}>{rest.name}</Text>
                                <Text style={[styles.calloutAddress, { color: subTextColor }]}>{rest.address}</Text>
                                <Text style={[styles.calloutDesc, { color: subTextColor }]}>{rest.description || "Best food in town!"}</Text>

                                <View style={styles.calloutBtnRow}>
                                    <TouchableOpacity
                                        style={[styles.calloutBtn, { backgroundColor: theme.colors.primary }]}
                                        onPress={() => navigation.navigate('RestaurantDetails', { restaurant: rest })}
                                    >
                                        <Text style={styles.calloutBtnText}>Order Here</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.calloutBtn, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6', marginLeft: 8 }]}
                                        onPress={() => navigation.navigate('ARScreen', { restaurant: rest })}
                                    >
                                        <Text style={[styles.calloutBtnText, { color: textColor }]}>AR View</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}

                {/* Emergency Markers */}
                {EMERGENCY_PLACES.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={place.location}
                        anchor={{ x: 0.5, y: 1 }}
                        tracksViewChanges={tracksViewChanges}
                    >
                        <View style={styles.finalMarkerWrapper}>
                            <View style={styles.pinBodyWithDot}>
                                <Ionicons
                                    name={place.type === 'police' ? "shield" : "medkit"}
                                    size={40}
                                    color={place.type === 'police' ? "#3B82F6" : "#EF4444"}
                                />
                                <View style={styles.dotInsidePin} />
                            </View>
                        </View>
                        <Callout tooltip>
                            <View style={[styles.calloutContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                                <Text style={[styles.calloutTitle, { color: textColor }]}>{place.name}</Text>
                                <Text style={[styles.calloutAddress, { color: subTextColor }]}>{place.address}</Text>
                                <Text style={[styles.calloutDesc, { color: subTextColor }]}>{place.description}</Text>
                                <TouchableOpacity
                                    style={[styles.calloutBtn, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6', marginTop: 8 }]}
                                    onPress={() => navigation.navigate('ARScreen', { restaurant: place })}
                                >
                                    <Text style={[styles.calloutBtnText, { color: textColor }]}>AR View</Text>
                                </TouchableOpacity>
                            </View>
                        </Callout>
                    </Marker>
                ))}
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
    },
    calloutContainer: {
        width: 220,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    calloutTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    calloutAddress: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 8,
    },
    calloutDesc: {
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 10,
        fontStyle: 'italic'
    },
    calloutBtnRow: {
        flexDirection: 'row',
        marginTop: 5,
        justifyContent: 'center'
    },
    calloutBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    calloutBtnText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
