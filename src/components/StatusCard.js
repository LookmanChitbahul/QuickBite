import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Step = ({ icon, label, active, color }) => (
  <View style={styles.stepItem}>
    <View style={[styles.circle, { backgroundColor: color, opacity: active ? 1 : 0.3 }]}>
      <Ionicons name={icon} size={22} color={active ? "#fff" : "#4B5563"} />
    </View>
    <Text style={styles.stepLabel}>{label}</Text>
  </View>
);

export default function StatusCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Track Your Order</Text>
      <Text style={styles.desc}>
        Real-time tracking of your delivery from kitchen to doorstep. Get updates at every step.
      </Text>

      <View style={styles.stepsRow}>
        <Step icon="checkmark" label="Ordered" color="#10B981" active />
        <View style={styles.line} />
        <Step icon="restaurant" label="Preparing" color="#FBBF24" active />
        <View style={styles.line} />
        <Step icon="home" label="Delivered" color="#D1D5DB" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 24,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: 'center'
  },
  title: { fontSize: 24, textAlign: 'center', fontWeight: 'bold', marginBottom: 12, color: '#1F2937' },
  desc: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  stepItem: { alignItems: 'center', width: '28%' },
  circle: { width: 44, height: 44, borderRadius: 22, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  line: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginBottom: 20, marginHorizontal: -4 }
});
