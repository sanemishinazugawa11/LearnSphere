import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { BookOpen, PenTool } from 'lucide-react-native';
import { Theme } from '../../src/theme/color';
import api from '../../src/api/client';
import { ActivityIndicator, View } from 'react-native';

export default function TabsLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data } = await api.get('/me');
        setRole(data.role);
      } catch (error) {
        console.log("Failed to fetch role");
      } finally {
        setIsLoading(false);
      }
    };
    checkUserRole();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: Theme.colors.card, 
          borderTopWidth: 1,
          borderTopColor: Theme.colors.border,
          paddingBottom: 5,
          height: 60,
          elevation: 0, 
          shadowOpacity: 0, 
        },
        tabBarLabelStyle: {
          fontFamily: 'Manrope_700Bold',
          fontSize: 10,
        },
        tabBarActiveTintColor: Theme.colors.text, 
        tabBarInactiveTintColor: Theme.colors.subtext,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Catalog', 
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="studio" 
        options={{ 
          title: 'Studio',
          href: role === 'instructor' ? '/studio' : null,
          tabBarIcon: ({ color }) => <PenTool color={color} size={24} /> 
        }} 
      />
    </Tabs>
  );
}