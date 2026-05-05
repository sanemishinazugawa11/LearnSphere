import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../src/theme/color';
import { BookOpen, Zap, Shield, ArrowRight } from 'lucide-react-native';

export default function Landing() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Top Logo Area */}
      <View style={styles.header}>
        <View style={styles.logoSquare}>
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.logoText}>LearnSphere.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>LearnSphere 2.0 Mobile</Text>
          </View>
          <Text style={styles.heroTitle}>Rapid learning,</Text>
          <Text style={styles.heroTitleHighlight}>engineered for scale.</Text>
          <Text style={styles.heroSubtitle}>
            A high-performance platform connecting experts with lifelong learners.
          </Text>
        </View>

        {/* Feature Grid */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <BookOpen size={20} color={Theme.colors.text} strokeWidth={2} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Curated Paths</Text>
              <Text style={styles.featureDesc}>Expert-crafted markdown courses.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Zap size={20} color={Theme.colors.text} strokeWidth={2} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Active Recall</Text>
              <Text style={styles.featureDesc}>Built-in interactive knowledge checks.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Shield size={20} color={Theme.colors.text} strokeWidth={2} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Role-Based Access</Text>
              <Text style={styles.featureDesc}>Strict separation of students and instructors.</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.actionArea}>
        <TouchableOpacity 
          style={styles.primaryBtn} 
          activeOpacity={0.9}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <ArrowRight size={18} color={Theme.colors.background} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryBtn} 
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Theme.colors.background 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingHorizontal: 24, 
    paddingTop: 20,
    marginBottom: 20
  },
  logoSquare: { 
    width: 24, 
    height: 24, 
    backgroundColor: Theme.colors.text, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  logoDot: { 
    width: 6, 
    height: 6, 
    backgroundColor: Theme.colors.accent, 
    borderRadius: 3 
  },
  logoText: { 
    fontFamily: 'Raleway_900Black',
    fontSize: 20, 
    color: Theme.colors.text, 
    letterSpacing: -0.5 
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 40 
  },
  heroSection: { 
    marginTop: 20, 
    marginBottom: 40 
  },
  badge: { 
    alignSelf: 'flex-start', 
    borderWidth: 1, 
    borderColor: Theme.colors.border, 
    backgroundColor: Theme.colors.card, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 100, 
    marginBottom: 20 
  },
  badgeText: { 
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 12, 
    color: Theme.colors.subtext 
  },
  heroTitle: { 
    fontFamily: 'Raleway_900Black',
    fontSize: 48, 
    color: Theme.colors.text, 
    letterSpacing: -2, 
    lineHeight: 52 
  },
  heroTitleHighlight: { 
    fontFamily: 'Raleway_900Black',
    fontSize: 48, 
    color: Theme.colors.accent, 
    letterSpacing: -2, 
    lineHeight: 52, 
    marginBottom: 16 
  },
  heroSubtitle: { 
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16, 
    color: Theme.colors.subtext, 
    lineHeight: 24 
  },
  featuresContainer: { 
    gap: 16 
  },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 16, 
    backgroundColor: Theme.colors.card, 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: Theme.colors.border 
  },
  featureIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: Theme.colors.background, 
    borderWidth: 1, 
    borderColor: Theme.colors.border, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  featureTextContainer: { 
    flex: 1 
  },
  featureTitle: { 
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16, 
    color: Theme.colors.text, 
    marginBottom: 4, 
    letterSpacing: -0.5 
  },
  featureDesc: { 
    fontFamily: 'Manrope_500Medium',
    fontSize: 14, 
    color: Theme.colors.subtext, 
    lineHeight: 20 
  },
  actionArea: { 
    paddingHorizontal: 24, 
    paddingTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: Theme.colors.border, 
    backgroundColor: Theme.colors.background 
  },
  primaryBtn: { 
    flexDirection: 'row', 
    backgroundColor: Theme.colors.text, 
    paddingVertical: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    marginBottom: 12 
  },
  primaryBtnText: { 
    fontFamily: 'Manrope_800ExtraBold',
    color: Theme.colors.background, 
    fontSize: 16
  },
  secondaryBtn: { 
    paddingVertical: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: Theme.colors.border, 
    backgroundColor: Theme.colors.card 
  },
  secondaryBtnText: { 
    fontFamily: 'Manrope_800ExtraBold',
    color: Theme.colors.text, 
    fontSize: 14
  }
});