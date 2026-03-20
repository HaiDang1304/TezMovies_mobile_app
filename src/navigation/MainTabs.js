import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './stacks/HomeStack';
import FavoritesStack from './stacks/FavoritesStack';
import HistoryStack from './stacks/HistoryStack';
import NotificationsStack from './stacks/NotificationsStack';
import AccountStack from './stacks/AccountStack';
import { useNotifications } from '../context/NotificationContext';
import { COLORS, FONTS } from '../constants/config';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: FONTS.xs,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'FavoritesTab':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'HistoryTab':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'NotificationsTab':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'AccountTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStack}
        options={{ tabBarLabel: 'Yêu thích' }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{ tabBarLabel: 'Lịch sử' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsStack}
        options={{
          tabBarLabel: 'Thông báo',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.accent,
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountStack}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
}
