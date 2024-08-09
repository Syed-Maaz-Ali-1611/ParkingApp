import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Check from '../../assets/Check.png';

const SuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reservationId, totalCharges } = route.params; // Ensure these are received

  const handlePress = () => {
    navigation.navigate('Home', { reservationId, totalCharges });
  };

  return (
    <View style={styles.container}>
      <Image style={styles.checkImage} source={Check} />
      <Text style={styles.title}>Payment Success!</Text>
      <Text style={styles.message}>1 parking slot has been booked for you.</Text>
      <TouchableOpacity style={styles.backButton} onPress={handlePress}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkImage: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  message: {
    fontSize: 20,
    color: '#fff',
  },
  backButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 35,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default SuccessScreen;
