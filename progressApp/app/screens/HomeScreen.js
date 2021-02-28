import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

class HomeScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: 'Welcome',
    });

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <Text style={styles.pageName}>Progress App</Text>

                <TouchableOpacity
                    onPress={() => navigate('LoginScreen')}
                    style={styles.btn1}>
                    <Text style={styles.btnText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigate('RegisterScreen')}
                    style={styles.btn2}>
                    <Text style={styles.btnText}>Register</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    btn1: {
        backgroundColor: 'black',
        padding: 10,
        margin: 10,
        width: '85%',
        alignItems: 'center',
    },
    btn2: {
        backgroundColor: 'blue',
        padding: 10,
        margin: 10,
        marginBottom: 50,
        width: '85%',
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    pageName: {
        position: 'absolute',
        top: 150,
        margin: 10,
        fontWeight: '500',
        fontSize: 48,
        color: '#000',
        textAlign: 'center'
    },
});

export default HomeScreen;
