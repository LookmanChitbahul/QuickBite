import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Alert, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { restaurants as initialRestaurants, userProfile, ownerProfile } from '../data/mockData';
import { translations } from '../data/translations';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, onSnapshot, orderBy, deleteDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import { lightTheme, darkTheme, colorBlindLightTheme, colorBlindDarkTheme } from '../styles/theme';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- State Declarations ---
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState([]);
    const [restaurants, setRestaurants] = useState(initialRestaurants);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [activeTab, setActiveTab] = useState('Home');
    const [language, setLanguage] = useState('en');
    const [paymentMethods, setPaymentMethods] = useState([]);

    // Location State
    const [restaurantLocation, setRestaurantLocation] = useState({ latitude: -20.1609, longitude: 57.5050 });
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState('Fetching location...');

    // Theme State
    const systemScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
    const [colorBlindType, setColorBlindType] = useState('none');
    const [theme, setTheme] = useState(lightTheme);
    const [settings, setSettings] = useState({ notifications: true, location: true });

    // --- Effects ---

    // Translation helper
    const t = (key) => {
        return translations[language][key] || key;
    };

    // Load saved language
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

    // Promotion Sync Logic
    useEffect(() => {
        if (!user) {
            setPromotions([]);
            return;
        }

        const q = query(collection(db, 'promotions'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPromos = snapshot.docs.map(doc => doc.data());
            setPromotions(fetchedPromos);

            setRestaurants(currentRestaurants => {
                return currentRestaurants.map(r => {
                    let menuChanged = false;
                    const newMenu = r.menu.map(item => {
                        const activePromo = fetchedPromos.find(p => p.restaurant?.id === r.id && p.title === item.name);
                        if (activePromo) {
                            if (item.price !== activePromo.itemPrice) {
                                menuChanged = true;
                                return { ...item, price: activePromo.itemPrice, originalPrice: item.originalPrice || item.price };
                            }
                        } else if (item.originalPrice) {
                            menuChanged = true;
                            return { ...item, price: item.originalPrice, originalPrice: undefined };
                        }
                        return item;
                    });
                    if (menuChanged) return { ...r, menu: newMenu };
                    return r;
                });
            });
        }, (error) => {
            console.error("Error fetching promotions:", error);
        });

        return () => unsubscribe();
    }, [user]);

    // Order Listener Logic
    useEffect(() => {
        if (!user) {
            setOrders([]);
            return;
        }

        const ordersRef = collection(db, 'orders');
        let q;

        if (user.isOwner) {
            q = query(ordersRef);
        } else {
            q = query(ordersRef, where('userId', '==', user.uid));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            fetchedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            setOrders(fetchedOrders);
        }, (error) => {
            console.log("Firestore Orders Error:", error.message);
        });

        return () => unsubscribe();
    }, [user?.uid, user?.isOwner]);

    // Auth Change Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    let userData;
                    if (!userDoc.exists()) {
                        userData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || 'App User',
                            role: (firebaseUser.email?.toLowerCase().includes('owner') || firebaseUser.email === 'lookman1@gmail.com') ? 'owner' : 'user',
                            createdAt: new Date().toISOString(),
                        };
                        await setDoc(userDocRef, userData);
                    } else {
                        userData = { uid: firebaseUser.uid, ...userDoc.data() };
                    }

                    if (userData.paymentMethods) setPaymentMethods(userData.paymentMethods);

                    const isOwner = userData.role === 'owner' || userData.email === 'owner@gmail.com';
                    setUser({ ...userProfile, ...userData, isOwner });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth state error:", error);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Initial Data & Location
    useEffect(() => {
        const init = async () => {
            const seenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
            if (seenWelcome === 'true') setHasSeenWelcome(true);

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let loc = await Location.getCurrentPositionAsync({});
                setUserLocation(loc.coords);
                let reverse = await Location.reverseGeocodeAsync(loc.coords);
                if (reverse.length > 0) {
                    setUserAddress(`${reverse[0].street || ''}, ${reverse[0].city || ''}`);
                }
            }
        };
        init();
    }, []);

    // --- Methods ---
    const logout = async () => {
        await signOut(auth);
        setUser(null);
        await AsyncStorage.multiRemove(['userSession', 'hasSeenWelcome', 'rememberMe']);
    };

    const addPromotion = async (promo) => {
        await setDoc(doc(db, 'promotions', promo.id), promo);
    };

    const removePromotion = async (promoId) => {
        await deleteDoc(doc(db, 'promotions', promoId));
    };

    const login = async (email, password) => { /* placeholder */ };

    const completeOnboarding = async () => {
        await AsyncStorage.setItem('hasSeenWelcome', 'true');
        setHasSeenWelcome(true);
    };

    const toggleTheme = () => setIsDarkMode(prev => !prev);
    const toggleColorBlind = () => setColorBlindType(prev => prev === 'none' ? 'deuteranopia' : 'none');

    useEffect(() => {
        setTheme(isDarkMode
            ? (colorBlindType !== 'none' ? colorBlindDarkTheme : darkTheme)
            : (colorBlindType !== 'none' ? colorBlindLightTheme : lightTheme)
        );
    }, [isDarkMode, colorBlindType]);

    const forgotPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            await setDoc(doc(db, 'passwordResets', email), { code, createdAt: new Date().toISOString() });
            return { success: true, code };
        } catch (e) {
            return { success: false, error: e.message };
        }
    };

    const checkUserInDatabase = async (email) => {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snap = await getDocs(q);
        return !snap.empty ? { exists: true, data: snap.docs[0].data(), uid: snap.docs[0].id } : { exists: false };
    };

    const verifyResetCode = async (email, code) => {
        const snap = await getDoc(doc(db, 'passwordResets', email));
        return snap.exists() && snap.data().code === code;
    };

    const updateUserProfile = async (updates) => {
        if (!user) return;
        setUser(prev => ({ ...prev, ...updates }));
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    };

    const addPaymentMethod = async (method) => {
        const next = [...paymentMethods, method];
        setPaymentMethods(next);
        if (user) await setDoc(doc(db, 'users', user.uid), { paymentMethods: next }, { merge: true });
    };

    const deletePaymentMethod = async (id) => {
        const next = paymentMethods.filter(m => m.id !== id);
        setPaymentMethods(next);
        if (user) await setDoc(doc(db, 'users', user.uid), { paymentMethods: next }, { merge: true });
    };

    const toggleFavorite = (id) => {
        setUser(prev => {
            if (!prev) return prev;
            const favs = prev.favorites || [];
            const next = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
            return { ...prev, favorites: next };
        });
    };

    const saveAccountToHistory = async (acc) => {
        const current = await AsyncStorage.getItem('savedAccounts');
        let accounts = current ? JSON.parse(current) : [];
        if (!accounts.find(a => a.email === acc.email)) {
            accounts.push({ id: acc.uid, name: acc.name, email: acc.email, photo: acc.photoUrl });
            await AsyncStorage.setItem('savedAccounts', JSON.stringify(accounts));
            setSavedAccounts(accounts);
        }
    };

    useEffect(() => {
        const loadSaved = async () => {
            const current = await AsyncStorage.getItem('savedAccounts');
            if (current) setSavedAccounts(JSON.parse(current));
        };
        loadSaved();
    }, []);

    const addToCart = (item, restaurant) => {
        if (cart.length > 0 && cart[0].restaurantId !== restaurant.id) {
            Alert.alert("New Basket?", "Clear your current basket?", [
                { text: "No" },
                { text: "Yes", onPress: () => setCart([{ ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }]) }
            ]);
            return;
        }
        setCart(prev => {
            const ext = prev.find(x => x.id === item.id);
            if (ext) return prev.map(x => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x);
            return [...prev, { ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(x => x.id !== id));

    const updateCartQuantity = (id, delta) => {
        setCart(prev => prev.map(x => x.id === id ? { ...x, quantity: Math.max(0, x.quantity + delta) } : x).filter(x => x.quantity > 0));
    };

    const clearCart = () => setCart([]);

    const placeOrder = async (proof) => {
        if (cart.length === 0) return false;
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0) + 15;
        const order = {
            items: [...cart],
            total,
            date: new Date().toISOString(),
            status: 'Awaiting Validation',
            userId: user?.uid || 'guest',
            userName: user?.name || 'Guest',
            paymentProof: proof,
            restaurantId: cart[0].restaurantId,
            restaurantName: cart[0].restaurantName
        };
        try {
            await addDoc(collection(db, 'orders'), order);
            clearCart();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const confirmPickup = async (orderId) => {
        await setDoc(doc(db, 'orders', orderId), { status: 'Picked Up', pickupTime: new Date().toISOString() }, { merge: true });
    };

    const updateOrderStatus = async (id, status) => {
        await setDoc(doc(db, 'orders', id), { status }, { merge: true });
    };

    const addManualOrder = async (o) => { await addDoc(collection(db, 'orders'), o); };
    const deleteRestaurant = (id) => setRestaurants(prev => prev.filter(x => x.id !== id));
    const addRestaurant = (r) => setRestaurants(prev => [...prev, r]);
    const updateRestaurantMenu = (id, m) => setRestaurants(prev => prev.map(x => x.id === id ? { ...x, menu: m } : x));

    return (
        <AppContext.Provider value={{
            user, setUser, isLoading, hasSeenWelcome, restaurants, cart, orders, promotions, activeTab, setActiveTab,
            language, changeLanguage, t, theme, isDarkMode, toggleTheme, colorBlindType, toggleColorBlind,
            addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder, confirmPickup, updateOrderStatus,
            logout, login, completeOnboarding, forgotPassword, checkUserInDatabase, verifyResetCode,
            updateUserProfile, addPaymentMethod, deletePaymentMethod, toggleFavorite, saveAccountToHistory, savedAccounts,
            addPromotion, removePromotion, addManualOrder, deleteRestaurant, addRestaurant, updateRestaurantMenu,
            userLocation, userAddress, restaurantLocation, setRestaurantLocation, ownerRestaurantId: '2'
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
