import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

export default function HelpScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { id: 1, q: 'How do I change my password?', a: 'Go to Settings > Account > Change Password.' },
    { id: 2, q: 'Where is my order?', a: 'You can track real-time status in the "Delivery" tab.' },
    { id: 3, q: 'Can I cancel my order?', a: 'Orders can only be canceled within 5 minutes of placing them.' },
    { id: 4, q: 'How do I add a payment method?', a: 'Go to Profile > Payment Methods to add a new card.' },
  ];

  const FaqItem = ({ question, answer }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.question}>{question}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.muted} />
        </View>
        {expanded && <Text style={styles.answer}>{answer}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor={theme.colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase())).map(faq => (
            <FaqItem key={faq.id} question={faq.q} answer={faq.a} />
          ))}
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <Text style={styles.contactButtonText}>Chat with Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactButton, styles.emailButton]}>
            <Ionicons name="mail" size={24} color={theme.colors.primary} />
            <Text style={[styles.contactButtonText, styles.emailButtonText]}>Email Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  backBtn: {
    width: 40,
    alignItems: 'flex-start'
  },
  searchContainer: {
    marginTop: -28,
    paddingHorizontal: 20,
    zIndex: 10
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151'
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16
  },
  faqContainer: {
    marginBottom: 32
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginRight: 16
  },
  answer: {
    marginTop: 12,
    color: '#6B7280',
    lineHeight: 22
  },
  contactContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    width: '100%',
    height: 56,
    borderRadius: 16,
    marginBottom: 12
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  },
  emailButton: {
    backgroundColor: '#FEF3C7',
  },
  emailButtonText: {
    color: theme.colors.primary
  }
});
