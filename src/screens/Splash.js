import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect } from 'react'
import splash from '../../assets/splash.png'
import { useNavigation } from '@react-navigation/native'
import Login from './Login'
import { TouchableOpacity } from 'react-native-gesture-handler'

const Splash = () => {
    const navigation = useNavigation()
    useEffect(() => {
        setTimeout(() => {
            navigation.navigate("Login")
        }, 2000)
    }, [])

    return (
        <View style={styles.container}>
            <Image
                source={splash}
                style={styles.backgroundImage}
            />
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.button} onPress={() => {
                    navigation.navigate("Login")
                }}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default Splash

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 60, // Adjust based on your design
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: 20,
        paddingHorizontal: 60,
        borderRadius: 25,

    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

