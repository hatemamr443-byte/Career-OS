import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!formData.email || !formData.password) { Alert.alert('Error', 'Please fill in required fields'); return; }
    if (formData.password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      await register(formData);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Registration failed');
    } finally { setIsLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Career OS</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <TextInput style={styles.input} placeholder="First Name" value={formData.first_name} onChangeText={(t) => setFormData({...formData, first_name: t})} />
        <TextInput style={styles.input} placeholder="Last Name" value={formData.last_name} onChangeText={(t) => setFormData({...formData, last_name: t})} />
        <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password (min 8 chars)" value={formData.password} onChangeText={(t) => setFormData({...formData, password: t})} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eff6ff', padding: 20 },
  card: { backgroundColor: '#fff', padding: 30, borderRadius: 16, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1d4ed8', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
