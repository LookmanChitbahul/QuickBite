import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Alert, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { restaurants as initialRestaurants, userProfile, ownerProfile } from '../data/mockData';
import { translations } from '../data/translations';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import * as Location from 'expo-location';
import { lightTheme, darkTheme, colorBlindLightTheme, colorBlindDarkTheme } from '../styles/theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [restaurants, setRestaurants] = useState(initialRestaurants);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    // Firestore realtime listener for orders
    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setOrders(fetchedOrders);
        }, (error) => {
            console.log("Firestore Snapshot Error (Silent):", error.message);
        });
        return () => unsubscribe();
    }, []);

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
                        // Prioritize street over name (name often contains plus codes)
                        const street = addr.street || addr.name || '';
                        const city = addr.city || addr.region || addr.subregion || '';
                        const displayAddr = `${street}${city ? ', ' + city : ''}`.trim();
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

                    // Session logic
                    if (rememberMe !== 'true' && lastActive) {
                        const diff = now - parseInt(lastActive);
                        if (diff > 300000) { // 5 minutes inactivity
                            // await logout(); // DISABLE auto-logout for now to fix owner login loop
                            // setIsLoading(false);
                            // return;
                        }
                    }

                    await AsyncStorage.setItem('lastActiveTime', now.toString());

                    // CRITICAL: Check if user exists in Firestore
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (!userDoc.exists()) {
                        console.warn("User exists in Auth but not in Firestore. Creating recovery profile...");
                        // Instead of logging out, we RECOVER by creating the missing doc
                        const recoveryData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || 'App User',
                            photoUrl: firebaseUser.photoURL,
                            role: (firebaseUser.email?.toLowerCase().includes('owner') || firebaseUser.email === 'lookman1@gmail.com') ? 'owner' : 'user',
                            createdAt: new Date().toISOString(),
                            isVerified: true
                        };

                        await setDoc(userDocRef, recoveryData);

                        // Proceed with this new data
                        let userData = recoveryData;
                        const isOwner = userData.role === 'owner';
                        const finalUser = { ...userProfile, ...userData, isOwner };
                        setUser(finalUser);
                        setIsLoading(false);
                        return;
                    }

                    let userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        photoUrl: firebaseUser.photoURL,
                        ...userDoc.data()
                    };

                    if (userData.paymentMethods) {
                        setPaymentMethods(userData.paymentMethods);
                    }

                    const isOwner = userData.email === 'owner@gmail.com' || userData.role === 'owner';
                    const finalUser = { ...userProfile, ...userData, isOwner };
                    setUser(finalUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Firebase Auth state error:", error);
                // On critical error, better to show login than a broken home
                setUser(null);
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

    const removeFromCart = (itemId) => setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));

    const confirmPickup = async (orderId) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await setDoc(orderRef, {
                status: 'Picked Up',
                pickupTime: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error("Failed to confirm pickup", e);
        }
    };

    const updateCartQuantity = (itemId, change) => {
        setCart((prevCart) => prevCart.map(item => {
            if (item.id === itemId) {
                const newQuantity = item.quantity + change;
                if (newQuantity <= 0) {
                    return null; // Filter out later
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean));
    };

    const addToCart = (item, restaurant) => {
        // Check for restaurant mismatch using current state

        // RELOADING logic to avoid the setter complexity above:
        // We will do the check outside the setter.
        const currentCart = cart; // access state directly
        if (currentCart.length > 0 && currentCart[0].restaurantId !== restaurant.id) {
            Alert.alert(
                "Start new basket?",
                `Your cart contains items from ${currentCart[0].restaurantName}. Clear it to order from ${restaurant.name}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "New Basket",
                        onPress: () => {
                            setCart([{ ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }]);
                        }
                    }
                ]
            );
            return;
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
            } else {
                return [...prevCart, { ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
            }
        });
    };

    const clearCart = () => setCart([]);

    const addManualOrder = async (order) => {
        try {
            await addDoc(collection(db, 'orders'), order);
        } catch (e) {
            console.error("Failed to add manual order", e);
        }
    };

    const placeOrder = async (paymentProof = null) => {
        if (cart.length === 0) return;
        const firstItem = cart[0];
        const restaurant = restaurants.find(r => r.id === firstItem.restaurantId);

        // Ensure we handle numeric prices correctly
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = {
            // id: generated by firestore
            items: [...cart],
            total: totalAmount,
            date: new Date().toISOString(),
            status: 'Awaiting Validation',
            restaurantId: firstItem.restaurantId,
            restaurantName: firstItem.restaurantName || 'Restaurant',
            location: restaurant?.location || restaurantLocation,
            restaurantAddress: restaurant?.address || 'Restaurant Address',
            paymentProof: paymentProof,
            userId: user?.uid || 'guest',
            userName: user?.name || 'Guest User'
        };

        try {
            await addDoc(collection(db, 'orders'), newOrder);
            clearCart();
        } catch (e) {
            Alert.alert("Error", "Failed to place order. Check connection.");
            console.error(e);
        }
    };

    const updateRestaurantMenu = (restaurantId, updatedMenu) => {
        setRestaurants((prevRestaurants) => prevRestaurants.map((rest) => rest.id === restaurantId ? { ...rest, menu: updatedMenu } : rest));
    };

    const addRestaurant = (newRestaurant) => setRestaurants(prev => [...prev, newRestaurant]);
    const deleteRestaurant = (restaurantId) => setRestaurants(prev => prev.filter(r => r.id !== restaurantId));

    const updateOrderStatus = async (orderId, newStatus) => {
        // Optimistic update not needed as listener will catch it, but good for UI responsiveness
        try {
            const orderRef = doc(db, 'orders', orderId);
            await setDoc(orderRef, { status: newStatus }, { merge: true });
        } catch (e) {
            console.error("Failed to update status", e);
        }
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
                checkUserInDatabase, verifyResetCode, userLocation, userAddress, addManualOrder, setCart, confirmPickup
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
