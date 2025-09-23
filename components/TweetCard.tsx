import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import { FontAwesome } from '@expo/vector-icons';

export default function TweetCard({ tweet, likeTweet, navigation }) {
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Profile', { username: tweet.username })}>
      <View style={tw`bg-white p-4 rounded-lg mb-2 shadow flex-row`}>
        <Image
          source={{ uri: tweet.avatar || 'https://i.pravatar.cc/50' }}
          style={tw`w-12 h-12 rounded-full mr-3`}
        />
        <View style={tw`flex-1`}>
          <Text style={tw`font-bold text-gray-900`}>{tweet.username}</Text>
          <Text style={tw`text-gray-500 mb-1 text-sm`}>@{tweet.username.toLowerCase()} · {tweet.time}</Text>
          <Text style={tw`text-gray-800 mb-2`}>{tweet.text}</Text>
          <View style={tw`flex-row justify-between w-1/2`}>
            <TouchableOpacity style={tw`flex-row items-center`}>
              <FontAwesome name="comment-o" size={18} color="gray" />
              <Text style={tw`text-gray-500 ml-1`}>{tweet.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`flex-row items-center`}>
              <FontAwesome name="retweet" size={18} color="gray" />
              <Text style={tw`text-gray-500 ml-1`}>{tweet.retweets}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`flex-row items-center`} onPress={() => likeTweet(tweet.id)}>
              <FontAwesome name="heart-o" size={18} color="red" />
              <Text style={tw`text-red-500 ml-1`}>{tweet.likes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
