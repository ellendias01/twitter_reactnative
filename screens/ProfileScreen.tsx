// screens/ProfileScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import TweetCard from '../components/TweetCard';
import AnalyticsService from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import { useRenderTime } from '../hooks/useRenderTime';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
    text: `This is tweet #${i + 1} from ${username}`,
    likes: Math.floor(Math.random() * 10),
    retweets: Math.floor(Math.random() * 5),
    comments: Math.floor(Math.random() * 3),
    time: `${i + 1}h`,
    avatar: `https://i.pravatar.cc/50?u=${username}`
  }));

  const handleFollow = () => {
    AnalyticsService.logButtonClick('FollowProfile', 'ProfileScreen');
    alert(`Seguindo ${username}`);
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <View style={tw`items-center mt-10 mb-4`}>
        <Image
          source={{ uri: `https://i.pravatar.cc/100?u=${username}` }}
          style={tw`w-24 h-24 rounded-full mb-4`}
        />
        <Text style={tw`text-2xl font-bold`}>{username}</Text>
        <Text style={tw`text-gray-500 mb-4`}>@{username.toLowerCase()}</Text>
        
        <View style={tw`flex-row justify-around w-3/4 mb-4`}>
          <View style={tw`items-center`}>
            <Text style={tw`font-bold text-gray-900`}>123</Text>
            <Text style={tw`text-gray-500`}>Following</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`font-bold text-gray-900`}>456</Text>
            <Text style={tw`text-gray-500`}>Followers</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={tw`bg-blue-500 px-6 py-2 rounded mb-2`}
          onPress={handleFollow}
        >
          <Text style={tw`text-white font-bold`}>Seguir</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.replace('Login')} 
          style={tw`bg-red-500 px-6 py-2 rounded`}
        >
          <Text style={tw`text-white font-bold`}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={userTweets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TweetCard 
            tweet={item} 
            likeTweet={() => {}} 
            navigation={navigation} 
          />
        )}
      />
    </View>
  );
}