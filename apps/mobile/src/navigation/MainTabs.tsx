import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/COLORS';

import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import AiCompanionScreen from '../screens/ai/AiCompanionScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 0,
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 6,
          paddingBottom: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 12,
          left: 0,
          right: 0,
          marginHorizontal: 12,
          height: Platform.OS === 'ios' ? 68 : 62,
          backgroundColor: 'rgba(10, 26, 21, 0.98)',
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
              <Ionicons name={focused ? 'book' : 'book-outline'} size={18} color={color} />
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
              <Ionicons name={focused ? 'search' : 'search-outline'} size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Rak',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconPillActive : styles.iconPill}>
              <Ionicons name={focused ? 'library' : 'library-outline'} size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Ai"
        component={AiCompanionScreen}
        options={{
          tabBarLabel: 'Ai',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconPillActive : styles.iconPill}>
              <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: 'Komunitas',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconPillActive : styles.iconPill}>
              <Ionicons name={focused ? 'people' : 'people-outline'} size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <View style={focused ? styles.iconPillActive : styles.iconPill}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={18} color={color} />
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
    width: 36,
    height: 26,
    borderRadius: 13,
  },
  iconPillActive: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(201, 149, 42, 0.18)',
  },
});
