// screens/NotificationsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AnalyticsService from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import { useRenderTime } from '../hooks/useRenderTime';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

// Tipagem das rotas
type RootStackParamList = {
  Notifications: { username: string };
  // ...adicione outras rotas se necessário
};

// Tipagem das props
type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
type NotificationsScreenRouteProp = RouteProp<RootStackParamList, 'Notifications'>;

type Props = {
  navigation: NotificationsScreenNavigationProp;
  route: NotificationsScreenRouteProp;
};

// Tipagem das notificações
type Notification = {
  id: string;
  type: 'like' | 'retweet' | 'mention' | 'follow' | string;
  username: string;
  text: string;
  targetTweet?: string;
  time: string;
  read: boolean;
  userAvatar?: string;
};

export default function NotificationsScreen({ route, navigation }: Props) {
  const { username } = route.params;
  const variant = ABTestingService.getUserVariant();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'likes' | 'follows'>('all');

  useRenderTime('NotificationsScreen');

  useEffect(() => {
    AnalyticsService.logScreenView('NotificationsScreen', variant);

    // Mock data for notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'like',
        username: 'Alice',
        text: 'curtiu seu tweet',
        targetTweet: 'Hello world! Welcome to The Y! Building amazing products with React Native 🚀',
        time: '5 min',
        read: false,
        userAvatar: 'https://i.pravatar.cc/50?u=alice'
      },
      {
        id: '2',
        type: 'retweet',
        username: 'Bob',
        text: 'retweetou seu tweet',
        targetTweet: 'Loving this new app! The dark theme looks absolutely stunning.',
        time: '15 min',
        read: false,
        userAvatar: 'https://i.pravatar.cc/50?u=bob'
      },
      {
        id: '3',
        type: 'mention',
        username: 'Charlie',
        text: 'mencionou você em um tweet',
        targetTweet: `Ótima conversa com @${username} hoje sobre desenvolvimento mobile!`,
        time: '1 h',
        read: true,
        userAvatar: 'https://i.pravatar.cc/50?u=charlie'
      },
      {
        id: '4',
        type: 'follow',
        username: 'Diana',
        text: 'começou a seguir você',
        time: '2 h',
        read: true,
        userAvatar: 'https://i.pravatar.cc/50?u=diana'
      },
      {
        id: '5',
        type: 'like',
        username: 'Eve',
        text: 'curtiu seu tweet',
        targetTweet: 'Novo recurso de notificações está incrível!',
        time: '3 h',
        read: true,
        userAvatar: 'https://i.pravatar.cc/50?u=eve'
      },
      {
        id: '6',
        type: 'follow',
        username: 'TechNews',
        text: 'começou a seguir você',
        time: '4 h',
        read: true,
        userAvatar: 'https://i.pravatar.cc/50?u=technews'
      }
    ];
    setNotifications(mockNotifications);
  }, [variant, username]);

  const handleNotificationPress = (notificationId: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
    AnalyticsService.logButtonClick('NotificationOpen', 'NotificationsScreen');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    AnalyticsService.logButtonClick('MarkAllAsRead', 'NotificationsScreen');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': 
        return <Ionicons name="heart" size={20} color="#EF4444" />;
      case 'retweet': 
        return <Ionicons name="repeat" size={20} color="#10B981" />;
      case 'mention': 
        return <Ionicons name="at" size={20} color="#3B82F6" />;
      case 'follow': 
        return <Ionicons name="person-add" size={20} color="#8B5CF6" />;
      default: 
        return <Ionicons name="notifications" size={20} color="#6B7280" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-red-500 bg-opacity-20 border-red-500';
      case 'retweet': return 'bg-green-500 bg-opacity-20 border-green-500';
      case 'mention': return 'bg-blue-500 bg-opacity-20 border-blue-500';
      case 'follow': return 'bg-purple-500 bg-opacity-20 border-purple-500';
      default: return 'bg-gray-500 bg-opacity-20 border-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mentions') return notif.type === 'mention';
    if (activeTab === 'likes') return notif.type === 'like';
    if (activeTab === 'follows') return notif.type === 'follow';
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Tipagem explícita do NotificationCard
  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <TouchableOpacity
      style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-3 ${
        !notification.read ? 'border-l-4 border-l-blue-500' : ''
      }`}
      onPress={() => handleNotificationPress(notification.id)}
    >
      <View style={tw`flex-row items-start gap-3`}>
        <View style={tw`relative`}>
          <Image
            source={{ uri: notification.userAvatar || `https://i.pravatar.cc/50?u=${notification.username}` }}
            style={tw`w-12 h-12 rounded-full border-2 border-gray-600`}
          />
          <View style={tw`absolute -bottom-1 -right-1 bg-[#0F172A] rounded-full p-1`}>
            <View style={tw`p-1 rounded-full ${getNotificationColor(notification.type)}`}>
              {getNotificationIcon(notification.type)}
            </View>
          </View>
        </View>
        
        <View style={tw`flex-1`}>
          <View style={tw`flex-row justify-between items-start mb-1`}>
            <Text style={tw`text-white font-bold text-base`}>{notification.username}</Text>
            <Text style={tw`text-gray-400 text-xs`}>{notification.time}</Text>
          </View>
          
          <Text style={tw`text-gray-300 text-sm mb-2`}>{notification.text}</Text>
          
          {notification.targetTweet && (
            <View style={tw`bg-white bg-opacity-5 p-3 rounded-lg border border-white border-opacity-5`}>
              <Text style={tw`text-gray-400 text-sm italic`}>"{notification.targetTweet}"</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const StatsCard = () => (
    <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-4`}>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>{notifications.length}</Text>
          <Text style={tw`text-gray-400 text-sm`}>Total</Text>
        </View>
        <View style={tw`h-8 w-px bg-gray-600`} />
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>{unreadCount}</Text>
          <Text style={tw`text-gray-400 text-sm`}>Não lidas</Text>
        </View>
        <View style={tw`h-8 w-px bg-gray-600`} />
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>
            {notifications.filter(n => n.type === 'like').length}
          </Text>
          <Text style={tw`text-gray-400 text-sm`}>Curtidas</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-[#0F172A]`}>
      {/* Header */}
      <View style={tw`bg-white bg-opacity-5 px-4 py-3 border-b border-white border-opacity-10`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View>
            <Text style={tw`text-white text-xl font-bold`}>Notificações</Text>
            <Text style={tw`text-gray-400 text-sm`}>
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={tw`bg-blue-500 bg-opacity-20 px-4 py-2 rounded-full border border-blue-500 border-opacity-30`}
            onPress={handleMarkAllAsRead}
          >
            <Text style={tw`text-blue-400 text-sm font-medium`}>Marcar todas</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={tw`flex-row gap-2`}>
            {([
              { key: 'all', label: 'Todas', icon: 'notifications' },
              { key: 'mentions', label: 'Menções', icon: 'at' },
              { key: 'likes', label: 'Curtidas', icon: 'heart' },
              { key: 'follows', label: 'Seguidores', icon: 'person-add' }
            ] as const).map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={tw`px-4 py-2 rounded-full flex-row items-center ${
                  activeTab === tab.key 
                    ? 'bg-blue-500 bg-opacity-30 border border-blue-500 border-opacity-50' 
                    : 'bg-white bg-opacity-5 border border-white border-opacity-10'
                }`}
                onPress={() => {
                  setActiveTab(tab.key);
                  AnalyticsService.logButtonClick(`Tab_${tab.key}`, 'NotificationsScreen');
                }}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={16} 
                  color={activeTab === tab.key ? '#60A5FA' : '#9CA3AF'} 
                  style={tw`mr-2`}
                />
                <Text style={tw`text-sm font-medium ${
                  activeTab === tab.key ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        style={tw`p-4`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<StatsCard />}
        ListEmptyComponent={
          <View style={tw`items-center justify-center py-12`}>
            <Ionicons name="notifications-off" size={64} color="#4B5563" />
            <Text style={tw`text-gray-400 text-lg font-medium mt-4`}>
              Nenhuma notificação
            </Text>
            <Text style={tw`text-gray-500 text-center mt-2 px-8`}>
              {activeTab === 'all' 
                ? 'Você está em dia com todas as notificações!' 
                : `Nenhuma notificação do tipo ${activeTab}`
              }
            </Text>
          </View>
        }
      />

      {/* Botão de Configurações */}
      <TouchableOpacity
        style={tw`mx-4 my-4 bg-blue-500 bg-opacity-20 p-4 rounded-xl border border-blue-500 border-opacity-30`}
        onPress={() => AnalyticsService.logButtonClick('NotificationSettings', 'NotificationsScreen')}
      >
        <View style={tw`flex-row items-center justify-center`}>
          <Ionicons name="settings-outline" size={20} color="#60A5FA" style={tw`mr-2`} />
          <Text style={tw`text-blue-400 font-medium`}>Configurações de notificação</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}