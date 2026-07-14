import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import StoreScreen from '../screens/store/StoreScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 0,
          marginBottom: Platform.OS === 'android' ? 6 : 0,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 8,
          paddingBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 28 : 16,
          left: 0,
          right: 0,
          marginHorizontal: 20,
          height: Platform.OS === 'ios' ? 68 : 62,
          backgroundColor: 'rgba(28, 28, 30, 0.96)',
          borderRadius: 34,
          borderTopWidth: 0,
          paddingBottom: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconPillActive : styles.iconPill}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Perpustakaan',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconPillActive : styles.iconPill}>
              <Ionicons name={focused ? 'library' : 'library-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Store"
        component={StoreScreen}
        options={{
          tabBarLabel: 'Toko Buku',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconPillActive : styles.iconPill}>
              <Ionicons name={focused ? 'bag-handle' : 'bag-handle-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Cari',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconPillActive : styles.iconPill}>
              <Ionicons name={focused ? 'search' : 'search-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 28,
    borderRadius: 14,
  },
  iconPillActive: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});
