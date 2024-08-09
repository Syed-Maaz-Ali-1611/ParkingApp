import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import loginimg from '../../assets/loginimg.png';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('https://parking-api-alpha.vercel.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.status === 200) {
                await AsyncStorage.setItem('token', data.token);
                Alert.alert('Success', 'Login successful');
                navigation.navigate("Main");
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        }
    };

    const handleRegister = () => {
        navigation.navigate("RegisterScreen");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>LOOKING FOR PARKING PLACES?</Text>
                </View>
                <View style={styles.imageContainer}>
                    <Image source={loginimg} style={styles.imagePlaceholder} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>Login</Text>
                </View>
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="********"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <Text style={styles.orText}>Don't have an account? then</Text>
                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: 'white',
        padding: 30,
        alignItems: 'center',
    },
    header: {
        marginTop: 30,
        marginBottom: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Arial',
        textTransform: 'uppercase',
        color: 'blue',
        textAlign: 'center',
    },
    imageContainer: {
        width: 250,
        height: 150,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    textContainer: {
        marginBottom: 15,
    },
    text: {
        fontSize: 20,
        color: '#000',
        fontFamily: 'Lao Sans Pro',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    form: {
        width: '100%',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: "black"
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orText: {
        fontSize: 14,
        color: '#000',
        marginTop: 10,
        marginBottom: 20,
        fontFamily: 'Arial',
        textAlign: 'center',
    },
});

export default Login;
