import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import AnalyticsService from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import { useRenderTime } from '../hooks/useRenderTime';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

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
};

export default function FollowingScreen({ route, navigation }: Props) {
  const { username } = route.params;
  const variant = ABTestingService.getUserVariant();
  const [following, setFollowing] = useState<User[]>([]);

  useRenderTime('FollowingScreen');

  useEffect(() => {
    AnalyticsService.logScreenView('FollowingScreen', variant);

    const mockFollowing: User[] = [
      { id: '1', username: 'Alice', bio: 'Software Developer', followers: 1234, isFollowing: true },
      { id: '2', username: 'Bob', bio: 'Designer', followers: 567, isFollowing: true },
      { id: '3', username: 'Charlie', bio: 'Product Manager', followers: 890, isFollowing: true },
      { id: '4', username: 'Diana', bio: 'Data Scientist', followers: 234, isFollowing: true },
      { id: '5', username: 'Eve', bio: 'Mobile Developer', followers: 678, isFollowing: true },
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
    <View style={tw`bg-white p-4 rounded-lg mb-2 shadow flex-row justify-between items-center`}>
      <TouchableOpacity
        style={tw`flex-row items-center flex-1`}
        onPress={() => handleUserPress(user.username)}
      >
        <Image
          source={{ uri: `https://i.pravatar.cc/50?u=${user.username}` }}
          style={tw`w-12 h-12 rounded-full mr-3`}
        />
        <View style={tw`flex-1`}>
          <Text style={tw`font-bold text-gray-900`}>{user.username}</Text>
          <Text style={tw`text-gray-500 text-sm`}>{user.bio}</Text>
          <Text style={tw`text-gray-400 text-xs`}>{user.followers} seguidores</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`bg-red-500 px-3 py-1 rounded`}
        onPress={() => handleUnfollow(user.id, user.username)}
      >
        <Text style={tw`text-white text-xs`}>Deixar de seguir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <View style={tw`bg-white p-4 border-b border-gray-200`}>
        <Text style={tw`text-xl font-bold text-center`}>Pessoas que você segue</Text>
      </View>

      <FlatList
        data={following}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <UserCard user={item} />}
        style={tw`p-2`}
      />

      <TouchableOpacity
        style={tw`mx-4 my-2 bg-green-500 p-3 rounded`}
        onPress={() => AnalyticsService.logButtonClick('DiscoverMore', 'FollowingScreen')}
      >
        <Text style={tw`text-white text-center`}>Descobrir mais pessoas</Text>
      </TouchableOpacity>
    </View>
  );
}