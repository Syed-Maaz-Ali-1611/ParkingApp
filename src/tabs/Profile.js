import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import user from '../../assets/user.png';

const Profile = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [owner, setOwner] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const response = await fetch('https://parking-api-alpha.vercel.app/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        const data = await response.json();
        setProfilePic(data.profilePic ? `https://parking-api-alpha.vercel.app/${data.profilePic.replace(/\\/g, '/')}` : null);
        setName(data.name || '');
        setAge(data.age ? data.age.toString() : '');
        setEmail(data.email || '');
        setVehicle(data.vehicle || '');
        setModel(data.model || '');
        setLicensePlate(data.licensePlate || '');
        setOwner(data.owner || '');
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', error.message || 'Something went wrong. Please try again later.');
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to make this work!');
      }
    };
    requestPermissions();
  }, []);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('age', age);
    formData.append('email', email);
    formData.append('vehicle', vehicle);
    formData.append('model', model);
    formData.append('licensePlate', licensePlate);
    formData.append('owner', owner);
  
    if (profilePic) {
      const fileName = profilePic.split('/').pop();
      const fileType = profilePic.split('.').pop();
      formData.append('profilePic', {
        uri: profilePic,
        name: fileName,
        type: `image/${fileType}`,
      });
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await fetch('https://parking-api-alpha.vercel.app/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      const data = await response.json();
      Alert.alert('Success', 'Profile updated successfully');
      setModalVisible(false);
      setProfilePic(data.profilePic ? `https://parking-api-alpha.vercel.app/${data.profilePic.replace(/\\/g, '/')}` : null);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again later.');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image picker result:', result); // Log the full result

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfilePic(uri);
      console.log('Picked image:', uri); // Debug log
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login'); // Navigate to the login screen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.photoPlaceholder}>
            <Image style={styles.photo} source={profilePic ? { uri: profilePic } : user} />
          </View>
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name: <Text style={styles.infoText}>{name}</Text></Text>
          <Text style={styles.label}>Age: <Text style={styles.infoText}>{age}</Text></Text>
          <Text style={styles.label}>Email: <Text style={styles.infoText}>{email}</Text></Text>
          <Text style={styles.label}>Vehicle: <Text style={styles.infoText}>{vehicle}</Text></Text>
          <Text style={styles.label}>Model: <Text style={styles.infoText}>{model}</Text></Text>
          <Text style={styles.label}>License Plate: <Text style={styles.infoText}>{licensePlate}</Text></Text>
          <Text style={styles.label}>Owner: <Text style={styles.infoText}>{owner}</Text></Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.labelText}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <Text style={styles.labelText}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                keyboardType='numeric'
                onChangeText={setAge}
              />
              <Text style={styles.labelText}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.labelText}>Vehicle</Text>
              <TextInput
                style={styles.input}
                placeholder="Vehicle"
                value={vehicle}
                onChangeText={setVehicle}
              />
              <Text style={styles.labelText}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="Model"
                value={model}
                onChangeText={setModel}
              />
              <Text style={styles.labelText}>License Plate</Text>
              <TextInput
                style={styles.input}
                placeholder="License Plate"
                value={licensePlate}
                onChangeText={setLicensePlate}
              />
              <Text style={styles.labelText}>Owner</Text>
              <TextInput
                style={styles.input}
                placeholder="Owner"
                value={owner}
                onChangeText={setOwner}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  profileContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#cccefc',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C4C4C4',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 4,
    padding: 2,
    fontWeight: 'bold',
    color: '#222233',
    fontFamily: 'System',
  },
  infoText: {
    fontWeight: 'normal',
  },
  labelText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutContainer: {
    width: '100%',
    padding: 16,
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  input: {
    width: '100%',
    padding: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
    marginBottom: 10,
    fontFamily: 'System',
    color: 'black',
  },
  buttonContainer: {
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
