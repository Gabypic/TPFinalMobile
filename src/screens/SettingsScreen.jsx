import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [sensorId, setSensorId] = useState('');
  const [sensorPwd, setSensorPwd] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Charger les identifiants au démarrage de l'écran
    const loadSensorCredentials = async () => {
      try {
        const storedId = await AsyncStorage.getItem('@sensor_id');
        const storedPwd = await AsyncStorage.getItem('@sensor_pwd');
        if (storedId) setSensorId(storedId);
        if (storedPwd) setSensorPwd(storedPwd);
      } catch (error) {
        console.error("Erreur de chargement des identifiants", error);
      }
    };
    loadSensorCredentials();
  }, []);

  const handleSaveSensor = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('@sensor_id', sensorId);
      await AsyncStorage.setItem('@sensor_pwd', sensorPwd);
      Alert.alert('Succès', 'Les informations du capteur ont été enregistrées.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les informations.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Paramètres</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration du Capteur</Text>
          <Text style={styles.sectionSubtitle}>Saisissez l'ID et le mot de passe du capteur pour recevoir ses données.</Text>

          <TextInput
            style={styles.input}
            placeholder="ID du capteur (ex: SENSOR_01)"
            value={sensorId}
            onChangeText={setSensorId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe du capteur"
            value={sensorPwd}
            onChangeText={setSensorPwd}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveSensor}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>{isSaving ? 'Enregistrement...' : 'Enregistrer le Capteur'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 20,
    color: '#333'
  },
  section: {
    marginBottom: 40,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
