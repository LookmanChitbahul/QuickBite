import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

export default function PrimaryButton({ label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      {/* Removed LinearGradient to keep it simple white on the primary background */}
      <Text style={styles.text}>{label}</Text>
      <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={styles.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 160,
  },
  text: { color: theme.colors.primary, fontSize: 17, fontWeight: '800', marginRight: 8 },
  icon: { marginTop: 1 }
});
