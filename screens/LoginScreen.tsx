import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import tw from 'twrnc';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (username.trim() && password.trim()) {
      navigation.replace('Home', { username });
    }
  };

  const handleDemoLogin = (demoUser: string) => {
    setUsername(demoUser);
    setPassword('password123');
    setTimeout(() => {
      navigation.replace('Home', { username: demoUser });
    }, 500);
  };

  return (
    <ScrollView 
      style={tw`flex-1 bg-[#0F172A]`}
      contentContainerStyle={tw`flex-grow justify-center`}
      showsVerticalScrollIndicator={false}
    >
      <View style={tw`p-8`}>
        {/* Logo e Header */}
        <View style={tw`items-center mb-12`}>
          <View style={tw`bg-blue-500 bg-opacity-20 p-4 rounded-full border border-blue-500 border-opacity-30 mb-4`}>
            <Ionicons name="logo-react" size={48} color="#60A5FA" />
          </View>
          <Text style={tw`text-white text-4xl font-bold mb-2`}>The Y</Text>
          <Text style={tw`text-gray-400 text-lg text-center`}>
            Conecte-se com o mundo através de conversas significativas
          </Text>
        </View>

        {/* Formulário de Login */}
        <View style={tw`bg-white bg-opacity-5 p-6 rounded-xl border border-white border-opacity-10 mb-6`}>
          <Text style={tw`text-white text-2xl font-bold mb-6 text-center`}>Entrar</Text>
          
          {/* Username Input */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-300 text-sm font-medium mb-2`}>Nome de usuário</Text>
            <View style={tw`flex-row items-center bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl px-4`}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={tw`mr-3`} />
              <TextInput
                placeholder="Digite seu username"
                placeholderTextColor="#6B7280"
                style={tw`flex-1 text-white text-base py-4`}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-300 text-sm font-medium mb-2`}>Senha</Text>
            <View style={tw`flex-row items-center bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl px-4`}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={tw`mr-3`} />
              <TextInput
                placeholder="Digite sua senha"
                placeholderTextColor="#6B7280"
                style={tw`flex-1 text-white text-base py-4`}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            style={tw`bg-blue-500 p-4 rounded-xl border border-blue-500 border-opacity-30 mb-4`}
            disabled={!username.trim() || !password.trim()}
          >
            <Text style={tw`text-white text-center font-bold text-lg`}>
              Entrar
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity style={tw`items-center py-2`}>
            <Text style={tw`text-blue-400 text-sm font-medium`}>
              Esqueceu sua senha?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Accounts */}
        <View style={tw`bg-white bg-opacity-5 p-6 rounded-xl border border-white border-opacity-10 mb-6`}>
          <Text style={tw`text-white text-lg font-bold mb-4 text-center`}>Contas Demo</Text>
          
          <View style={tw`flex-row flex-wrap -mx-1`}>
            {[
              { username: 'alice', role: 'Developer' },
              { username: 'bob', role: 'Designer' },
              { username: 'charlie', role: 'Product Manager' },
              { username: 'diana', role: 'Data Scientist' }
            ].map((user, index) => (
              <TouchableOpacity
                key={user.username}
                style={tw`w-1/2 px-1 mb-2`}
                onPress={() => handleDemoLogin(user.username)}
              >
                <View style={tw`bg-white bg-opacity-5 p-3 rounded-lg border border-white border-opacity-10 items-center`}>
                  <Text style={tw`text-white font-medium text-sm`}>{user.username}</Text>
                  <Text style={tw`text-gray-400 text-xs`}>{user.role}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Up Section */}
        <View style={tw`items-center`}>
          <Text style={tw`text-gray-400 text-sm mb-2`}>
            Não tem uma conta?
          </Text>
          <TouchableOpacity 
            style={tw`bg-green-500 bg-opacity-20 px-6 py-3 rounded-full border border-green-500 border-opacity-30`}
          >
            <Text style={tw`text-green-400 font-medium`}>
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={tw`mt-8 items-center`}>
          <Text style={tw`text-gray-500 text-xs text-center`}>
            Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}