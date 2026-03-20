import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FavoritesScreen from '../../screens/Account/FavoritesScreen';
import MovieDetailScreen from '../../screens/Movie/MovieDetailScreen';
import WatchMovieScreen from '../../screens/Movie/WatchMovieScreen';
import { COLORS } from '../../constants/config';

const Stack = createNativeStackNavigator();

export default function FavoritesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="WatchMovie" component={WatchMovieScreen} />
    </Stack.Navigator>
  );
}
