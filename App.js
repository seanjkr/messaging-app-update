import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import StartScreen from './components/Start';
import ChatScreen from './components/Chat';

const Stack = createStackNavigator();
 
export default function App() {
  return (

    <NavigationContainer>

      <Stack.Navigator initialRouteName="StartScreen">

        <Stack.Screen name="StartScreen" component={StartScreen} />

        <Stack.Screen name="ChatScreen" component={ChatScreen} />

      </Stack.Navigator>

    </NavigationContainer>

  );
}
