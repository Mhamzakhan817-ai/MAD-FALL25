import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import DailySummary from '@/components/DailySummary';
import FoodLogSection from '@/components/FoodLogSection';
import AddFoodModal from '@/components/AddFoodModal';
import FlareInsights from '@/components/FlareInsights';
import WeeklyStats from '@/components/WeeklyStats';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';
import { FoodLog } from '@/types';

export default function HomeScreen() {
  const { user, token, signOut } = useAuth();
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  
  const setupDatabase = useMutation(api.setup.initializeApp);
  const signOutMutation = useMutation(api.auth.signOut);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch today's food logs
  const foodLogs = useQuery(api.foods.getFoodLogs, token ? { token, date: today } : 'skip') as FoodLog[] | undefined;
  
  // Initialize database with sample foods on first load
  useEffect(() => {
    const initDB = async () => {
      try {
        const result = await setupDatabase();
        console.log('Database initialization result:', result);
      } catch (error) {
        console.log('Database initialization error:', error);
      }
    };
    
    // Always try to initialize on first load
    if (token) {
      initDB();
    }
  }, [setupDatabase, token]);

  const handleManualInit = async () => {
    try {
      const result = await setupDatabase();
      console.log('Manual database initialization result:', result);
      Alert.alert('Success', 'Database initialized with sample foods!');
    } catch (error) {
      console.error('Manual database initialization error:', error);
      Alert.alert('Error', 'Failed to initialize database');
    }
  };

  const handleAddFood = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedMealType(mealType);
    setShowAddFood(true);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('Starting sign out process...');
              // Call backend signout to invalidate session
              if (token) {
                console.log('Calling backend signout...');
                const result = await signOutMutation({ token });
                console.log('Backend signout result:', result);
              }
            } catch (error) {
              console.error('Backend signout error:', error);
              // Continue with local signout even if backend fails
            } finally {
              try {
                console.log('Calling local signout...');
                // Always clear local storage
                await signOut();
                console.log('Local signout completed');
              } catch (localError) {
                console.error('Local signout error:', localError);
                Alert.alert('Error', 'Failed to sign out completely. Please try again.');
              }
            }
          }
        },
      ]
    );
  };

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FlameIcon size={60} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FlameIcon size={32} />
          <View style={styles.headerText}>
            <Text style={styles.appName}>InflamEase</Text>
            <Text style={styles.welcomeText}>Hello, {user.name}</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={handleSignOut} 
            style={styles.signOutButton}
            activeOpacity={0.7}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleManualInit} style={styles.debugButton}>
            <Text style={styles.debugButtonText}>Init DB</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Summary */}
        <DailySummary foodLogs={foodLogs || []} />

        {/* Weekly Stats */}
        <View style={styles.statsContainer}>
          <WeeklyStats />
        </View>

        {/* Flare Insights */}
        <View style={styles.insightsContainer}>
          <FlareInsights />
        </View>

        {/* Food Log Sections */}
        <View style={styles.foodLogContainer}>
          <FoodLogSection
            title="Breakfast"
            mealType="breakfast"
            foodLogs={foodLogs?.filter((log: FoodLog) => log.mealType === 'breakfast') || []}
            onAddFood={() => handleAddFood('breakfast')}
            token={token}
          />
          
          <FoodLogSection
            title="Lunch"
            mealType="lunch"
            foodLogs={foodLogs?.filter((log: FoodLog) => log.mealType === 'lunch') || []}
            onAddFood={() => handleAddFood('lunch')}
            token={token}
          />
          
          <FoodLogSection
            title="Dinner"
            mealType="dinner"
            foodLogs={foodLogs?.filter((log: FoodLog) => log.mealType === 'dinner') || []}
            onAddFood={() => handleAddFood('dinner')}
            token={token}
          />
          
          <FoodLogSection
            title="Snacks"
            mealType="snack"
            foodLogs={foodLogs?.filter((log: FoodLog) => log.mealType === 'snack') || []}
            onAddFood={() => handleAddFood('snack')}
            token={token}
          />
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Food Modal */}
      <AddFoodModal
        visible={showAddFood}
        onClose={() => setShowAddFood(false)}
        mealType={selectedMealType}
        token={token}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    gap: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutButton: {
    paddingHorizontal: 16, // Increased from 12
    paddingVertical: 8, // Increased from 6
    borderRadius: 8,
    backgroundColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.primary,
    // Add shadow for better visibility
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600', // Increased from '500'
  },
  debugButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    marginLeft: 8,
  },
  debugButtonText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  insightsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  foodLogContainer: {
    gap: 16,
    paddingHorizontal: 20,
  },
  bottomSpacing: {
    height: 100, // Extra space for tab bar
  },
});