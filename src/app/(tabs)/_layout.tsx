import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Home, Compass, Bookmark, User } from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="small" color={COLORS.black} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/signin" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.black,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: COLORS.border,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.sansMedium,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Home
              size={22}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <Compass
              size={22}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size, focused }) => (
            <Bookmark
              size={22}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
              fill={focused ? color : 'none'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <User
              size={22}
              color={color}
              strokeWidth={focused ? 2.4 : 1.8}
            />
          ),
        }}
      />
    </Tabs>
  );
}
