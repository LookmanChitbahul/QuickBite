import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Text, Dimensions, Linking, Platform, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useApp } from '../context/AppContext';
import { darkMapStyle, deuteranopiaMapStyle, protanopiaMapStyle, tritanopiaMapStyle, maptilerStreetsStyle } from '../data/mapStyles';

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

    const currentMapStyle = useMemo(() => {
        if (colorBlindType === 'deuteranopia') return deuteranopiaMapStyle;
        if (colorBlindType === 'protanopia') return protanopiaMapStyle;
        if (colorBlindType === 'tritanopia') return tritanopiaMapStyle;
        return isDarkMode ? darkMapStyle : maptilerStreetsStyle;
    }, [isDarkMode, colorBlindType]);

    const textColor = isDarkMode ? '#FFFFFF' : '#111827';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#4B5563';

    const mapRef = useRef(null);
    const markerRefs = useRef({});

    // UI States
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [is3DMode, setIs3DMode] = useState(true); // Default to 3D for "WOW" factor
    const slideAnim = useRef(new Animated.Value(300)).current; // For bottom sheet animation

    const myRestaurant = useMemo(() => restaurants.find(r => r.id === ownerRestaurantId), [restaurants, ownerRestaurantId]);
    const location = useMemo(() => route?.params?.location || restaurantLocation || DEFAULT_LOC, [route?.params?.location, restaurantLocation]);

    // Animation for Bottom Sheet
    useEffect(() => {
        if (selectedRestaurant) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedRestaurant]);

    // Focus Effects
    useEffect(() => {
        const restaurant = route?.params?.restaurant;
        if (restaurant) {
            setSelectedRestaurant(restaurant);
            const target = restaurant.location || location;

            mapRef.current?.animateCamera({
                center: target,
                zoom: 18, // Higher zoom for buildings
                pitch: 60, // Aggressive 3D tilt
                heading: 0
            }, { duration: 1000 });
        } else {
            // Default 3D view
            mapRef.current?.animateCamera({
                pitch: 45,
                zoom: 16
            }, { duration: 1000 });
        }
    }, [route?.params?.restaurant]);

    const centerOnUser = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateCamera({
                center: userLocation,
                zoom: 17,
                pitch: 45,
            }, { duration: 1000 });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={currentMapStyle}
                showsBuildings={true}
                showsIndoors={true}
                showsTraffic={false}
                initialRegion={{
                    ...DEFAULT_LOC,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                pitchEnabled={true}
                rotateEnabled={true}
            >

                {/* User Location Marker */}
                {userLocation && (
                    <Marker coordinate={userLocation} title="You" anchor={{ x: 0.5, y: 0.5 }} zIndex={999}>
                        <View style={styles.userMarkerWrapper}>
                            <View style={styles.userMarkerPulse} />
                            <View style={styles.userMarkerInner} />
                        </View>
                    </Marker>
                )}

                {/* Restaurant Markers */}
                {restaurants.map((rest) => (
                    <Marker
                        key={rest.id}
                        coordinate={rest.location || DEFAULT_LOC}
                        style={{ zIndex: selectedRestaurant?.id === rest.id ? 10 : 1 }}
                        onPress={() => setSelectedRestaurant(rest)}
                    >
                        <Image
                            source={require('../assets/custom_marker.png')}
                            style={{ width: 45, height: 45 }}
                            resizeMode="contain"
                        />
                    </Marker>
                ))}

                {/* Emergency Markers */}
                {EMERGENCY_PLACES.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={place.location}
                        onPress={() => setSelectedRestaurant(place)}
                    >
                        <Ionicons
                            name={place.type === 'police' ? "shield" : "medkit"}
                            size={35}
                            color={place.type === 'police' ? "#3B82F6" : "#EF4444"}
                        />
                    </Marker>
                ))}
            </MapView>

            <TouchableOpacity
                style={[styles.floatingBackBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
            >
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>

            {/* Map Controls */}
            <View style={styles.mapControls}>
                {/* 3D Tilt Toggle - Helps users who struggle with gesture */}
                <TouchableOpacity
                    style={[styles.controlBtn, { backgroundColor: is3DMode ? theme.colors.primary : (isDarkMode ? '#1F2937' : '#FFFFFF'), marginBottom: 12 }]}
                    onPress={() => {
                        setIs3DMode(!is3DMode);
                        mapRef.current?.animateCamera({ pitch: is3DMode ? 0 : 45 }, { duration: 500 });
                    }}
                >
                    <Ionicons name="cube-outline" size={24} color={is3DMode ? '#FFF' : theme.colors.primary} />
                </TouchableOpacity>

                {userLocation && (
                    <TouchableOpacity
                        style={[styles.controlBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                        onPress={centerOnUser}
                    >
                        <Ionicons name="locate" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Restaurant Detail Bottom Sheet */}
            <Animated.View
                style={[
                    styles.bottomSheet,
                    {
                        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {selectedRestaurant && (
                    <View>
                        <View style={styles.sheetHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.sheetTitle, { color: textColor }]}>{selectedRestaurant.name}</Text>
                                <Text style={[styles.sheetSubtitle, { color: subTextColor }]}>{selectedRestaurant.address}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedRestaurant(null)}>
                                <Ionicons name="close-circle" size={28} color={subTextColor} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sheetDesc, { color: subTextColor }]}>
                            {selectedRestaurant.description || "Tap for more details."}
                        </Text>

                        {/* Action Buttons */}
                        <View style={styles.actionRow}>
                            {/* Order Button - Only for restaurants */}
                            {!selectedRestaurant.type && (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: theme.colors.primary, flex: 2 }]}
                                    onPress={() => navigation.navigate('RestaurantDetails', { restaurant: selectedRestaurant })}
                                >
                                    <Text style={styles.actionBtnText}>Order Now</Text>
                                </TouchableOpacity>
                            )}



                            {/* Directions Button */}
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#10B981', flex: 1 }]}
                                onPress={() => {
                                    const { latitude, longitude } = selectedRestaurant.location;
                                    const label = encodeURIComponent(selectedRestaurant.name);
                                    const scheme = Platform.OS === 'ios'
                                        ? `maps:0,0?q=${label}@${latitude},${longitude}`
                                        : `geo:0,0?q=${latitude},${longitude}(${label})`;
                                    Linking.openURL(scheme);
                                }}
                            >
                                <Ionicons name="navigate-outline" size={18} color="#FFF" style={{ marginRight: 5 }} />
                                <Text style={styles.actionBtnText}>Go</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Animated.View>
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
        elevation: 5,
        zIndex: 100,
    },
    mapControls: {
        position: 'absolute',
        bottom: 220, // Moved up to make room for bottom sheet
        right: 20,
        zIndex: 100,
        alignItems: 'center'
    },
    controlBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        elevation: 5,
    },
    // Markers
    userMarkerWrapper: {
        alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
    },
    userMarkerPulse: {
        position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(59, 130, 246, 0.3)',
    },
    userMarkerInner: {
        width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#FFFFFF',
    },
    // Bottom Sheet
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
        zIndex: 200,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sheetSubtitle: {
        fontSize: 14,
        opacity: 0.8,
    },
    sheetDesc: {
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    }
});
