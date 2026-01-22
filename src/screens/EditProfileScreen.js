import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ScrollView, Platform, ActionSheetIOS, Animated, Easing, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

export default function EditProfileScreen({ navigation }) {
    const context = useApp();

    // Guard against missing context or missing user
    if (!context || !context.user) return null;

    const { theme, user, updateUserProfile, isDarkMode } = context;
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [photoUrl, setPhotoUrl] = useState(user?.photoUrl);

    // Rotation Animation
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 10000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    // Safe color access
    const textColor = isDarkMode ? '#FFFFFF' : '#000000';
    const labelColor = isDarkMode ? '#D1D5DB' : '#374151';
    const glassInputBg = isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)';
    const glassInputBorder = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)';
    const placeholderColor = isDarkMode ? '#9CA3AF' : '#4B5563';
    const primaryColor = theme?.colors?.primary || '#F59E0B';

    const [mediaLibraryStatus, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

    const pickImage = async () => {
        try {
            if (!mediaLibraryStatus?.granted) {
                const permission = await requestMediaLibraryPermission();
                if (!permission.granted) {
                    Alert.alert('Permission needed', 'Please grant library permissions to choose an image.');
                    return;
                }
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setPhotoUrl(result.assets[0].uri);
            }
        } catch (error) {
            console.log("Error picking image:", error);
            Alert.alert("Error", "Failed to launch image gallery. Please restart the app.");
        }
    };

    const handlePhotoChange = () => {
        Alert.alert(
            "Change Photo",
            "Choose an option",
            [
                { text: "Choose from Gallery", onPress: pickImage },
                { text: "Cancel", style: "cancel" }
            ],
            { cancelable: true }
        );
    };

    const handleSave = () => {
        if (!name || !email) {
            Alert.alert("Missing Fields", "Please enter your name and email.");
            return;
        }
        updateUserProfile({ name, email, phone, photoUrl });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* Animated Rotating Background */}
            <View style={StyleSheet.absoluteFill}>
                <View style={{ flex: 1, overflow: 'hidden', backgroundColor: theme?.colors?.background || '#F9FAFB' }}>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: -Dimensions.get('window').height * 0.5,
                            left: -Dimensions.get('window').height * 0.5,
                            width: Dimensions.get('window').height * 2,
                            height: Dimensions.get('window').height * 2,
                            transform: [{ rotate: spin }]
                        }}
                    >
                        <LinearGradient
                            colors={isDarkMode
                                ? ['#000428', '#004e92', '#00C6FB', '#004e92', '#000428']
                                : ['#373b44', '#4286f4', '#373b44']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }}
                        />
                    </Animated.View>
                </View>
            </View>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={[styles.saveText, { color: primaryColor }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarSection}>
                    {photoUrl ? (
                        <Image
                            source={{ uri: photoUrl }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.emptyAvatar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: glassInputBorder, borderWidth: 1 }]}>
                            <Ionicons name="person-outline" size={40} color={placeholderColor} />
                        </View>
                    )}
                    <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePhotoChange}>
                        <Text style={[styles.changePhotoText, { color: primaryColor }]}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.form, { paddingBottom: 50 }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: labelColor }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: glassInputBg, borderColor: glassInputBorder, borderWidth: 1, color: textColor }]}
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={placeholderColor}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: labelColor }]}>Email Address</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: glassInputBg, borderColor: glassInputBorder, borderWidth: 1, color: textColor }]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={placeholderColor}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: labelColor }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: glassInputBg, borderColor: glassInputBorder, borderWidth: 1, color: textColor }]}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder="+230 "
                            placeholderTextColor={placeholderColor}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'transparent'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)' },
    saveButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)' },
    saveText: { fontWeight: 'bold', fontSize: 16 },
    content: { paddingHorizontal: 24 },
    avatarSection: { alignItems: 'center', marginBottom: 32 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    emptyAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changePhotoBtn: { marginTop: 12 },
    changePhotoText: { fontWeight: '600' },
    form: { gap: 20 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 12, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase' },
    input: {
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
    }
});
