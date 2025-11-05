import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image } from 'react-native';
import tw from 'twrnc';

type TweetInputProps = {
  addTweet: (text: string) => void;
  username?: string;
};

export default function TweetInput({ addTweet, username }: TweetInputProps) {
  const [text, setText] = useState('');

  const handlePost = () => {
    if (text.trim()) {
      addTweet(text);
      setText('');
    }
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={tw`px-4 py-3 border-b border-gray-200`}>
      <View style={tw`flex-row`}>
        {/* Avatar */}
        <Image
          source={{ uri: `https://i.pravatar.cc/50?u=${username || 'user'}` }}
          style={tw`w-12 h-12 rounded-full mr-3`}
        />

        {/* Input area */}
        <View style={tw`flex-1`}>
          <TextInput
            style={tw`text-gray-900 text-base min-h-12 max-h-32`}
            placeholder="What's happening?"
            placeholderTextColor="#657786"
            value={text}
            onChangeText={setText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline
            textAlignVertical="top"
          />
          
          {/* Action bar */}
          <View style={tw`flex-row items-center justify-between mt-3`}>
            {/* Left side - could add icons for media, gif, etc */}
            <View style={tw`flex-row`} />
            
            {/* Tweet button */}
            <TouchableOpacity 
              style={tw`px-4 py-2 rounded-full ${text.trim() ? 'bg-blue-500' : 'bg-gray-300'}`}
              onPress={handlePost}
              disabled={!text.trim()}
              activeOpacity={0.8}
            >
              <Text style={tw`text-white font-bold text-sm`}>Tweet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}