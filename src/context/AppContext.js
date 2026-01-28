import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Alert, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { restaurants as initialRestaurants, userProfile, ownerProfile } from '../data/mockData';
import { translations } from '../data/translations';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as Location from 'expo-location';
import { lightTheme, darkTheme, colorBlindLightTheme, colorBlindDarkTheme } from '../styles/theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [restaurants, setRestaurants] = useState(initialRestaurants);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [restaurantLocation, setRestaurantLocation] = useState({ latitude: -20.1609, longitude: 57.5050 });
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState('Fetching location...');

    // Auth & Onboarding State
    const [user, setUser] = useState(null);
    const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [savedAccounts, setSavedAccounts] = useState([]);

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

    const [paymentMethods, setPaymentMethods] = useState([]);
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

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setHasSeenWelcome(false);
            await AsyncStorage.removeItem('userSession');
            await AsyncStorage.removeItem('hasSeenWelcome');
            await AsyncStorage.removeItem('rememberMe');
            await AsyncStorage.removeItem('lastActiveTime');
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    // Check Firebase Auth & Storage on Mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const savedOrders = await AsyncStorage.getItem('orderHistory');
                if (savedOrders) setOrders(JSON.parse(savedOrders));

                const seenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
                if (seenWelcome === 'true') setHasSeenWelcome(true);

                // Fetch Location
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let loc = await Location.getCurrentPositionAsync({});
                    setUserLocation(loc.coords);

                    // Reverse Geocode
                    let reverse = await Location.reverseGeocodeAsync({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude
                    });

                    if (reverse.length > 0) {
                        const addr = reverse[0];
                        const displayAddr = `${addr.name || addr.street || ''}, ${addr.city || addr.region || ''}`.trim().replace(/^,/, '').trim();
                        setUserAddress(displayAddr || 'Mauritius');
                    }
                } else {
                    setUserAddress('Bagatelle Mall, Moka'); // Fallback
                }
            } catch (e) {
                console.error("Failed to load initial data", e);
                setUserAddress('Bagatelle Mall, Moka');
            }
        };
        loadInitialData();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    const rememberMe = await AsyncStorage.getItem('rememberMe');
                    const lastActive = await AsyncStorage.getItem('lastActiveTime');
                    const now = Date.now();

                    // Session should last 5 minutes (300,000 ms) of INACTIVITY
                    if (rememberMe !== 'true' && lastActive) {
                        const diff = now - parseInt(lastActive);
                        if (diff > 300000) { // 5 minutes
                            await logout();
                            setIsLoading(false);
                            return;
                        }
                    }

                    await AsyncStorage.setItem('lastActiveTime', now.toString());

                    let userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        photoUrl: firebaseUser.photoURL,
                    };

                    try {
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                        if (userDoc.exists()) {
                            userData = { ...userData, ...userDoc.data() };
                            if (userData.paymentMethods) {
                                setPaymentMethods(userData.paymentMethods);
                            }
                        }
                    } catch (permError) {
                        console.warn("Firestore Access Warning: " + permError.message);
                    }

                    const isOwner = userData.email === 'owner@gmail.com' || userData.role === 'owner';
                    const finalUser = { ...userProfile, ...userData, isOwner };
                    setUser(finalUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Firebase Auth state error:", error);
            } finally {
                setIsLoading(false);
            }
        });

        // AppState listener for activity tracking
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'active') {
                const lastActive = await AsyncStorage.getItem('lastActiveTime');
                const rememberMe = await AsyncStorage.getItem('rememberMe');
                const now = Date.now();

                if (rememberMe !== 'true' && lastActive) {
                    if (now - parseInt(lastActive) > 300000) {
                        await logout();
                    }
                }
                await AsyncStorage.setItem('lastActiveTime', now.toString());
            } else if (nextAppState === 'background') {
                // Mark background time as last active
                await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
            }
        });

        return () => {
            unsubscribe();
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const saveOrders = async () => {
            try {
                await AsyncStorage.setItem('orderHistory', JSON.stringify(orders));
            } catch (e) {
                console.error("Failed to save orders", e);
            }
        };
        if (orders.length > 0) saveOrders();
    }, [orders]);

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenWelcome', 'true');
            setHasSeenWelcome(true);
        } catch (e) {
            console.error("Failed to save onboarding status");
        }
    };

    const login = async (email, password, rememberMe = false) => { };

    const forgotPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await setDoc(doc(db, 'passwordResets', email), { code: otpCode, createdAt: new Date().toISOString() });
            return { success: true, code: otpCode };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const toggleTheme = () => setIsDarkMode(prev => !prev);
    const registerForPushNotificationsAsync = async () => { return null; };

    const toggleSettings = async (key) => {
        setSettings(prev => {
            const newValue = !prev[key];
            if (key === 'notifications' && newValue === true) registerForPushNotificationsAsync();
            return { ...prev, [key]: newValue };
        });
    };

    const scheduleNotification = async (title, body) => { };

    const saveAccountToHistory = async (userData) => {
        try {
            const accounts = [...savedAccounts];
            const index = accounts.findIndex(a => a.email === userData.email);
            const accountInfo = {
                uid: userData.uid,
                email: userData.email,
                name: userData.name || userData.displayName,
                photoUrl: userData.photoUrl || userData.photoURL,
                type: userData.type || 'Google'
            };
            if (index > -1) accounts[index] = accountInfo;
            else accounts.unshift(accountInfo);
            const limitedAccounts = accounts.slice(0, 5);
            setSavedAccounts(limitedAccounts);
            await AsyncStorage.setItem('savedAccounts', JSON.stringify(limitedAccounts));
        } catch (e) {
            console.error("Error saving account history", e);
        }
    };

    const checkUserInDatabase = async (email) => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                return { exists: true, data: userData, uid: querySnapshot.docs[0].id };
            }
            return { exists: false };
        } catch (e) {
            return { exists: false, error: e.message };
        }
    };

    const verifyResetCode = async (email, inputCode) => {
        try {
            const resetDoc = await getDoc(doc(db, 'passwordResets', email));
            if (resetDoc.exists() && resetDoc.data().code === inputCode) return true;
            return false;
        } catch (e) {
            return false;
        }
    };

    const updateUserProfile = async (updates) => {
        if (!user) return;
        try {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            await AsyncStorage.setItem('userSession', JSON.stringify(updatedUser));
            await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const addPaymentMethod = async (method) => {
        const newMethods = [...paymentMethods, method];
        setPaymentMethods(newMethods);
        if (user) await setDoc(doc(db, 'users', user.uid), { paymentMethods: newMethods }, { merge: true });
    };

    const deletePaymentMethod = async (id) => {
        const newMethods = paymentMethods.filter(m => m.id !== id);
        setPaymentMethods(newMethods);
        if (user) await setDoc(doc(db, 'users', user.uid), { paymentMethods: newMethods }, { merge: true });
    };

    const toggleFavorite = (restaurantId) => {
        setUser(prev => {
            if (!prev) return prev;
            const isFav = prev.favorites?.includes(restaurantId);
            const newFavs = isFav ? prev.favorites.filter(id => id !== restaurantId) : [...(prev.favorites || []), restaurantId];
            const updated = { ...prev, favorites: newFavs };
            AsyncStorage.setItem('userSession', JSON.stringify(updated));
            return updated;
        });
    };

    const addToCart = (item, restaurant) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
            } else {
                return [...prevCart, { ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
            }
        });
    };

    const removeFromCart = (itemId) => setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));

    const updateCartQuantity = (itemId, change) => {
        setCart((prevCart) => prevCart.map(item => {
            if (item.id === itemId) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

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

    const updateRestaurantMenu = (restaurantId, updatedMenu) => {
        setRestaurants((prevRestaurants) => prevRestaurants.map((rest) => rest.id === restaurantId ? { ...rest, menu: updatedMenu } : rest));
    };

    const addRestaurant = (newRestaurant) => setRestaurants(prev => [...prev, newRestaurant]);
    const deleteRestaurant = (restaurantId) => setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    };

    return (
        <AppContext.Provider
            value={{
                restaurants, cart, orders, user, setUser, login, logout, isLoading, hasSeenWelcome, completeOnboarding,
                addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder, updateRestaurantMenu, ownerRestaurantId: '2',
                theme, isDarkMode, toggleTheme, colorBlindType, setColorBlindType, toggleColorBlind, settings, toggleSettings,
                paymentMethods, updateUserProfile, addPaymentMethod, deletePaymentMethod, toggleFavorite, scheduleNotification,
                activeTab, setActiveTab, restaurantLocation, setRestaurantLocation, language, changeLanguage, t,
                updateOrderStatus, addRestaurant, deleteRestaurant, forgotPassword, savedAccounts, saveAccountToHistory,
                checkUserInDatabase, verifyResetCode, userLocation, userAddress
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
