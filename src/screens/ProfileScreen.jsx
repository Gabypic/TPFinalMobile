import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir les deux champs.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      Alert.alert('Succès', 'Votre mot de passe a bien été mis à jour.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* En-tête Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.title}>Mon Profil</Text>
        </View>

        {/* Informations utilisateur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du compte</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.infoIcon} />
              <View>
                <Text style={styles.label}>Email connecté</Text>
                <Text style={styles.value}>{user?.email || 'Non connecté'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Changement de mot de passe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 caractères"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmer"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginLeft: 5,
  },
  infoCard: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  infoIcon: {
    marginRight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 5,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
