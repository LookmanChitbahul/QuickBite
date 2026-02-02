import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const RestaurantList = ({ restaurants, onPress, onToggleFavorite, ...props }) => {
  const { theme, isDarkMode } = useApp();

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={48} color={theme.colors.muted} />
      <Text style={[styles.emptyText, { color: theme.colors.muted }]}>No restaurants found</Text>
    </View>
  );

  return (
    <FlatList
      data={restaurants}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        restaurants.length === 0 && { flex: 1 },
        { paddingHorizontal: Dimensions.get('window').width > 768 ? 20 : 16 }
      ]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmptyList}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: isDarkMode ? '#1F2937' : '#fff' },
            props.numColumns > 1 && { width: (Dimensions.get('window').width / props.numColumns) - 30, marginHorizontal: 10 }
          ]}
          onPress={() => onPress && onPress(item)}
          activeOpacity={0.9}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
            {index === 0 && (
              <View style={[styles.promoBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.promoBadgeText}>Featured</Text>
              </View>
            )}
            <View style={[styles.ratingBadge, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : '#fff' }]}>
              <Text style={[styles.ratingText, { color: isDarkMode ? '#fff' : '#000' }]}>{item.rating}</Text>
              <Ionicons name="star" size={12} color={isDarkMode ? '#fff' : '#000'} style={{ marginLeft: 2 }} />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={[styles.name, { color: isDarkMode ? '#fff' : theme.colors.text }]}>{item.name}</Text>
              <TouchableOpacity onPress={() => onToggleFavorite && onToggleFavorite(item)}>
                <Ionicons
                  name={item.isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={item.isFavorite ? theme.colors.error : theme.colors.muted}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.cuisine, { color: isDarkMode ? '#9CA3AF' : theme.colors.textLight }]}>
              {item.tags ? item.tags.join(' • ') : 'Restaurant • Casual'}
            </Text>
            <View style={styles.footerRow}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color={isDarkMode ? '#9CA3AF' : theme.colors.muted} />
                <Text style={[styles.detailText, { color: isDarkMode ? '#9CA3AF' : theme.colors.textLight }]}>25-35 min</Text>
              </View>
              <View style={styles.dot} />
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={14} color={isDarkMode ? '#9CA3AF' : theme.colors.muted} />
                <Text style={[styles.detailText, { color: isDarkMode ? '#9CA3AF' : theme.colors.textLight }]}>{item.distance || '1.2 km'}</Text>
              </View>
              <View style={styles.dot} />
              <Text style={[styles.detailText, { color: isDarkMode ? '#9CA3AF' : theme.colors.textLight }]}>Rs 50 Fee</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      style={styles.container}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden'
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promoBadgeText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase'
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  ratingText: {
    fontWeight: 'bold',
    fontSize: 12
  },
  infoContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
  },
  cuisine: {
    fontSize: 14,
    marginBottom: 12
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    fontSize: 13,
    marginLeft: 4
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 8
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10
  },
});


export default RestaurantList;
