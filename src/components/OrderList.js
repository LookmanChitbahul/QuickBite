import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import theme from '../styles/theme';

const orders = [
  { id: '1', restaurant: 'The Golden Spoon', date: '2023-10-27', total: '$25.50', status: 'Delivered' },
  { id: '2', restaurant: 'La Trattoria', date: '2023-10-25', total: '$40.00', status: 'Delivered' },
  { id: '3', restaurant: 'Sushi Express', date: '2023-10-24', total: '$30.25', status: 'Canceled' },
  { id: '4', restaurant: 'Pizzeria Roma', date: '2023-10-22', total: '$20.00', status: 'Delivered' },
  { id: '5', restaurant: 'The Sizzling Grill', date: '2023-10-20', total: '$50.00', status: 'In Progress' },
];

const statusColors = {
  Delivered: theme.colors.primary,
  'In Progress': theme.colors.purple,
  Canceled: theme.colors.muted,
};

const OrderList = () => {
  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.infoContainer}>
            <Text style={styles.restaurant}>{item.restaurant}</Text>
            <Text style={styles.details}>{item.date} - {item.total}</Text>
          </View>
          <Text style={[styles.status, { color: statusColors[item.status] }]}>
            {item.status}
          </Text>
        </View>
      )}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  restaurant: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    color: theme.colors.muted,
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});


export default OrderList;
