import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    title: "Track Your Food",
    description: "Log your meals and discover their anti-inflammatory properties. Every food gets a score from 1-10 to help you make better choices.",
    icon: "🍎",
  },
  {
    title: "Monitor Progress",
    description: "See your daily inflammation score, track calories, and monitor your journey towards better health with detailed insights.",
    icon: "📊",
  },
  {
    title: "Get Personalized Tips",
    description: "Receive AI-powered suggestions to reduce inflammation based on your eating patterns and health goals.",
    icon: "💡",
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const { user, token } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const completeOnboardingMutation = useMutation(api.auth.completeOnboarding);

  const nextSlide = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
    } else {
      // Show calorie goal setup
      setCurrentSlide(ONBOARDING_SLIDES.length);
      scrollViewRef.current?.scrollTo({ x: ONBOARDING_SLIDES.length * screenWidth, animated: true });
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const prevIndex = currentSlide - 1;
      setCurrentSlide(prevIndex);
      scrollViewRef.current?.scrollTo({ x: prevIndex * screenWidth, animated: true });
    }
  };

  const completeOnboarding = async () => {
    const goal = parseInt(calorieGoal);
    if (isNaN(goal) || goal < 1000 || goal > 5000) {
      Alert.alert('Invalid Goal', 'Please enter a calorie goal between 1000 and 5000');
      return;
    }
    
    // Save calorie goal to user profile
    try {
      if (token) {
        await completeOnboardingMutation({
          token,
          dailyCalorieGoal: goal,
        });
      }
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    }
  };

  const renderSlide = (slide: typeof ONBOARDING_SLIDES[0], index: number) => (
    <View key={index} style={[styles.slide, { width: screenWidth }]}>
      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.slideIcon}>{slide.icon}</Text>
        </View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDescription}>{slide.description}</Text>
        
        {/* Feature highlights based on slide */}
        <View style={styles.featureList}>
          {index === 0 && (
            <>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Anti-inflammatory scoring system</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Comprehensive food database</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Easy meal logging</Text>
              </View>
            </>
          )}
          {index === 1 && (
            <>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Daily inflammation score</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Calorie and macro tracking</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Progress visualization</Text>
              </View>
            </>
          )}
          {index === 2 && (
            <>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Personalized recommendations</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>AI-powered insights</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>Health goal optimization</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderCalorieGoalSetup = () => (
    <View style={[styles.slide, { width: screenWidth }]}>
      <View style={styles.slideContent}>
        <FlameIcon size={80} />
        <Text style={styles.slideTitle}>Set Your Daily Goal</Text>
        <Text style={styles.slideDescription}>
          How many calories do you want to consume per day? You can always change this later.
        </Text>
        
        <View style={styles.goalInputContainer}>
          <Text style={styles.goalLabel}>Daily Calorie Goal</Text>
          <TextInput
            style={styles.goalInput}
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            keyboardType="numeric"
            placeholder="2000"
            placeholderTextColor={Colors.text.tertiary}
          />
          <Text style={styles.goalUnit}>calories</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <FlameIcon size={40} />
        <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.slideContainer}
        contentContainerStyle={{ width: screenWidth * (ONBOARDING_SLIDES.length + 1) }}
      >
        {ONBOARDING_SLIDES.map((slide, index) => renderSlide(slide, index))}
        {renderCalorieGoalSetup()}
      </ScrollView>

      {/* Progress indicators */}
      <View style={styles.progressContainer}>
        {[...Array(ONBOARDING_SLIDES.length + 1)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentSlide && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {currentSlide > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevSlide}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.buttonSpacer} />
        
        {currentSlide < ONBOARDING_SLIDES.length ? (
          <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.completeButton} onPress={completeOnboarding}>
            <Text style={styles.completeButtonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
  },
  slideContainer: {
    flex: 1,
  },
  slide: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  slideIcon: {
    fontSize: 60,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  featureList: {
    alignSelf: 'stretch',
    paddingHorizontal: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
    marginRight: 12,
    width: 20,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  goalInputContainer: {
    alignItems: 'center',
    marginTop: 32,
    width: '100%',
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  goalInput: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
    minWidth: 120,
  },
  goalUnit: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  buttonSpacer: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});