import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function OnboardingCard({ title, description, imageSource }) {
  return (
    <View style={styles.card}>
      {imageSource && <Image source={{ uri: imageSource }} style={styles.image} />}
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.desc}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 30,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: 'center'
  },
  title: { fontSize: 24, textAlign: 'center', fontWeight: 'bold', marginBottom: 15, color: '#1F2937' },
  desc: { fontSize: 16, color: '#4B5563', textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  image: { width: '100%', height: 150, borderRadius: 16, marginBottom: 20 }
});