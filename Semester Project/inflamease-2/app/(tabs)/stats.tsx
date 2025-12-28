import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';

export default function StatsScreen() {
  const { token } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'lifetime'>('week');
  
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

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <FlameIcon size={32} />
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please sign in to view your statistics</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <FlameIcon size={32} />
        <Text style={styles.headerTitle}>Statistics</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'week' && styles.periodButtonTextActive
          ]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'lifetime' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('lifetime')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'lifetime' && styles.periodButtonTextActive
          ]}>
            Lifetime
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedPeriod === 'week' ? (
          // Weekly Stats
          weeklyStats === undefined ? (
            <View style={styles.loadingContainer}>
              <FlameIcon size={60} />
              <Text style={styles.loadingText}>Loading weekly stats...</Text>
            </View>
          ) : weeklyStats === null ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Unable to load weekly data</Text>
            </View>
          ) : (
            <View style={styles.statsContainer}>
              {/* Weekly Overview */}
              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <Text style={styles.overviewTitle}>Weekly Overview</Text>
                  <Text style={styles.overviewSubtitle}>
                    {formatDate(startOfWeek.toISOString().split('T')[0])} - {formatDate(endOfWeek.toISOString().split('T')[0])}
                  </Text>
                </View>
                
                <View style={styles.mainScoreContainer}>
                  <View style={[styles.mainScoreCircle, { borderColor: getScoreColor(weeklyStats.averageScore) }]}>
                    <Text style={[styles.mainScoreValue, { color: getScoreColor(weeklyStats.averageScore) }]}>
                      {weeklyStats.averageScore.toFixed(1)}
                    </Text>
                    <Text style={styles.mainScoreLabel}>Average Score</Text>
                  </View>
                  <Text style={[styles.scoreDescription, { color: getScoreColor(weeklyStats.averageScore) }]}>
                    {getScoreLabel(weeklyStats.averageScore)}
                  </Text>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{weeklyStats.totalCalories.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Total Calories</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{weeklyStats.totalLogs}</Text>
                    <Text style={styles.statLabel}>Meals Logged</Text>
                  </View>
                </View>
              </View>

              {/* Daily Breakdown */}
              {weeklyStats.dailyAverages.length > 0 && (
                <View style={styles.dailyCard}>
                  <Text style={styles.cardTitle}>Daily Breakdown</Text>
                  {weeklyStats.dailyAverages.map((day, index) => (
                    <View key={index} style={styles.dailyItem}>
                      <View style={styles.dailyInfo}>
                        <Text style={styles.dailyDate}>{formatDate(day.date)}</Text>
                        <Text style={styles.dailyDetails}>
                          {day.totalLogs} meals • {day.totalCalories} cal
                        </Text>
                      </View>
                      <View style={[styles.dailyScore, { backgroundColor: getScoreColor(day.averageScore) }]}>
                        <Text style={styles.dailyScoreText}>{day.averageScore.toFixed(1)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )
        ) : (
          // Lifetime Stats
          lifetimeStats === undefined ? (
            <View style={styles.loadingContainer}>
              <FlameIcon size={60} />
              <Text style={styles.loadingText}>Loading lifetime stats...</Text>
            </View>
          ) : lifetimeStats === null ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Unable to load lifetime data</Text>
            </View>
          ) : (
            <View style={styles.statsContainer}>
              {/* Lifetime Overview */}
              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <Text style={styles.overviewTitle}>Lifetime Overview</Text>
                  <Text style={styles.overviewSubtitle}>
                    All time tracking data
                  </Text>
                </View>
                
                <View style={styles.mainScoreContainer}>
                  <View style={[styles.mainScoreCircle, { borderColor: getScoreColor(lifetimeStats.averageScore) }]}>
                    <Text style={[styles.mainScoreValue, { color: getScoreColor(lifetimeStats.averageScore) }]}>
                      {lifetimeStats.averageScore.toFixed(1)}
                    </Text>
                    <Text style={styles.mainScoreLabel}>Lifetime Average</Text>
                  </View>
                  <Text style={[styles.scoreDescription, { color: getScoreColor(lifetimeStats.averageScore) }]}>
                    {getScoreLabel(lifetimeStats.averageScore)}
                  </Text>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{lifetimeStats.daysTracked}</Text>
                    <Text style={styles.statLabel}>Days Tracked</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{lifetimeStats.totalLogs}</Text>
                    <Text style={styles.statLabel}>Total Meals</Text>
                  </View>
                </View>
              </View>

              {/* Best & Worst Days */}
              {lifetimeStats.bestDay && lifetimeStats.worstDay && (
                <View style={styles.extremesCard}>
                  <Text style={styles.cardTitle}>Best & Worst Days</Text>
                  
                  <View style={styles.extremeItem}>
                    <View style={styles.extremeInfo}>
                      <Text style={styles.extremeLabel}>🏆 Best Day</Text>
                      <Text style={styles.extremeDate}>{formatDate(lifetimeStats.bestDay.date)}</Text>
                    </View>
                    <View style={[styles.extremeScore, { backgroundColor: getScoreColor(lifetimeStats.bestDay.score) }]}>
                      <Text style={styles.extremeScoreText}>{lifetimeStats.bestDay.score.toFixed(1)}</Text>
                    </View>
                  </View>

                  <View style={styles.extremeItem}>
                    <View style={styles.extremeInfo}>
                      <Text style={styles.extremeLabel}>📉 Worst Day</Text>
                      <Text style={styles.extremeDate}>{formatDate(lifetimeStats.worstDay.date)}</Text>
                    </View>
                    <View style={[styles.extremeScore, { backgroundColor: getScoreColor(lifetimeStats.worstDay.score) }]}>
                      <Text style={styles.extremeScoreText}>{lifetimeStats.worstDay.score.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Monthly Trends */}
              {lifetimeStats.monthlyTrends.length > 0 && (
                <View style={styles.trendsCard}>
                  <Text style={styles.cardTitle}>Monthly Trends</Text>
                  {lifetimeStats.monthlyTrends.map((month, index) => (
                    <View key={index} style={styles.trendItem}>
                      <View style={styles.trendInfo}>
                        <Text style={styles.trendMonth}>{month.month}</Text>
                        <Text style={styles.trendDetails}>{month.totalLogs} meals</Text>
                      </View>
                      <View style={[styles.trendScore, { backgroundColor: getScoreColor(month.averageScore) }]}>
                        <Text style={styles.trendScoreText}>{month.averageScore.toFixed(1)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  mainScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mainScoreLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreDescription: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dailyInfo: {
    flex: 1,
  },
  dailyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  dailyDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  dailyScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dailyScoreText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  extremesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  extremeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  extremeInfo: {
    flex: 1,
  },
  extremeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  extremeDate: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  extremeScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  extremeScoreText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  trendsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  trendInfo: {
    flex: 1,
  },
  trendMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  trendDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  trendScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendScoreText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});