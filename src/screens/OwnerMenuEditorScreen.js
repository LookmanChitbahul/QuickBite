import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Modal, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';

export default function OwnerMenuEditorScreen({ navigation }) {
    const { restaurants, updateRestaurantMenu, isDarkMode, theme } = useApp();
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const primaryColor = theme?.colors?.primary || '#F59E0B';
    const bgColor = isDarkMode ? '#111827' : '#F9FAFB';
    const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';
    const textColor = isDarkMode ? '#FFFFFF' : '#1F2937';
    const subTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const borderColor = isDarkMode ? '#374151' : '#E5E7EB';

    const handleSelectRestaurant = (restaurant) => {
        setSelectedRestaurant(restaurant);
    };

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
        setIsEditing(true);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery access is required to add photos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setEditingItem(prev => ({ ...prev, image: result.assets[0].uri }));
        }
    };

    const handleAddItem = () => {
        setEditingItem({
            id: `item_${Date.now()}`,
            name: '',
            price: 0,
            description: '',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        });
        setIsEditing(true);
    };

    const handleSaveItem = () => {
        if (!editingItem.name || editingItem.price <= 0) {
            Alert.alert("Error", "Please provide a name and valid price.");
            return;
        }

        let updatedMenu;
        const exists = selectedRestaurant.menu.find(i => i.id === editingItem.id);

        if (exists) {
            updatedMenu = selectedRestaurant.menu.map(i => i.id === editingItem.id ? editingItem : i);
        } else {
            updatedMenu = [...selectedRestaurant.menu, editingItem];
        }

        updateRestaurantMenu(selectedRestaurant.id, updatedMenu);
        setSelectedRestaurant({ ...selectedRestaurant, menu: updatedMenu });
        setIsEditing(false);
        setEditingItem(null);
        Alert.alert("Success", "Menu updated successfully!");
    };

    const handleDeleteItem = (itemId) => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to remove this item from the menu?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const updatedMenu = selectedRestaurant.menu.filter(i => i.id !== itemId);
                        updateRestaurantMenu(selectedRestaurant.id, updatedMenu);
                        setSelectedRestaurant({ ...selectedRestaurant, menu: updatedMenu });
                    }
                }
            ]
        );
    };

    if (!selectedRestaurant) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <View style={[styles.header, { backgroundColor: cardBg }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Select Restaurant</Text>
                </View>
                <ScrollView contentContainerStyle={styles.listContent}>
                    {restaurants.map(rest => (
                        <TouchableOpacity
                            key={rest.id}
                            style={[styles.restaurantCard, { backgroundColor: cardBg, borderColor: borderColor }]}
                            onPress={() => handleSelectRestaurant(rest)}
                        >
                            <Image source={{ uri: rest.image }} style={styles.restImage} />
                            <View style={styles.restInfo}>
                                <Text style={[styles.restName, { color: textColor }]}>{rest.name}</Text>
                                <Text style={[styles.restAddress, { color: subTextColor }]}>{rest.address}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={subTextColor} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={[styles.header, { backgroundColor: cardBg }]}>
                <TouchableOpacity onPress={() => setSelectedRestaurant(null)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>{selectedRestaurant.name} Menu</Text>
                <TouchableOpacity onPress={handleAddItem}>
                    <Ionicons name="add-circle-outline" size={28} color={primaryColor} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.listContent}>
                {selectedRestaurant.menu.map(item => (
                    <View key={item.id} style={[styles.menuItemCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemDetails}>
                            <Text style={[styles.itemName, { color: textColor }]}>{item.name}</Text>
                            <Text style={[styles.itemPrice, { color: primaryColor }]}>Rs {item.price.toFixed(2)}</Text>
                            <Text style={[styles.itemDesc, { color: subTextColor }]} numberOfLines={2}>{item.description}</Text>
                        </View>
                        <View style={styles.itemActions}>
                            <TouchableOpacity onPress={() => handleEditItem(item)} style={styles.actionBtn}>
                                <Ionicons name="create-outline" size={22} color={primaryColor} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.actionBtn}>
                                <Ionicons name="trash-outline" size={22} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Edit/Add Modal */}
            <Modal visible={isEditing} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textColor }]}>
                                {editingItem?.id.startsWith('item_') ? 'Add New Item' : 'Edit Item'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsEditing(false)}>
                                <Ionicons name="close" size={24} color={textColor} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Text style={[styles.inputLabel, { color: subTextColor }]}>Item Name</Text>
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: borderColor }]}
                                value={editingItem?.name}
                                onChangeText={(text) => setEditingItem({ ...editingItem, name: text })}
                                placeholder="e.g. Cheese Burger"
                                placeholderTextColor={subTextColor}
                            />

                            <TouchableOpacity onPress={pickImage} style={[styles.imagePickerBtn, { borderColor: borderColor, marginTop: 16 }]}>
                                {editingItem?.image ? (
                                    <Image source={{ uri: editingItem.image }} style={styles.pickedImagePreview} />
                                ) : (
                                    <View style={styles.pickerPlaceholder}>
                                        <Ionicons name="camera" size={24} color={primaryColor} />
                                        <Text style={{ color: subTextColor, fontSize: 13, marginTop: 4 }}>Add Item Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Text style={[styles.inputLabel, { color: subTextColor }]}>Price (Rs)</Text>
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: borderColor }]}
                                value={editingItem?.price.toString()}
                                onChangeText={(text) => setEditingItem({ ...editingItem, price: parseFloat(text) || 0 })}
                                keyboardType="numeric"
                                placeholder="0.00"
                                placeholderTextColor={subTextColor}
                            />

                            <Text style={[styles.inputLabel, { color: subTextColor }]}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { color: textColor, borderColor: borderColor }]}
                                value={editingItem?.description}
                                onChangeText={(text) => setEditingItem({ ...editingItem, description: text })}
                                multiline
                                numberOfLines={3}
                                placeholder="Brief description of the dish..."
                                placeholderTextColor={subTextColor}
                            />

                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: primaryColor }]} onPress={handleSaveItem}>
                                <Text style={styles.saveBtnText}>Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        elevation: 2,
    },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    listContent: { padding: 20 },
    restaurantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    restImage: { width: 60, height: 60, borderRadius: 12 },
    restInfo: { flex: 1, marginLeft: 15 },
    restName: { fontSize: 16, fontWeight: 'bold' },
    restAddress: { fontSize: 12, marginTop: 2 },
    menuItemCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        alignItems: 'center'
    },
    itemImage: { width: 70, height: 70, borderRadius: 12 },
    itemDetails: { flex: 1, marginLeft: 15 },
    itemName: { fontSize: 15, fontWeight: 'bold' },
    itemPrice: { fontSize: 14, fontWeight: '700', marginVertical: 2 },
    itemDesc: { fontSize: 12, lineHeight: 16 },
    itemActions: { marginLeft: 10 },
    actionBtn: { padding: 8 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    saveBtn: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 40,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    imagePickerBtn: {
        height: 150,
        borderRadius: 16,
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
});
