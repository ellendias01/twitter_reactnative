// screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, Image, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import Navbar from '../components/Navbar';
import TweetInput from '../components/TweetInput';
import TweetCard from '../components/TweetCard';
import AnalyticsService from '../services/AnalyticsService';
import ABTestingService from '../services/ABTestingService';
import { useRenderTime } from '../hooks/useRenderTime';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: { username: string };
  Login: undefined;
  Profile: { username: string };
  // ...adicione outras rotas se necessário
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
};

type Tweet = {
  id: string;
  username: string;
  text: string;
  likes: number;
  retweets: number;
  comments: number;
  time: string;
  avatar: string;
  isVerified?: boolean;
  isLiked?: boolean;
  isRetweeted?: boolean;
};

export default function HomeScreen({ route, navigation }: Props) {
  const { username } = route.params;
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [nextId, setNextId] = useState(3);
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const variant = ABTestingService.getUserVariant();
  const insets = useSafeAreaInsets();

  // Medir tempo de renderização
  useRenderTime('HomeScreen');

  // Registrar visualização da tela
  useEffect(() => {
    AnalyticsService.logScreenView('HomeScreen', variant);
  }, [variant]);

  useEffect(() => {
    const initialTweets = [
      { 
        id: '1', 
        username: 'Alice', 
        text: 'Hello world! Welcome to The Y! Building amazing products with React Native 🚀', 
        likes: 15, 
        retweets: 5, 
        comments: 3, 
        time: '1h', 
        avatar: 'https://i.pravatar.cc/50?u=alice',
        isVerified: true,
        isLiked: false,
        isRetweeted: false
      },
      { 
        id: '2', 
        username: 'Bob', 
        text: 'Loving this new app! The dark theme looks absolutely stunning. What do you think?', 
        likes: 8, 
        retweets: 2, 
        comments: 1, 
        time: '2h', 
        avatar: 'https://i.pravatar.cc/50?u=bob',
        isVerified: false,
        isLiked: true,
        isRetweeted: false
      },
      { 
        id: '3', 
        username: 'TechNews', 
        text: 'Just launched: New React Native performance improvements that will blow your mind! ⚡', 
        likes: 42, 
        retweets: 18, 
        comments: 7, 
        time: '3h', 
        avatar: 'https://i.pravatar.cc/50?u=technews',
        isVerified: true,
        isLiked: false,
        isRetweeted: true
      }
    ];
    setTweets(initialTweets);
  }, []);

  const addTweet = (text: string) => {
    const newTweet = { 
      id: Date.now().toString(), 
      username, 
      text, 
      likes: 0, 
      retweets: 0, 
      comments: 0, 
      time: 'now', 
      avatar: `https://i.pravatar.cc/50?u=${username}`,
      isVerified: true,
      isLiked: false,
      isRetweeted: false
    };
    setTweets([newTweet, ...tweets]);
    AnalyticsService.logButtonClick('AddTweet', 'HomeScreen');
  };

  const likeTweet = (id: string) => {
    setTweets(tweets.map(t => 
      t.id === id ? { 
        ...t, 
        likes: t.isLiked ? t.likes - 1 : t.likes + 1,
        isLiked: !t.isLiked 
      } : t
    ));
    AnalyticsService.logButtonClick('LikeTweet', 'HomeScreen');
  };

  const retweetTweet = (id: string) => {
    setTweets(tweets.map(t => 
      t.id === id ? { 
        ...t, 
        retweets: t.isRetweeted ? t.retweets - 1 : t.retweets + 1,
        isRetweeted: !t.isRetweeted 
      } : t
    ));
    AnalyticsService.logButtonClick('RetweetTweet', 'HomeScreen');
  };

  const followUser = (username: string) => {
    AnalyticsService.logButtonClick('FollowUser', 'HomeScreen');
    alert(`Seguindo ${username}`);
  };

  const loadMoreTweets = () => {
    const moreTweets = Array.from({ length: 3 }).map((_, i) => ({
      id: (nextId + i).toString(),
      username: `User${nextId + i}`,
      text: `This is tweet #${nextId + i} with some interesting content about technology and development!`,
      likes: Math.floor(Math.random() * 10),
      retweets: Math.floor(Math.random() * 5),
      comments: Math.floor(Math.random() * 3),
      time: `${Math.floor(Math.random() * 10) + 1}h`,
      avatar: `https://i.pravatar.cc/50?u=user${nextId + i}`,
      isVerified: Math.random() > 0.7,
      isLiked: false,
      isRetweeted: false
    }));
    setTweets([...tweets, ...moreTweets]);
    setNextId(nextId + 3);
  };

  const UserStats = () => (
    <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-4`}>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>{tweets.length}</Text>
          <Text style={tw`text-gray-400 text-sm`}>Tweets</Text>
        </View>
        <View style={tw`h-8 w-px bg-gray-600`} />
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>
            {tweets.reduce((sum, tweet) => sum + tweet.likes, 0)}
          </Text>
          <Text style={tw`text-gray-400 text-sm`}>Curtidas</Text>
        </View>
        <View style={tw`h-8 w-px bg-gray-600`} />
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-2xl font-bold`}>
            {tweets.reduce((sum, tweet) => sum + tweet.retweets, 0)}
          </Text>
          <Text style={tw`text-gray-400 text-sm`}>Retweets</Text>
        </View>
      </View>
    </View>
  );

  // Componente TweetInput inline com texto branco
  const CustomTweetInput = ({ addTweet, username }: { addTweet: (text: string) => void; username: string }) => {
    const [tweetText, setTweetText] = useState('');

    const handleSubmit = () => {
      if (tweetText.trim()) {
        addTweet(tweetText);
        setTweetText('');
      }
    };

    return (
      <View style={tw`flex-row items-start gap-3`}>
        <Image
          source={{ uri: `https://i.pravatar.cc/50?u=${username}` }}
          style={tw`w-10 h-10 rounded-full border-2 border-blue-500 border-opacity-50`}
        />
        <View style={tw`flex-1`}>
          <TextInput
            style={tw`text-white text-base bg-transparent border-b border-gray-600 pb-2 mb-3`}
            placeholder="O que está acontecendo?"
            placeholderTextColor="#6B7280"
            value={tweetText}
            onChangeText={setTweetText}
            multiline
            maxLength={280}
          />
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity>
                <Ionicons name="image-outline" size={20} color="#60A5FA" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="location-outline" size={20} color="#60A5FA" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="happy-outline" size={20} color="#60A5FA" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                tw`px-4 py-2 rounded-full`,
                tweetText.trim() ? tw`bg-blue-500` : tw`bg-blue-500 bg-opacity-30`
              ]}
              onPress={handleSubmit}
              disabled={!tweetText.trim()}
            >
              <Text style={tw`text-white font-medium`}>Tweet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[tw`flex-1 bg-[#0F172A]`, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={tw`bg-white bg-opacity-5 px-4 py-3 border-b border-white border-opacity-10`}>
        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-white text-xl font-bold`}>Início</Text>
            <Text style={tw`text-gray-400 text-sm`}>Bem-vindo, @{username}</Text>
          </View>
          
          <TouchableOpacity
            style={tw`bg-blue-500 bg-opacity-20 p-2 rounded-full border border-blue-500 border-opacity-30`}
          >
            <Ionicons name="sparkles" size={20} color="#60A5FA" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={tw`flex-row mt-4`}>
          {[
            { key: 'for-you', label: 'Para você' },
            { key: 'following', label: 'Seguindo' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={tw`flex-1 items-center pb-3 border-b-2 ${
                activeTab === tab.key 
                  ? 'border-blue-500' 
                  : 'border-transparent'
              }`}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={tw`text-sm font-medium ${
                activeTab === tab.key ? 'text-white' : 'text-gray-400'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={tweets}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={tw`p-4`}>
            {/* User Stats */}
            <UserStats />
            
            {/* Tweet Input */}
            <View style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-4`}>
              <CustomTweetInput addTweet={addTweet} username={username} />
            </View>

            {/* Timeline Header */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-white text-lg font-bold`}>Timeline</Text>
              <TouchableOpacity
                style={tw`bg-gray-600 bg-opacity-50 px-3 py-1 rounded-full`}
                onPress={loadMoreTweets}
              >
                <Text style={tw`text-gray-300 text-sm`}>
                  {tweets.length} tweets
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={tw`px-4`}>
            <TweetCard 
              tweet={item} 
              likeTweet={likeTweet}
              retweetTweet={retweetTweet}
              navigation={navigation} 
            />
          </View>
        )}
        onEndReached={loadMoreTweets}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => <View style={tw`h-3`} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-20`}
      />
      
      <Navbar navigation={navigation as any} username={username} />
    </View>
  );
}