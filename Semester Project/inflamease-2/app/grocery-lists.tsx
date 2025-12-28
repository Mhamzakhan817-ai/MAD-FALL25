import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function GroceryListsScreen() {
  const { token } = useAuth();
  
  // For now, we'll show a placeholder since we don't have the grocery list query yet
  // In a real implementation, you'd fetch the user's grocery lists here
  
  const mockGroceryLists = [
    {
      id: '1',
      title: '5 Day Anti-Inflammatory Meal Plan',
      createdDate: new Date().toISOString().split('T')[0],
      ingredients: [
        { name: '4 chicken breasts', category: 'meat', checked: false },
        { name: '2 tsp turmeric powder', category: 'pantry', checked: false },
        { name: '1 inch fresh ginger', category: 'produce', checked: false },
        { name: '2 bell peppers', category: 'produce', checked: false },
        { name: '1 zucchini', category: 'produce', checked: false },
        { name: '2 tbsp olive oil', category: 'pantry', checked: false },
        { name: '2 ripe avocados', category: 'produce', checked: false },
        { name: '4 eggs', category: 'dairy', checked: false },
        { name: '4 slices whole grain bread', category: 'grains', checked: false },
      ]
    }
  ];

  const [selectedList, setSelectedList] = useState(mockGroceryLists[0]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemName: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemName)) {
      newCheckedItems.delete(itemName);
    } else {
      newCheckedItems.add(itemName);
    }
    setCheckedItems(newCheckedItems);
  };

  const groupedIngredients = selectedList.ingredients.reduce((groups, ingredient) => {
    const category = ingredient.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(ingredient);
    return groups;
  }, {} as Record<string, typeof selectedList.ingredients>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'produce': return '🥬';
      case 'meat': return '🥩';
      case 'dairy': return '🥛';
      case 'pantry': return '🏺';
      case 'grains': return '🌾';
      default: return '📦';
    }
  };

  const getCategoryTitle = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <FlameIcon size={32} />
          <Text style={styles.headerTitle}>Grocery Lists</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{selectedList.title}</Text>
          <Text style={styles.listDate}>
            Created on {new Date(selectedList.createdDate).toLocaleDateString()}
          </Text>
          <Text style={styles.listStats}>
            {checkedItems.size} of {selectedList.ingredients.length} items checked
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(checkedItems.size / selectedList.ingredients.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Ingredients by Category */}
        {Object.entries(groupedIngredients).map(([category, ingredients]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
              <Text style={styles.categoryTitle}>{getCategoryTitle(category)}</Text>
              <Text style={styles.categoryCount}>
                {ingredients.filter(item => checkedItems.has(item.name)).length}/{ingredients.length}
              </Text>
            </View>
            
            {ingredients.map((ingredient, index) => {
              const isChecked = checkedItems.has(ingredient.name);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.ingredientItem, isChecked && styles.ingredientItemChecked]}
                  onPress={() => toggleItem(ingredient.name)}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.ingredientText, isChecked && styles.ingredientTextChecked]}>
                    {ingredient.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.clearButton} onPress={() => setCheckedItems(new Set())}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={() => {
              const allItems = new Set(selectedList.ingredients.map(item => item.name));
              setCheckedItems(allItems);
            }}
          >
            <Text style={styles.completeButtonText}>Check All</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Shopping Tips</Text>
          <Text style={styles.infoText}>
            • Shop the perimeter of the store first for fresh produce and proteins{'\n'}
            • Check your pantry before shopping to avoid duplicates{'\n'}
            • Consider buying organic for the "Dirty Dozen" produce items{'\n'}
            • Fresh ginger and turmeric have stronger anti-inflammatory properties than dried
          </Text>
        </View>

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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  listHeader: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  listDate: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  listStats: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  categorySection: {
    backgroundColor: Colors.surface,
    marginBottom: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.accent,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  ingredientItemChecked: {
    backgroundColor: Colors.accent,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: 'bold',
  },
  ingredientText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: Colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});