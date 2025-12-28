import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { FoodLog } from '@/types';

interface DailySummaryProps {
  foodLogs: FoodLog[];
}

export default function DailySummary({ foodLogs }: DailySummaryProps) {
  const { user } = useAuth();

  // Calculate daily totals
  const totals = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
      antiInflammatoryScore: acc.antiInflammatoryScore + log.antiInflammatoryScore,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, antiInflammatoryScore: 0 }
  );

  // Calculate average anti-inflammatory score
  const avgAntiInflammatoryScore = foodLogs.length > 0 
    ? Math.round((totals.antiInflammatoryScore / foodLogs.length) * 10) / 10
    : 0;

  const calorieGoal = user?.dailyCalorieGoal || 2000;
  const calorieProgress = Math.min((totals.calories / calorieGoal) * 100, 100);

  // Get color for anti-inflammatory score
  const getScoreColor = (score: number) => {
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.warning;
    if (score >= 4) return Colors.secondary;
    return Colors.error;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Summary</Text>
      
      {/* Calorie Progress */}
      <View style={styles.calorieSection}>
        <View style={styles.calorieHeader}>
          <Text style={styles.calorieTitle}>Calories</Text>
          <Text style={styles.calorieText}>
            {totals.calories} / {calorieGoal}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${calorieProgress}%`,
                backgroundColor: calorieProgress > 100 ? Colors.error : Colors.primary
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(calorieProgress)}% of daily goal
        </Text>
      </View>

      {/* Macros */}
      <View style={styles.macroSection}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{Math.round(totals.protein)}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{Math.round(totals.carbs)}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{Math.round(totals.fat)}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>

      {/* Anti-inflammatory Score */}
      <View style={styles.scoreSection}>
        <Text style={styles.scoreTitle}>Anti-Inflammatory Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: getScoreColor(avgAntiInflammatoryScore) }]}>
            {avgAntiInflammatoryScore.toFixed(1)}
          </Text>
          <Text style={styles.scoreMax}>/10</Text>
        </View>
        <Text style={styles.scoreDescription}>
          {avgAntiInflammatoryScore >= 8 && "Excellent! Very anti-inflammatory"}
          {avgAntiInflammatoryScore >= 6 && avgAntiInflammatoryScore < 8 && "Good anti-inflammatory choices"}
          {avgAntiInflammatoryScore >= 4 && avgAntiInflammatoryScore < 6 && "Moderate inflammatory impact"}
          {avgAntiInflammatoryScore < 4 && avgAntiInflammatoryScore > 0 && "Consider more anti-inflammatory foods"}
          {avgAntiInflammatoryScore === 0 && "Start logging foods to see your score"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  calorieSection: {
    marginBottom: 20,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  calorieText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.accent,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  macroSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 18,
    color: Colors.text.tertiary,
    marginLeft: 2,
  },
  scoreDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});