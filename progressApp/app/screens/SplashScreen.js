import React, { Component } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SplashScreen extends Component {
    getData = async (key) => {
        try {
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        this.getData('userToken').then((token) => {
            if (token != null) {
                this.props.navigation.navigate('App');
            } else {
                this.props.navigation.navigate('Auth');
            }
        });
    }

    render() {
        return (
            <View>
                <ActivityIndicator />
            </View>
        );
    }
}

export default SplashScreen
