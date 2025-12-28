import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function RecipesScreen() {
  const { user, token } = useAuth();
  
  // Initialize recipes on first load
  const initializeRecipes = useMutation(api.setup.initializeRecipes);
  
  // Fetch data
  const featuredContent = useQuery(api.recipes.getFeaturedContent);
  const userPurchases = useQuery(api.recipes.getUserPurchases, token ? { token } : 'skip');
  
  // Mutations
  const getUserReferralCode = useMutation(api.recipes.getUserReferralCode);
  const generateGroceryList = useMutation(api.recipes.generateGroceryList);

  useEffect(() => {
    const initRecipes = async () => {
      try {
        const result = await initializeRecipes();
        console.log('Recipe initialization result:', result);
      } catch (error) {
        console.log('Recipe initialization error:', error);
      }
    };
    
    if (token) {
      initRecipes();
    }
  }, [initializeRecipes, token]);

  const handlePurchaseRecipes = () => {
    // Navigate to contact collection for meal plan purchase
    const featuredMealPlan = featuredContent?.mealPlan;
    if (featuredMealPlan) {
      router.push({
        pathname: '/purchase-contact',
        params: {
          itemType: 'mealPlan',
          itemId: featuredMealPlan._id,
          title: featuredMealPlan.title,
          price: featuredMealPlan.price.toString(),
        }
      });
    } else {
      // Fallback to individual recipes purchase page
      router.push('/purchase-recipes');
    }
  };

  const handleViewRecipe = (recipeId: string) => {
    // Check if user has purchased this recipe
    const hasPurchased = userPurchases?.some(p => 
      p.itemType === 'recipe' && p.itemId === recipeId
    );
    
    if (hasPurchased) {
      router.push(`/recipe/${recipeId}`);
    } else {
      Alert.alert(
        'Recipe Not Purchased',
        'You need to purchase this recipe to view the full details and instructions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Purchase', onPress: handlePurchaseRecipes }
        ]
      );
    }
  };

  const handleReferFriends = async () => {
    if (!token) return;
    
    try {
      const userReferral = await getUserReferralCode({ token });
      
      if (userReferral) {
        const referralLink = `https://inflamease.app/signup?ref=${userReferral.referralCode}`;
        const shareMessage = `🔥 Join me on InflamEase - the anti-inflammatory nutrition tracker that's helping me reduce inflammation naturally!\n\nUse my referral code: ${userReferral.referralCode}\nOr click this link: ${referralLink}\n\nYou'll get access to science-backed recipes and I'll earn free recipes when you sign up! 🍽️✨`;
        
        try {
          const result = await Share.share({
            message: shareMessage,
            url: referralLink,
            title: 'Join InflamEase - Anti-Inflammatory Nutrition Tracker',
          });
          
          if (result.action === Share.sharedAction) {
            Alert.alert(
              'Thanks for sharing!',
              `Your referral stats:\n• Referral code: ${userReferral.referralCode}\n• Friends referred: ${userReferral.referredUsers}\n• Earnings: $${(userReferral.totalEarnings / 100).toFixed(2)}`
            );
          }
        } catch (shareError) {
          // Fallback to showing the referral code if sharing fails
          Alert.alert(
            'Refer Friends & Get Free Recipes!',
            `Share your referral code: ${userReferral.referralCode}\n\nReferral link: ${referralLink}\n\nYou've referred ${userReferral.referredUsers} friends and earned $${(userReferral.totalEarnings / 100).toFixed(2)}!`,
            [
              { 
                text: 'Copy Link', 
                onPress: () => {
                  // In a real app, you'd copy to clipboard here
                  console.log('Copying referral link:', referralLink);
                  Alert.alert('Link copied!', 'Referral link copied to clipboard');
                }
              },
              { text: 'Close', style: 'cancel' }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error getting referral code:', error);
      Alert.alert('Error', 'Failed to get referral information');
    }
  };

  const handleGenerateGroceryList = async () => {
    if (!token || !featuredContent?.recipes) {
      Alert.alert('Error', 'Unable to generate grocery list at this time.');
      return;
    }

    try {
      // Get the first few recipes from the meal plan
      const recipeIds = featuredContent.recipes.slice(0, 5).map(recipe => recipe._id);
      
      const result = await generateGroceryList({
        token,
        recipeIds,
        title: '5 Day Anti-Inflammatory Meal Plan',
      });

      Alert.alert(
        'Grocery List Generated!',
        'Your grocery list has been created and saved to your account. You can access it from your profile.',
        [
          { text: 'View Profile', onPress: () => router.push('/(tabs)/profile') },
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      console.error('Error generating grocery list:', error);
      Alert.alert('Error', 'Failed to generate grocery list. Please try again.');
    }
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
          <Text style={styles.headerTitle}>InflamEase</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, styles.activeTab]}
          onPress={() => {}}
        >
          <Text style={[styles.tabText, styles.activeTabText]}>
            🍽️ Recipes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => router.push('/(tabs)/flares')}
        >
          <Text style={styles.tabText}>
            🔥 Flares
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => router.push('/supplements')}
        >
          <Text style={styles.tabText}>
            💊 Supps
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 5 Day Recipes Section */}
        {featuredContent?.mealPlan && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>5 Day Recipes</Text>
              <TouchableOpacity 
                style={styles.groceryListButton}
                onPress={handleGenerateGroceryList}
              >
                <Text style={styles.groceryListText}>Grocery List</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mealPlanCard}>
              <View style={styles.mealPlanContent}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>DAY 1</Text>
                </View>
                <Text style={styles.mealPlanTitle}>Breakfast</Text>
                <Text style={styles.mealPlanSubtitle}>Avocado Egg Toast</Text>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => {
                    if (featuredContent?.recipes && featuredContent.recipes.length > 0) {
                      handleViewRecipe(featuredContent.recipes[0]._id);
                    } else {
                      Alert.alert('Coming Soon', 'This meal plan recipe will be available soon!');
                    }
                  }}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.mealPlanRow}>
              <View style={[styles.mealPlanCard, styles.mealPlanCardSmall]}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>DAY 2</Text>
                </View>
                <Text style={styles.mealPlanTitle}>Breakfast</Text>
                <Text style={styles.mealPlanSubtitle}>Avocado Egg Toast</Text>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => {
                    if (featuredContent?.recipes && featuredContent.recipes.length > 1) {
                      handleViewRecipe(featuredContent.recipes[1]._id);
                    } else {
                      Alert.alert('Coming Soon', 'This meal plan recipe will be available soon!');
                    }
                  }}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.mealPlanCard, styles.mealPlanCardSmall]}>
                <Text style={styles.mealPlanTitle}>Lunch</Text>
                <Text style={styles.mealPlanSubtitle}>Grilled Chicken</Text>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => {
                    if (featuredContent?.recipes && featuredContent.recipes.length > 2) {
                      handleViewRecipe(featuredContent.recipes[2]._id);
                    } else {
                      Alert.alert('Coming Soon', 'This meal plan recipe will be available soon!');
                    }
                  }}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Individual Recipes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Individual Recipes</Text>
            <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchaseRecipes}>
              <Text style={styles.purchaseButtonText}>Purchase</Text>
            </TouchableOpacity>
          </View>

          {featuredContent?.recipes && featuredContent.recipes.length > 0 && (
            <View style={styles.individualRecipeCard}>
              <View style={styles.recipeIcon}>
                <Text style={styles.recipeIconText}>🍽️</Text>
              </View>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{featuredContent.recipes[0].title}</Text>
                <Text style={styles.recipeSubtitle}>with Roasted Vegetables</Text>
              </View>
              <TouchableOpacity 
                style={styles.readButton}
                onPress={() => handleViewRecipe(featuredContent.recipes[0]._id)}
              >
                <Text style={styles.readButtonText}>Read</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={styles.showAllButton}
            onPress={() => router.push('/purchase-recipes')}
          >
            <Text style={styles.showAllText}>Show all</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Section */}
        <View style={styles.referralSection}>
          <Text style={styles.referralTitle}>Refer to others & Get Free recipes!</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleReferFriends}>
            <Text style={styles.startButtonText}>START</Text>
          </TouchableOpacity>
          
          <View style={styles.referralOptions}>
            <View style={styles.referralOption}>
              <Text style={styles.referralOptionNumber}>1 Recipe</Text>
              <Text style={styles.referralOptionText}>after you refer 10</Text>
            </View>
            <View style={styles.referralOption}>
              <Text style={styles.referralOptionNumber}>10 Recipes</Text>
              <Text style={styles.referralOptionText}>after you refer 20</Text>
            </View>
            <View style={styles.referralOption}>
              <Text style={styles.referralOptionNumber}>20 Recipes</Text>
              <Text style={styles.referralOptionText}>after you refer 50</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
    color: Colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  groceryListButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  groceryListText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  purchaseButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  purchaseButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  mealPlanCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  mealPlanCardSmall: {
    flex: 1,
    marginRight: 8,
  },
  mealPlanContent: {
    alignItems: 'flex-start',
  },
  mealPlanRow: {
    flexDirection: 'row',
  },
  dayBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  dayBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  mealPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  mealPlanSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  individualRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recipeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeIconText: {
    fontSize: 20,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  recipeSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  readButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  readButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  showAllButton: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  showAllText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  referralSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  referralTitle: {
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  referralOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  referralOption: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  referralOptionNumber: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  referralOptionText: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});