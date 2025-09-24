import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import tw from 'twrnc';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Login: undefined;
  Home: { username: string };
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      navigation.replace('Home', { username });
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-50 p-5`}>
      <Text style={tw`text-3xl font-bold mb-6 text-blue-500`}>The Y</Text>
      <TextInput
        placeholder="Username"
        style={tw`w-full border border-gray-300 p-3 rounded mb-4 bg-white`}
        value={username}
        onChangeText={setUsername}
      />
      <TouchableOpacity
        onPress={handleLogin}
        style={tw`w-full bg-blue-500 p-3 rounded`}
      >
        <Text style={tw`text-white text-center font-bold`}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}
