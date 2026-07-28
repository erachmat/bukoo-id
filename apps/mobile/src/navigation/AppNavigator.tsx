import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { RootStackParamList, ReadingStackParamList } from './types';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ReadingScreen from '../screens/reading/ReadingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BookDetailScreen from '../screens/book/BookDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const ReadingStack = createNativeStackNavigator<ReadingStackParamList>();

function ReadingStackNavigator() {
  return (
    <ReadingStack.Navigator screenOptions={{ headerShown: false }}>
      <ReadingStack.Screen name="BookDetail" component={BookDetailScreen} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ReadingStack.Screen name="Reading" component={ReadingScreen as any} />
    </ReadingStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Main App flow
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ReadingStack" component={ReadingStackNavigator} />
          <Stack.Screen 
            name="ReadingScreen" 
            component={ReadingScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        // Auth flow
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
