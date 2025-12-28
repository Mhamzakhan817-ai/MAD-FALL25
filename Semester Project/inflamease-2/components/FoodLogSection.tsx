import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Colors from '@/constants/Colors';
import { FoodLog } from '@/types';
import { Id } from '@/convex/_generated/dataModel';

interface FoodLogSectionProps {
  title: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodLogs: FoodLog[];
  onAddFood: () => void;
  token: string;
}

export default function FoodLogSection({ 
  title, 
  mealType, 
  foodLogs, 
  onAddFood, 
  token 
}: FoodLogSectionProps) {
  const deleteFoodLog = useMutation(api.foods.deleteFoodLog);

  const handleDeleteFood = async (foodLogId: Id<"foodLogs">) => {
    Alert.alert(
      'Delete Food',
      'Are you sure you want to remove this food from your log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting food log:', foodLogId);
              const result = await deleteFoodLog({ token, logId: foodLogId });
              console.log('Delete result:', result);
              Alert.alert('Success', 'Food removed from your log');
            } catch (error) {
              console.error('Error deleting food log:', error);
              Alert.alert('Error', 'Failed to delete food log. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Calculate totals for this meal
  const mealTotals = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      antiInflammatoryScore: acc.antiInflammatoryScore + log.antiInflammatoryScore,
    }),
    { calories: 0, antiInflammatoryScore: 0 }
  );

  const avgScore = foodLogs.length > 0 
    ? Math.round((mealTotals.antiInflammatoryScore / foodLogs.length) * 10) / 10
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.warning;
    if (score >= 4) return Colors.secondary;
    return Colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          {foodLogs.length > 0 && (
            <View style={styles.mealSummary}>
              <Text style={styles.calorieText}>{mealTotals.calories} cal</Text>
              <Text style={[styles.scoreText, { color: getScoreColor(avgScore) }]}>
                {avgScore.toFixed(1)}/10
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddFood}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {foodLogs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No foods logged yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first food</Text>
        </View>
      ) : (
        <View style={styles.foodList}>
          {foodLogs.map((log) => (
            <View key={log._id} style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{log.food?.name || 'Unknown Food'}</Text>
                <Text style={styles.foodDetails}>
                  {log.servingSize} • {log.calories} cal
                </Text>
              </View>
              <View style={styles.foodActions}>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.foodScore, { color: getScoreColor(log.antiInflammatoryScore) }]}>
                    {log.antiInflammatoryScore.toFixed(1)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFood(log._id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  mealSummary: {
    flexDirection: 'row',
    gap: 12,
  },
  calorieText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  foodList: {
    gap: 8,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  foodDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.accent,
  },
  foodScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    // Make it more prominent
    borderWidth: 1,
    borderColor: Colors.white,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 20, // Increased from 18
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'center',
  },
});