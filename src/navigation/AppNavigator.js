
import React from 'react'
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Splash from '../screens/Splash';
import Login from '../screens/Login';
import RegisterScreen from '../screens/RegisterScreen';
import Main from './Main';
import Summary from '../screens/Summary';
import PaymentType from '../screens/PaymentType';
import SuccessScreen from '../screens/SuccessScreen';

const stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <stack.Navigator>
        <stack.Screen
          name="Splash" component={Splash} options={{ headerShown: false }}
        />
        <stack.Screen
          name="Main" component={Main} options={{ headerShown: false }}
        />
                <stack.Screen
          name="Login" component={Login} options={{ headerShown: false }}
        />
        <stack.Screen
          name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }}
        />
               <stack.Screen name='Summary' component={Summary} options={{ headerShown: false }}></stack.Screen>
        <stack.Screen name='PaymentType' component={PaymentType} options={{ headerShown: false }}></stack.Screen>
        <stack.Screen name='SuccessScreen' component={SuccessScreen} options={{ headerShown: false }}></stack.Screen>
      </stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator

const styles = StyleSheet.create({});