import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Home from '../tabs/Home';
import Profile from '../tabs/Profile';
import ParkingSlot from '../tabs/ParkingSlot';
import home from '../../assets/home.png';
import booking from '../../assets/booking.png';
import account from '../../assets/account.png';

const Tab = createMaterialBottomTabNavigator();

const Main = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="blue"
      inactiveColor="black"
      barStyle={{
        backgroundColor: 'white',
        overflow: 'hidden',
            
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Image source={home} style={{ height: 30, width: 30, tintColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="ParkingSlot"
        component={ParkingSlot}
        options={{
          tabBarLabel: 'Booking',
          tabBarIcon: ({ color }) => (
            <Image source={booking} style={{ height: 30, width: 30, tintColor: color }} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Image source={account} style={{ height: 30, width: 30, tintColor: color }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Main;

const styles = StyleSheet.create({});
