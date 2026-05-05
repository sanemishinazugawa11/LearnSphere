import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/api/client';
import { Theme } from '../../src/theme/color'; 

const CATEGORIES = ["All", "Personal Finance", "Ancient Indian History", "Logic & Critical Thinking", "Psychology & Human Behavior", "Business & Entrepreneurship", "Data Science & Technology", "Creative Arts & Design", "Health & Wellness", "Digital Marketing", "Language & Communication"];

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 300); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (searchQuery.trim() !== '') params.search = searchQuery;

      const { data } = await api.get('/courses', { params });
      setCourses(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/(auth)/login');
  };

  const renderCourseCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => router.push(`/course/${item.id}`)}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center' }]} />
      )}
      <View style={styles.cardContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 40) }]}>
        <View>
          <Text style={styles.headerTitle}>Course Catalog</Text>
          <Text style={styles.headerSubtitle}>Explore paths and master new skills.</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color={Theme.colors.subtext} size={18} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor={Theme.colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setActiveCategory(cat)}
              style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
            >
              <Text style={[styles.categoryBtnText, activeCategory === cat && styles.categoryBtnTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Theme.colors.primary} size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourseCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontFamily: 'Raleway_900Black', fontSize: 32, color: Theme.colors.text, letterSpacing: -1 },
  headerSubtitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: Theme.colors.subtext, marginTop: 4 },
  logoutBtn: { backgroundColor: Theme.colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: Theme.colors.border },
  logoutText: { fontFamily: 'Manrope_700Bold', color: Theme.colors.text, fontSize: 12 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.card, marginHorizontal: 20, borderRadius: 8, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: Theme.colors.border },
  searchIcon: { marginRight: 10 },
  searchInput: { fontFamily: 'Manrope_500Medium', flex: 1, color: Theme.colors.text, paddingVertical: 12, fontSize: 14 },
  
  categoryScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 20 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: Theme.colors.card, borderWidth: 1, borderColor: Theme.colors.border },
  categoryBtnActive: { backgroundColor: Theme.colors.text, borderColor: Theme.colors.text },
  categoryBtnText: { fontFamily: 'Manrope_700Bold', color: Theme.colors.subtext, fontSize: 13 },
  categoryBtnTextActive: { color: Theme.colors.card },

  listContent: { padding: 20, paddingBottom: 100, gap: 16 },
  card: { backgroundColor: Theme.colors.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Theme.colors.border },
  cardImage: { width: '100%', height: 160, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  cardContent: { padding: 20 },
  categoryBadge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 12 },
  categoryText: { fontFamily: 'Manrope_800ExtraBold', color: Theme.colors.subtext, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontFamily: 'Raleway_800ExtraBold', color: Theme.colors.text, fontSize: 20, letterSpacing: -0.5, marginBottom: 8, lineHeight: 24 },
  description: { fontFamily: 'Manrope_500Medium', color: Theme.colors.subtext, fontSize: 14, lineHeight: 22 },
});