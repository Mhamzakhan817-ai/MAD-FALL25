import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';

export default function SupplementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  
  // Fetch supplement details
  const supplement = useQuery(api.supplements.getSupplementById, 
    id && token ? { supplementId: id, token } : 'skip'
  );

  if (!supplement) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FlameIcon size={60} />
          <Text style={styles.loadingText}>Loading supplement details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!supplement.isPurchased) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supplement Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.notPurchasedContainer}>
          <FlameIcon size={80} />
          <Text style={styles.notPurchasedTitle}>Supplement Not Purchased</Text>
          <Text style={styles.notPurchasedDescription}>
            You need to purchase this supplement guide to view the full details and recommendations.
          </Text>
          <TouchableOpacity 
            style={styles.purchaseButton}
            onPress={() => router.push('/supplements')}
          >
            <Text style={styles.purchaseButtonText}>View Supplements</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Supplement Guide</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.supplementTitle}>{supplement.title}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Anti-Inflammatory Score</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreValue}>{supplement.antiInflammatoryScore}/10</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>{supplement.description}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Benefits</Text>
          {supplement.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Dosage Recommendation */}
        {'dosageRecommendation' in supplement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dosage Recommendation</Text>
            <View style={styles.dosageCard}>
              <Text style={styles.dosageIcon}>💊</Text>
              <Text style={styles.dosageText}>{supplement.dosageRecommendation}</Text>
            </View>
          </View>
        )}

        {/* Scientific Evidence */}
        {'scientificEvidence' in supplement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scientific Evidence</Text>
            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceIcon}>🔬</Text>
              <Text style={styles.evidenceText}>{supplement.scientificEvidence}</Text>
            </View>
          </View>
        )}

        {/* Quality Brands */}
        {'qualityBrands' in supplement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Brands</Text>
            <Text style={styles.sectionDescription}>
              These brands have been vetted for quality, purity, and potency:
            </Text>
            {supplement.qualityBrands.map((brand: string, index: number) => (
              <View key={index} style={styles.brandItem}>
                <Text style={styles.brandBullet}>⭐</Text>
                <Text style={styles.brandText}>{brand}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Potential Side Effects */}
        {'potentialSideEffects' in supplement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Potential Side Effects</Text>
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningContent}>
                {supplement.potentialSideEffects.map((effect: string, index: number) => (
                  <Text key={index} style={styles.warningText}>• {effect}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Drug Interactions */}
        {'interactions' in supplement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drug Interactions</Text>
            <View style={styles.interactionCard}>
              <Text style={styles.interactionIcon}>🚨</Text>
              <View style={styles.interactionContent}>
                <Text style={styles.interactionHeader}>
                  Consult your healthcare provider if you're taking:
                </Text>
                {supplement.interactions.map((interaction: string, index: number) => (
                  <Text key={index} style={styles.interactionText}>• {interaction}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This information is for educational purposes only and is not intended to replace professional medical advice. 
            Always consult with a qualified healthcare provider before starting any new supplement regimen, especially if you have 
            existing health conditions or are taking medications.
          </Text>
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
  notPurchasedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  notPurchasedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  notPurchasedDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  supplementTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  scoreBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitBullet: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  dosageCard: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dosageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dosageText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  evidenceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  evidenceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  evidenceText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandBullet: {
    fontSize: 16,
    marginRight: 8,
  },
  brandText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
    lineHeight: 20,
  },
  interactionCard: {
    backgroundColor: '#F8D7DA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  interactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  interactionContent: {
    flex: 1,
  },
  interactionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#721C24',
    marginBottom: 8,
  },
  interactionText: {
    fontSize: 14,
    color: '#721C24',
    marginBottom: 4,
    lineHeight: 20,
  },
  disclaimerSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  purchaseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  purchaseButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
});