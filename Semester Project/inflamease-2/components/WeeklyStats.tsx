import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function WeeklyStats() {
  const { token } = useAuth();
  
  // Calculate current week dates
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
  
  const weeklyStats = useQuery(api.foods.getWeeklyStats, token ? {
    token,
    startDate: startOfWeek.toISOString().split('T')[0],
    endDate: endOfWeek.toISOString().split('T')[0],
  } : 'skip');

  const lifetimeStats = useQuery(api.foods.getLifetimeStats, token ? { token } : 'skip');

  const getScoreColor = (score: number) => {
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.warning;
    if (score >= 4) return Colors.secondary;
    return Colors.error;
  };

  if (!token || weeklyStats === undefined || lifetimeStats === undefined) {
    return null;
  }

  if (weeklyStats === null || lifetimeStats === null) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push('/(tabs)/stats')}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title}>📊 Your Progress</Text>
        <Text style={styles.viewMore}>View Details →</Text>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>This Week</Text>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(weeklyStats.averageScore) }]}>
              <Text style={[styles.scoreValue, { color: getScoreColor(weeklyStats.averageScore) }]}>
                {weeklyStats.averageScore.toFixed(1)}
              </Text>
            </View>
            <Text style={styles.scoreDetails}>
              {weeklyStats.totalLogs} meals logged
            </Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Lifetime</Text>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(lifetimeStats.averageScore) }]}>
              <Text style={[styles.scoreValue, { color: getScoreColor(lifetimeStats.averageScore) }]}>
                {lifetimeStats.averageScore.toFixed(1)}
              </Text>
            </View>
            <Text style={styles.scoreDetails}>
              {lifetimeStats.daysTracked} days tracked
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  viewMore: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreDetails: {
    fontSize: 11,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.divider,
    marginHorizontal: 16,
  },
});