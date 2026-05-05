import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

// Import the exact weights we need
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Raleway_400Regular, Raleway_700Bold, Raleway_800ExtraBold, Raleway_900Black } from '@expo-google-fonts/raleway';

// Keep the splash screen visible while fetching resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Load the fonts into memory
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Raleway_400Regular,
    Raleway_700Bold,
    Raleway_800ExtraBold,
    Raleway_900Black,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Hide splash screen once fonts are ready
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  // Prevent rendering until fonts and auth are checked
  if (isAuthenticated === null || (!fontsLoaded && !fontError)) {
    return null; 
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fafafa' } }}>
        <Stack.Screen name="(auth)" options={{ redirect: isAuthenticated }} />
        <Stack.Screen name="(tabs)" options={{ redirect: !isAuthenticated }} />
      </Stack>
    </SafeAreaProvider>
  );
}