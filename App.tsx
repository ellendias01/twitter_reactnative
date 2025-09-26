// App.tsx
import React from 'react';
import perf from '@react-native-firebase/perf';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import FollowingScreen from './screens/FollowingScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import DashboardScreen from './screens/Dashboard';

type RootStackParamList = {
  Login: undefined;
  Home: { username: string };
  Profile: { username: string };
  Following: { username: string };
  Notifications: { username: string };
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

    useEffect(() => {
    const trace = perf().newTrace('app_start');
    trace.start();

    setTimeout(() => {
      trace.stop();
    }, 3000);
  }, []);
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Following" 
          component={FollowingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Dashboard de Métricas' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}