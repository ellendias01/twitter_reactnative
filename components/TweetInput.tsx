import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import tw from 'twrnc';

type TweetInputProps = {
  addTweet: (text: string) => void;
};

export default function TweetInput({ addTweet }: TweetInputProps) {
  const [text, setText] = useState('');

  const handlePost = () => {
    if (text.trim()) {
      addTweet(text);
      setText('');
    }
  };

  return (
    <View style={tw`mb-4 bg-white p-3 rounded-lg shadow`}>
      <TextInput
        style={tw`border border-gray-300 p-2 rounded mb-2`}
        placeholder="What's happening?"
        value={text}
        onChangeText={setText}
        multiline
      />
      <TouchableOpacity style={tw`bg-blue-500 p-2 rounded`} onPress={handlePost}>
        <Text style={tw`text-white text-center font-bold`}>Tweet</Text>
      </TouchableOpacity>
    </View>
  );
}