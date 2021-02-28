import React, { Component } from 'react';
import {
    AppRegistry,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

class LoginScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: 'Login',
    });

    constructor(props) {
        super(props)
        this.state = {
            userEmail: '',
            userPassword: ''
        }
    }

    updateValue(text, field) {
        switch (field) {
            case "userEmail":
                this.setState({ userEmail: text })
                break;
            case "userPassword":
                this.setState({ userPassword: text })
                break;
        }
    }

    storeData = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value)
        } catch (e) {
            console.log(e);
        }
    }

    login = () => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (this.state.userEmail == "") {
            alert("Please enter Email address");
            this.updateValue("", "userEmail")
        } else if (reg.test(this.state.userEmail) === false) {
            alert("Email is Not Correct");
            this.updateValue("", "userEmail")
        } else if (this.state.userPassword == "") {
            alert("Please enter password");
            this.updateValue("", "userPassword")
        } else {
            axios.post('http://10.0.2.2:8000/api/v1/login', {
                email: this.state.userEmail,
                password: this.state.userPassword
            })
                .then((res) => {
                    if (res.status == 200) {
                        this.storeData('userToken', res.data.token).then(() => {
                            this.props.navigation.navigate("SplashScreen");
                        });
                    }
                }).catch((error) => {
                    if (error.response) {
                        alert(error.response.data.message);
                    }
                });
        }
        Keyboard.dismiss();
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <TextInput
                            placeholder="Enter Email"
                            style={styles.placeholder}
                            onChangeText={(text) => this.updateValue(text, "userEmail")}
                        />

                        <TextInput
                            placeholder="Enter Password"
                            style={styles.placeholder}
                            secureTextEntry={true}
                            onChangeText={(text) => this.updateValue(text, "userPassword")}
                        />

                        <TouchableOpacity
                            onPress={() => this.login()}
                            style={styles.btn}>
                            <Text style={styles.btnText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    btn: {
        width: 250,
        padding: 10,
        backgroundColor: 'black',
        alignItems: 'center'
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    placeholder: {
        width: 250,
        padding: 5,
        margin: 10,
        borderColor: "#333",
        borderBottomWidth: 1.5,
    },
});

export default LoginScreen;
