// components/TweetCard.tsx
import React, { useState } from 'react';
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

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(tweet.likes);

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    handleLike();
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={tw`bg-white px-4 py-3`}
    >
      <View style={tw`flex-row`}>
        {/* Avatar */}
        <TouchableOpacity onPress={handleProfilePress} style={tw`mr-3`}>
          <Image
            source={{ uri: tweet.avatar || 'https://i.pravatar.cc/50' }}
            style={tw`w-12 h-12 rounded-full`}
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`flex-row items-center mb-1`}>
            <TouchableOpacity onPress={handleProfilePress}>
              <Text style={tw`font-bold text-gray-900 text-base mr-2`}>{tweet.username}</Text>
            </TouchableOpacity>
            <Text style={tw`text-gray-500 text-sm`}>@{tweet.username.toLowerCase()}</Text>
            <Text style={tw`text-gray-500 text-sm mx-1`}>·</Text>
            <Text style={tw`text-gray-500 text-sm`}>{tweet.time}</Text>
          </View>

          {/* Tweet Text */}
          <Text style={tw`text-gray-900 text-base mb-3 leading-5`}>{tweet.text}</Text>

          {/* Actions */}
          <View style={tw`flex-row justify-between items-center -ml-2`}>
            {/* Comment */}
            <TouchableOpacity 
              style={tw`flex-row items-center px-2 py-1`}
              onPress={handleComment}
            >
              <FontAwesome 
                name="comment-o" 
                size={18} 
                color="#657786" 
                style={tw`mr-2`}
              />
              {tweet.comments > 0 && (
                <Text style={tw`text-gray-500 text-sm`}>{tweet.comments}</Text>
              )}
            </TouchableOpacity>

            {/* Retweet */}
            <TouchableOpacity 
              style={tw`flex-row items-center px-2 py-1`}
              onPress={handleRetweet}
            >
              <FontAwesome 
                name="retweet" 
                size={18} 
                color="#657786"
                style={tw`mr-2`}
              />
              {tweet.retweets > 0 && (
                <Text style={tw`text-gray-500 text-sm`}>{tweet.retweets}</Text>
              )}
            </TouchableOpacity>

            {/* Like */}
            <TouchableOpacity 
              style={tw`flex-row items-center px-2 py-1`} 
              onPress={handleLikePress}
            >
              <FontAwesome 
                name={isLiked ? "heart" : "heart-o"} 
                size={18} 
                color={isLiked ? "#F91880" : "#657786"}
                style={tw`mr-2`}
              />
              {likeCount > 0 && (
                <Text style={tw`text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                  {likeCount}
                </Text>
              )}
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity 
              style={tw`flex-row items-center px-2 py-1`}
              onPress={() => AnalyticsService.logButtonClick('ShareTweet', 'TweetCard')}
            >
              <FontAwesome 
                name="share" 
                size={18} 
                color="#657786"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}