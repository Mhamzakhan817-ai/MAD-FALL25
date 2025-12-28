import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Colors from '@/constants/Colors';
import FlameIcon from '@/components/FlameIcon';
import { Id } from '@/convex/_generated/dataModel';

interface Food {
  _id: Id<"foods">;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  antiInflammatoryScore: number;
  commonServings: Array<{
    name: string;
    grams: number;
  }>;
}

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  token: string;
}

export default function AddFoodModal({ visible, onClose, mealType, token }: AddFoodModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedServing, setSelectedServing] = useState<{ name: string; grams: number } | null>(null);
  const [customGrams, setCustomGrams] = useState('');
  const [loading, setLoading] = useState(false);

  const foods = useQuery(api.foods.searchFoods, 
    { query: searchQuery || "", limit: 20 }
  ) as Food[] | undefined;

  const addFoodLog = useMutation(api.foods.addFoodLog);

  useEffect(() => {
    if (!visible) {
      // Reset state when modal closes
      setSearchQuery('');
      setSelectedFood(null);
      setSelectedServing(null);
      setCustomGrams('');
    }
  }, [visible]);

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food);
    setSelectedServing(food.commonServings[0] || null);
    setCustomGrams(food.commonServings[0]?.grams.toString() || '100');
  };

  const handleServingSelect = (serving: { name: string; grams: number }) => {
    setSelectedServing(serving);
    setCustomGrams(serving.grams.toString());
  };

  const calculateNutrition = (grams: number) => {
    if (!selectedFood) return null;
    
    const ratio = grams / 100;
    return {
      calories: Math.round(selectedFood.caloriesPer100g * ratio),
      protein: Math.round(selectedFood.proteinPer100g * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbsPer100g * ratio * 10) / 10,
      fat: Math.round(selectedFood.fatPer100g * ratio * 10) / 10,
    };
  };

  const handleAddFood = async () => {
    if (!selectedFood || !token) return;

    const grams = parseFloat(customGrams);
    if (isNaN(grams) || grams <= 0) {
      Alert.alert('Error', 'Please enter a valid serving size');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const servingName = selectedServing ? selectedServing.name : `${grams}g`;

      await addFoodLog({
        token,
        foodId: selectedFood._id,
        mealType,
        servingSize: servingName,
        servingGrams: grams,
        logDate: today,
      });

      Alert.alert('Success', 'Food added to your log!');
      onClose();
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food to your log');
    } finally {
      setLoading(false);
    }
  };

  const nutrition = selectedFood && customGrams ? calculateNutrition(parseFloat(customGrams) || 0) : null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return Colors.success;
    if (score >= 6) return Colors.warning;
    if (score >= 4) return Colors.secondary;
    return Colors.error;
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity 
      style={styles.foodItem}
      onPress={() => handleFoodSelect(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        {item.brand && <Text style={styles.foodBrand}>{item.brand}</Text>}
        <Text style={styles.foodDetails}>
          {item.caloriesPer100g} cal/100g • Score: {item.antiInflammatoryScore}/10
        </Text>
      </View>
      <View style={[styles.scoreIndicator, { backgroundColor: getScoreColor(item.antiInflammatoryScore) }]}>
        <Text style={styles.scoreText}>{item.antiInflammatoryScore}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <FlameIcon size={24} />
              <Text style={styles.headerTitle}>Add to {mealType}</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {!selectedFood ? (
            // Search Screen
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for foods..."
                placeholderTextColor={Colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />

              {searchQuery.length < 2 ? (
                <View style={styles.popularFoodsContainer}>
                  <Text style={styles.popularFoodsTitle}>Popular Foods</Text>
                  <FlatList
                    data={foods || []}
                    renderItem={renderFoodItem}
                    keyExtractor={(item) => item._id}
                    style={styles.foodList}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              ) : (
                <FlatList
                  data={foods || []}
                  renderItem={renderFoodItem}
                  keyExtractor={(item) => item._id}
                  style={styles.foodList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          ) : (
            // Food Details Screen
            <View style={styles.detailsContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedFood(null)}
              >
                <Text style={styles.backButtonText}>← Back to search</Text>
              </TouchableOpacity>

              <View style={styles.selectedFoodHeader}>
                <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                {selectedFood.brand && (
                  <Text style={styles.selectedFoodBrand}>{selectedFood.brand}</Text>
                )}
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Anti-inflammatory Score:</Text>
                  <Text style={[styles.scoreValue, { color: getScoreColor(selectedFood.antiInflammatoryScore) }]}>
                    {selectedFood.antiInflammatoryScore}/10
                  </Text>
                </View>
              </View>

              {/* Serving Size Selection */}
              <View style={styles.servingSection}>
                <Text style={styles.sectionTitle}>Serving Size</Text>
                
                {selectedFood.commonServings.map((serving, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.servingOption,
                      selectedServing?.name === serving.name && styles.servingOptionSelected
                    ]}
                    onPress={() => handleServingSelect(serving)}
                  >
                    <Text style={[
                      styles.servingOptionText,
                      selectedServing?.name === serving.name && styles.servingOptionTextSelected
                    ]}>
                      {serving.name}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.customServingContainer}>
                  <Text style={styles.customServingLabel}>Custom amount (grams):</Text>
                  <TextInput
                    style={styles.customServingInput}
                    value={customGrams}
                    onChangeText={setCustomGrams}
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>

              {/* Nutrition Preview */}
              {nutrition && (
                <View style={styles.nutritionSection}>
                  <Text style={styles.sectionTitle}>Nutrition Information</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{nutrition.protein}g</Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{nutrition.carbs}g</Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{nutrition.fat}g</Text>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Add Button */}
              <TouchableOpacity
                style={[styles.addButton, loading && styles.addButtonDisabled]}
                onPress={handleAddFood}
                disabled={loading}
              >
                <Text style={styles.addButtonText}>
                  {loading ? 'Adding...' : 'Add to Log'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  headerRight: {
    width: 50, // Balance the header
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.text.primary,
    marginVertical: 16,
  },
  searchPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPromptText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  popularFoodsContainer: {
    flex: 1,
  },
  popularFoodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  foodList: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  foodBrand: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  foodDetails: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  scoreIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  scoreText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  selectedFoodHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: 20,
  },
  selectedFoodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedFoodBrand: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  servingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  servingOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  servingOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent,
  },
  servingOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  servingOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  customServingContainer: {
    marginTop: 12,
  },
  customServingLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  customServingInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.text.primary,
  },
  nutritionSection: {
    marginBottom: 24,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});