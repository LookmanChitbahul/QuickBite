import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function OwnerDashboardScreen({ navigation }) {
    const { restaurants, ownerRestaurantId, updateRestaurantMenu, restaurantLocation, setRestaurantLocation, logout, isDarkMode, theme } = useApp();
    const myRestaurant = restaurants.find(r => r.id === ownerRestaurantId);

    const handleAddMenu = () => {
        if (!myRestaurant) return;

        const newItem = {
            id: `new_${Date.now()}`,
            name: "Chef's Special Pasta",
            price: 18.99,
            description: "Freshly handmade pasta with secret sauce.",
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        };

        const updatedMenu = [...myRestaurant.menu, newItem];
        updateRestaurantMenu(ownerRestaurantId, updatedMenu);
        Alert.alert("Menu Updated", "Chef's Special Pasta added to your menu!");
    };

    const handleDeleteMenu = () => {
        if (!myRestaurant || myRestaurant.menu.length === 0) return;

        // Remove the last item for demo
        const updatedMenu = myRestaurant.menu.slice(0, -1);
        updateRestaurantMenu(ownerRestaurantId, updatedMenu);
        Alert.alert("Menu Updated", "Last item removed from menu.");
    };

    const handleReports = (type) => {
        Alert.alert("Reports", `Generating ${type} report...`);
    };

    const handleSetLocation = () => {
        // In a real app, this would open a map picker.
        // For this demo, we'll "update" it to a slightly different Mauritius coordinate.
        const newLoc = { latitude: -20.1709, longitude: 57.5150 };
        setRestaurantLocation(newLoc);
        Alert.alert("Location Updated", "Your restaurant location has been updated on the map!");
    };

    const handleLogout = async () => {
        await logout();
        navigation.replace('Auth');
    };

    const primaryColor = theme?.colors?.primary || '#F59E0B';
    const bgColor = isDarkMode ? '#111827' : '#F9FAFB';
    const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';
    const textColor = isDarkMode ? '#FFFFFF' : '#1F2937';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

    return (
        <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={[styles.header, { backgroundColor: cardBg }]}>
                <Text style={[styles.greeting, { color: textColor }]}>Welcome, Chef!</Text>
                <Text style={[styles.subtext, { color: subTextColor }]}>
                    Manage your restaurant: {myRestaurant ? myRestaurant.name : 'Loading...'}
                </Text>
                <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]} onPress={handleLogout}>
                    <Text style={[styles.logoutText, { color: subTextColor }]}>Log Out</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                    <Text style={[styles.statLabel, { color: subTextColor }]}>Today's Revenue</Text>
                    <Text style={[styles.statValue, { color: textColor }]}>$1,240.50</Text>
                    <Ionicons name="trending-up" size={20} color={primaryColor} style={styles.statIcon} />
                </View>
                <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                    <Text style={[styles.statLabel, { color: subTextColor }]}>Total Orders</Text>
                    <Text style={[styles.statValue, { color: textColor }]}>48</Text>
                    <Ionicons name="receipt" size={20} color={primaryColor} style={styles.statIcon} />
                </View>
            </View>

            <Text style={[styles.sectionTitle, { color: textColor }]}>Menu Management</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: cardBg }]} onPress={handleAddMenu}>
                    <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE' }]}>
                        <Ionicons name="add-circle" size={32} color="#2563EB" />
                    </View>
                    <Text style={[styles.actionText, { color: textColor }]}>Add "Special"</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, { backgroundColor: cardBg }]} onPress={handleDeleteMenu}>
                    <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.2)' : '#FEE2E2' }]}>
                        <Ionicons name="trash" size={32} color="#DC2626" />
                    </View>
                    <Text style={[styles.actionText, { color: textColor }]}>Delete Last</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: textColor }]}>Analytics</Text>
            <View style={[styles.listContainer, { backgroundColor: cardBg }]}>
                <TouchableOpacity style={[styles.listItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]} onPress={() => handleReports('Daily')}>
                    <Ionicons name="bar-chart" size={24} color={subTextColor} />
                    <Text style={[styles.listText, { color: textColor }]}>Daily Revenue Report</Text>
                    <Ionicons name="chevron-forward" size={20} color={subTextColor} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.listItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]} onPress={() => handleReports('Orders')}>
                    <Ionicons name="list" size={24} color={subTextColor} />
                    <Text style={[styles.listText, { color: textColor }]}>Order History</Text>
                    <Ionicons name="chevron-forward" size={20} color={subTextColor} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: textColor }]}>Location Management</Text>
            <View style={[styles.listContainer, { backgroundColor: cardBg, marginBottom: 40 }]}>
                <TouchableOpacity style={[styles.listItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]} onPress={handleSetLocation}>
                    <Ionicons name="map" size={24} color={primaryColor} />
                    <Text style={[styles.listText, { color: textColor }]}>Update Restaurant Location</Text>
                    <Ionicons name="locate" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('Map', {
                    location: restaurantLocation,
                    restaurantName: myRestaurant?.name || "My Restaurant"
                })}>
                    <Ionicons name="eye" size={24} color={subTextColor} />
                    <Text style={[styles.listText, { color: textColor }]}>View My Map</Text>
                    <Ionicons name="chevron-forward" size={20} color={subTextColor} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 60,
        marginBottom: 20
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtext: {
        fontSize: 14,
        marginTop: 4
    },
    logoutBtn: {
        position: 'absolute',
        top: 60,
        right: 24,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },
    logoutText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative'
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 8
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
        opacity: 0.5
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 24,
        marginBottom: 16
    },
    actionsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 32
    },
    actionCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
    },
    actionText: {
        fontWeight: '600',
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    listText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        fontWeight: '500'
    }
});
