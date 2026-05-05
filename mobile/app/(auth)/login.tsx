import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../src/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { Theme } from '../../src/theme/color';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to connect to server";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.logo}>Sign in</Text>
          <Text style={styles.subtitle}>to continue to LearnSphere</Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input} 
            placeholderTextColor={Theme.colors.subtext}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholderTextColor={Theme.colors.subtext}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? <EyeOff color={Theme.colors.subtext} size={20} /> : <Eye color={Theme.colors.subtext} size={20} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Continuing...' : 'Continue'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkContainer}>
            <Text style={styles.linkText}>No account? <Text style={styles.linkHighlight}>Sign up</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 20, justifyContent: 'center' },
  card: { backgroundColor: Theme.colors.card, padding: 30, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.border },
  header: { marginBottom: 30 },
  logo: { fontFamily: 'Raleway_900Black', fontSize: 28, color: Theme.colors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: Theme.colors.subtext, marginTop: 4 },
  form: { gap: 12 },
  label: { fontFamily: 'Manrope_700Bold', color: Theme.colors.text, fontSize: 12, marginBottom: -4 },
  input: { fontFamily: 'Manrope_500Medium', backgroundColor: Theme.colors.card, padding: 16, borderRadius: 8, color: Theme.colors.text, fontSize: 16, borderWidth: 1, borderColor: Theme.colors.border },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.card, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border },
  passwordInput: { fontFamily: 'Manrope_500Medium', flex: 1, padding: 16, color: Theme.colors.text, fontSize: 16 },
  eyeIcon: { padding: 16 },
  button: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { fontFamily: 'Manrope_700Bold', color: Theme.colors.card, fontSize: 16 },
  linkContainer: { marginTop: 15, alignItems: 'center', padding: 10 },
  linkText: { fontFamily: 'Manrope_600SemiBold', color: Theme.colors.subtext, fontSize: 14 },
  linkHighlight: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text }
});