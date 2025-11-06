// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
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
        'Esta funcionalidade está disponível apenas para alguns usuários durante o teste.',
        [
          {
            text: 'Entendi',
            style: 'default'
          }
        ]
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
    { screen: 'Home', label: 'Início', icon: 'home' },
    { screen: 'Profile', label: 'Perfil', icon: 'person' },
    { screen: 'Following', label: 'Seguindo', icon: 'people' },
    { screen: 'Dashboard', label: 'Analytics', icon: 'analytics' },
  ];

  if (variant === 'B') {
    navItems.push({ screen: 'Notifications', label: 'Notificações', icon: 'notifications' });
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
        tw`flex-row justify-around items-center py-3 border-t border-white border-opacity-10 bg-[#0F172A]`,
        { paddingBottom: Math.max(insets.bottom, 12) }
      ]}
    >
      {navItems.map((item) => {
        const isActive = activeScreen === item.screen;
        const isNotifications = item.screen === 'Notifications';
        
        return (
          <TouchableOpacity
            key={item.screen}
            style={tw`items-center flex-1`}
            onPress={() => handleNavPress(item.screen)}
            activeOpacity={0.7}
          >
            <View style={tw`relative`}>
              <View style={[
                tw`p-2 rounded-full mb-1`,
                isActive 
                  ? 'bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-30' 
                  : 'bg-transparent'
              ]}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={isActive ? '#60A5FA' : '#6B7280'}
                />
              </View>
              
              {/* Badge para Notificações (se for variante B) */}
              {isNotifications && variant === 'B' && (
                <View style={tw`absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-[#0F172A]`} />
              )}
            </View>
            
            <Text 
              style={[
                tw`text-xs font-medium`,
                isActive ? tw`text-blue-400` : tw`text-gray-400`
              ]}
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