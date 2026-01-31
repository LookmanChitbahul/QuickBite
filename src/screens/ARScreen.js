import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';

export default function ARScreen({ navigation, route }) {
    const { theme } = useApp();
    const selectedRestaurant = route?.params?.restaurant;

    const [isLoading, setIsLoading] = useState(true);

    if (!selectedRestaurant || !selectedRestaurant.location) {
        return (
            <View style={styles.center}>
                <Text style={{ color: '#fff' }}>No location data available.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: 'yellow' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { latitude, longitude } = selectedRestaurant.location;
    // Attempt to use the Gemini key as a proxy for a Google Maps Key, or fallback to a known public key if possible (not recommended/possible here). 
    // Using the public URL hack for Street View which is robust without a specific restricted key.
    // The 'embed' API requires a key. The 'maps' URL is public.

    // Strategy: Use the detailed Google Maps URL which forces Street View (layer=c & cbll).
    // This allows "Geoguessr" style navigation.
    const streetViewUrl = `https://www.google.com/maps?layer=c&cbll=${latitude},${longitude}`;

    // Alternative: Embed API (Cleanest, but needs valid Map Key)
    // const embedUrl = `https://www.google.com/maps/embed/v1/streetview?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}&location=${latitude},${longitude}`;

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <WebView
                source={{ uri: streetViewUrl }}
                style={{ flex: 1 }}
                onLoadEnd={() => setIsLoading(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                )}
            />

            {/* Overlay UI */}
            <View style={styles.overlayHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{selectedRestaurant.name}</Text>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>Street View</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Hint */}
            <View style={styles.bottomHint}>
                <Ionicons name="scan-outline" size={20} color="#fff" />
                <Text style={styles.hintText}>Drag to look around • Tap arrows to move</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    loader: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },
    overlayHeader: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'box-none'
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5
    },
    titleContainer: {
        flex: 1,
        marginLeft: 15,
        alignItems: 'flex-end'
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3
    },
    tag: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4
    },
    tagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000'
    },
    bottomHint: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20
    },
    hintText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 8
    }
});
