// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ABTestingService from '../services/ABTestingService';
import AnalyticsService from '../services/AnalyticsService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: { username: string };
  Profile: { username: string };
  Following: { username: string };
  Notifications: { username: string };
  Dashboard: undefined;
};

type NavbarProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  username: string;
};

export default function Navbar({ navigation, username }: NavbarProps) {
  const variant = ABTestingService.getUserVariant();
  const insets = useSafeAreaInsets();

  const handleNavigation = (screen: keyof RootStackParamList) => {
    AnalyticsService.logButtonClick(`Nav_${screen}`, 'Navbar');

    if (screen === 'Notifications' && variant !== 'B') {
      AnalyticsService.logButtonClick('Notifications_Blocked', 'Navbar');
      Alert.alert(
        'Acesso Restrito',
        'Esta funcionalidade está disponível apenas para alguns usuários durante o teste.'
      );
      return;
    }

    if (screen === 'Dashboard') {
      navigation.navigate('Dashboard');
    } else {
      navigation.navigate(screen, { username });
    }
  };

  const navItems: { screen: keyof RootStackParamList; label: string; icon: string }[] = [
    { screen: 'Home', label: 'Home', icon: 'home' },
    { screen: 'Profile', label: 'Perfil', icon: 'user' },
    { screen: 'Following', label: 'Seguindo', icon: 'users' },
    { screen: 'Dashboard', label: 'Dashboard', icon: 'dashboard' },
  ];

  if (variant === 'B') {
    navItems.push({ screen: 'Notifications', label: 'Notificações', icon: 'bell' });
  }

  const [activeScreen, setActiveScreen] = useState<keyof RootStackParamList>('Home');

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState();
      if (state?.routes && state.routes[state.index]) {
        const currentRoute = state.routes[state.index].name as keyof RootStackParamList;
        setActiveScreen(currentRoute);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleNavPress = (screen: keyof RootStackParamList) => {
    setActiveScreen(screen);
    handleNavigation(screen);
  };

  return (
    <View 
      style={[
        tw`flex-row justify-around items-center py-2 border-t border-gray-200 bg-white`,
        { paddingBottom: Math.max(insets.bottom, 8) }
      ]}
    >
      {navItems.map((item) => {
        const isActive = activeScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={tw`items-center flex-1`}
            onPress={() => handleNavPress(item.screen)}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={item.icon}
              size={22}
              color={isActive ? '#1DA1F2' : '#657786'}
            />
            <Text 
              style={tw`text-xs mt-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
