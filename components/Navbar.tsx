import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { FontAwesome } from '@expo/vector-icons';

export default function Navbar({ navigation, username }) {
  return (
    <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-200 bg-white`}>
      <Text style={tw`text-2xl font-bold text-blue-500`}>The Y</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Profile', { username })}>
        <Text style={tw`text-blue-500 font-bold`}>{username}</Text>
      </TouchableOpacity>
    </View>
  );
}
