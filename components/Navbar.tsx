// components/Navbar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { FontAwesome } from '@expo/vector-icons';
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

  return (
    <View style={tw`flex-row justify-between items-center p-2 border-t border-gray-200 bg-white`}>
      {/* Nome do app à esquerda */}
      <TouchableOpacity onPress={() => handleNavigation('Home')}>
        <Text style={tw`text-2xl font-bold text-blue-500`}>The Y</Text>
      </TouchableOpacity>

      {/* Ícones + labels à direita */}
      <View style={tw`flex-row items-center`}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={tw`items-center mx-2`}
            onPress={() => handleNavigation(item.screen)}
          >
            <FontAwesome
              name={item.icon}
              size={24}
              color={item.screen === 'Dashboard' ? 'purple' : 'blue'}
            />
            <Text style={tw`text-xs mt-1 ${item.screen === 'Dashboard' ? 'text-purple-500' : 'text-blue-500'}`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Perfil do usuário */}
        <TouchableOpacity
          style={tw`items-center ml-2`}
          onPress={() => handleNavigation('Profile')}
        >
          <Text style={tw`text-blue-500 font-bold text-xs`}>{username}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
