// components/TweetCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
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
  isVerified?: boolean;
  isLiked?: boolean;
  isRetweeted?: boolean;
};

type TweetCardProps = {
  tweet: Tweet;
  likeTweet: (id: string) => void;
  retweetTweet?: (id: string) => void;
  navigation: NativeStackNavigationProp<any>;
};

export default function TweetCard({ tweet, likeTweet, retweetTweet, navigation }: TweetCardProps) {
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [isRetweeted, setIsRetweeted] = useState(tweet.isRetweeted || false);
  const [likeCount, setLikeCount] = useState(tweet.likes);
  const [retweetCount, setRetweetCount] = useState(tweet.retweets);

  const handleLike = () => {
    likeTweet(tweet.id);
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    AnalyticsService.logButtonClick('LikeTweet', 'TweetCard');
  };

  const handleComment = () => {
    AnalyticsService.logButtonClick('CommentTweet', 'TweetCard');
    alert(`Comentar no tweet de ${tweet.username}`);
  };

  const handleRetweet = () => {
    if (retweetTweet) {
      retweetTweet(tweet.id);
    }
    setIsRetweeted(!isRetweeted);
    setRetweetCount(prev => isRetweeted ? prev - 1 : prev + 1);
    AnalyticsService.logButtonClick('RetweetTweet', 'TweetCard');
  };

  const handleProfilePress = () => {
    AnalyticsService.logButtonClick('UserProfileFromTweet', 'TweetCard');
    navigation.navigate('Profile', { username: tweet.username });
  };

  const handleShare = () => {
    AnalyticsService.logButtonClick('ShareTweet', 'TweetCard');
    alert(`Compartilhar tweet de ${tweet.username}`);
  };

  const ActionButton = ({ 
    icon, 
    count, 
    isActive, 
    activeColor, 
    onPress, 
    label 
  }: {
    icon: string;
    count: number;
    isActive: boolean;
    activeColor: string;
    onPress: () => void;
    label: string;
  }) => (
    <TouchableOpacity 
      style={tw`flex-row items-center px-3 py-2 rounded-full`}
      onPress={onPress}
    >
      <Ionicons 
        name={icon as any} 
        size={18} 
        color={isActive ? activeColor : '#6B7280'}
        style={tw`mr-2`}
      />
      {count > 0 && (
        <Text style={[
          tw`text-sm font-medium`,
          isActive ? { color: activeColor } : tw`text-gray-400`
        ]}>
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={tw`bg-white bg-opacity-5 p-4 rounded-xl border border-white border-opacity-10 mb-3`}
    >
      <View style={tw`flex-row`}>
        {/* Avatar */}
        <TouchableOpacity onPress={handleProfilePress} style={tw`mr-3`}>
          <Image
            source={{ uri: tweet.avatar || 'https://i.pravatar.cc/50' }}
            style={tw`w-12 h-12 rounded-full border-2 border-blue-500 border-opacity-50`}
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`flex-row items-center mb-2`}>
            <TouchableOpacity onPress={handleProfilePress} style={tw`flex-row items-center`}>
              <Text style={tw`text-white font-bold text-base mr-2`}>{tweet.username}</Text>
              {tweet.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#60A5FA" />
              )}
            </TouchableOpacity>
            <Text style={tw`text-gray-400 text-sm mx-2`}>·</Text>
            <Text style={tw`text-gray-400 text-sm`}>{tweet.time}</Text>
          </View>

          {/* Tweet Text */}
          <Text style={tw`text-gray-100 text-base mb-4 leading-6`}>{tweet.text}</Text>

          {/* Actions */}
          <View style={tw`flex-row justify-between items-center`}>
            {/* Comment */}
            <ActionButton
              icon="chatbubble-outline"
              count={tweet.comments}
              isActive={false}
              activeColor="#60A5FA"
              onPress={handleComment}
              label="Comentar"
            />

            {/* Retweet */}
            <ActionButton
              icon="repeat-outline"
              count={retweetCount}
              isActive={isRetweeted}
              activeColor="#10B981"
              onPress={handleRetweet}
              label="Retweet"
            />

            {/* Like */}
            <ActionButton
              icon={isLiked ? "heart" : "heart-outline"}
              count={likeCount}
              isActive={isLiked}
              activeColor="#EF4444"
              onPress={handleLike}
              label="Curtir"
            />

            {/* Share */}
            <TouchableOpacity 
              style={tw`flex-row items-center px-3 py-2 rounded-full`}
              onPress={handleShare}
            >
              <Ionicons 
                name="share-social-outline" 
                size={18} 
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Engagement Stats */}
      {(likeCount > 0 || retweetCount > 0 || tweet.comments > 0) && (
        <View style={tw`flex-row items-center mt-3 pt-3 border-t border-white border-opacity-5`}>
          {retweetCount > 0 && (
            <View style={tw`flex-row items-center mr-4`}>
              <Ionicons name="repeat" size={14} color="#10B981" />
              <Text style={tw`text-gray-400 text-xs ml-1`}>{retweetCount}</Text>
            </View>
          )}
          {likeCount > 0 && (
            <View style={tw`flex-row items-center mr-4`}>
              <Ionicons name="heart" size={14} color="#EF4444" />
              <Text style={tw`text-gray-400 text-xs ml-1`}>{likeCount}</Text>
            </View>
          )}
          {tweet.comments > 0 && (
            <View style={tw`flex-row items-center`}>
              <Ionicons name="chatbubble" size={14} color="#60A5FA" />
              <Text style={tw`text-gray-400 text-xs ml-1`}>{tweet.comments}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}