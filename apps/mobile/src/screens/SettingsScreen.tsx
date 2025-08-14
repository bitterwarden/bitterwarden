import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useVault } from '../contexts/VaultContext';

export function SettingsScreen() {
  const { vault } = useVault();
  const [autoSync, setAutoSync] = useState(false);
  const [biometricUnlock, setBiometricUnlock] = useState(true);

  function handleGitHubConnect() {
    Alert.alert(
      'Connect GitHub',
      'This will open GitHub to authorize Bitterwarden to access your private repositories.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log('Open GitHub OAuth') },
      ]
    );
  }

  function handleExport() {
    Alert.alert(
      'Export Vault',
      'This will export your vault data. Make sure to keep the export file secure.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Export vault') },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleGitHubConnect}>
          <View>
            <Text style={styles.optionTitle}>Connect GitHub</Text>
            <Text style={styles.optionDescription}>
              Sync your vault with a private GitHub repository
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.option}>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Auto Sync</Text>
            <Text style={styles.optionDescription}>
              Automatically sync changes in the background
            </Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: '#333', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.option}>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Biometric Unlock</Text>
            <Text style={styles.optionDescription}>
              Use Face ID or Touch ID to unlock vault
            </Text>
          </View>
          <Switch
            value={biometricUnlock}
            onValueChange={setBiometricUnlock}
            trackColor={{ false: '#333', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity style={styles.option}>
          <View>
            <Text style={styles.optionTitle}>Change Master Password</Text>
            <Text style={styles.optionDescription}>
              Update your vault master password
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleExport}>
          <View>
            <Text style={styles.optionTitle}>Export Vault</Text>
            <Text style={styles.optionDescription}>
              Export your vault data for backup
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <View>
            <Text style={styles.optionTitle}>Import Data</Text>
            <Text style={styles.optionDescription}>
              Import passwords from another manager
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.version}>Version 0.0.1</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  optionText: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
  },
  version: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 8,
  },
});