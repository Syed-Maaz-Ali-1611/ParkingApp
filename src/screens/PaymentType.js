import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

const PaymentType = () => {
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { reservationId, totalCharges } = route.params;
  const stripe = useStripe();

  useEffect(() => {
    if (selectedPaymentType === 'CARD') {
      handleStripePayment();
    }
  }, [selectedPaymentType]);

  const handlePaymentTypeSelection = (type) => {
    setSelectedPaymentType(type);
  };

  const handleStripePayment = async () => {
    try {
      if (totalCharges < 0.5) {
        Alert.alert('Error', 'Amount must be at least 50 cents.');
        return;
      }
  
      const response = await fetch('https://parking-api-alpha.vercel.app/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Math.round(totalCharges * 100) }), // Stripe expects the amount in cents
      });
  
      const responseText = await response.text();
      console.log('Response Text:', responseText); // Log the raw response text
  
      const jsonResponse = JSON.parse(responseText);
      if (jsonResponse.error) {
        throw new Error(jsonResponse.error);
      }
  
      const { clientSecret } = jsonResponse;
  
      const { error } = await stripe.initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Parking', // Add your merchant name here
        returnURL: 'park://payment-completed', // Update this to match your app's scheme
      });
  
      if (!error) {
        const { error: paymentError } = await stripe.presentPaymentSheet({
          clientSecret,
        });
  
        if (paymentError) {
          Alert.alert('Payment failed', paymentError.message);
        } else {
          // Payment successful, save the reservation
          saveReservation();
        }
      } else {
        Alert.alert('Payment sheet initialization failed', error.message);
      }
    } catch (error) {
      console.error('Error in handleStripePayment:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };
  

  const saveReservation = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://parking-api-alpha.vercel.app/save-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reservationId, totalCharges }),
      });

      const data = await response.json();
      if (response.status === 201) {
        Alert.alert('Success', 'Reservation saved successfully');
        navigation.navigate('SuccessScreen', { reservationId, totalCharges });
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      Alert.alert('Error', 'Something went wrong while saving the reservation.');
    }
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel the payment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              console.log('Token:', token);  // Log token for debugging
              console.log('Reservation ID:', reservationId);  // Log reservation ID for debugging

              const response = await fetch(`https://parking-api-alpha.vercel.app/reserve/${reservationId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.status === 200) {
                Alert.alert('Success', 'Reservation cancelled successfully');
                navigation.navigate('ParkingSlot');  // Navigate back to the slot page
              } else {
                const data = await response.json();
                Alert.alert('Error', data.message || 'Something went wrong');
              }
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert('Error', 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  return (
    <StripeProvider publishableKey="pk_test_51PNdjnECRSK15cD8R2W21IDXSUqYiO9zH3oIa7nZ0csT97jJlODGdJyY7gvvC1QbEkWab3eorCVORF5Nh7mJjT3P00WnjNTJ55">
      <View style={styles.container}>
        <Text style={styles.title}>PAYMENT TYPE</Text>
      
        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => handlePaymentTypeSelection('CARD')}
        >
          <Text style={styles.optionText}>CARD</Text>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>TOTAL</Text>
          <Text style={styles.totalText}>Rs.{totalCharges}</Text>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handleStripePayment}>
          <Text style={styles.payButtonText}>Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPayment}>
          <Text style={styles.cancelButtonText}>Cancel Payment</Text>
        </TouchableOpacity>
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 30,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  optionText: {
    fontSize: 16,
  },
  plusIcon: {
    fontSize: 20,
    color: '#007bff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default PaymentType;
