// components/TweetCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import { FontAwesome } from '@expo/vector-icons';
import AnalyticsService from '../services/AnalyticsService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Profile: { username: string };
  // ...adicione outras rotas se necessário
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
};

type TweetCardProps = {
  tweet: Tweet;
  likeTweet: (id: string) => void;
  navigation: NativeStackNavigationProp<any>;
};

export default function TweetCard({ tweet, likeTweet, navigation }: TweetCardProps) {
  const handleLike = () => {
    likeTweet(tweet.id);
    AnalyticsService.logButtonClick('LikeTweet', 'TweetCard');
  };

  const handleComment = () => {
    AnalyticsService.logButtonClick('CommentTweet', 'TweetCard');
    // Navegar para tela de comentários (implementar depois)
    alert(`Comentar no tweet de ${tweet.username}`);
  };

  const handleRetweet = () => {
    AnalyticsService.logButtonClick('RetweetTweet', 'TweetCard');
    alert(`Retweetar tweet de ${tweet.username}`);
  };

  const handleProfilePress = () => {
    AnalyticsService.logButtonClick('UserProfileFromTweet', 'TweetCard');
    navigation.navigate('Profile', { username: tweet.username });
  };

  return (
    <View style={tw`bg-white p-4 rounded-lg mb-2 shadow`}>
      <TouchableOpacity onPress={handleProfilePress} style={tw`flex-row items-center mb-2`}>
        <Image
          source={{ uri: tweet.avatar || 'https://i.pravatar.cc/50' }}
          style={tw`w-10 h-10 rounded-full mr-3`}
        />
        <View>
          <Text style={tw`font-bold text-gray-900`}>{tweet.username}</Text>
          <Text style={tw`text-gray-500 text-xs`}>@{tweet.username.toLowerCase()} · {tweet.time}</Text>
        </View>
      </TouchableOpacity>
      
      <Text style={tw`text-gray-800 mb-3`}>{tweet.text}</Text>
      
      <View style={tw`flex-row justify-between`}>
        <TouchableOpacity 
          style={tw`flex-row items-center`}
          onPress={handleComment}
        >
          <FontAwesome name="comment-o" size={18} color="gray" />
          <Text style={tw`text-gray-500 ml-1`}>{tweet.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={tw`flex-row items-center`}
          onPress={handleRetweet}
        >
          <FontAwesome name="retweet" size={18} color="gray" />
          <Text style={tw`text-gray-500 ml-1`}>{tweet.retweets}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={tw`flex-row items-center`} 
          onPress={handleLike}
        >
          <FontAwesome name="heart-o" size={18} color="red" />
          <Text style={tw`text-red-500 ml-1`}>{tweet.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={tw`flex-row items-center`}
          onPress={() => AnalyticsService.logButtonClick('ShareTweet', 'TweetCard')}
        >
          <FontAwesome name="share" size={18} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );
}