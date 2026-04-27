import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { jobsAPI } from '../services/api';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [scoringId, setScoringId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', company: '', location: '', description: '', requirements: '', salary_min: '', salary_max: '', url: '' });

  useEffect(() => { loadJobs(); }, [statusFilter]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: 1, page_size: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await jobsAPI.list(params);
      setJobs(res.data.items || []);
    } catch (e) { Alert.alert('Error', 'Failed to load jobs'); }
    finally { setIsLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadJobs(); };

  const handleScore = async (jobId: number) => {
    setScoringId(jobId);
    try {
      const res = await jobsAPI.score(jobId);
      Alert.alert('AI Score', `Score: ${res.data.score}/100\nDecision: ${res.data.decision}`);
      loadJobs();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Scoring failed');
    } finally { setScoringId(null); }
  };

  const handleApply = async (jobId: number) => {
    try {
      const res = await jobsAPI.apply(jobId);
      Alert.alert('Applied!', `+${res.data.gamification.xp_earned} XP earned`);
      loadJobs();
    } catch (err: any) { Alert.alert('Error', err.response?.data?.detail || 'Failed'); }
  };

  const handleSkip = async (jobId: number) => {
    try {
      const res = await jobsAPI.skip(jobId);
      Alert.alert('Skipped', `+${res.data.gamification.xp_earned} XP earned`);
      loadJobs();
    } catch (err: any) { Alert.alert('Error', err.response?.data?.detail || 'Failed'); }
  };

  const handleAddJob = async () => {
    if (!formData.title || !formData.company || !formData.description) {
      Alert.alert('Error', 'Please fill in required fields'); return;
    }
    try {
      await jobsAPI.create({
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
      });
      Alert.alert('Success', 'Job added');
      setShowAdd(false);
      setFormData({ title: '', company: '', location: '', description: '', requirements: '', salary_min: '', salary_max: '', url: '' });
      loadJobs();
    } catch (err: any) { Alert.alert('Error', err.response?.data?.detail || 'Failed'); }
  };

  const filters = ['all', 'new', 'applied', 'skipped', 'saved'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAdd(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity key={f} onPress={() => setStatusFilter(f === 'all' ? '' : f)}
            style={[styles.filterChip, (f === 'all' && !statusFilter) || statusFilter === f ? styles.filterActive : styles.filterInactive]}>
            <Text style={[styles.filterText, (f === 'all' && !statusFilter) || statusFilter === f ? styles.filterTextActive : styles.filterTextInactive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoading ? <ActivityIndicator style={styles.loader} size="large" color="#2563eb" /> :
        jobs.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No jobs found</Text></View>
        ) : (
          jobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <View style={styles.jobTitleRow}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={[styles.statusBadge,
                      job.user_status === 'applied' ? styles.statusApplied :
                      job.user_status === 'skipped' ? styles.statusSkipped :
                      job.user_status === 'saved' ? styles.statusSaved : styles.statusNew]}>
                      <Text style={styles.statusText}>{job.user_status}</Text>
                    </View>
                  </View>
                  <Text style={styles.jobCompany}>{job.company} · {job.location || 'Remote'}</Text>
                </View>
                {job.ai_score !== null && (
                  <View style={[styles.scoreCircle,
                    job.ai_score >= 80 ? styles.scoreHigh :
                    job.ai_score >= 60 ? styles.scoreGood :
                    job.ai_score >= 40 ? styles.scoreMed : styles.scoreLow]}>
                    <Text style={styles.scoreCircleText}>{job.ai_score}</Text>
                  </View>
                )}
              </View>

              {job.ai_reasoning && (
                <View style={styles.reasoningBox}>
                  <Text style={styles.reasoningTitle}>AI Analysis</Text>
                  <Text style={styles.reasoningText}><Text style={styles.reasoningLabel}>Strengths: </Text>{job.ai_reasoning.strengths?.join(', ')}</Text>
                  <Text style={styles.reasoningText}><Text style={styles.reasoningLabel}>Gaps: </Text>{job.ai_reasoning.gaps?.join(', ')}</Text>
                  <Text style={styles.reasoningText}><Text style={styles.reasoningLabel}>Next Step: </Text>{job.ai_reasoning.next_step}</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                {job.ai_score === null && (
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleScore(job.id)} disabled={scoringId === job.id}>
                    <Text style={styles.actionButtonText}>{scoringId === job.id ? 'Scoring...' : '🤖 AI Score'}</Text>
                  </TouchableOpacity>
                )}
                {job.user_status === 'new' && (
                  <>
                    <TouchableOpacity style={[styles.actionButton, styles.applyButton]} onPress={() => handleApply(job.id)}>
                      <Text style={[styles.actionButtonText, styles.applyText]}>✓ Apply</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.skipButton]} onPress={() => handleSkip(job.id)}>
                      <Text style={[styles.actionButtonText, styles.skipText]}>✕ Skip</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Job Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Job</Text>
            <ScrollView style={styles.modalScroll}>
              <TextInput style={styles.modalInput} placeholder="Job Title *" value={formData.title} onChangeText={t => setFormData({...formData, title: t})} />
              <TextInput style={styles.modalInput} placeholder="Company *" value={formData.company} onChangeText={t => setFormData({...formData, company: t})} />
              <TextInput style={styles.modalInput} placeholder="Location" value={formData.location} onChangeText={t => setFormData({...formData, location: t})} />
              <TextInput style={[styles.modalInput, styles.textArea]} placeholder="Description *" multiline numberOfLines={4} value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />
              <TextInput style={[styles.modalInput, styles.textArea]} placeholder="Requirements" multiline numberOfLines={3} value={formData.requirements} onChangeText={t => setFormData({...formData, requirements: t})} />
              <View style={styles.salaryRow}>
                <TextInput style={[styles.modalInput, styles.salaryInput]} placeholder="Min Salary" keyboardType="numeric" value={formData.salary_min} onChangeText={t => setFormData({...formData, salary_min: t})} />
                <TextInput style={[styles.modalInput, styles.salaryInput]} placeholder="Max Salary" keyboardType="numeric" value={formData.salary_max} onChangeText={t => setFormData({...formData, salary_max: t})} />
              </View>
              <TextInput style={styles.modalInput} placeholder="Job URL" value={formData.url} onChangeText={t => setFormData({...formData, url: t})} />
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAdd(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleAddJob}>
                <Text style={styles.modalSaveText}>Add Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterInactive: { backgroundColor: '#fff', borderColor: '#d1d5db' },
  filterText: { fontSize: 13, fontWeight: '500', textTransform: 'capitalize' },
  filterTextActive: { color: '#fff' },
  filterTextInactive: { color: '#374151' },
  loader: { marginTop: 40 },
  emptyCard: { backgroundColor: '#fff', margin: 16, padding: 40, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 16 },
  jobCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobInfo: { flex: 1 },
  jobTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  jobTitle: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusApplied: { backgroundColor: '#d1fae5' },
  statusSkipped: { backgroundColor: '#fee2e2' },
  statusSaved: { backgroundColor: '#dbeafe' },
  statusNew: { backgroundColor: '#f3f4f6' },
  statusText: { fontSize: 11, fontWeight: '500', color: '#1f2937', textTransform: 'capitalize' },
  jobCompany: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  scoreCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  scoreHigh: { backgroundColor: '#d1fae5' },
  scoreGood: { backgroundColor: '#dbeafe' },
  scoreMed: { backgroundColor: '#fef3c7' },
  scoreLow: { backgroundColor: '#fee2e2' },
  scoreCircleText: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  reasoningBox: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 12, marginTop: 12 },
  reasoningTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  reasoningText: { fontSize: 13, color: '#4b5563', marginBottom: 2 },
  reasoningLabel: { fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#eff6ff' },
  actionButtonText: { fontSize: 13, fontWeight: '500', color: '#2563eb' },
  applyButton: { backgroundColor: '#d1fae5' },
  applyText: { color: '#059669' },
  skipButton: { backgroundColor: '#fee2e2' },
  skipText: { color: '#dc2626' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, width: '100%', maxHeight: '80%', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  modalScroll: { maxHeight: 400 },
  modalInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  textArea: { height: 80, textAlignVertical: 'top' },
  salaryRow: { flexDirection: 'row', gap: 12 },
  salaryInput: { flex: 1 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalCancel: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  modalCancelText: { color: '#374151', fontWeight: '500' },
  modalSave: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#2563eb', alignItems: 'center' },
  modalSaveText: { color: '#fff', fontWeight: '600' },
});
