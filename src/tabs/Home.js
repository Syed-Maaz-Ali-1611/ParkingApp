import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity, Modal, Button, Alert, Vibration } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { Audio } from 'expo-av';
import parking from '../../assets/parking.png';

const Home = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const [parkingPlaces, setParkingPlaces] = useState([
    { name: 'Nepa', slots: '8', latitude: 24.9185, longitude: 67.0976 },
    { name: 'Gulshan', slots: '5', latitude: 24.9170, longitude: 67.0960 },
    { name: 'Johar', slots: '10', latitude: 24.9160, longitude: 67.0950 },
  ]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(''); // Timer state

  useEffect(() => {
    if (route.params?.reservationId) {
      fetchReservation(route.params.reservationId);
    }
  }, [route.params]);

  const fetchReservation = async (reservationId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`https://parking-api-alpha.vercel.app/reservations/${reservationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        console.error('Response text:', text);
        Alert.alert('Error', 'Failed to fetch reservation data. Please try again.');
        return;
      }

      setReservation(data);
      scheduleTimer(data.startTime, data.endTime, reservationId);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      Alert.alert('Error', 'Something went wrong while fetching reservation data.');
    }
  };

  const scheduleTimer = (startTime, endTime, reservationId) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const now = new Date().getTime();
    const timeToStart = start - now;

    setTimeout(() => {
      startTimer(end, reservationId);
    }, timeToStart);
  };

  const startTimer = (endTime, reservationId) => {
    const end = new Date(endTime).getTime();

    const interval = setInterval(async () => {
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('00:00:00');
        Vibration.vibrate();
        playAlertTone();
        Alert.alert('Time Up', 'Your reservation time has ended.');
        await removeReservation(reservationId);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);
  };

  const playAlertTone = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/alert_tone.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing alert tone:', error);
    }
  };

  const removeReservation = async (reservationId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`https://parking-api-alpha.vercel.app/reserve/${reservationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Reservation time expired and has been removed.');
        setReservation(null);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error removing reservation:', error);
      Alert.alert('Error', 'Something went wrong while removing reservation.');
    }
  };

  const handleZoom = (latitude, longitude) => {
    mapRef.current.animateToRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
  };

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
    setModalVisible(true);
  };

  const handleBookRide = () => {
    setModalVisible(false);
    navigation.navigate('ParkingSlot', { place: selectedPlace });
  };

  const fetchSlots = async (location) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`https://parking-api-alpha.vercel.app/slots/${location}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching slots:', error);
      Alert.alert('Error', 'Something went wrong while fetching slots.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 24.9180,
          longitude: 67.0971,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {parkingPlaces.map((place, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={`${place.slots} slots available`}
            onPress={() => handleMarkerPress(place)}
          />
        ))}
      </MapView>

      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Find Parking Spot</Text>
      </View>

      <View style={styles.nearbyContainer}>
        <Text style={styles.title}>NEARBY PARKING PLACES</Text>
        <ScrollView>
          {parkingPlaces.map((place, index) => (
            <NearbyParking
              key={index}
              name={place.name}
              slots={place.slots}
              onPress={() => handleZoom(place.latitude, place.longitude)}
            />
          ))}
        </ScrollView>
      </View>

      {reservation && (
        <View style={styles.reservationContainer}>
          <Text style={styles.timeLeftText}>Time Left: {timeLeft}</Text>
        </View>
      )}

      {selectedPlace && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Do you want to book a ride to {selectedPlace.name}?</Text>
              <View style={styles.modalButtons}>
                <Button title="Yes" onPress={handleBookRide} />
                <Button title="No" color="red" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const NearbyParking = ({ name, slots, onPress }) => (
  <TouchableOpacity style={styles.parkingItem} onPress={onPress}>
    <Image source={parking} style={styles.parkingImage} />
    <View>
      <Text style={styles.parkingName}>{name}</Text>
      <Text style={styles.parkingSlots}>{slots} slots available</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    marginHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222233',
  },
  nearbyContainer: {
    position: 'absolute',
    bottom: 15,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    color: '#222233',
    padding: 4,
  },
  parkingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  parkingName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#161629',
  },
  parkingImage: {
    width: 25,
    height: 25,
    marginRight: 10,
    bottom: 10,
  },
  parkingSlots: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  reservationContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
  },
  timeLeftText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222233',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default Home;
