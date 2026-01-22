import React from 'react';
import { View, StyleSheet, Text, StatusBar, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import RestaurantList from '../components/RestaurantList';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen({ navigation }) {
    const { restaurants, user, toggleFavorite, theme, isDarkMode } = useApp();

    const favoriteIds = user?.favorites || [];
    const favoriteRestaurants = restaurants.filter(r => favoriteIds.includes(r.id)).map(r => ({
        ...r,
        isFavorite: true
    }));

    const handleRestaurantPress = (restaurant) => {
        navigation.navigate('RestaurantDetails', { restaurant });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Favorites</Text>
                <View style={styles.backButton} />
            </View>

            {favoriteRestaurants.length > 0 ? (
                <RestaurantList
                    restaurants={favoriteRestaurants}
                    onPress={handleRestaurantPress}
                    onToggleFavorite={(r) => toggleFavorite(r.id)}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={80} color={theme.colors.muted} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Favorites Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.textLight }]}>
                        Mark restaurants as favorites to see them here.
                    </Text>
                    <TouchableOpacity
                        style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={[styles.exploreText, { color: theme.colors.white }]}>Explore Restaurants</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 10
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtitle: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 30,
    },
    exploreButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 25,
    },
    exploreText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
