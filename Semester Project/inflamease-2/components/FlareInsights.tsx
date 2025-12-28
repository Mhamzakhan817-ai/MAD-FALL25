import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

interface FlareInsightsProps {
  style?: any;
}

export default function FlareInsights({ style }: FlareInsightsProps) {
  const { token } = useAuth();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch today's flare and recent stats
  const todayFlare = useQuery(api.flares.getFlareByDate, token ? { token, flareDate: today } : 'skip');
  const flareStats = useQuery(api.flares.getFlareStats, token ? { token, days: 7 } : 'skip');

  // Don't show if no data
  if (!todayFlare && (!flareStats || flareStats.totalFlares === 0)) {
    return null;
  }

  const navigateToFlares = () => {
    router.push('/(tabs)/flares');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <FlameIcon size={24} />
        <Text style={styles.title}>Flare Insights</Text>
      </View>

      {todayFlare ? (
        <View style={styles.todayFlareSection}>
          <View style={styles.flareStatus}>
            <View style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(todayFlare.severity) }
            ]}>
              <Text style={styles.severityText}>{todayFlare.severity}</Text>
            </View>
            <View style={styles.flareInfo}>
              <Text style={styles.flareTitle}>Today's Flare</Text>
              <Text style={styles.flareDescription}>
                {getSeverityLabel(todayFlare.severity)}
              </Text>
            </View>
          </View>
          
          {todayFlare.notes && (
            <Text style={styles.flareNotes}>"{todayFlare.notes}"</Text>
          )}
        </View>
      ) : (
        <View style={styles.noFlareSection}>
          <Text style={styles.noFlareText}>No flare recorded today</Text>
          <Text style={styles.noFlareSubtext}>
            Track your inflammation to identify patterns
          </Text>
        </View>
      )}

      {flareStats && flareStats.totalFlares > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>7-Day Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{flareStats.totalFlares}</Text>
              <Text style={styles.statLabel}>Flares</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{flareStats.averageSeverity}</Text>
              <Text style={styles.statLabel}>Avg Severity</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{flareStats.frequency}</Text>
              <Text style={styles.statLabel}>Per Week</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.viewMoreButton} onPress={navigateToFlares}>
        <Text style={styles.viewMoreText}>View Flare Tracking</Text>
      </TouchableOpacity>
    </View>
  );
}

function getSeverityColor(severity: number): string {
  if (severity <= 3) return Colors.success;
  if (severity <= 6) return Colors.warning;
  return Colors.error;
}

function getSeverityLabel(severity: number): string {
  if (severity <= 3) return "Mild";
  if (severity <= 6) return "Moderate";
  return "Severe";
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  // Today's Flare
  todayFlareSection: {
    marginBottom: 12,
  },
  flareStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  severityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  flareInfo: {
    flex: 1,
  },
  flareTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  flareDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  flareNotes: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    paddingLeft: 44,
  },

  // No Flare
  noFlareSection: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  noFlareText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  noFlareSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },

  // Stats
  statsSection: {
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '500',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 2,
  },

  // View More
  viewMoreButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
});