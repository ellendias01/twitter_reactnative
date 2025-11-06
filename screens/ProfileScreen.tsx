// screens/ProfileScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import tw from 'twrnc';
import TweetCard from '../components/TweetCard';
import AnalyticsService from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import { useRenderTime } from '../hooks/useRenderTime';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Profile: { username: string };
  Login: undefined;
  // ...outras rotas se existirem
};
type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

type ProfileScreenProps = {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
};

export default function ProfileScreen({ route, navigation }: ProfileScreenProps) {
  const { username } = route.params;
  const variant = ABTestingService.getUserVariant();

  // Medir tempo de renderização
  useRenderTime('ProfileScreen');

  // Registrar visualização da tela
  useEffect(() => {
    AnalyticsService.logScreenView('ProfileScreen', variant);
  }, [variant, username]);

  const userTweets = Array.from({ length: 5 }).map((_, i) => ({
    id: (i + 100).toString(),
    username,
    text: `This is tweet #${i + 1} from ${username}. Building amazing products with React Native and TypeScript! 🚀`,
    likes: Math.floor(Math.random() * 10),
    retweets: Math.floor(Math.random() * 5),
    comments: Math.floor(Math.random() * 3),
    time: `${i + 1}h`,
    avatar: `https://i.pravatar.cc/50?u=${username}`,
    isVerified: true,
    isLiked: Math.random() > 0.5,
    isRetweeted: false
  }));

  const handleFollow = () => {
    AnalyticsService.logButtonClick('FollowProfile', 'ProfileScreen');
    alert(`Seguindo ${username}`);
  };

  const handleEditProfile = () => {
    AnalyticsService.logButtonClick('EditProfile', 'ProfileScreen');
    alert('Abrir edição de perfil');
  };

  const handleMessage = () => {
    AnalyticsService.logButtonClick('MessageUser', 'ProfileScreen');
    alert(`Enviar mensagem para ${username}`);
  };

  const UserStats = () => (
    <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-4`}>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>123</Text>
          <Text style={tw`text-gray-400 text-sm`}>Seguindo</Text>
        </View>
        <View style={tw`h-8 w-px bg-gray-600`} />
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>456</Text>
          <Text style={tw`text-gray-400 text-sm`}>Seguidores</Text>
        </View>
        <View style={tw`h-8 w-px bg-gray-600`} />
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>{userTweets.length}</Text>
          <Text style={tw`text-gray-400 text-sm`}>Tweets</Text>
        </View>
      </View>
    </View>
  );

  const likeTweet = (id: string) => {
    // Implementar função de like
    AnalyticsService.logButtonClick('LikeTweet', 'ProfileScreen');
  };

  const retweetTweet = (id: string) => {
    // Implementar função de retweet
    AnalyticsService.logButtonClick('RetweetTweet', 'ProfileScreen');
  };

  return (
    <View style={tw`flex-1 bg-[#0F172A]`}>
      {/* Header */}
      <View style={tw`bg-white bg-opacity-5 px-4 py-3 border-b border-white border-opacity-10`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              style={tw`mr-4`}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-white text-lg font-bold`}>{username}</Text>
              <Text style={tw`text-gray-400 text-sm`}>{userTweets.length} tweets</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={tw`bg-blue-500 bg-opacity-20 p-2 rounded-full border border-blue-500 border-opacity-30`}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#60A5FA" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={tw`flex-1`}>
        {/* Profile Header */}
        <View style={tw`p-4`}>
          {/* Banner e Avatar */}
          <View style={tw`relative mb-16`}>
            <View style={tw`bg-blue-500 bg-opacity-20 h-32 rounded-xl border border-blue-500 border-opacity-30`} />
            <Image
              source={{ uri: `https://i.pravatar.cc/100?u=${username}` }}
              style={tw`w-24 h-24 rounded-full border-4 border-[#0F172A] absolute -bottom-12 left-4`}
            />
          </View>

          {/* User Info */}
          <View style={tw`mt-4`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Text style={tw`text-white text-xl font-bold mr-2`}>{username}</Text>
              <Ionicons name="checkmark-circle" size={20} color="#60A5FA" />
            </View>
            <Text style={tw`text-gray-400 text-sm mb-3`}>@{username.toLowerCase()}</Text>
            
            <Text style={tw`text-gray-300 text-sm mb-4 leading-5`}>
              Desenvolvedor React Native • Criando apps incríveis • Apaixonado por tecnologia e inovação
            </Text>

            <View style={tw`flex-row items-center mb-4`}>
              <Ionicons name="location-outline" size={16} color="#9CA3AF" />
              <Text style={tw`text-gray-400 text-sm ml-1 mr-4`}>São Paulo, Brasil</Text>
              
              <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
              <Text style={tw`text-gray-400 text-sm ml-1`}>Ingressou em Jan 2024</Text>
            </View>
          </View>

          {/* Stats */}
          <UserStats />

          {/* Action Buttons */}
          <View style={tw`flex-row gap-3 mb-6`}>
            <TouchableOpacity
              style={tw`flex-1 bg-blue-500 bg-opacity-20 p-3 rounded-xl border border-blue-500 border-opacity-30`}
              onPress={handleFollow}
            >
              <Text style={tw`text-blue-400 text-center font-medium`}>Seguir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={tw`flex-1 bg-gray-600 bg-opacity-50 p-3 rounded-xl border border-gray-500 border-opacity-30`}
              onPress={handleMessage}
            >
              <Text style={tw`text-gray-300 text-center font-medium`}>Mensagem</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={tw`bg-gray-600 bg-opacity-50 p-3 rounded-xl border border-gray-500 border-opacity-30`}
              onPress={handleEditProfile}
            >
              <Ionicons name="pencil" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={tw`flex-row mb-4`}>
            {[
              { key: 'tweets', label: 'Tweets', icon: 'chatbubble-outline' },
              { key: 'replies', label: 'Tweets & Respostas', icon: 'chatbox-outline' },
              { key: 'media', label: 'Mídia', icon: 'image-outline' },
              { key: 'likes', label: 'Curtidas', icon: 'heart-outline' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={tw`flex-1 items-center py-3 border-b-2 border-blue-500`}
              >
                <Ionicons name={tab.icon as any} size={16} color="#60A5FA" style={tw`mb-1`} />
                <Text style={tw`text-blue-400 text-xs font-medium`}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tweets List */}
        <View style={tw`px-4`}>
          {userTweets.map((tweet, index) => (
            <View key={tweet.id} style={tw`mb-3`}>
              <TweetCard 
                tweet={tweet} 
                likeTweet={likeTweet}
                retweetTweet={retweetTweet}
                navigation={navigation} 
              />
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={() => navigation.replace('Login')} 
          style={tw`mx-4 my-6 bg-red-500 bg-opacity-20 p-4 rounded-xl border border-red-500 border-opacity-30`}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={tw`mr-2`} />
            <Text style={tw`text-red-400 font-medium`}>Sair da conta</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}