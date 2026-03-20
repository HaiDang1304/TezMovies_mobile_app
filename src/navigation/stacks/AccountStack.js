import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountScreen from '../../screens/Account/AccountScreen';
import ProfileScreen from '../../screens/Account/ProfileScreen';
import AdminDashboardScreen from '../../screens/Admin/AdminDashboardScreen';
import UserManagementScreen from '../../screens/Admin/UserManagementScreen';
import MovieCrawlerScreen from '../../screens/Admin/MovieCrawlerScreen';
import AdminNotificationsScreen from '../../screens/Admin/AdminNotificationsScreen';
import { COLORS } from '../../constants/config';

const Stack = createNativeStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="MovieCrawler" component={MovieCrawlerScreen} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
    </Stack.Navigator>
  );
}
