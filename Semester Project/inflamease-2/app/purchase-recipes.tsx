import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function PurchaseRecipesScreen() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch data
  const recipes = useQuery(api.recipes.getRecipesForPurchase, { limit: 20 });
  const userPurchases = useQuery(api.recipes.getUserPurchases, token ? { token } : 'skip');
  
  // Mutations
  const purchaseItem = useMutation(api.recipes.purchaseItem);

  const handlePurchase = async (recipe: any) => {
    if (!token) return;

    // Check if already purchased
    const alreadyPurchased = userPurchases?.some(p => 
      p.itemType === 'recipe' && p.itemId === recipe._id
    );

    if (alreadyPurchased) {
      Alert.alert('Already Purchased', 'You already own this recipe!');
      return;
    }

    // Navigate to contact collection screen
    router.push({
      pathname: '/purchase-contact',
      params: {
        itemType: 'recipe',
        itemId: recipe._id,
        title: recipe.title,
        price: recipe.price.toString(),
      }
    });
  };

  const handleView = (recipe: any) => {
    // Check if user has purchased this recipe
    const hasPurchased = userPurchases?.some(p => 
      p.itemType === 'recipe' && p.itemId === recipe._id
    );
    
    if (hasPurchased) {
      router.push(`/recipe/${recipe._id}`);
    } else {
      Alert.alert(
        'Recipe Preview',
        `"${recipe.title}"\n\n${recipe.description}\n\nCook Time: ${recipe.cookTime} min\nServings: ${recipe.servings}\nAnti-inflammatory Score: ${recipe.antiInflammatoryScore}/10\n\nPurchase to view full recipe with ingredients and instructions!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Purchase', onPress: () => handlePurchase(recipe) }
        ]
      );
    }
  };

  const isPurchased = (recipeId: string) => {
    return userPurchases?.some(p => 
      p.itemType === 'recipe' && p.itemId === recipeId
    ) || false;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.warning;
    return Colors.error;
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <FlameIcon size={32} />
          <Text style={styles.headerTitle}>InflamEase</Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>🍽️ Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>🔥 Flares</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>💊 Supps</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Purchase Recipes</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {recipes && recipes.map((recipe) => (
          <View key={recipe._id} style={styles.recipeCard}>
            <View style={styles.recipeImageContainer}>
              <View style={styles.recipeImagePlaceholder}>
                <Text style={styles.recipeImageIcon}>🥗</Text>
              </View>
              <TouchableOpacity style={styles.shareRecipeButton}>
                <Text style={styles.shareRecipeButtonText}>⋯</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.recipeContent}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.recipeDetails}>
                {recipe.cookTime} min | {recipe.calories} kcal | {recipe.carbs}g gr. of carbs
              </Text>
              
              <View style={styles.recipeActions}>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => handleView(recipe)}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                
                {isPurchased(recipe._id) ? (
                  <View style={styles.purchasedButton}>
                    <Text style={styles.purchasedButtonText}>Purchased ✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.purchaseButton}
                    onPress={() => handlePurchase(recipe)}
                  >
                    <Text style={styles.purchaseButtonText}>
                      Purchase ${(recipe.price / 100).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Anti-inflammatory Score */}
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Anti-inflammatory Score:</Text>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(recipe.antiInflammatoryScore) }]}>
                  <Text style={styles.scoreText}>{recipe.antiInflammatoryScore}/10</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {recipe.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}

        {/* Empty State */}
        {(!recipes || recipes.length === 0) && (
          <View style={styles.emptyState}>
            <FlameIcon size={60} />
            <Text style={styles.emptyStateTitle}>No Recipes Available</Text>
            <Text style={styles.emptyStateDescription}>
              Check back soon for delicious anti-inflammatory recipes!
            </Text>
          </View>
        )}

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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
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
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  recipeCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recipeImageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: Colors.accent,
  },
  recipeImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeImageIcon: {
    fontSize: 60,
  },
  shareRecipeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareRecipeButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  recipeDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  viewButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  purchaseButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  purchasedButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchasedButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.divider,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});