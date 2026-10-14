import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { BookmarkProvider } from '../context/BookmarkContext';
import { AuthProvider } from '../context/AuthContext';
import { ReadingProvider } from '../context/ReadingContext';
import { NotificationProvider } from '../context/NotificationContext';

// Prevent splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BookmarkProvider>
          <ReadingProvider>
            <NotificationProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade_from_bottom',
                  contentStyle: { backgroundColor: '#FFFFFF' },
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="article/[id]"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="category/[slug]"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="search"
                  options={{
                    headerShown: false,
                    animation: 'fade',
                  }}
                />
                <Stack.Screen
                  name="notifications"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="history"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="settings"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="premium"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="auth/signin"
                  options={{
                    headerShown: false,
                    animation: 'fade',
                    gestureEnabled: false,
                  }}
                />
                <Stack.Screen
                  name="auth/signup"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="auth/forgot-password"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
              </Stack>
            </NotificationProvider>
          </ReadingProvider>
        </BookmarkProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
