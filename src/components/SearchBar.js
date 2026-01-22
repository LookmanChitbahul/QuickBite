import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const { theme, t } = useApp();

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.muted} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={t('search_placeholder')}
          placeholderTextColor={theme.colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});

export default SearchBar;
