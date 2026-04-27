import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { gamificationAPI } from '../services/api';

export default function GamificationScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [pRes, aRes, bRes] = await Promise.all([
        gamificationAPI.getProfile(),
        gamificationAPI.getActivities(),
        gamificationAPI.getBadges(),
      ]);
      setProfile(pRes.data);
      setActivities(aRes.data || []);
      setBadges(bRes.data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  const xpPct = profile ? (profile.xp / profile.next_level_xp) * 100 : 0;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Level Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelCircle}>
          <Text style={styles.levelNumber}>{profile?.level || 1}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>Level {profile?.level || 1}</Text>
          <Text style={styles.xpText}>{profile?.xp || 0} / {profile?.next_level_xp || 100} XP</Text>
          <View style={styles.xpBar}><View style={[styles.xpFill, { width: `${xpPct}%` }]} /></View>
          <Text style={styles.xpRemaining}>{profile?.xp_to_next_level || 100} XP to next level</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, styles.streakBox]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>{profile?.streak_days || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={[styles.statBox, styles.longestBox]}>
          <Text style={styles.statEmoji}>⚡</Text>
          <Text style={styles.statValue}>{profile?.longest_streak || 0}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
        <View style={[styles.statBox, styles.badgeBox]}>
          <Text style={styles.statEmoji}>🏅</Text>
          <Text style={styles.statValue}>{profile?.badges?.length || 0}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      {/* Activity Stats */}
      <View style={styles.activityStatsCard}>
        <Text style={styles.cardTitle}>Activity Stats</Text>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Jobs Applied</Text>
          <Text style={styles.statRowValue}>{profile?.total_jobs_applied || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Jobs Skipped</Text>
          <Text style={styles.statRowValue}>{profile?.total_jobs_skipped || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Emails Processed</Text>
          <Text style={styles.statRowValue}>{profile?.total_emails_processed || 0}</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesCard}>
        <Text style={styles.cardTitle}>Badges</Text>
        <View style={styles.badgesGrid}>
          {badges.map(badge => (
            <View key={badge.id} style={[styles.badgeItem, badge.earned ? styles.badgeEarned : styles.badgeLocked]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={styles.badgeName} numberOfLines={1}>{badge.name.replace(/_/g, ' ')}</Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>{badge.description}</Text>
              {badge.earned && <Text style={styles.badgeXp}>+{badge.xp_reward} XP</Text>}
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityCard}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {activities.length === 0 ? (
          <Text style={styles.emptyText}>No activity yet</Text>
        ) : (
          activities.slice(0, 10).map((act, i) => (
            <View key={i} style={styles.activityItem}>
              <Text style={styles.activityEmoji}>
                {act.activity_type === 'job_applied' ? '📝' : act.activity_type === 'job_skipped' ? '✕' : act.activity_type === 'job_scored' ? '🧠' : act.activity_type === 'email_classified' ? '📧' : '✨'}
              </Text>
              <View style={styles.activityInfo}>
                <Text style={styles.activityType}>{act.activity_type.replace(/_/g, ' ')}</Text>
                {act.description && <Text style={styles.activityDesc} numberOfLines={1}>{act.description}</Text>}
              </View>
              <Text style={styles.activityXp}>+{act.xp_earned} XP</Text>
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
  levelCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  levelCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  levelNumber: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  levelInfo: { flex: 1, marginLeft: 16 },
  levelTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  xpText: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  xpBar: { width: '100%', height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginTop: 8 },
  xpFill: { height: 8, backgroundColor: '#2563eb', borderRadius: 4 },
  xpRemaining: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  streakBox: { backgroundColor: '#fff7ed' },
  longestBox: { backgroundColor: '#eff6ff' },
  badgeBox: { backgroundColor: '#faf5ff' },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  activityStatsCard: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  statRowLabel: { fontSize: 14, color: '#4b5563' },
  statRowValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  badgesCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeItem: { width: '48%', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  badgeEarned: { backgroundColor: '#fefce8', borderColor: '#fde047' },
  badgeLocked: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', opacity: 0.7 },
  badgeIcon: { fontSize: 28 },
  badgeName: { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 4, textAlign: 'center', textTransform: 'capitalize' },
  badgeDesc: { fontSize: 11, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  badgeXp: { fontSize: 11, color: '#ca8a04', fontWeight: '500', marginTop: 4 },
  activityCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  emptyText: { color: '#6b7280', textAlign: 'center', paddingVertical: 20 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  activityEmoji: { fontSize: 20, marginRight: 12 },
  activityInfo: { flex: 1 },
  activityType: { fontSize: 14, fontWeight: '500', color: '#111827', textTransform: 'capitalize' },
  activityDesc: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  activityXp: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
});
