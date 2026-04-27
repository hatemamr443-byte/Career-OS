import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try { const res = await profileAPI.get(); setProfile(res.data); setFormData(res.data); }
    catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    try {
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([k, v]) => v !== undefined && v !== null && k !== 'id' && k !== 'user_id' && k !== 'updated_at')
      );
      await profileAPI.update(updateData);
      Alert.alert('Success', 'Profile updated');
      setIsEditing(false);
      loadProfile();
    } catch (err: any) { Alert.alert('Error', err.response?.data?.detail || 'Update failed'); }
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.editButton}>
          <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.emailText}>{user?.email}</Text>
        <Text style={styles.roleText}>{user?.role} plan · {user?.ai_requests_used}/{user?.ai_requests_limit} AI requests</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={formData.title || ''} onChangeText={t => setFormData({...formData, title: t})} />
          ) : <Text style={styles.value}>{profile?.title || 'Not set'}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Experience (years)</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={String(formData.experience_years || '')} onChangeText={t => setFormData({...formData, experience_years: parseInt(t) || null})} keyboardType="numeric" />
          ) : <Text style={styles.value}>{profile?.experience_years || 'Not set'}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Summary</Text>
          {isEditing ? (
            <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={3} value={formData.summary || ''} onChangeText={t => setFormData({...formData, summary: t})} />
          ) : <Text style={styles.value}>{profile?.summary || 'Not set'}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Skills</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')} onChangeText={t => setFormData({...formData, skills: t.split(',').map((s: string) => s.trim()).filter(Boolean)})} />
          ) : (
            <View style={styles.skillsRow}>
              {profile?.skills?.length > 0 ? profile.skills.map((s: string, i: number) => (
                <View key={i} style={styles.skillChip}><Text style={styles.skillText}>{s}</Text></View>
              )) : <Text style={styles.value}>No skills added</Text>}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Preferred Location</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={formData.preferred_location || ''} onChangeText={t => setFormData({...formData, preferred_location: t})} />
          ) : <Text style={styles.value}>{profile?.preferred_location || 'Not set'}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Remote Preference</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={formData.remote_preference || ''} onChangeText={t => setFormData({...formData, remote_preference: t})} />
          ) : <Text style={styles.value}>{profile?.remote_preference || 'Not set'}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>Min Salary</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={String(formData.preferred_salary_min || '')} onChangeText={t => setFormData({...formData, preferred_salary_min: parseInt(t) || null})} keyboardType="numeric" />
            ) : <Text style={styles.value}>{profile?.preferred_salary_min ? `$${profile.preferred_salary_min.toLocaleString()}` : 'Not set'}</Text>}
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>Max Salary</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={String(formData.preferred_salary_max || '')} onChangeText={t => setFormData({...formData, preferred_salary_max: parseInt(t) || null})} keyboardType="numeric" />
            ) : <Text style={styles.value}>{profile?.preferred_salary_max ? `$${profile.preferred_salary_max.toLocaleString()}` : 'Not set'}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>LinkedIn</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={formData.linkedin_url || ''} onChangeText={t => setFormData({...formData, linkedin_url: t})} />
            ) : <Text style={styles.value} numberOfLines={1}>{profile?.linkedin_url || 'Not set'}</Text>}
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>Portfolio</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={formData.portfolio_url || ''} onChangeText={t => setFormData({...formData, portfolio_url: t})} />
            ) : <Text style={styles.value} numberOfLines={1}>{profile?.portfolio_url || 'Not set'}</Text>}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  editButton: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  editButtonText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  emailText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  roleText: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 4 },
  value: { fontSize: 15, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 15, backgroundColor: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChip: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  skillText: { fontSize: 12, color: '#1e40af', fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  logoutButton: { backgroundColor: '#fee2e2', margin: 16, padding: 14, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 16 },
});
