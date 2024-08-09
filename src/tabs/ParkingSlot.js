import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pic1 from '../../assets/slotpage.jpg';

const parkingPlaces = [
  { name: 'Nepa', slots: '8', latitude: 24.9185, longitude: 67.0976 },
  { name: 'Gulshan', slots: '5', latitude: 24.9170, longitude: 67.0960 },
  { name: 'Johar', slots: '10', latitude: 24.9160, longitude: 67.0950 },
];

const ParkingSlot = () => {
  const [step, setStep] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [parkingSlots, setParkingSlots] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedPlace) {
        const token = await AsyncStorage.getItem('token');
        fetch(`https://parking-api-alpha.vercel.app/slots/${selectedPlace.name}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (!data || !data.slots) {
              console.error('Invalid response structure:', data);
              return;
            }
            console.log('Fetched slots:', data.slots);
            setParkingSlots(data.slots);
          })
          .catch((error) => console.error('Error fetching slots:', error));
      }
    };

    fetchSlots();
  }, [selectedPlace]);

  const handlePlacePress = (place) => {
    setSelectedPlace(place);
    setStep(2);
  };

  const handleSlotPress = (slot) => {
    console.log('Slot pressed:', slot);
    if (slot.unavailable) {
      Alert.alert('Slot Unavailable', 'This slot is already booked.');
      return;
    }
    setParkingSlots((prevSlots) =>
      prevSlots.map((s) =>
        s.id === slot.id ? { ...s, selected: !s.selected } : s
      )
    );
  };

  const handleContinuePress = () => {
    const selectedSlots = parkingSlots.filter((slot) => slot.selected);
    if (selectedSlots.length === 0) {
      Alert.alert('No Slot Selected', 'Please select at least one slot.');
      return;
    }
    navigation.navigate('Summary', { selectedPlace: selectedPlace.name, selectedSlots });
  };

  const handleBackPress = () => {
    setStep(1);
    setSelectedPlace(null);
    setParkingSlots([]);
  };

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <View style={styles.placesContainer}>
          <Text style={styles.title}>Select a Parking Location</Text>
          {parkingPlaces.map((place, index) => (
            <TouchableOpacity
              key={index}
              style={styles.place}
              onPress={() => handlePlacePress(place)}
            >
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeDetails}>{place.slots} slots available</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <>
          <Text style={styles.title}>Select the Required Parking Slots at {selectedPlace.name}</Text>
          <Image source={pic1} style={styles.image} />
          <View style={styles.slotContainer}>
            {parkingSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slot,
                  slot.selected && styles.selectedSlot,
                  slot.unavailable && styles.unavailableSlot,
                ]}
                disabled={slot.unavailable}
                onPress={() => handleSlotPress(slot)}
              >
                <Text style={styles.slotText}>{slot.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: 'black',
  },
  placesContainer: {
    width: '100%',
  },
  place: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  slot: {
    width: 40,
    height: 40,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10, // Added border radius
  },
  selectedSlot: {
    backgroundColor: '#1EFF24',
  },
  unavailableSlot: {
    backgroundColor: '#FF1E1E',
  },
  slotText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: '#007bff',
    padding: 10, // Reduced padding
    marginTop: 20,
    width: 200, // Reduced width
    borderRadius: 10, // Added border radius
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16, // Reduced font size
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#FF6347',
    padding: 10, // Reduced padding
    marginTop: 10, // Reduced margin top
    width: 200, // Reduced width
    borderRadius: 10, // Added border radius
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16, // Reduced font size
    textAlign: 'center',
  },
});

export default ParkingSlot;
