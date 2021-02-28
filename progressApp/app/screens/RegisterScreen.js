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

class RegisterScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: 'Register',
    });

    constructor(props) {
        super(props)
        this.state = {
            userName: '',
            userEmail: '',
            userPassword: '',
            repeatPassword: ''
        }
    }

    updateValue(text, field) {
        switch (field) {
            case "userName":
                this.setState({ userName: text })
                break;
            case "userEmail":
                this.setState({ userEmail: text })
                break;
            case "userPassword":
                this.setState({ userPassword: text })
                break;
            case "repeatPassword":
                this.setState({ repeatPassword: text })
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

    userRegister = () => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (this.state.userName == "") {
            alert("Please enter Login");
            this.updateValue("", "userName")
        } else if (this.state.userEmail == "") {
            alert("Please enter Email address");
            this.updateValue("", "userEmail")
        } else if (reg.test(this.state.userEmail) === false) {
            alert("Email is Not Correct");
            this.updateValue("", "userEmail")
        } else if (this.state.userPassword == "") {
            alert("Please enter password");
            this.updateValue("", "userPassword")
        } else if (this.state.repeatPassword == "") {
            alert("Please repeat password");
            this.updateValue("", "repeatPassword")
        } else if (this.state.repeatPassword != this.state.userPassword) {
            alert("Passwords do not match");
            this.updateValue("", "repeatPassword")
        } else {
            axios.post('http://10.0.2.2:8000/api/v1/register', {
                login: this.state.userName,
                email: this.state.userEmail,
                password: this.state.userPassword
            })
                .then((res) => {
                    if (res.status == 201) {
                        // automatically login the registered user
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
                }).catch(error => {
                    if (error.response) {
                        if (error.response.data.errors.password) {
                            alert(error.response.data.errors.password);
                        } else {
                            alert(error.response.data.message);
                        }
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
                            placeholder="Enter Login"
                            style={styles.placeholder}
                            onChangeText={(text) => this.updateValue(text, "userName")}
                        />

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

                        <TextInput
                            placeholder="Repeat Password"
                            style={styles.placeholder}
                            secureTextEntry={true}
                            onChangeText={(text) => this.updateValue(text, "repeatPassword")}
                        />

                        <TouchableOpacity
                            onPress={() => this.userRegister()}
                            style={styles.btn}>
                            <Text style={styles.btnText}>Register</Text>
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
        backgroundColor: 'blue',
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
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    placeholder: {
        width: 250,
        padding: 5,
        margin: 10,
        borderColor: "#333",
        borderBottomWidth: 1.5,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
});

export default RegisterScreen;
