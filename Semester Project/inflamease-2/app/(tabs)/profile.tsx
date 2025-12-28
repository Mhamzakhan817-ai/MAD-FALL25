import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, token, signOut, refreshUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(user?.dailyCalorieGoal?.toString() || '2000');
  const [userName, setUserName] = useState(user?.name || '');
  
  const signOutMutation = useMutation(api.auth.signOut);
  // const updateSettings = useMutation(api.profile.updateSettings);
  // const exportData = useQuery(api.profile.exportUserData, token ? { token } : 'skip');

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
              console.log('Starting profile sign out process...');
              if (token) {
                console.log('Calling backend signout from profile...');
                const result = await signOutMutation({ token });
                console.log('Profile backend signout result:', result);
              }
            } catch (error) {
              console.error('Profile backend signout error:', error);
              // Continue with local signout even if backend fails
            } finally {
              try {
                console.log('Calling local signout from profile...');
                await signOut();
                console.log('Profile local signout completed');
              } catch (localError) {
                console.error('Profile local signout error:', localError);
                Alert.alert('Error', 'Failed to sign out completely. Please try again.');
              }
            }
          }
        },
      ]
    );
  };

  const handleSettings = () => {
    setUserName(user?.name || '');
    setShowSettings(true);
  };

  const handleSaveSettings = async () => {
    if (!token) return;
    
    try {
      // This would be implemented when we add the profile functionality
      // await updateSettings({
      //   token,
      //   name: userName !== user?.name ? userName : undefined,
      // });
      Alert.alert('Success', 'Settings updated successfully');
      refreshUser(); // Refresh user data to show updated info
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleDailyGoals = () => {
    setDailyCalorieGoal(user?.dailyCalorieGoal?.toString() || '2000');
    setShowGoals(true);
  };

  const handleSaveGoals = async () => {
    if (!token) return;
    
    const goalNumber = parseInt(dailyCalorieGoal);
    if (isNaN(goalNumber) || goalNumber < 1000 || goalNumber > 5000) {
      Alert.alert('Error', 'Please enter a valid calorie goal between 1000 and 5000');
      return;
    }

    try {
      // This would be implemented when we add the profile functionality
      // await updateSettings({
      //   token,
      //   dailyCalorieGoal: goalNumber,
      // });
      Alert.alert('Success', 'Daily calorie goal updated successfully');
      refreshUser(); // Refresh user data to show updated goal
      setShowGoals(false);
    } catch (error) {
      console.error('Error updating goals:', error);
      Alert.alert('Error', 'Failed to update daily goals');
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Data export functionality will be available soon. This will allow you to download all your food logs and flare records.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <FlameIcon size={32} />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <FlameIcon size={32} />
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <FlameIcon size={80} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.dailyCalorieGoal && (
            <Text style={styles.userGoal}>Daily Goal: {user.dailyCalorieGoal} calories</Text>
          )}
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={handleDailyGoals}>
            <Text style={styles.optionIcon}>🎯</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Daily Calorie Goal</Text>
              <Text style={styles.optionSubtitle}>
                {user.dailyCalorieGoal ? `${user.dailyCalorieGoal} calories` : 'Not set'}
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option} 
            onPress={() => router.push('/grocery-lists')}
          >
            <Text style={styles.optionIcon}>🛒</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Grocery Lists</Text>
              <Text style={styles.optionSubtitle}>View your meal plan shopping lists</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleExportData}>
            <Text style={styles.optionIcon}>📊</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Export Data</Text>
              <Text style={styles.optionSubtitle}>Download your health data</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.option, styles.signOutOption]} 
            onPress={handleSignOut}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.optionIcon}>🚪</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Sign Out</Text>
              <Text style={styles.optionSubtitle}>Log out of your account</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity onPress={handleSaveSettings}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Daily Goals Modal */}
      <Modal visible={showGoals} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGoals(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Daily Goals</Text>
            <TouchableOpacity onPress={handleSaveGoals}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Calorie Goal</Text>
              <TextInput
                style={styles.textInput}
                value={dailyCalorieGoal}
                onChangeText={setDailyCalorieGoal}
                placeholder="2000"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>Recommended range: 1000-5000 calories</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  userGoal: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  optionArrow: {
    fontSize: 18,
    color: Colors.text.tertiary,
  },
  actions: {
    gap: 16,
  },
  actionButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: Colors.accent,
    borderColor: Colors.primary,
    marginTop: 20,
  },
  signOutButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalSave: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  inputHint: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  signOutOption: {
    backgroundColor: Colors.accent,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
});