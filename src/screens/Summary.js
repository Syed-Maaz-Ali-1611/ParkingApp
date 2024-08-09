import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Button, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import pic1 from '../../assets/detailpage.jpg';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const vehicleRates = {
  car: 8400, // Rate per hour in PKR
  bike: 8400, // Rate per hour in PKR
  truck: 8400, // Rate per hour in PKR
};

const Summary = () => {
  const [vehicleType, setVehicleType] = useState('car');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60000)); // Default end time 1 minute after start time
  const [totalCharges, setTotalCharges] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [vehicleName, setVehicleName] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const selectedSlots = route.params.selectedSlots.map(slot => slot.id).join(', ');
  const slotCount = route.params.selectedSlots.length; // Number of slots booked

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('https://parking-api-alpha.vercel.app/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.status === 200) {
          setVehicleName(data.licensePlate);
        } else {
          Alert.alert('Error', data.message || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Something went wrong');
      }
    };

    fetchProfile();
  }, []);

  const calculateCharges = () => {
    const duration = (endTime - startTime) / (1000 * 60 * 60); // Duration in hours
    if (duration <= 0) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }
    const rate = vehicleRates[vehicleType];
    const charges = duration * rate * slotCount;
    if (charges < 140) { // Ensure the total amount is at least 140 PKR (~50 cents USD)
      Alert.alert('Error', 'Total amount must be at least 50 cents.');
      return;
    }
    setTotalCharges(charges); // Calculate total charges based on the number of slots
  };

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime) {
      Alert.alert('Incomplete Form', 'Please fill in all fields.');
      return;
    }
    if (endTime - startTime < 60000) {
      Alert.alert('Invalid Time', 'End time must be at least 1 minute after start time.');
      return;
    }
    calculateCharges();

    if (totalCharges < 140) { // Double-check the total amount before proceeding
      Alert.alert('Error', 'Total amount must be at least 50 cents.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://parking-api-alpha.vercel.app/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleName,
          vehicleType,
          parkingLocation: route.params.selectedPlace,
          selectedSlots: route.params.selectedSlots,
          date,
          startTime,
          endTime,
          totalCharges,
        }),
      });

      const data = await response.json();
      if (response.status === 201) {
        Alert.alert('Success', 'Reservation successful');
        navigation.navigate('PaymentType', { reservationId: data.reservation._id, totalCharges });
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleCancel = () => {
    navigation.navigate('ParkingSlot');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Parking Reservation</Text>
      <Image source={pic1} style={styles.image} />
      <Text style={styles.boldText}>Vehicle Name:</Text>
      <Text style={styles.input}>{vehicleName}</Text>
      <Text style={styles.boldText}>Vehicle Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={vehicleType}
          style={styles.picker}
          onValueChange={(itemValue) => setVehicleType(itemValue)}
          mode="dropdown" // For better compatibility on iOS and Android
        >
          <Picker.Item label="Car" value="car" />
          <Picker.Item label="Bike" value="bike" />
          <Picker.Item label="Truck" value="truck" />
        </Picker>
      </View>
      <Text style={styles.boldText}>Parking Slot Number:</Text>
      <Text style={styles.input}>{selectedSlots}</Text>
      <Text style={styles.boldText}>Start Time:</Text>
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
        <Text style={styles.input}>{startTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'android' ? 'spinner' : 'default'} // New style for Android
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) {
              setStartTime(selectedTime);
            }
          }}
        />
      )}
      <Text style={styles.boldText}>End Time:</Text>
      <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
        <Text style={styles.input}>{endTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display={Platform.OS === 'android' ? 'spinner' : 'default'} // New style for Android
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) {
              setEndTime(selectedTime);
            }
          }}
        />
      )}
      <Button title="Calculate Charges" onPress={calculateCharges} />
      <Text style={styles.chargesText}>Total Charges: Rs.{totalCharges}</Text>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    marginBottom: 20,
    color: 'black',
  },
  boldText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  input: {
    fontSize: 18,
    color: 'grey',
    marginBottom: 20,
    marginTop: 20,
  },
  pickerContainer: {
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 50,
    width: '100%',
  },
  chargesText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginTop: 20,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Summary;
