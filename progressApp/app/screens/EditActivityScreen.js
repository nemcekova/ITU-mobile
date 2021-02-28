import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import {
    TextInput,
    State
} from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

class EditActivityScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: "Edit activity",
    });

    constructor(props) {
        super(props);
        this.state = {
            activity_name: '',
            activity_id: '',
            unit: '',
        };
    }

    componentDidMount() {
        const { navigate, state } = this.props.navigation;
        this.setState({
            activity_name: state.params.obj.activity_name,
            activity_id: state.params.obj.activity_id,
            unit: state.params.obj.unit
        });
    }

    updateValue(text, field) {
        switch (field) {
            case 'activity_name':
                this.setState({
                    activity_name: text,
                });
                break;
            case 'unit':
                this.setState({
                    unit: text,
                });
                break;
        }
    }

    getData = async (key) => {
        try {
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.log(e);
        }
    }

    removeData = async (key) => {
        try {
            await AsyncStorage.removeItem(key);
        }
        catch (e) {
            console.log(e);
        }
    }

    submit() {
        let collection = {};
        collection.activity_name = this.state.activity_name;
        collection.unit = this.state.unit;
        collection.activity_id = this.state.activity_id;

        this.getData('userToken').then((token) => {
            axios.put("http://10.0.2.2:8000/api/v1/activities/" + this.state.activity_id,
                JSON.stringify(collection), {
                headers: {
                    'Authorization': 'Bearer '.concat(token),
                    'Content-Type': 'application/json'
                }
            })
                .then((res) => {
                    if (res.status == 200) {
                        console.log(collection);
                        this.props.navigation.navigate("SingleActivityScreen", { obj: collection, name: collection.activity_name, unit: collection.unit });
                    }
                })
                .catch((error) => this.handleError(error));
        });
        Keyboard.dismiss();
    }

    handleError(error) {
        console.log(error);

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    alert('New login is necessary');
                    this.removeData('userToken').then(() => {
                        this.props.navigation.navigate("SplashScreen");
                    });
                    break;
                case 500:
                    // SQL Error
                    alert('Invalid data')
                    break;
                default:
                    alert(error.response.data.message);
                    break;
            }
        }
    }

    render() {
        var oldName = this.state.activity_name;
        var oldUnit = this.state.unit;
        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <TextInput
                            placeholder="Activity Name"
                            value={oldName}
                            style={styles.placeholder}
                            onChangeText={(text) => this.updateValue(text, "activity_name")}
                        />

                        <TextInput
                            placeholder="Unit (km/kg/m)"
                            value={oldUnit}
                            style={styles.placeholder}
                            onChangeText={(text) => this.updateValue(text, "unit")}
                        />

                        <TouchableOpacity style={styles.btn} onPress={() => this.submit()}>
                            <Text style={styles.btnText}>Submit</Text>
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

export default EditActivityScreen;
