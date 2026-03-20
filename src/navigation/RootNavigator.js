import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AuthCallbackScreen from '../screens/Auth/AuthCallbackScreen';
import VerifyScreen from '../screens/Auth/VerifyScreen';
import WatchPartyScreen from '../screens/WatchParty/WatchPartyScreen';
import WatchPartyRoomScreen from '../screens/WatchParty/WatchPartyRoomScreen';
import { COLORS } from '../constants/config';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="WatchParty" component={WatchPartyScreen} />
      <Stack.Screen name="WatchPartyRoom" component={WatchPartyRoomScreen} />
    </Stack.Navigator>
  );
}
