import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, StatusBar, Alert, Dimensions, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function RestaurantDetailsScreen({ route, navigation }) {
    const { restaurant } = route.params || {};
    const { cart, theme, isDarkMode, t, addToCart } = useApp();
    const [activeMenuCat, setActiveMenuCat] = React.useState(t('featured') || 'Featured');

    const cartCount = cart.filter(item => item.restaurantId === restaurant.id).reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.filter(item => item.restaurantId === restaurant.id).reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!restaurant) {
        return (
            <View style={styles.errorContainer}>
                <Text>{t('error_loading') || 'Error loading restaurant details.'}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: theme?.colors?.primary || '#F59E0B' }}>{t('go_back') || 'Go Back'}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleAddToCart = (item) => {
        addToCart(item, restaurant);
    };

    const menuCategories = [t('featured') || 'Featured', t('mains') || 'Mains', t('sides') || 'Sides', t('drinks') || 'Drinks', t('desserts') || 'Desserts'];

    const renderMenuItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
            activeOpacity={0.7}
            onPress={() => handleAddToCart(item)}
        >
            <View style={styles.menuInfo}>
                <Text style={[styles.menuName, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{item.name}</Text>
                <Text style={[styles.menuDesc, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]} numberOfLines={2}>{item.description}</Text>
                <Text style={[styles.menuPrice, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.menuImageContainer}>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme?.colors?.primary || '#F59E0B' }]}
                    onPress={() => handleAddToCart(item)}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Hero Section */}
            <View style={styles.heroContainer}>
                <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
                    style={StyleSheet.absoluteFill}
                />

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.heroActions}>
                    <TouchableOpacity style={styles.heroActionBtn}>
                        <Ionicons name="search-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.heroActionBtn}>
                        <Ionicons name="share-outline" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.content, { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }]}>
                <View style={styles.header}>
                    <Text style={[styles.name, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{restaurant.name}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color="#000" />
                            <Text style={styles.ratingText}>{restaurant.rating}</Text>
                            <Text style={styles.reviewCount}>({restaurant.reviews}+)</Text>
                        </View>
                        <Text style={styles.dot}>•</Text>
                        <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Fast Food</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>$$</Text>
                    </View>

                    <View style={styles.deliveryInfoRow}>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{t('delivery')}</Text>
                            <Text style={[styles.infoValue, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>20-30 min</Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{t('fee')}</Text>
                            <Text style={[styles.infoValue, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Rs 25.00</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.menuTabContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuTabs}>
                        {menuCategories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.menuTab, activeMenuCat === cat && styles.activeMenuTab]}
                                onPress={() => setActiveMenuCat(cat)}
                            >
                                <Text style={[
                                    styles.menuTabText,
                                    { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
                                    activeMenuCat === cat && { color: isDarkMode ? '#fff' : '#000', fontWeight: '900' }
                                ]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <FlatList
                    data={restaurant.menu}
                    keyExtractor={item => item.id}
                    renderItem={renderMenuItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>{activeMenuCat}</Text>
                    )}
                />
            </View>

            {cartCount > 0 && (
                <View style={styles.cartBarContainer}>
                    <TouchableOpacity
                        style={[styles.cartBar, { backgroundColor: theme?.colors?.primary || '#000' }]}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                        <Text style={styles.viewBasketText}>{t('view_basket')}</Text>
                        <Text style={styles.cartTotalText}>Rs {cartTotal.toFixed(2)}</Text>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    heroContainer: {
        height: 220,
        width: '100%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3
    },
    heroActions: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
    },
    heroActionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3
    },
    content: {
        flex: 1,
        paddingTop: 20
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20
    },
    name: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontWeight: 'bold',
        fontSize: 13,
        marginLeft: 4
    },
    reviewCount: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4
    },
    metaText: {
        fontSize: 14,
    },
    dot: {
        marginHorizontal: 8,
        color: '#9CA3AF'
    },
    deliveryInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700'
    },
    infoDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 20
    },
    menuTabContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginBottom: 10
    },
    menuTabs: {
        paddingHorizontal: 20,
        height: 50,
        alignItems: 'center'
    },
    menuTab: {
        marginRight: 25,
        paddingVertical: 10,
    },
    activeMenuTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#000'
    },
    menuTabText: {
        fontSize: 15,
        fontWeight: '600'
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        paddingHorizontal: 20,
        marginVertical: 20
    },
    menuItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        alignItems: 'center'
    },
    menuInfo: {
        flex: 1,
        paddingRight: 16
    },
    menuName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 6
    },
    menuDesc: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20
    },
    menuPrice: {
        fontSize: 16,
        fontWeight: '600',
    },
    menuImageContainer: {
        position: 'relative'
    },
    menuImage: {
        width: 110,
        height: 110,
        borderRadius: 12,
        backgroundColor: '#F3F4F6'
    },
    addButton: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    cartBarContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    cartBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    cartBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    cartBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },
    viewBasketText: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    cartTotalText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

