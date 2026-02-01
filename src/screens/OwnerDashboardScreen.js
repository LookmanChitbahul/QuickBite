import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Image, Modal, TextInput, FlatList, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';

export default function OwnerDashboardScreen({ navigation }) {
    const {
        restaurants,
        ownerRestaurantId,
        restaurantLocation,
        setRestaurantLocation,
        logout,
        isDarkMode,
        theme,
        orders,
        updateOrderStatus,
        addRestaurant,
        deleteRestaurant,
        addManualOrder,
        confirmPickup
    } = useApp();

    const [scanning, setScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const [selectedProof, setSelectedProof] = useState(null);
    const [revenueResId, setRevenueResId] = useState('all'); // Default to ALL
    const [isAddingRest, setIsAddingRest] = useState(false);
    const [newRest, setNewRest] = useState({ name: '', address: '', description: '', tags: '', image: null });
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [isResPickerVisible, setIsResPickerVisible] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);
    const [isArTestVisible, setIsArTestVisible] = useState(false);
    const [arTestLoc, setArTestLoc] = useState({ lat: '-20.2443', lng: '57.4882', name: 'Test Place' });

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery access is required to add photos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            setNewRest(prev => ({ ...prev, image: result.assets[0].uri }));
        }
    };

    const myRestaurant = restaurants.find(r => r.id === ownerRestaurantId);

    // Revenue calculation
    // Revenue calculation
    const totalRevenue = useMemo(() => {
        let filteredOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Picked Up');

        if (revenueResId === 'all') {
            // No filter, take all
        } else if (revenueResId.startsWith('BRAND_')) {
            const brandName = revenueResId.replace('BRAND_', '');
            // Filter orders where the restaurant belongs to this brand
            // We need to look up the restaurant for each order to check its brand
            filteredOrders = filteredOrders.filter(o => {
                const rest = restaurants.find(r => r.id === o.restaurantId);
                return rest && (rest.brand === brandName || rest.name.includes(brandName));
            });
        } else {
            // Specific restaurant ID
            filteredOrders = filteredOrders.filter(o => o.restaurantId === revenueResId);
        }

        return filteredOrders.reduce((sum, o) => sum + o.total, 0);
    }, [orders, revenueResId, restaurants]);

    const revenueRestName = useMemo(() => {
        if (revenueResId === 'all') return 'All Restaurants';
        if (revenueResId.startsWith('BRAND_')) return `${revenueResId.replace('BRAND_', '')} (All Branches)`;
        return restaurants.find(r => r.id === revenueResId)?.name || 'Select Restaurant';
    }, [revenueResId, restaurants]);

    const filteredTransactions = useMemo(() => {
        let list = orders;
        if (revenueResId !== 'all') {
            if (revenueResId.startsWith('BRAND_')) {
                const brandName = revenueResId.replace('BRAND_', '');
                list = list.filter(o => {
                    const rest = restaurants.find(r => r.id === o.restaurantId);
                    return rest && (rest.brand === brandName || rest.name.includes(brandName));
                });
            } else {
                list = list.filter(o => o.restaurantId === revenueResId);
            }
        }
        // Sort by date descending
        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [orders, revenueResId, restaurants]);

    // Pending orders for ALL restaurants (since we are in an "Owner/Admin" dev mode)
    const pendingOrders = orders.filter(o => o.status === 'Awaiting Validation');

    const handleOrderStatus = (orderId, status) => {
        updateOrderStatus(orderId, status);
        Alert.alert("Order Updated", `Order has been marked as ${status}.`);
    };

    const handleAddRestaurant = () => {
        if (!newRest.name || !newRest.address) {
            Alert.alert("Error", "Name and Address are required.");
            return;
        }
        const restaurant = {
            id: `rest_${Date.now()}`,
            name: newRest.name,
            address: newRest.address,
            description: newRest.description,
            tags: newRest.tags.split(',').map(t => t.trim()),
            rating: 5.0,
            reviews: 0,
            distance: '0.0 km',
            location: { latitude: -20.2443, longitude: 57.4882 },
            image: newRest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            menu: [],
            bankDetails: { bank: 'MCB', account: '000000000000', name: newRest.name, juice: '50000000' }
        };
        addRestaurant(restaurant);
        setIsAddingRest(false);
        setNewRest({ name: '', address: '', description: '', tags: '', image: null });
        Alert.alert("Success", "New restaurant added successfully!");
    };

    const handleDeleteRestaurant = () => {
        Alert.alert(
            "Delete Restaurant",
            "Select a restaurant to permanently remove:",
            restaurants.map(r => ({
                text: r.name,
                style: 'destructive',
                onPress: () => {
                    deleteRestaurant(r.id);
                    if (revenueResId === r.id) setRevenueResId(null);
                    Alert.alert("Deleted", `${r.name} has been removed.`);
                }
            })).concat([{ text: "Cancel", style: "cancel" }])
        );
    };

    const handleCreateTestOrder = () => {
        const testOrder = {
            id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
            items: [{ id: 'test1', name: 'Sample Item', quantity: 1, price: 150 }],
            total: 150,
            date: new Date().toISOString(),
            status: 'Awaiting Validation',
            restaurantId: revenueResId !== 'all' ? revenueResId : restaurants[0].id,
            restaurantName: restaurants.find(r => r.id === (revenueResId !== 'all' ? revenueResId : restaurants[0].id))?.name || 'My Restaurant',
            restaurantAddress: 'Testing Lane, Mauritius',
            paymentProof: 'https://images.unsplash.com/photo-1554224155-1697467265d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        };
        addManualOrder(testOrder);
        Alert.alert("Debug Order Created", "A test order was added to the history. Scroll down to see it in the Recent Transactions log.");
    };

    const handleBarCodeScanned = ({ data }) => {
        try {
            const qrData = JSON.parse(data);
            const order = orders.find(o => o.id === qrData.orderId);

            if (!order) {
                Alert.alert('Error', 'Order not found');
                setScanning(false);
                return;
            }

            if (order.status === 'Picked Up') {
                Alert.alert('Info', 'Order already picked up');
                setScanning(false);
                return;
            }

            confirmPickup(order.id);
            setScanning(false);
            Alert.alert("Success", `Order #${order.id.slice(-6)} picked up!`);
        } catch (e) {
            Alert.alert("Error", "Invalid QR Code");
            setScanning(false);
        }
    };

    const handleTestAr = () => {
        const lat = parseFloat(arTestLoc.lat);
        const lng = parseFloat(arTestLoc.lng);
        if (isNaN(lat) || isNaN(lng)) {
            Alert.alert("Error", "Invalid coordinates");
            return;
        }
        setIsArTestVisible(false);
        navigation.navigate('ARScreen', {
            restaurant: {
                id: 'test_ar',
                name: arTestLoc.name,
                location: { latitude: lat, longitude: lng },
                description: 'Manual AR Test Location'
            }
        });
    };

    const handleGenerateReport = async () => {
        const selectedRes = restaurants.find(r => r.id === revenueResId);
        if (!selectedRes) {
            Alert.alert("Error", "Please select a restaurant first.");
            return;
        }

        const resOrders = orders.filter(o => o.restaurantId === revenueResId && (o.status === 'Confirmed' || o.status === 'Picked Up'));
        const totalRev = resOrders.reduce((sum, o) => sum + o.total, 0);

        const html = `
            <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                        h1 { color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
                        .header-info { margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f9fafb; font-weight: bold; }
                        .total-row { font-weight: bold; background-color: #fffbeb; }
                        .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>QuickBite Revenue Report</h1>
                    <div class="header-info">
                        <p><strong>Restaurant:</strong> ${selectedRes.name}</p>
                        <p><strong>Address:</strong> ${selectedRes.address}</p>
                        <p><strong>Date Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Status:</strong> Confirmed & Completed Orders</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Amount (Rs)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resOrders.map(o => `
                                <tr>
                                    <td>#${o.id.slice(-6)}</td>
                                    <td>${new Date(o.date).toLocaleDateString()}</td>
                                    <td>${o.items.map(i => `${i.quantity}x ${i.name}`).join('<br>')}</td>
                                    <td>${o.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Total Revenue:</td>
                                <td>Rs ${totalRev.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footer">
                        Generated via QuickBite Mauritius Management Portal
                    </div>
                </body>
            </html>
        `;

        try {
            setIsReportModalVisible(true);
        } catch (error) {
            Alert.alert("Error", "Could not prepare PDF report.");
            console.error(error);
        }
    };

    const performReportAction = async (actionType) => {
        const selectedRes = restaurants.find(r => r.id === revenueResId);
        const resOrders = orders.filter(o => o.restaurantId === revenueResId && (o.status === 'Confirmed' || o.status === 'Picked Up'));
        const totalRev = resOrders.reduce((sum, o) => sum + o.total, 0);

        const html = `
            <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                        h1 { color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
                        .header-info { margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f9fafb; font-weight: bold; }
                        .total-row { font-weight: bold; background-color: #fffbeb; }
                        .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>QuickBite Revenue Report</h1>
                    <div class="header-info">
                        <p><strong>Restaurant:</strong> ${selectedRes.name}</p>
                        <p><strong>Address:</strong> ${selectedRes.address}</p>
                        <p><strong>Date Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Status:</strong> Confirmed Orders Only</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Amount (Rs)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resOrders.map(o => `
                                <tr>
                                    <td>#${o.id.slice(-6)}</td>
                                    <td>${new Date(o.date).toLocaleDateString()}</td>
                                    <td>${o.items.map(i => `${i.quantity}x ${i.name}`).join('<br>')}</td>
                                    <td>${o.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Total Revenue:</td>
                                <td>Rs ${totalRev.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footer">
                        Generated via QuickBite Mauritius Management Portal
                    </div>
                </body>
            </html>
        `;

        setIsReportModalVisible(false);

        try {
            if (actionType === 'preview') {
                setPreviewContent(html);
                setIsPreviewVisible(true);
            } else if (actionType === 'print') {
                await Print.printAsync({ html });
            } else if (actionType === 'download') {
                const { uri } = await Print.printToFileAsync({ html });
                const fileName = `QuickBite_Report_${selectedRes.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

                if (Platform.OS === 'android') {
                    // Direct Download logic for Android using StorageAccessFramework
                    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                    if (permissions.granted) {
                        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                        await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf')
                            .then(async (safUri) => {
                                await FileSystem.writeAsStringAsync(safUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                                Alert.alert('File Saved', `Report has been saved to your selected folder as ${fileName}`);
                            })
                            .catch((e) => {
                                console.error(e);
                                Alert.alert('Error', 'Failed to save file to storage.');
                            });
                    } else {
                        Alert.alert('Permission Denied', 'Storage access is required to download the report.');
                    }
                } else {
                    // iOS download (Standard flow via Share Sheet's "Save to Files")
                    const newUri = FileSystem.documentDirectory + fileName;
                    await FileSystem.copyAsync({ from: uri, to: newUri });
                    await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
                }
            } else if (actionType === 'share') {
                const { uri } = await Print.printToFileAsync({ html });
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            }
        } catch (error) {
            Alert.alert("Error", `Could not perform ${actionType} action.`);
        }
    };

    const handleLogout = async () => {
        await logout();
        // navigation.replace('Auth'); // State change will handle this automatically
    };

    const primaryColor = theme?.colors?.primary || '#F59E0B';
    const bgColor = isDarkMode ? '#111827' : '#F9FAFB';
    const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';
    const textColor = isDarkMode ? '#FFFFFF' : '#1F2937';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const borderColor = isDarkMode ? '#374151' : '#F3F4F6';

    return (
        <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={isDarkMode ? ['#1e3a8a', '#1e1b4b'] : ['#F59E0B', '#D97706']}
                style={styles.headerGradient}
            >
                <View style={styles.headerHeader}>
                    <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} style={styles.backWhiteCircle}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutWhiteCircle} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerWelcome}>Welcome</Text>
                    <Text style={styles.headerRestName}>{myRestaurant?.name || 'Restaurant Manager'}</Text>
                    <View style={styles.headerTag}>
                        <Ionicons name="checkmark-circle" size={14} color="#fff" />
                        <Text style={styles.headerTagText}>Verified Partner</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Revenue Insights */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>Revenue Analytics</Text>
            <View style={styles.statsContainer}>
                <TouchableOpacity
                    style={[styles.statCardFull, { backgroundColor: cardBg }]}
                    onPress={() => setIsResPickerVisible(true)}
                >
                    <View style={styles.revHeader}>
                        <Text style={[styles.statLabel, { color: subTextColor }]}>Total Revenue: {revenueRestName}</Text>
                        <Ionicons name="swap-horizontal" size={16} color={primaryColor} />
                    </View>
                    <Text style={[styles.statValueBig, { color: textColor }]}>Rs {totalRevenue.toFixed(2)}</Text>
                    <View style={styles.revFooter}>
                        <Text style={{ fontSize: 11, color: '#10B981' }}>• Confirmed Orders Only</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: primaryColor }]} onPress={handleGenerateReport}>
                                <Ionicons name="download-outline" size={16} color="#fff" />
                                <Text style={styles.downloadBtnText}>PDF Report</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Bank-style Transaction Log */}
                <View style={[styles.transactionContainer, { backgroundColor: cardBg, marginTop: 15 }]}>
                    <View style={styles.transHeader}>
                        <Text style={[styles.transTitle, { color: textColor }]}>Recent Transactions</Text>
                        <Ionicons name="receipt-outline" size={18} color={subTextColor} />
                    </View>
                    {filteredTransactions.slice(0, 10).map((order, idx) => (
                        <View key={order.id} style={[styles.transRow, { borderBottomWidth: idx === 9 ? 0 : 1, borderBottomColor: borderColor }]}>
                            <View style={styles.transIconCircle}>
                                <Ionicons name="location-outline" size={20} color="#10B981" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.transOrderName, { color: textColor }]}>{order.restaurantName} #{order.id.slice(-4)}</Text>
                                <Text style={[styles.transDate, { color: subTextColor }]}>
                                    {new Date(order.date).toLocaleDateString()} • {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Text style={[styles.transDate, { color: subTextColor, fontSize: 10, marginTop: 2 }]}>
                                    📍 {order.location?.latitude ? `${order.location.latitude.toFixed(4)}, ${order.location.longitude.toFixed(4)}` : 'Location N/A'}
                                </Text>
                            </View>
                            <Text style={[styles.transAmount, { color: '#10B981' }]}>+Rs {order.total.toFixed(0)}</Text>
                        </View>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <Text style={[styles.emptyTrans, { color: subTextColor }]}>No transactions yet.</Text>
                    )}
                </View>
            </View>

            {/* Incoming Payments Section */}
            <Text style={[styles.sectionTitle, { color: textColor, marginTop: 10 }]}>Incoming Payments ({pendingOrders.length})</Text>
            {pendingOrders.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
                    <Ionicons name="sparkles-outline" size={40} color={subTextColor} />
                    <Text style={[styles.emptyText, { color: subTextColor }]}>No pending payments to validate.</Text>
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                    {pendingOrders.map(order => (
                        <View key={order.id} style={[styles.orderCardHorizontal, { backgroundColor: isDarkMode ? '#1e1b4b' : '#EFF6FF', borderColor: isDarkMode ? '#1e3a8a' : '#DBEAFE' }]}>
                            <View style={styles.orderHeader}>
                                <Text style={[styles.orderId, { color: textColor }]}>#{order.id.slice(-6)}</Text>
                                <Text style={[styles.orderTotal, { color: '#3B82F6' }]}>Rs {order.total.toFixed(0)}</Text>
                            </View>
                            <Text style={[styles.orderRestName, { color: subTextColor }]}>{order.restaurantName}</Text>

                            <TouchableOpacity
                                style={styles.proofThumbContainer}
                                onPress={() => setSelectedProof(order.paymentProof)}
                            >
                                <Image source={{ uri: order.paymentProof }} style={styles.proofThumbSmall} />
                                <View style={styles.proofOverlay}><Ionicons name="image" size={14} color="#fff" /></View>
                            </TouchableOpacity>

                            <View style={styles.quickActions}>
                                <TouchableOpacity onPress={() => handleOrderStatus(order.id, 'Confirmed')} style={[styles.quickBtn, { backgroundColor: '#10B981' }]}>
                                    <Ionicons name="checkmark" size={18} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleOrderStatus(order.id, 'Payment Rejected')} style={[styles.quickBtn, { backgroundColor: '#F97316' }]}>
                                    <Ionicons name="close" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Ready for Pick Up Section */}
            <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>Ready for Pick Up ({orders.filter(o => o.status === 'Confirmed').length})</Text>
            {orders.filter(o => o.status === 'Confirmed').length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
                    <Ionicons name="restaurant-outline" size={40} color={subTextColor} />
                    <Text style={[styles.emptyText, { color: subTextColor }]}>No orders ready for pick up.</Text>
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                    {orders.filter(o => o.status === 'Confirmed').map(order => (
                        <View key={order.id} style={[styles.orderCardHorizontal, { backgroundColor: isDarkMode ? '#1e3020' : '#F0FDF4', borderColor: isDarkMode ? '#065f46' : '#DCFCE7' }]}>
                            <View style={styles.orderHeader}>
                                <Text style={[styles.orderId, { color: textColor }]}>#{order.id.slice(-6)}</Text>
                                <Ionicons name="time" size={14} color="#10B981" />
                            </View>
                            <Text style={[styles.orderRestName, { color: subTextColor }]}>{order.restaurantName}</Text>

                            <View style={styles.itemsBrief}>
                                {order.items.slice(0, 2).map((item, idx) => (
                                    <Text key={idx} style={{ fontSize: 10, color: textColor }} numberOfLines={1}>
                                        • {item.quantity}x {item.name}
                                    </Text>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.pickupBtn, { backgroundColor: '#10B981' }]}
                                onPress={async () => {
                                    if (!permission?.granted) {
                                        const result = await requestPermission();
                                        if (!result.granted) {
                                            Alert.alert("Permission Denied", "Camera access is needed to scan QR code");
                                            return;
                                        }
                                    }
                                    setScanning(true);
                                }}
                            >
                                <Ionicons name="qr-code" size={16} color="#fff" />
                                <Text style={styles.pickupBtnText}>Scan QR Code</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}

            <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>Management Controls</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity style={[styles.actionCard, { backgroundColor: cardBg }]} onPress={() => navigation.navigate('OwnerMenuEditor')}>
                    <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE' }]}>
                        <Ionicons name="restaurant" size={32} color="#2563EB" />
                    </View>
                    <Text style={[styles.actionText, { color: textColor }]}>Edit Menus</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, { backgroundColor: cardBg }]} onPress={() => setIsAddingRest(true)}>
                    <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5' }]}>
                        <Ionicons name="add-circle" size={32} color="#10B981" />
                    </View>
                    <Text style={[styles.actionText, { color: textColor }]}>Add Rest.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, { backgroundColor: cardBg }]} onPress={handleDeleteRestaurant}>
                    <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }]}>
                        <Ionicons name="trash" size={32} color="#F97316" />
                    </View>
                    <Text style={[styles.actionText, { color: textColor }]}>Delete Rest.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, { backgroundColor: cardBg }]} onPress={() => setIsArTestVisible(true)}>
                    <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : '#EDE9FE' }]}>
                        <Ionicons name="cube" size={32} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.actionText, { color: textColor }]}>Test AR</Text>
                </TouchableOpacity>
            </View>

            {/* Add Restaurant Modal */}
            <Modal visible={isAddingRest} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>New Restaurant</Text>
                            <TouchableOpacity onPress={() => setIsAddingRest(false)}>
                                <Ionicons name="close" size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder="Restaurant Name"
                            placeholderTextColor={subTextColor}
                            style={[styles.input, { color: textColor, borderColor: borderColor }]}
                            value={newRest.name}
                            onChangeText={t => setNewRest({ ...newRest, name: t })}
                        />

                        <TouchableOpacity onPress={pickImage} style={[styles.imagePickerBtn, { borderColor: borderColor, marginTop: 12 }]}>
                            {newRest.image ? (
                                <Image source={{ uri: newRest.image }} style={styles.pickedImagePreview} />
                            ) : (
                                <View style={styles.pickerPlaceholder}>
                                    <Ionicons name="camera" size={24} color={primaryColor} />
                                    <Text style={{ color: subTextColor, fontSize: 13, marginTop: 4 }}>Add Restaurant Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TextInput
                            placeholder="Address (e.g. Bagatelle Mall)"
                            placeholderTextColor={subTextColor}
                            style={[styles.input, { color: textColor, borderColor: borderColor, marginTop: 12 }]}
                            value={newRest.address}
                            onChangeText={t => setNewRest({ ...newRest, address: t })}
                        />
                        <TextInput
                            placeholder="Description"
                            placeholderTextColor={subTextColor}
                            style={[styles.input, { color: textColor, borderColor: borderColor, marginTop: 12 }]}
                            value={newRest.description}
                            onChangeText={t => setNewRest({ ...newRest, description: t })}
                        />
                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: primaryColor }]} onPress={handleAddRestaurant}>
                            <Text style={styles.saveBtnText}>Save Restaurant</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Proof Preview Modal */}
            <Modal visible={!!selectedProof} transparent animationType="fade">
                <View style={styles.modalBg}>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedProof(null)}>
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>
                    {selectedProof && (
                        <Image source={{ uri: selectedProof }} style={styles.fullProofImage} resizeMode="contain" />
                    )}
                </View>
            </Modal>

            {/* Report Actions Modal */}
            <Modal visible={isReportModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>Report Options</Text>
                            <TouchableOpacity onPress={() => setIsReportModalVisible(false)}>
                                <Ionicons name="close" size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[styles.reportActionBtn, { borderColor: borderColor }]} onPress={() => performReportAction('preview')}>
                            <Ionicons name="eye" size={20} color={primaryColor} />
                            <Text style={[styles.reportActionText, { color: textColor }]}>Preview</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.reportActionBtn, { borderColor: borderColor }]} onPress={() => performReportAction('print')}>
                            <Ionicons name="print" size={20} color={primaryColor} />
                            <Text style={[styles.reportActionText, { color: textColor }]}>Print</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.reportActionBtn, { borderColor: borderColor }]} onPress={() => performReportAction('download')}>
                            <Ionicons name="download" size={20} color={primaryColor} />
                            <Text style={[styles.reportActionText, { color: textColor }]}>Download</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.reportActionBtn, { borderColor: borderColor }]} onPress={() => performReportAction('share')}>
                            <Ionicons name="share-social" size={20} color={primaryColor} />
                            <Text style={[styles.reportActionText, { color: textColor }]}>Share</Text>
                        </TouchableOpacity>

                        <View style={{ height: 20 }} />
                    </View>
                </View>
            </Modal>

            {/* Restaurant Picker Modal */}
            <Modal visible={isResPickerVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>Select Restaurant</Text>
                            <TouchableOpacity onPress={() => setIsResPickerVisible(false)}>
                                <Ionicons name="close" size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 400 }}>
                            <TouchableOpacity
                                style={[styles.pickerItem, { borderBottomColor: borderColor }]}
                                onPress={() => {
                                    setRevenueResId('all');
                                    setIsResPickerVisible(false);
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.pickerItemText, { color: textColor, fontWeight: 'bold' }]}>All Restaurants</Text>
                                    <Text style={{ fontSize: 11, color: subTextColor }}>Global Revenue</Text>
                                </View>
                                {revenueResId === 'all' && <Ionicons name="checkmark-circle" size={20} color={primaryColor} />}
                            </TouchableOpacity>

                            {/* Group by Brands */}
                            {Array.from(new Set(restaurants.map(r => r.brand || r.name))).map(brand => {
                                const brandLocs = restaurants.filter(r => (r.brand === brand) || (!r.brand && r.name === brand));
                                const isBrandSelected = revenueResId === `BRAND_${brand}`;

                                return (
                                    <View key={brand} style={{ marginTop: 10 }}>
                                        {/* Brand Header / Select All for Brand */}
                                        <TouchableOpacity
                                            style={[styles.pickerItem, { borderBottomColor: borderColor, backgroundColor: isDarkMode ? '#374151' : '#F3F4F6', paddingLeft: 10 }]}
                                            onPress={() => {
                                                setRevenueResId(`BRAND_${brand}`);
                                                setIsResPickerVisible(false);
                                            }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.pickerItemText, { color: textColor, fontWeight: 'bold' }]}>{brand}</Text>
                                                <Text style={{ fontSize: 11, color: subTextColor }}>All {brand} Locations</Text>
                                            </View>
                                            {isBrandSelected && <Ionicons name="checkmark-circle" size={20} color={primaryColor} />}
                                        </TouchableOpacity>

                                        {/* Individual Locations */}
                                        {brandLocs.map(r => (
                                            <TouchableOpacity
                                                key={r.id}
                                                style={[styles.pickerItem, { borderBottomColor: borderColor, paddingLeft: 30 }]}
                                                onPress={() => {
                                                    setRevenueResId(r.id);
                                                    setIsResPickerVisible(false);
                                                }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.pickerItemText, { color: textColor }]}>{r.name}</Text>
                                                    <Text style={{ fontSize: 11, color: subTextColor }}>{r.address}</Text>
                                                </View>
                                                {revenueResId === r.id && <Ionicons name="checkmark-circle" size={20} color={primaryColor} />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                );
                            })}
                        </ScrollView>
                        <View style={{ height: 20 }} />
                    </View>
                </View>
            </Modal>

            {/* PDF Preview Modal */}
            <Modal visible={isPreviewVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg, height: '85%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>Report Preview</Text>
                            <TouchableOpacity onPress={() => setIsPreviewVisible(false)} style={styles.previewCloseBtn}>
                                <Text style={{ color: primaryColor, fontWeight: 'bold' }}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: borderColor }}>
                            <WebView
                                originWhitelist={['*']}
                                source={{ html: previewContent }}
                                style={{ flex: 1, backgroundColor: '#fff' }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* AR Test Modal */}
            <Modal visible={isArTestVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>AR Location Test</Text>
                            <TouchableOpacity onPress={() => setIsArTestVisible(false)}>
                                <Ionicons name="close" size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: subTextColor, marginBottom: 15 }}>Enter coordinates to test AR view.</Text>

                        <TextInput
                            placeholder="Place Name"
                            placeholderTextColor={subTextColor}
                            style={[styles.input, { color: textColor, borderColor: borderColor, marginBottom: 12 }]}
                            value={arTestLoc.name}
                            onChangeText={t => setArTestLoc({ ...arTestLoc, name: t })}
                        />
                        <TextInput
                            placeholder="Latitude (e.g. -20.24)"
                            placeholderTextColor={subTextColor}
                            style={[styles.input, { color: textColor, borderColor: borderColor, marginBottom: 12 }]}
                            value={arTestLoc.lat}
                            keyboardType="default" // Allow negative signs and dots freely
                            onChangeText={t => setArTestLoc({ ...arTestLoc, lat: t })}
                        />
                        <TextInput
                            placeholder="Longitude (e.g. 57.48)"
                            placeholderTextColor={subTextColor}
                            style={[styles.input, { color: textColor, borderColor: borderColor, marginBottom: 12 }]}
                            value={arTestLoc.lng}
                            keyboardType="default" // Allow negative signs and dots freely
                            onChangeText={t => setArTestLoc({ ...arTestLoc, lng: t })}
                        />

                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#8B5CF6' }]} onPress={handleTestAr}>
                            <Text style={styles.saveBtnText}>Launch AR View</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* QR Scanner Modal */}
            {/* QR Scanner Modal */}
            <Modal visible={scanning} animationType="slide" transparent={false} presentationStyle="fullScreen">
                <View style={[styles.scannerContainer, { flex: 1, backgroundColor: 'black' }]}>
                    <CameraView
                        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                        style={[StyleSheet.absoluteFillObject, { flex: 1 }]}
                    />
                    <View style={[styles.scannerOverlay, { flex: 1, justifyContent: 'space-between', paddingVertical: 50 }]}>
                        <View style={styles.scannerHeader}>
                            <Text style={styles.scannerTitle}>Scan Customer QR</Text>
                            <TouchableOpacity onPress={() => setScanning(false)} style={styles.scannerClose}>
                                <Ionicons name="close-circle" size={40} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.scannerBox} />
                        <Text style={styles.scannerHint}>Align the QR code within the frame</Text>
                    </View>
                </View>
            </Modal>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 20,
    },
    headerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backWhiteCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutWhiteCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        marginTop: 24,
    },
    headerWelcome: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    headerRestName: {
        fontSize: 28,
        color: '#FFF',
        fontWeight: '900',
        marginTop: 4,
    },
    headerTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 12,
    },
    headerTagText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    sectionTitle: { fontSize: 17, fontWeight: '800', marginLeft: 24, marginBottom: 12 },
    statsContainer: { paddingHorizontal: 20, marginBottom: 20 },
    statCardFull: { padding: 20, borderRadius: 20, elevation: 3, shadowOpacity: 0.1, shadowRadius: 10 },
    revHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    statLabel: { fontSize: 13, fontWeight: '600' },
    statValueBig: { fontSize: 28, fontWeight: '900' },
    emptyCard: { marginHorizontal: 20, padding: 30, borderRadius: 20, alignItems: 'center' },
    emptyText: { marginTop: 10, fontSize: 14 },
    orderCardHorizontal: { width: 160, padding: 15, borderRadius: 20, marginRight: 15, borderWidth: 1 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    orderId: { fontSize: 13, fontWeight: 'bold' },
    orderTotal: { fontSize: 14, fontWeight: '800' },
    orderRestName: { fontSize: 11, marginBottom: 10 },
    proofThumbContainer: { height: 60, borderRadius: 12, overflow: 'hidden', marginBottom: 10, position: 'relative' },
    proofThumbSmall: { width: '100%', height: '100%' },
    proofOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
    quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
    quickBtn: { width: '45%', height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15 },
    actionCard: { width: '30%', padding: 15, borderRadius: 16, margin: '1.5%', alignItems: 'center', justifyContent: 'center' },
    iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    input: { borderWidth: 1, borderRadius: 12, padding: 12 },
    saveBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 25 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    modalClose: { position: 'absolute', top: 50, right: 20 },
    fullProofImage: { width: '90%', height: '80%' },
    imagePickerBtn: {
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    pickedImagePreview: {
        width: '100%',
        height: '100%',
    },
    pickerPlaceholder: {
        alignItems: 'center',
    },
    reportActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12
    },
    reportActionText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 15
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
    },
    pickerItemText: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2
    },
    revFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    downloadBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4
    },
    testOrderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CC0000',
    },
    testOrderBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4
    },
    itemsBrief: {
        marginVertical: 10,
        height: 35,
    },
    pickupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 5,
    },
    pickupBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    previewCloseBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    transactionContainer: {
        borderRadius: 20,
        padding: 18,
        elevation: 2,
        shadowOpacity: 0.1,
    },
    transHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    transTitle: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    transRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    transIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    transOrderName: {
        fontSize: 14,
        fontWeight: '600',
    },
    transDate: {
        fontSize: 11,
        marginTop: 2,
    },
    transAmount: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyTrans: {
        textAlign: 'center',
        fontSize: 13,
        paddingVertical: 10,
    }
});
