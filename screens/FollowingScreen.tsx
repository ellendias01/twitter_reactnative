import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import tw from 'twrnc';
import AnalyticsService from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import { useRenderTime } from '../hooks/useRenderTime';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: { username: string };
  Profile: { username: string };
  Following: { username: string };
};

type FollowingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Following'>;
type FollowingScreenRouteProp = RouteProp<RootStackParamList, 'Following'>;

type Props = {
  navigation: FollowingScreenNavigationProp;
  route: FollowingScreenRouteProp;
};

type User = {
  id: string;
  username: string;
  bio: string;
  followers: number;
  isFollowing: boolean;
  isVerified?: boolean;
  isLive?: boolean;
};

export default function FollowingScreen({ route, navigation }: Props) {
  const { username } = route.params;
  const variant = ABTestingService.getUserVariant();
  const [following, setFollowing] = useState<User[]>([]);

  useRenderTime('FollowingScreen');

  useEffect(() => {
    AnalyticsService.logScreenView('FollowingScreen', variant);

    const mockFollowing: User[] = [
      { 
        id: '1', 
        username: 'Alice', 
        bio: 'Software Developer • Building amazing apps', 
        followers: 1234, 
        isFollowing: true,
        isVerified: true,
        isLive: true
      },
      { 
        id: '2', 
        username: 'Bob', 
        bio: 'UI/UX Designer • Creating beautiful interfaces', 
        followers: 567, 
        isFollowing: true,
        isVerified: false,
        isLive: false
      },
      { 
        id: '3', 
        username: 'Charlie', 
        bio: 'Product Manager • Shipping great products', 
        followers: 890, 
        isFollowing: true,
        isVerified: true,
        isLive: false
      },
      { 
        id: '4', 
        username: 'Diana', 
        bio: 'Data Scientist • Turning data into insights', 
        followers: 234, 
        isFollowing: true,
        isVerified: false,
        isLive: true
      },
      { 
        id: '5', 
        username: 'Eve', 
        bio: 'Mobile Developer • React Native expert', 
        followers: 678, 
        isFollowing: true,
        isVerified: true,
        isLive: false
      },
      { 
        id: '6', 
        username: 'Frank', 
        bio: 'Backend Engineer • Scaling systems', 
        followers: 345, 
        isFollowing: true,
        isVerified: false,
        isLive: false
      },
    ];
    setFollowing(mockFollowing);
  }, [variant]);

  const handleUnfollow = (userId: string, userUsername: string) => {
    setFollowing(following.map(user =>
      user.id === userId ? { ...user, isFollowing: false } : user
    ));
    AnalyticsService.logButtonClick('UnfollowUser', 'FollowingScreen');
    alert(`Deixou de seguir @${userUsername}`);
  };

  const handleUserPress = (userUsername: string) => {
    AnalyticsService.logButtonClick('UserProfile', 'FollowingScreen');
    navigation.navigate('Profile', { username: userUsername });
  };

  const UserCard = ({ user }: { user: User }) => (
    <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-3`}>
      <View style={tw`flex-row items-start justify-between`}>
        <TouchableOpacity
          style={tw`flex-row items-start flex-1`}
          onPress={() => handleUserPress(user.username)}
        >
          <View style={tw`relative`}>
            <Image
              source={{ uri: `https://i.pravatar.cc/60?u=${user.username}` }}
              style={tw`w-14 h-14 rounded-full mr-4 border-2 border-blue-500 border-opacity-50`}
            />
            {user.isLive && (
              <View style={tw`absolute -top-1 -right-1 bg-red-500 px-1 rounded-full`}>
                <Text style={tw`text-white text-xs font-bold`}>LIVE</Text>
              </View>
            )}
          </View>
          
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Text style={tw`text-white font-bold text-base mr-2`}>{user.username}</Text>
              {user.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#60A5FA" />
              )}
            </View>
            
            <Text style={tw`text-gray-300 text-sm mb-2 leading-5`}>{user.bio}</Text>
            
            <View style={tw`flex-row items-center`}>
              <Ionicons name="people" size={14} color="#9CA3AF" />
              <Text style={tw`text-gray-400 text-xs ml-1`}>
                {user.followers.toLocaleString()} seguidores
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-red-500 bg-opacity-20 px-4 py-2 rounded-full border border-red-500 border-opacity-30`}
          onPress={() => handleUnfollow(user.id, user.username)}
        >
          <Text style={tw`text-red-400 text-sm font-medium`}>Seguindo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const StatsCard = () => (
    <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-4`}>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>{following.length}</Text>
          <Text style={tw`text-gray-400 text-sm`}>Seguindo</Text>
        </View>
        <View style={tw`h-8 w-px bg-gray-600`} />
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>
            {following.filter(user => user.isLive).length}
          </Text>
          <Text style={tw`text-gray-400 text-sm`}>Ao vivo</Text>
        </View>
        <View style={tw`h-8 w-px bg-gray-600`} />
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>
            {following.filter(user => user.isVerified).length}
          </Text>
          <Text style={tw`text-gray-400 text-sm`}>Verificados</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-[#0F172A]`}>
      {/* Header */}
      <View style={tw`bg-white bg-opacity-5 p-4 border-b border-white border-opacity-10`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              style={tw`mr-4`}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-white text-xl font-bold`}>Pessoas que você segue</Text>
              <Text style={tw`text-gray-400 text-sm`}>@{username}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={tw`bg-blue-500 bg-opacity-20 p-2 rounded-full border border-blue-500 border-opacity-30`}
          >
            <Ionicons name="search" size={20} color="#60A5FA" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={tw`flex-1 p-4`}>
        {/* Stats Card */}
        <StatsCard />

        {/* Following List */}
        <FlatList
          data={following}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <UserCard user={item} />}
          scrollEnabled={false}
          style={tw`mb-4`}
        />

        {/* Action Buttons */}
        <View style={tw`flex-row gap-3 mb-6`}>
          <TouchableOpacity
            style={tw`flex-1 bg-blue-500 bg-opacity-20 p-4 rounded-xl border border-blue-500 border-opacity-30`}
            onPress={() => AnalyticsService.logButtonClick('DiscoverMore', 'FollowingScreen')}
          >
            <View style={tw`flex-row items-center justify-center`}>
              <Ionicons name="compass" size={20} color="#60A5FA" style={tw`mr-2`} />
              <Text style={tw`text-blue-400 font-medium`}>Descobrir mais</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`flex-1 bg-green-500 bg-opacity-20 p-4 rounded-xl border border-green-500 border-opacity-30`}
            onPress={() => AnalyticsService.logButtonClick('RefreshList', 'FollowingScreen')}
          >
            <View style={tw`flex-row items-center justify-center`}>
              <Ionicons name="refresh" size={20} color="#34D399" style={tw`mr-2`} />
              <Text style={tw`text-green-400 font-medium`}>Atualizar</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Empty State (caso não esteja seguindo ninguém) */}
        {following.length === 0 && (
          <View style={tw`items-center py-12`}>
            <Ionicons name="people" size={64} color="#4B5563" />
            <Text style={tw`text-gray-400 text-lg font-medium mt-4`}>
              Você não está seguindo ninguém
            </Text>
            <Text style={tw`text-gray-500 text-center mt-2 px-8`}>
              Comece a seguir pessoas para ver seus conteúdos aqui
            </Text>
            <TouchableOpacity
              style={tw`bg-blue-500 bg-opacity-20 px-6 py-3 rounded-full border border-blue-500 border-opacity-30 mt-4`}
              onPress={() => AnalyticsService.logButtonClick('ExploreUsers', 'FollowingScreen')}
            >
              <Text style={tw`text-blue-400 font-medium`}>Explorar usuários</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}