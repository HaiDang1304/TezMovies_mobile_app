import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/Home/HomeScreen';
import MovieDetailScreen from '../../screens/Movie/MovieDetailScreen';
import WatchMovieScreen from '../../screens/Movie/WatchMovieScreen';
import CategoryDetailScreen from '../../screens/Category/CategoryDetailScreen';
import SearchScreen from '../../screens/Search/SearchScreen';
import TopicsScreen from '../../screens/Category/TopicsScreen';
import { COLORS } from '../../constants/config';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="WatchMovie" component={WatchMovieScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Topics" component={TopicsScreen} />
    </Stack.Navigator>
  );
}
