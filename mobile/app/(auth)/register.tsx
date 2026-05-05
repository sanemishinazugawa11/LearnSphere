import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import api from '../../src/api/client';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, GraduationCap, Presentation } from 'lucide-react-native';
import { Theme } from '../../src/theme/color';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || password.length < 6) {
      alert("Please fill all fields (password min 6 chars)");
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, role });
      alert("Account created! Please sign in.");
      router.replace('/(auth)/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Registration failed";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.logo}>Create an account</Text>
            <Text style={styles.subtitle}>Start your journey on LearnSphere.</Text>
          </View>
          
          <View style={styles.form}>
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
                onPress={() => setRole('student')}
                activeOpacity={0.8}
              >
                <GraduationCap size={20} color={role === 'student' ? Theme.colors.card : Theme.colors.subtext} />
                <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'instructor' && styles.roleBtnActive]}
                onPress={() => setRole('instructor')}
                activeOpacity={0.8}
              >
                <Presentation size={20} color={role === 'instructor' ? Theme.colors.card : Theme.colors.subtext} />
                <Text style={[styles.roleText, role === 'instructor' && styles.roleTextActive]}>Instructor</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} placeholderTextColor={Theme.colors.subtext}
              onChangeText={setName}
            />
            
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} placeholderTextColor={Theme.colors.subtext}
              onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
            />
            
            <Text style={styles.label}>Password (Min 6 chars)</Text>
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
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Signing up...' : 'Sign up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.linkContainer}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkHighlight}>Sign in</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  card: { backgroundColor: Theme.colors.card, padding: 30, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.border },
  header: { marginBottom: 30 },
  logo: { fontFamily: 'Raleway_900Black', fontSize: 24, color: Theme.colors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: Theme.colors.subtext, marginTop: 4 },
  form: { gap: 12 },
  label: { fontFamily: 'Manrope_700Bold', color: Theme.colors.text, fontSize: 12, marginBottom: -4 },
  input: { fontFamily: 'Manrope_500Medium', backgroundColor: Theme.colors.card, padding: 16, borderRadius: 8, color: Theme.colors.text, fontSize: 16, borderWidth: 1, borderColor: Theme.colors.border },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.card, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border },
  passwordInput: { fontFamily: 'Manrope_500Medium', flex: 1, padding: 16, color: Theme.colors.text, fontSize: 16 },
  eyeIcon: { padding: 16 },
  roleContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center', backgroundColor: Theme.colors.card, gap: 4 },
  roleBtnActive: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primary },
  roleText: { fontFamily: 'Manrope_700Bold', color: Theme.colors.subtext, fontSize: 12 },
  roleTextActive: { color: Theme.colors.card },
  button: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { fontFamily: 'Manrope_700Bold', color: Theme.colors.card, fontSize: 16 },
  linkContainer: { marginTop: 10, alignItems: 'center', padding: 10 },
  linkText: { fontFamily: 'Manrope_600SemiBold', color: Theme.colors.subtext, fontSize: 14 },
  linkHighlight: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.text }
});