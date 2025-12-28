import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import FlameIcon from '@/components/FlameIcon';
import Colors from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface Flare {
  _id: Id<'flares'>;
  flareDate: string;
  severity: number;
  notes?: string;
  triggers?: string[];
}

export default function FlaresScreen() {
  const { user, token } = useAuth();
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [triggers, setTriggers] = useState('');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Fetch data
  const todayFlare = useQuery(api.flares.getFlareByDate, token ? { token, flareDate: today } : 'skip');
  const recentFlares = useQuery(api.flares.getFlares, token ? { token, limit: 7 } : 'skip');
  const flareStats = useQuery(api.flares.getFlareStats, token ? { token, days: 30 } : 'skip');

  // Mutations
  const recordFlare = useMutation(api.flares.recordFlare);
  const deleteFlare = useMutation(api.flares.deleteFlare);

  const handleRecordFlare = async () => {
    if (!token || selectedSeverity === null) return;

    try {
      await recordFlare({
        token,
        flareDate: today,
        severity: selectedSeverity,
        notes: notes.trim() || undefined,
        triggers: triggers.trim() ? triggers.split(',').map(t => t.trim()) : undefined,
      });
      
      Alert.alert('Success', 'Flare recorded successfully');
      setShowRecordModal(false);
      setSelectedSeverity(null);
      setNotes('');
      setTriggers('');
    } catch (error) {
      console.error('Error recording flare:', error);
      Alert.alert('Error', 'Failed to record flare');
    }
  };

  const handleDeleteFlare = async (flareId: Id<'flares'>) => {
    if (!token) return;

    Alert.alert(
      'Delete Flare',
      'Are you sure you want to delete this flare record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting flare:', flareId);
              const result = await deleteFlare({ token, flareId });
              console.log('Delete flare result:', result);
              Alert.alert('Success', 'Flare deleted successfully');
            } catch (error) {
              console.error('Error deleting flare:', error);
              Alert.alert('Error', 'Failed to delete flare. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openRecordModal = (severity?: number) => {
    if (severity) setSelectedSeverity(severity);
    if (todayFlare) {
      setSelectedSeverity(todayFlare.severity);
      setNotes(todayFlare.notes || '');
      setTriggers(todayFlare.triggers?.join(', ') || '');
    }
    setShowRecordModal(true);
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
        <FlameIcon size={32} />
        <Text style={styles.headerTitle}>Flare Tracking</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Status */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Today's Status</Text>
          {todayFlare ? (
            <View style={styles.todayFlareCard}>
              <View style={styles.todayFlareHeader}>
                <Text style={styles.todayFlareTitle}>Flare Recorded</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openRecordModal()}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.severityDisplay}>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(todayFlare.severity) }
                ]}>
                  <Text style={styles.severityBadgeText}>{todayFlare.severity}</Text>
                </View>
                <Text style={styles.severityDescription}>
                  {getSeverityDescription(todayFlare.severity)}
                </Text>
              </View>
              {todayFlare.notes && (
                <Text style={styles.flareNotes}>"{todayFlare.notes}"</Text>
              )}
              {todayFlare.triggers && todayFlare.triggers.length > 0 && (
                <View style={styles.triggersContainer}>
                  <Text style={styles.triggersLabel}>Triggers:</Text>
                  <Text style={styles.triggersText}>{todayFlare.triggers.join(', ')}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noFlareCard}>
              <Text style={styles.noFlareText}>No flare recorded today</Text>
              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => openRecordModal()}
              >
                <Text style={styles.recordButtonText}>Record Flare</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Severity Scale */}
        <View style={styles.quickRecordSection}>
          <Text style={styles.sectionTitle}>Quick Record</Text>
          <Text style={styles.sectionDescription}>
            Tap a severity level to quickly record today's flare
          </Text>
          
          <View style={styles.severityGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.severityButton,
                  { backgroundColor: getSeverityColor(severity) },
                  todayFlare?.severity === severity && styles.severityButtonActive
                ]}
                onPress={() => openRecordModal(severity)}
              >
                <Text style={styles.severityButtonText}>{severity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Statistics */}
        {flareStats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>30-Day Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{flareStats.totalFlares}</Text>
                <Text style={styles.statLabel}>Total Flares</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{flareStats.averageSeverity}</Text>
                <Text style={styles.statLabel}>Avg Severity</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{flareStats.frequency}</Text>
                <Text style={styles.statLabel}>Per Week</Text>
              </View>
            </View>
            
            <View style={styles.distributionSection}>
              <Text style={styles.distributionTitle}>Severity Distribution</Text>
              <View style={styles.distributionBars}>
                <View style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>Mild (1-3)</Text>
                  <View style={styles.distributionBar}>
                    <View style={[
                      styles.distributionFill,
                      { 
                        width: `${(flareStats.severityDistribution.mild / Math.max(flareStats.totalFlares, 1)) * 100}%`,
                        backgroundColor: Colors.success
                      }
                    ]} />
                  </View>
                  <Text style={styles.distributionCount}>{flareStats.severityDistribution.mild}</Text>
                </View>
                <View style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>Moderate (4-6)</Text>
                  <View style={styles.distributionBar}>
                    <View style={[
                      styles.distributionFill,
                      { 
                        width: `${(flareStats.severityDistribution.moderate / Math.max(flareStats.totalFlares, 1)) * 100}%`,
                        backgroundColor: Colors.warning
                      }
                    ]} />
                  </View>
                  <Text style={styles.distributionCount}>{flareStats.severityDistribution.moderate}</Text>
                </View>
                <View style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>Severe (7-10)</Text>
                  <View style={styles.distributionBar}>
                    <View style={[
                      styles.distributionFill,
                      { 
                        width: `${(flareStats.severityDistribution.severe / Math.max(flareStats.totalFlares, 1)) * 100}%`,
                        backgroundColor: Colors.error
                      }
                    ]} />
                  </View>
                  <Text style={styles.distributionCount}>{flareStats.severityDistribution.severe}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recent History */}
        {recentFlares && recentFlares.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Recent History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(true)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {recentFlares.slice(0, 5).map((flare) => (
              <View key={flare._id} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>
                    {new Date(flare.flareDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={styles.historyContent}>
                  <View style={styles.historyMain}>
                    <View style={[
                      styles.historySeverityBadge,
                      { backgroundColor: getSeverityColor(flare.severity) }
                    ]}>
                      <Text style={styles.historySeverityText}>{flare.severity}</Text>
                    </View>
                    <Text style={styles.historyDescription}>
                      {getSeverityDescription(flare.severity)}
                    </Text>
                  </View>
                  {flare.notes && (
                    <Text style={styles.historyNotes}>"{flare.notes}"</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFlare(flare._id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Record Flare Modal */}
      <Modal visible={showRecordModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRecordModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {todayFlare ? 'Update Flare' : 'Record Flare'}
            </Text>
            <TouchableOpacity onPress={handleRecordFlare}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Severity Level</Text>
              <Text style={styles.modalSectionDescription}>
                Rate your inflammation from 1 (minimal) to 10 (severe)
              </Text>
              
              <View style={styles.modalSeverityGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.modalSeverityButton,
                      selectedSeverity === severity && styles.modalSeverityButtonSelected,
                      { backgroundColor: getSeverityColor(severity) }
                    ]}
                    onPress={() => setSelectedSeverity(severity)}
                  >
                    <Text style={[
                      styles.modalSeverityButtonText,
                      selectedSeverity === severity && styles.modalSeverityButtonTextSelected
                    ]}>
                      {severity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedSeverity && (
                <View style={styles.modalSeverityDescription}>
                  <Text style={styles.modalSeverityDescriptionText}>
                    {getSeverityDescription(selectedSeverity)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Notes (Optional)</Text>
              <Text style={styles.modalSectionDescription}>
                Describe your symptoms, feelings, or any additional context
              </Text>
              <TextInput
                style={styles.modalTextArea}
                value={notes}
                onChangeText={setNotes}
                placeholder="How are you feeling? What symptoms are you experiencing?"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Potential Triggers (Optional)</Text>
              <Text style={styles.modalSectionDescription}>
                List potential triggers separated by commas (e.g., stress, lack of sleep, certain foods)
              </Text>
              <TextInput
                style={styles.modalTextInput}
                value={triggers}
                onChangeText={setTriggers}
                placeholder="stress, processed food, lack of sleep"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* History Modal */}
      <Modal visible={showHistoryModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Flare History</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {recentFlares && recentFlares.length > 0 ? (
              recentFlares.map((flare) => (
                <View key={flare._id} style={styles.historyModalItem}>
                  <View style={styles.historyModalHeader}>
                    <Text style={styles.historyModalDate}>
                      {new Date(flare.flareDate).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    <TouchableOpacity
                      style={styles.historyModalDelete}
                      onPress={() => handleDeleteFlare(flare._id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.historyModalDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.historyModalContent}>
                    <View style={styles.historyModalSeverity}>
                      <View style={[
                        styles.historySeverityBadge,
                        { backgroundColor: getSeverityColor(flare.severity) }
                      ]}>
                        <Text style={styles.historySeverityText}>{flare.severity}</Text>
                      </View>
                      <Text style={styles.historyDescription}>
                        {getSeverityDescription(flare.severity)}
                      </Text>
                    </View>
                    
                    {flare.notes && (
                      <Text style={styles.historyModalNotes}>"{flare.notes}"</Text>
                    )}
                    
                    {flare.triggers && flare.triggers.length > 0 && (
                      <View style={styles.historyModalTriggers}>
                        <Text style={styles.historyModalTriggersLabel}>Triggers:</Text>
                        <Text style={styles.historyModalTriggersText}>
                          {flare.triggers.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <FlameIcon size={60} />
                <Text style={styles.emptyStateTitle}>No Flares Recorded</Text>
                <Text style={styles.emptyStateDescription}>
                  Start tracking your inflammatory flares to identify patterns and triggers.
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function getSeverityColor(severity: number): string {
  if (severity <= 3) return Colors.success;
  if (severity <= 6) return Colors.warning;
  return Colors.error;
}

function getSeverityDescription(severity: number): string {
  if (severity <= 2) return "Minimal inflammation - feeling great!";
  if (severity <= 4) return "Mild inflammation - some discomfort but manageable";
  if (severity <= 6) return "Moderate inflammation - noticeable symptoms";
  if (severity <= 8) return "Significant inflammation - affecting daily activities";
  return "Severe inflammation - seeking medical attention recommended";
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
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  
  // Today's Status
  todaySection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  todayFlareCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayFlareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayFlareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.accent,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  severityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  severityBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  severityDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  flareNotes: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  triggersContainer: {
    marginTop: 8,
  },
  triggersLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  triggersText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  noFlareCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  noFlareText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  recordButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  recordButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Quick Record
  quickRecordSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  severityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  severityButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityButtonActive: {
    borderWidth: 3,
    borderColor: Colors.text.primary,
  },
  severityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },

  // Statistics
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  distributionSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  distributionBars: {
    gap: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    width: 80,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    width: 20,
    textAlign: 'right',
  },

  // History
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  historyDate: {
    width: 60,
    alignItems: 'center',
  },
  historyDateText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  historyContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  historyMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  historySeverityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySeverityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  historyDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  historyNotes: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'center',
  },

  // Modal styles
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
  modalHeaderSpacer: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalSectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  modalSeverityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  modalSeverityButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSeverityButtonSelected: {
    borderWidth: 3,
    borderColor: Colors.text.primary,
  },
  modalSeverityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  modalSeverityButtonTextSelected: {
    color: Colors.text.primary,
  },
  modalSeverityDescription: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  modalSeverityDescriptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
    minHeight: 100,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },

  // History Modal
  historyModalItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyModalDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  historyModalDelete: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  historyModalDeleteText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  historyModalContent: {
    gap: 8,
  },
  historyModalSeverity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyModalNotes: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    paddingLeft: 36,
  },
  historyModalTriggers: {
    paddingLeft: 36,
  },
  historyModalTriggersLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  historyModalTriggersText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Empty State
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
});