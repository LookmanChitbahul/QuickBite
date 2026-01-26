import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { restaurants as initialRestaurants, userProfile, ownerProfile } from '../data/mockData';
import { translations } from '../data/translations';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
import { lightTheme, darkTheme, colorBlindLightTheme, colorBlindDarkTheme } from '../styles/theme';


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
    const [colorBlindType, setColorBlindType] = useState('none');
    const [theme, setTheme] = useState(lightTheme);

    const [settings, setSettings] = useState({
        notifications: true,
        location: true,
    });
    const [activeTab, setActiveTab] = useState('Home');

    useEffect(() => {
        if (colorBlindType !== 'none') {
            setTheme(isDarkMode ? colorBlindDarkTheme : colorBlindLightTheme);
        } else {
            setTheme(isDarkMode ? darkTheme : lightTheme);
        }
    }, [isDarkMode, colorBlindType]);

    const toggleColorBlind = () => setColorBlindType(prev => prev === 'none' ? 'deuteranopia' : 'none');

    const [paymentMethods, setPaymentMethods] = useState([
        { id: '1', type: 'Internet Banking', last4: 'Transfer', icon: 'business' }
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
        setIsDarkMode(systemScheme === 'dark');
    }, [systemScheme]);

    // Check Firebase Auth & Storage on Mount
    useEffect(() => {
        const loadOrders = async () => {
            try {
                const savedOrders = await AsyncStorage.getItem('orderHistory');
                if (savedOrders) setOrders(JSON.parse(savedOrders));

                const seenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
                if (seenWelcome) setHasSeenWelcome(true);
            } catch (e) {
                console.error("Failed to load storage data", e);
            }
        };
        loadOrders();

        // Safety timeout for loading state
        const loadingTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 5000); // 5 seconds max loading

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    let userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName, // Map standard Firebase property
                    };

                    try {
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                        if (userDoc.exists()) {
                            userData = { ...userData, ...userDoc.data() };
                        }
                    } catch (permError) {
                        console.warn("Firestore Access Warning: " + permError.message + ". Check your Firestore Rules.");
                        // We continue with basic auth data if Firestore is locked
                    }

                    // Owner Detection Logic
                    const isOwner = userData.email === 'owner@gmail.com' || userData.role === 'owner';

                    const finalUser = {
                        ...userProfile,
                        ...userData,
                        isOwner: isOwner
                    };

                    setUser(finalUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Firebase Auth state error:", error);
            } finally {
                setIsLoading(false);
                clearTimeout(loadingTimeout);
            }
        });

        return () => {
            unsubscribe();
            clearTimeout(loadingTimeout);
        };
    }, []);

    // Save orders whenever they change
    useEffect(() => {
        const saveOrders = async () => {
            try {
                await AsyncStorage.setItem('orderHistory', JSON.stringify(orders));
            } catch (e) {
                console.error("Failed to save orders", e);
            }
        };
        if (orders.length > 0) {
            saveOrders();
        }
    }, [orders]);

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenWelcome', 'true');
            setHasSeenWelcome(true);
        } catch (e) {
            console.error("Failed to save onboarding status");
        }
    };

    const login = async (email, password, rememberMe = false) => {
        // Handled in screen
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setHasSeenWelcome(false);
            await AsyncStorage.removeItem('userSession');
            await AsyncStorage.removeItem('hasSeenWelcome');
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    const forgotPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
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
        // Disabled for Expo Go compatibility to avoid console errors
        console.log("Notification suppressed (Expo Go SDK 53+ limit)");
        /*
        try {
            const { status } = await Notifications.getPermissionsAsync();
            ...
        } catch (e) {
            ...
        }
        */
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
    const placeOrder = (paymentProof = null) => {
        if (cart.length === 0) return;

        const firstItem = cart[0];
        const restaurant = restaurants.find(r => r.id === firstItem.restaurantId);

        const newOrder = {
            id: Date.now().toString(),
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString(),
            status: 'Awaiting Validation',
            restaurantId: firstItem.restaurantId,
            restaurantName: firstItem.restaurantName || 'Restaurant',
            location: restaurant?.location || restaurantLocation,
            restaurantAddress: restaurant?.address || 'Restaurant Address',
            paymentProof: paymentProof
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

    const addRestaurant = (newRestaurant) => {
        setRestaurants(prev => [...prev, newRestaurant]);
    };

    const deleteRestaurant = (restaurantId) => {
        setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
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
                colorBlindType,
                setColorBlindType,
                toggleColorBlind,
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
                t,
                updateOrderStatus,
                addRestaurant,
                deleteRestaurant,
                forgotPassword
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
