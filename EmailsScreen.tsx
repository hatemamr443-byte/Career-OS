import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { emailsAPI } from '../services/api';

export default function EmailsScreen() {
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [classifyingId, setClassifyingId] = useState<number | null>(null);

  useEffect(() => { loadEmails(); }, [categoryFilter]);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: 1, page_size: 50 };
      if (categoryFilter) params.category = categoryFilter;
      const res = await emailsAPI.list(params);
      setEmails(res.data.items || []);
    } catch (e) { Alert.alert('Error', 'Failed to load emails'); }
    finally { setIsLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadEmails(); };

  const handleClassify = async (emailId: number) => {
    setClassifyingId(emailId);
    try {
      const res = await emailsAPI.classify(emailId);
      Alert.alert('Classified', `Category: ${res.data.category}`);
      loadEmails();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Classification failed');
    } finally { setClassifyingId(null); }
  };

  const categories = ['all', 'interview', 'offer', 'rejection', 'negotiation', 'other'];

  const getCategoryStyle = (cat: string) => {
    switch(cat) {
      case 'interview': return styles.catInterview;
      case 'offer': return styles.catOffer;
      case 'rejection': return styles.catRejection;
      case 'negotiation': return styles.catNegotiation;
      default: return styles.catOther;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emails</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {categories.map(c => (
          <TouchableOpacity key={c} onPress={() => setCategoryFilter(c === 'all' ? '' : c)}
            style={[styles.filterChip, (c === 'all' && !categoryFilter) || categoryFilter === c ? styles.filterActive : styles.filterInactive]}>
            <Text style={[styles.filterText, (c === 'all' && !categoryFilter) || categoryFilter === c ? styles.filterTextActive : styles.filterTextInactive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoading ? <ActivityIndicator style={styles.loader} size="large" color="#2563eb" /> :
        emails.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No emails found</Text></View>
        ) : (
          emails.map(email => (
            <View key={email.id} style={styles.emailCard}>
              <View style={styles.emailHeader}>
                <View style={styles.emailInfo}>
                  <View style={styles.emailTitleRow}>
                    <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
                    {email.ai_category && (
                      <View style={[styles.categoryBadge, getCategoryStyle(email.ai_category)]}>
                        <Text style={styles.categoryText}>{email.ai_category}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.emailSender} numberOfLines={1}>{email.sender}</Text>
                </View>
              </View>
              <Text style={styles.emailBody} numberOfLines={3}>{email.body.substring(0, 200)}...</Text>

              {email.ai_extracted_data && (
                <View style={styles.extractedBox}>
                  {email.ai_extracted_data.company && <Text style={styles.extractedText}><Text style={styles.extractedLabel}>Company: </Text>{email.ai_extracted_data.company}</Text>}
                  {email.ai_extracted_data.position && <Text style={styles.extractedText}><Text style={styles.extractedLabel}>Position: </Text>{email.ai_extracted_data.position}</Text>}
                  {email.ai_extracted_data.date && <Text style={styles.extractedText}><Text style={styles.extractedLabel}>Date: </Text>{email.ai_extracted_data.date}</Text>}
                  {email.ai_extracted_data.next_steps && <Text style={styles.extractedText}><Text style={styles.extractedLabel}>Next Steps: </Text>{email.ai_extracted_data.next_steps}</Text>}
                </View>
              )}

              {!email.ai_category && (
                <TouchableOpacity style={styles.classifyButton} onPress={() => handleClassify(email.id)} disabled={classifyingId === email.id}>
                  <Text style={styles.classifyText}>{classifyingId === email.id ? 'Classifying...' : '🤖 Classify'}</Text>
                </TouchableOpacity>
              )}
              {email.ai_confidence && <Text style={styles.confidenceText}>{Math.round(email.ai_confidence * 100)}% confidence</Text>}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterInactive: { backgroundColor: '#fff', borderColor: '#d1d5db' },
  filterText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  filterTextActive: { color: '#fff' },
  filterTextInactive: { color: '#374151' },
  loader: { marginTop: 40 },
  emptyCard: { backgroundColor: '#fff', margin: 16, padding: 40, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 16 },
  emailCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  emailHeader: { marginBottom: 8 },
  emailInfo: { flex: 1 },
  emailTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emailSubject: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  emailSender: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  emailBody: { fontSize: 13, color: '#4b5563', lineHeight: 18 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  catInterview: { backgroundColor: '#f3e8ff' },
  catOffer: { backgroundColor: '#d1fae5' },
  catRejection: { backgroundColor: '#fee2e2' },
  catNegotiation: { backgroundColor: '#dbeafe' },
  catOther: { backgroundColor: '#f3f4f6' },
  categoryText: { fontSize: 11, fontWeight: '500', color: '#1f2937', textTransform: 'capitalize' },
  extractedBox: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, marginTop: 10 },
  extractedText: { fontSize: 12, color: '#4b5563', marginBottom: 2 },
  extractedLabel: { fontWeight: '600' },
  classifyButton: { backgroundColor: '#eff6ff', padding: 8, borderRadius: 6, alignSelf: 'flex-start', marginTop: 10 },
  classifyText: { color: '#2563eb', fontSize: 13, fontWeight: '500' },
  confidenceText: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
});
