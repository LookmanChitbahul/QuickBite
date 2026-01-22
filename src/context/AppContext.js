import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { restaurants as initialRestaurants, userProfile, ownerProfile } from '../data/mockData';
import { translations } from '../data/translations';

// Remote Push Notifications are not supported in Expo Go for SDK 54+
/*
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});
*/
import { lightTheme, darkTheme } from '../styles/theme';


const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [restaurants, setRestaurants] = useState(initialRestaurants);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [restaurantLocation, setRestaurantLocation] = useState({ latitude: -20.1609, longitude: 57.5050 });

    // Auth & Onboarding State
    const [user, setUser] = useState(null);
    const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Theme & Settings State
    const systemScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
    const [theme, setTheme] = useState(systemScheme === 'dark' ? darkTheme : lightTheme);
    const [settings, setSettings] = useState({
        notifications: true,
        location: true,
    });
    const [activeTab, setActiveTab] = useState('Home');

    const [paymentMethods, setPaymentMethods] = useState([
        { id: '1', type: 'Visa', last4: '4242', icon: 'card' }
    ]);

    const [language, setLanguage] = useState('en');

    const t = (key) => {
        return translations[language][key] || key;
    };

    useEffect(() => {
        const loadLang = async () => {
            const savedLang = await AsyncStorage.getItem('userLanguage');
            if (savedLang) setLanguage(savedLang);
        };
        loadLang();
    }, []);

    const changeLanguage = async (newLang) => {
        setLanguage(newLang);
        await AsyncStorage.setItem('userLanguage', newLang);
    };

    useEffect(() => {
        setTheme(isDarkMode ? darkTheme : lightTheme);
    }, [isDarkMode]);

    useEffect(() => {
        setIsDarkMode(systemScheme === 'dark');
    }, [systemScheme]);

    // Check Storage on Mount
    useEffect(() => {
        const loadStorageData = async () => {
            try {
                // Force reset for fresh start as requested by user
                await AsyncStorage.removeItem('hasSeenWelcome');
                await AsyncStorage.removeItem('userSession');

                setHasSeenWelcome(false);
                setUser(null);
            } catch (e) {
                console.error("Failed to load storage data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStorageData();
    }, []);

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenWelcome', 'true');
            setHasSeenWelcome(true);
        } catch (e) {
            console.error("Failed to save onboarding status");
        }
    };

    const login = async (userData) => {
        try {
            // Simulator login: just set state and storage
            const newUser = { ...userProfile, ...userData }; // Merge with mock profile for now
            setUser(newUser);
            await AsyncStorage.setItem('userSession', JSON.stringify(newUser));
        } catch (e) {
            console.error("Login failed");
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            await AsyncStorage.removeItem('userSession');
        } catch (e) {
            console.error("Logout failed");
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const registerForPushNotificationsAsync = async () => {
        console.log("Push Notifications disabled for Expo Go SDK 54 compatibility");
        return null;
        /*
        if (!Device.isDevice) {
            Alert.alert('Must use physical device for Push Notifications');
            return;
        }
        ...
        */
    };

    const toggleSettings = async (key) => {
        setSettings(prev => {
            const newValue = !prev[key];
            if (key === 'notifications' && newValue === true) {
                // Try to register when turning on
                registerForPushNotificationsAsync();
            }
            return { ...prev, [key]: newValue };
        });
    };

    const scheduleNotification = async (title, body) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                data: { data: 'goes here' },
            },
            trigger: null, // show immediately
        });
    };

    // --- User Actions ---
    const updateUserProfile = (updates) => {
        setUser(prev => {
            const updated = { ...prev, ...updates };
            AsyncStorage.setItem('userSession', JSON.stringify(updated));
            return updated;
        });
    };

    const addPaymentMethod = (method) => {
        setPaymentMethods(prev => [...prev, method]);
    };

    const toggleFavorite = (restaurantId) => {
        setUser(prev => {
            if (!prev) return prev; // If user is null, do nothing
            const isFav = prev.favorites?.includes(restaurantId);
            let newFavs;
            if (isFav) {
                newFavs = prev.favorites.filter(id => id !== restaurantId);
            } else {
                newFavs = [...(prev.favorites || []), restaurantId];
            }
            const updated = { ...prev, favorites: newFavs };
            AsyncStorage.setItem('userSession', JSON.stringify(updated));
            return updated;
        });
    };

    // --- Cart Actions ---
    const addToCart = (item, restaurant) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                return [...prevCart, { ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
            }
        });
    };

    const removeFromCart = (itemId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    };

    const updateCartQuantity = (itemId, change) => {
        setCart((prevCart) => {
            return prevCart.map(item => {
                if (item.id === itemId) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            });
        });
    };

    const clearCart = () => setCart([]);

    // --- Order Actions ---
    const placeOrder = () => {
        if (cart.length === 0) return;

        const firstItem = cart[0];
        const restaurant = restaurants.find(r => r.id === firstItem.restaurantId);

        const newOrder = {
            id: Date.now().toString(),
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString(),
            status: 'Preparing', // Preparing, On the Way, Delivered
            restaurantId: firstItem.restaurantId,
            restaurantName: firstItem.restaurantName || 'Restaurant',
            location: restaurant?.location || restaurantLocation
        };

        setOrders((prevOrders) => [newOrder, ...prevOrders]);
        clearCart();
    };

    // --- Owner Actions ---
    const updateRestaurantMenu = (restaurantId, updatedMenu) => {
        setRestaurants((prevRestaurants) =>
            prevRestaurants.map((rest) =>
                rest.id === restaurantId ? { ...rest, menu: updatedMenu } : rest
            )
        );
    };

    return (
        <AppContext.Provider
            value={{
                restaurants,
                cart,
                orders,
                user,
                setUser, // Exposed, but preferably use login/logout
                login,
                logout,
                isLoading,
                hasSeenWelcome,
                completeOnboarding,
                addToCart,
                removeFromCart,
                updateCartQuantity,
                clearCart,
                placeOrder,
                updateRestaurantMenu,
                ownerRestaurantId: '2',
                // New Exports
                theme,
                isDarkMode,
                toggleTheme,
                settings,
                toggleSettings,
                paymentMethods,
                updateUserProfile,
                addPaymentMethod,
                toggleFavorite,
                scheduleNotification,
                activeTab,
                setActiveTab,
                restaurantLocation,
                setRestaurantLocation,
                language,
                changeLanguage,
                t
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
