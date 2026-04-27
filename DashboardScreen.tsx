import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { gamificationAPI, jobsAPI, emailsAPI } from '../services/api';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [gRes, jRes, eRes] = await Promise.all([
        gamificationAPI.getProfile(),
        jobsAPI.list({ page: 1, page_size: 5 }),
        emailsAPI.list({ page: 1, page_size: 5 }),
      ]);
      setStats(gRes.data);
      setRecentJobs(jRes.data.items || []);
      setRecentEmails(eRes.data.items || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadDashboard(); };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  const xpPct = stats ? (stats.xp / stats.next_level_xp) * 100 : 0;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{stats?.level || 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
          <View style={styles.xpBar}><View style={[styles.xpFill, { width: `${xpPct}%` }]} /></View>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={[styles.statValue, styles.orange]}>{stats?.streak_days || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📝</Text>
          <Text style={[styles.statValue, styles.green]}>{stats?.total_jobs_applied || 0}</Text>
          <Text style={styles.statLabel}>Applied</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🤖</Text>
          <Text style={styles.statValue}>{user?.ai_requests_used || 0}</Text>
          <Text style={styles.statLabel}>AI Used</Text>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentJobs.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No jobs yet. Add your first job!</Text></View>
        ) : (
          recentJobs.map(job => (
            <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => navigation.navigate('Jobs')}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company}</Text>
                </View>
                {job.ai_score !== null && (
                  <View style={[styles.scoreBadge, 
                    job.ai_score >= 80 ? styles.scoreHigh : 
                    job.ai_score >= 60 ? styles.scoreGood : 
                    job.ai_score >= 40 ? styles.scoreMed : styles.scoreLow]}>
                    <Text style={styles.scoreText}>{job.ai_score}</Text>
                  </View>
                )}
              </View>
              {job.ai_decision && (
                <View style={[styles.decisionBadge, 
                  job.ai_decision === 'APPLY' ? styles.decisionApply :
                  job.ai_decision === 'SKIP' ? styles.decisionSkip : styles.decisionReview]}>
                  <Text style={styles.decisionText}>{job.ai_decision}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Emails */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Emails</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Emails')}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentEmails.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No emails processed yet</Text></View>
        ) : (
          recentEmails.map(email => (
            <View key={email.id} style={styles.emailCard}>
              <View style={styles.emailHeader}>
                <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
                {email.ai_category && (
                  <View style={[styles.categoryBadge,
                    email.ai_category === 'interview' ? styles.catInterview :
                    email.ai_category === 'offer' ? styles.catOffer :
                    email.ai_category === 'rejection' ? styles.catRejection :
                    email.ai_category === 'negotiation' ? styles.catNegotiation : styles.catOther]}>
                    <Text style={styles.categoryText}>{email.ai_category}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.emailSender} numberOfLines={1}>{email.sender}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flex: 1, minWidth: 150, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1e40af' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  orange: { color: '#f97316' },
  green: { color: '#10b981' },
  xpBar: { width: '100%', height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, marginTop: 8 },
  xpFill: { height: 4, backgroundColor: '#3b82f6', borderRadius: 2 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  link: { color: '#2563eb', fontSize: 14 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { color: '#6b7280' },
  jobCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  jobCompany: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  scoreBadge: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  scoreHigh: { backgroundColor: '#d1fae5' },
  scoreGood: { backgroundColor: '#dbeafe' },
  scoreMed: { backgroundColor: '#fef3c7' },
  scoreLow: { backgroundColor: '#fee2e2' },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  decisionBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 8 },
  decisionApply: { backgroundColor: '#d1fae5' },
  decisionSkip: { backgroundColor: '#fee2e2' },
  decisionReview: { backgroundColor: '#fef3c7' },
  decisionText: { fontSize: 12, fontWeight: '500', color: '#1f2937' },
  emailCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  emailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emailSubject: { fontSize: 15, fontWeight: '500', color: '#111827', flex: 1, marginRight: 8 },
  emailSender: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  catInterview: { backgroundColor: '#f3e8ff' },
  catOffer: { backgroundColor: '#d1fae5' },
  catRejection: { backgroundColor: '#fee2e2' },
  catNegotiation: { backgroundColor: '#dbeafe' },
  catOther: { backgroundColor: '#f3f4f6' },
  categoryText: { fontSize: 11, fontWeight: '500', color: '#1f2937' },
});
