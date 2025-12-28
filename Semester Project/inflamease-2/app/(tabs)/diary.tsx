import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';

interface DiaryEntry {
  date: string;
  meals: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
    snack: any[];
  };
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    averageScore: number;
  };
}

export default function DiaryScreen() {
  const { token } = useAuth();
  const [daysBack, setDaysBack] = useState(14);
  
  const diaryData = useQuery(api.foods.getFoodDiary, token ? { token, daysBack } : 'skip');

  const getScoreColor = (score: number) => {
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.warning;
    if (score >= 4) return Colors.secondary;
    return Colors.error;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderMealSection = (mealType: string, meals: any[]) => {
    if (meals.length === 0) return null;
    
    return (
      <View style={styles.mealSection}>
        <Text style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
        {meals.map((meal, index) => (
          <View key={index} style={styles.mealItem}>
            <View style={styles.mealInfo}>
              <Text style={styles.foodName}>{meal.food?.name || 'Unknown Food'}</Text>
              <Text style={styles.foodDetails}>
                {meal.servingSize} • {meal.calories} cal
              </Text>
            </View>
            <View style={[styles.scoreIndicator, { backgroundColor: getScoreColor(meal.antiInflammatoryScore) }]}>
              <Text style={styles.scoreText}>{meal.antiInflammatoryScore.toFixed(1)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderDiaryEntry = ({ item }: { item: DiaryEntry }) => (
    <View style={styles.diaryEntry}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <View style={styles.dailySummary}>
          <Text style={styles.caloriesText}>{item.dailyTotals.calories} cal</Text>
          <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(item.dailyTotals.averageScore) }]}>
            <Text style={styles.scoreText}>{item.dailyTotals.averageScore.toFixed(1)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.mealsContainer}>
        {renderMealSection('breakfast', item.meals.breakfast)}
        {renderMealSection('lunch', item.meals.lunch)}
        {renderMealSection('dinner', item.meals.dinner)}
        {renderMealSection('snack', item.meals.snack)}
        
        {/* Show empty state if no meals logged */}
        {Object.values(item.meals).every(meals => meals.length === 0) && (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>No meals logged</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <FlameIcon size={32} />
          <Text style={styles.headerTitle}>Food Diary</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please sign in to view your food diary</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <FlameIcon size={32} />
        <Text style={styles.headerTitle}>Food Diary</Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangeScroll}>
          {[14, 30, 60, 90].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.timeRangeButton,
                daysBack === days && styles.timeRangeButtonActive
              ]}
              onPress={() => setDaysBack(days)}
            >
              <Text style={[
                styles.timeRangeButtonText,
                daysBack === days && styles.timeRangeButtonTextActive
              ]}>
                {days === 14 ? '2 weeks' : days === 30 ? '1 month' : days === 60 ? '2 months' : '3 months'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Diary Content */}
      {diaryData === undefined ? (
        <View style={styles.loadingContainer}>
          <FlameIcon size={60} />
          <Text style={styles.loadingText}>Loading your food diary...</Text>
        </View>
      ) : diaryData === null ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Unable to load diary data</Text>
        </View>
      ) : (
        <FlatList
          data={diaryData.diary}
          renderItem={renderDiaryEntry}
          keyExtractor={(item) => item.date}
          style={styles.diaryList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.diaryListContent}
        />
      )}
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
  timeRangeContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  timeRangeScroll: {
    paddingHorizontal: 20,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: Colors.white,
  },
  diaryList: {
    flex: 1,
  },
  diaryListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  diaryEntry: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  dailySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  caloriesText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  scoreContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealsContainer: {
    padding: 16,
  },
  mealSection: {
    marginBottom: 16,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    marginBottom: 4,
  },
  mealInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  foodDetails: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  scoreIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDayText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
});