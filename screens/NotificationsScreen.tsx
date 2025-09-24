// screens/NotificationsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import { FontAwesome } from '@expo/vector-icons';
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
};

export default function NotificationsScreen({ route, navigation }: Props) {
  const { username } = route.params;
  const variant = ABTestingService.getUserVariant();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'likes'>('all');

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
        targetTweet: 'Hello world! Welcome to The Y!',
        time: '5 min',
        read: false
      },
      {
        id: '2',
        type: 'retweet',
        username: 'Bob',
        text: 'retweetou seu tweet',
        targetTweet: 'Loving this new app!',
        time: '15 min',
        read: false
      },
      {
        id: '3',
        type: 'mention',
        username: 'Charlie',
        text: 'mencionou você em um tweet',
        targetTweet: `Ótima conversa com @${username} hoje!`,
        time: '1 h',
        read: true
      },
      {
        id: '4',
        type: 'follow',
        username: 'Diana',
        text: 'começou a seguir você',
        time: '2 h',
        read: true
      },
      {
        id: '5',
        type: 'like',
        username: 'Eve',
        text: 'curtiu seu tweet',
        targetTweet: 'Novo recurso de notificações!',
        time: '3 h',
        read: true
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
      case 'like': return <FontAwesome name="heart" size={20} color="red" />;
      case 'retweet': return <FontAwesome name="retweet" size={20} color="green" />;
      case 'mention': return <FontAwesome name="at" size={20} color="blue" />;
      case 'follow': return <FontAwesome name="user-plus" size={20} color="purple" />;
      default: return <FontAwesome name="bell" size={20} color="gray" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mentions') return notif.type === 'mention';
    if (activeTab === 'likes') return notif.type === 'like';
    return true;
  });

  // Tipagem explícita do NotificationCard
  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <TouchableOpacity
      style={tw`bg-white p-3 border-l-4 ${notification.read ? 'border-transparent' : 'border-blue-500'} mb-2 shadow`}
      onPress={() => handleNotificationPress(notification.id)}
    >
      <View style={tw`flex-row items-start`}>
        <View style={tw`mr-3 mt-1`}>
          {getNotificationIcon(notification.type)}
        </View>
        <View style={tw`flex-1`}>
          <View style={tw`flex-row justify-between items-start`}>
            <Text style={tw`font-bold text-gray-900`}>{notification.username}</Text>
            <Text style={tw`text-gray-400 text-xs`}>{notification.time}</Text>
          </View>
          <Text style={tw`text-gray-700`}>{notification.text}</Text>
          {notification.targetTweet && (
            <Text style={tw`text-gray-500 text-sm mt-1 italic`}>"{notification.targetTweet}"</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <View style={tw`bg-white p-4 border-b border-gray-200`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={tw`text-xl font-bold`}>Notificações</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={tw`text-blue-500 text-sm`}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={tw`flex-row justify-around`}>
          {(['all', 'mentions', 'likes'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={tw`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => {
                setActiveTab(tab);
                AnalyticsService.logButtonClick(`Tab_${tab}`, 'NotificationsScreen');
              }}
            >
              <Text style={tw`font-medium ${activeTab === tab ? 'text-blue-500' : 'text-gray-500'}`}>
                {tab === 'all' ? 'Todas' : tab === 'mentions' ? 'Menções' : 'Curtidas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        style={tw`p-2`}
        ListEmptyComponent={
          <View style={tw`items-center justify-center p-8`}>
            <FontAwesome name="bell-slash" size={40} color="gray" />
            <Text style={tw`text-gray-500 mt-2`}>Nenhuma notificação</Text>
          </View>
        }
      />

      {/* Botão de exemplo para analytics */}
      <TouchableOpacity
        style={tw`mx-4 my-2 bg-blue-500 p-3 rounded`}
        onPress={() => AnalyticsService.logButtonClick('NotificationSettings', 'NotificationsScreen')}
      >
        <Text style={tw`text-white text-center`}>Configurações de notificação</Text>
      </TouchableOpacity>
    </View>
  );
}