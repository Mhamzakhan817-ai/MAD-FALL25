import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';

export default function PurchaseSuccessScreen() {
  const { itemType, itemId, title, price } = useLocalSearchParams<{
    itemType: string;
    itemId: string;
    title: string;
    price: string;
  }>();

  const priceInDollars = price ? (parseInt(price) / 100).toFixed(2) : '0.00';

  const handleViewItem = () => {
    if (itemType === 'recipe') {
      router.push(`/recipe/${itemId}`);
    } else {
      // For meal plans, go back to recipes page
      router.push('/(tabs)/recipes');
    }
  };

  const handleBackToRecipes = () => {
    router.push('/(tabs)/recipes');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <FlameIcon size={40} style={styles.flameIcon} />
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Purchase Successful!</Text>
        <Text style={styles.successSubtitle}>
          Thank you for your purchase. You now have access to your {itemType === 'mealPlan' ? 'meal plan' : 'recipe'}.
        </Text>

        {/* Purchase Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Purchase Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Item:</Text>
            <Text style={styles.detailValue}>{title}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {itemType === 'mealPlan' ? 'Meal Plan' : 'Recipe'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValue}>${priceInDollars}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purchase Date:</Text>
            <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Access Your Content</Text>
              <Text style={styles.stepDescription}>
                Your {itemType === 'mealPlan' ? 'meal plan' : 'recipe'} is now available in your account.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Email Confirmation</Text>
              <Text style={styles.stepDescription}>
                You'll receive a confirmation email with your purchase details shortly.
              </Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Start Cooking!</Text>
              <Text style={styles.stepDescription}>
                Begin your anti-inflammatory journey with your new {itemType === 'mealPlan' ? 'meal plan' : 'recipe'}.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewItem}>
            <Text style={styles.primaryButtonText}>
              View My {itemType === 'mealPlan' ? 'Meal Plan' : 'Recipe'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToRecipes}>
            <Text style={styles.secondaryButtonText}>Browse More Recipes</Text>
          </TouchableOpacity>
        </View>

        {/* Support Information */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            If you have any questions about your purchase or need assistance, please contact our support team at support@inflamease.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 40,
    color: Colors.white,
    fontWeight: 'bold',
  },
  flameIcon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  nextStepsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  supportCard: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
});