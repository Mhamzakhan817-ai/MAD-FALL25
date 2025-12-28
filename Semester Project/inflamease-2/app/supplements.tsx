import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function SupplementsScreen() {
  const { user, token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Initialize supplements on first load
  const initializeSupplements = useMutation(api.setup.initializeSupplements);
  
  // Fetch data
  const featuredSupplements = useQuery(api.supplements.getFeaturedSupplements);
  const categorySupplements = useQuery(
    api.supplements.getAllSupplements, 
    selectedCategory ? { category: selectedCategory } : 'skip'
  );
  const userPurchases = useQuery(api.supplements.getUserSupplementPurchases, token ? { token } : 'skip');
  
  // Determine which supplements to show
  const supplementsToShow = selectedCategory ? categorySupplements : featuredSupplements;
  
  useEffect(() => {
    const initSupps = async () => {
      try {
        const result = await initializeSupplements();
        console.log('Supplements initialization result:', result);
      } catch (error) {
        console.log('Supplements initialization error:', error);
      }
    };
    
    if (token) {
      initSupps();
    }
  }, [initializeSupplements, token]);

  const handlePurchaseSupplement = (supplementId: string, title: string, price: number) => {
    // Navigate to contact collection for supplement purchase
    router.push({
      pathname: '/purchase-contact',
      params: {
        itemType: 'supplement',
        itemId: supplementId,
        title: title,
        price: price.toString(),
      }
    });
  };

  const handleViewSupplement = (supplementId: string) => {
    // Check if user has purchased this supplement
    const hasPurchased = userPurchases?.some(p => 
      p.itemType === 'supplement' && p.itemId === supplementId
    );
    
    if (hasPurchased) {
      router.push(`/supplement/${supplementId}`);
    } else {
      Alert.alert(
        'Supplement Not Purchased',
        'You need to purchase this supplement guide to view the full details and recommendations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Purchase', onPress: () => {
            const supplement = supplementsToShow?.find(s => s._id === supplementId);
            if (supplement) {
              handlePurchaseSupplement(supplementId, supplement.title, supplement.price);
            }
          }}
        ]
      );
    }
  };

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect if already selected
    } else {
      setSelectedCategory(category);
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <FlameIcon size={32} />
          <Text style={styles.headerTitle}>Anti-Inflammatory Supplements</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Science-Backed Supplements</Text>
          <Text style={styles.heroSubtitle}>
            Carefully curated supplements to support your anti-inflammatory journey
          </Text>
        </View>

        {/* Featured/Category Supplements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Supplements` : 'Featured Supplements'}
          </Text>
          
          {selectedCategory && (
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={styles.clearFilterText}>Show All Supplements</Text>
            </TouchableOpacity>
          )}
          
          {supplementsToShow && supplementsToShow.length > 0 ? (
            supplementsToShow.map((supplement) => (
              <View key={supplement._id} style={styles.supplementCard}>
                <View style={styles.supplementIcon}>
                  <Text style={styles.supplementIconText}>💊</Text>
                </View>
                
                <View style={styles.supplementContent}>
                  <View style={styles.supplementHeader}>
                    <Text style={styles.supplementTitle}>{supplement.title}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>${(supplement.price / 100).toFixed(2)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.supplementDescription}>{supplement.description}</Text>
                  
                  <View style={styles.supplementMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Category:</Text>
                      <Text style={styles.metaValue}>{supplement.category}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Anti-Inflammatory Score:</Text>
                      <View style={styles.scoreContainer}>
                        <Text style={styles.scoreValue}>{supplement.antiInflammatoryScore}/10</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.benefitsList}>
                    <Text style={styles.benefitsTitle}>Key Benefits:</Text>
                    {supplement.benefits.slice(0, 3).map((benefit, index) => (
                      <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.supplementActions}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleViewSupplement(supplement._id)}
                    >
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.purchaseButton}
                      onPress={() => handlePurchaseSupplement(supplement._id, supplement.title, supplement.price)}
                    >
                      <Text style={styles.purchaseButtonText}>Purchase</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FlameIcon size={60} />
              <Text style={styles.emptyStateTitle}>
                {selectedCategory ? `No ${selectedCategory} supplements found` : 'Supplements Coming Soon'}
              </Text>
              <Text style={styles.emptyStateDescription}>
                {selectedCategory 
                  ? 'Try selecting a different category or check back later for more supplements.'
                  : 'We\'re preparing a comprehensive guide to anti-inflammatory supplements. Check back soon!'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplement Categories</Text>
          
          <View style={styles.categoriesGrid}>
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === 'herbal' && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategoryPress('herbal')}
            >
              <Text style={styles.categoryIcon}>🌿</Text>
              <Text style={styles.categoryTitle}>Herbal</Text>
              <Text style={styles.categoryDescription}>Natural plant-based supplements</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === 'omega-3' && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategoryPress('omega-3')}
            >
              <Text style={styles.categoryIcon}>🐟</Text>
              <Text style={styles.categoryTitle}>Omega-3</Text>
              <Text style={styles.categoryDescription}>Essential fatty acids</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === 'probiotics' && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategoryPress('probiotics')}
            >
              <Text style={styles.categoryIcon}>🔬</Text>
              <Text style={styles.categoryTitle}>Probiotics</Text>
              <Text style={styles.categoryDescription}>Gut health support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === 'antioxidants' && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategoryPress('antioxidants')}
            >
              <Text style={styles.categoryIcon}>⚡</Text>
              <Text style={styles.categoryTitle}>Antioxidants</Text>
              <Text style={styles.categoryDescription}>Cellular protection</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === 'vitamins' && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategoryPress('vitamins')}
            >
              <Text style={styles.categoryIcon}>🌟</Text>
              <Text style={styles.categoryTitle}>Vitamins</Text>
              <Text style={styles.categoryDescription}>Essential nutrients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === 'minerals' && styles.selectedCategoryCard
              ]}
              onPress={() => handleCategoryPress('minerals')}
            >
              <Text style={styles.categoryIcon}>⚖️</Text>
              <Text style={styles.categoryTitle}>Minerals</Text>
              <Text style={styles.categoryDescription}>Essential minerals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Choose Our Supplement Guides?</Text>
          
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🔬</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoItemTitle}>Science-Based</Text>
                <Text style={styles.infoItemDescription}>All recommendations backed by peer-reviewed research</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>👨‍⚕️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoItemTitle}>Expert Reviewed</Text>
                <Text style={styles.infoItemDescription}>Curated by nutritionists and healthcare professionals</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🎯</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoItemTitle}>Personalized</Text>
                <Text style={styles.infoItemDescription}>Tailored recommendations based on your inflammation profile</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>💰</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoItemTitle}>Cost-Effective</Text>
                <Text style={styles.infoItemDescription}>Save money with our vetted supplement recommendations</Text>
              </View>
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  supplementCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
  },
  supplementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supplementIconText: {
    fontSize: 24,
  },
  supplementContent: {
    flex: 1,
  },
  supplementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  supplementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  priceContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  supplementDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  supplementMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginRight: 8,
  },
  metaValue: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  scoreContainer: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: 'bold',
  },
  benefitsList: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  benefitItem: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  supplementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 10,
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
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoItemDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  clearFilterButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  clearFilterText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCategoryCard: {
    backgroundColor: Colors.accent,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
});