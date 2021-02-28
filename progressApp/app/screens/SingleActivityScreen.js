import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    ActivityIndicator,
    Keyboard,
    FlatList,
    Dimensions,
    TouchableWithoutFeedback
} from "react-native";
import {
    TextInput,
    State
} from "react-native-gesture-handler";
import {
    LineChart,
} from "react-native-chart-kit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

class SingleActivityScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.getParam('name', 'An activity') + (navigation.getParam('unit', 'some unit') ? ' [' + navigation.getParam('unit', 'some unit') + ']' : '')
    });

    constructor(props) {
        super(props);
        this.state = {
            activity_name: '',
            activity_id: '',
            unit: '',
            activity_logs: [],
            activity_timestamps: [],
            newest_log_id: '',
            add_log_value: '',
            isLoading: true,
            keyboardOpened: false
        };
    }

    componentDidMount() {
        this.getLogs();
        const { navigation } = this.props;
        this.focusListener = navigation.addListener('didFocus', () => this.getLogs());
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount() {
        this.focusListener.remove();
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {
        this.setState({
            keyboardOpened: true
        });
    }

    _keyboardDidHide = () => {
        this.setState({
            keyboardOpened: false
        });
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

    getLogs() {
        const { navigate, state } = this.props.navigation;
        this.setState({
            activity_name: state.params.obj.activity_name,
            activity_id: state.params.obj.activity_id,
            unit: state.params.obj.unit
        });

        this.getData('userToken').then((token) => {
            axios.get("http://10.0.2.2:8000/api/v1/log/", {
                headers: {
                    'Authorization': 'Bearer '.concat(token)
                }
            })
                .then((res) => {
                    if (res.status == 200) {
                        for (let i = 0; i < res.data.length; i++) {
                            if (res.data[i].activity_id == this.state.activity_id) {
                                this.setState({ newest_log_id: res.data[0].log_id });
                                break;
                            }
                        }

                        var tmp_logs = [];
                        var tmp_timestamps = [];
                        for (let i = 0; i < res.data.length; i++) {
                            if (i >= 7) {
                                // there will by only 7 newest logs in graph
                                break;
                            }
                            if (res.data[i].activity_id == this.state.activity_id) {
                                tmp_logs.push(res.data[i].value);
                                var tmpArray = res.data[i].created_at.split(' ');
                                tmp_timestamps.push(tmpArray[0] + ' ' + tmpArray[1]);
                            }
                        }
                        this.setState({ activity_logs: tmp_logs.reverse() });
                        this.setState({ activity_timestamps: tmp_timestamps.reverse() });
                        this.setState({ isLoading: false });
                    }
                })
                .catch((error) => this.handleError(error));
        });
    }

    delete(activity_id) {
        this.getData('userToken').then((token) => {
            axios.delete("http://10.0.2.2:8000/api/v1/activities/" + activity_id, {
                headers: {
                    'Authorization': 'Bearer '.concat(token)
                }
            })
                .then((res) => {
                    if (res.status == 200) {
                        this.props.navigation.navigate("AllActivitiesScreen");
                    }
                })
                .catch((error) => this.handleError(error));
        });
    }

    deleteLastLog() {
        this.getData('userToken').then((token) => {
            axios.delete("http://10.0.2.2:8000/api/v1/log/" + this.state.newest_log_id, {
                headers: {
                    'Authorization': 'Bearer '.concat(token)
                }
            })
                .then((res) => {
                    if (res.status == 200) {
                        this.getLogs();
                    }
                })
                .catch((error) => this.handleError(error));
        });
    }

    addLog() {
        let collection = {};
        collection.activity_id = this.state.activity_id;
        collection.value = this.state.add_log_value;

        this.getData('userToken').then((token) => {
            axios.post("http://10.0.2.2:8000/api/v1/log/",
                JSON.stringify(collection), {
                headers: {
                    'Authorization': 'Bearer '.concat(token),
                    'Content-Type': 'application/json'
                }
            })
                .then((res) => {
                    if (res.status == 201) {
                        this.setState({ add_log_value: '' });
                        this.getLogs();
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
                    this.setState({ add_log_value: '' });
                    alert('Invalid data')
                    break;
                default:
                    this.setState({ add_log_value: '' });
                    alert(error.response.data.message);
                    break;
            }
        }
    }

    render() {
        var oldLog = this.state.add_log_value;
        let collection = {}
        collection.activity_id = this.state.activity_id;
        collection.activity_name = this.state.activity_name;
        collection.unit = this.state.unit;
        const { navigate } = this.props.navigation;

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => this.delete(collection.activity_id)}>
                                <Text style={styles.btnText}>Delete</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => navigate("EditActivityScreen", { obj: collection })}>
                                <Text style={styles.btnText}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.container}>
                            {this.state.isLoading ? (
                                <ActivityIndicator />
                            ) : (
                                    <View style={styles.content}>
                                        {this.state.activity_logs.length > 0 ? (
                                            <View style={styles.content}>
                                                <Text>Progress graph</Text>

                                                <LineChart
                                                    data={{
                                                        labels: this.state.activity_timestamps,
                                                        datasets: [
                                                            {
                                                                data: this.state.activity_logs
                                                            }
                                                        ]
                                                    }}
                                                    width={Dimensions.get("window").width * 0.9} // from react-native
                                                    height={this.state.keyboardOpened ? Dimensions.get("window").width * 0.5 : Dimensions.get("window").width * 0.9}
                                                    yAxisSuffix={' ' + this.state.unit}
                                                    chartConfig={{
                                                        backgroundColor: "#311287",
                                                        backgroundGradientFrom: "#9eefff",
                                                        backgroundGradientTo: "#9ecdff",
                                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                        propsForDots: {
                                                            r: "6",
                                                            strokeWidth: "2",
                                                            stroke: "#ffa726"
                                                        }
                                                    }}
                                                    bezier
                                                    style={{
                                                        marginVertical: 10,
                                                        borderRadius: 5
                                                    }}
                                                    renderDotContent={({ x, y, index }) => <Text key={index} style={{ position: 'absolute', top: y - 25, left: x }}>{this.state.activity_logs[index]}</Text>}
                                                />
                                            </View>
                                        ) : (
                                                <Text>Add some data please...</Text>
                                            )}
                                    </View>
                                )}
                        </View>

                        <View style={styles.buttons}>
                            <TextInput
                                placeholder="New log"
                                value={oldLog}
                                style={styles.placeholder}
                                onChangeText={(text) => this.setState({ add_log_value: text })}
                            />

                            <TouchableOpacity
                                style={styles.btn2}
                                onPress={() => this.addLog()}>
                                <Text>Add log</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btn2}
                                onPress={() => this.deleteLastLog()}>
                                <Text>Delete last log</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    btn: {
        width: '30%',
        padding: 5,
        margin: 10,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btn2: {
        width: '30%',
        padding: 5,
        margin: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "black",
        borderWidth: 2,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    buttons: {
        flexDirection: 'row',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        width: '20%',
        padding: 5,
        margin: 10,
        borderColor: "#333",
        borderBottomWidth: 1.5,
    },
});

export default SingleActivityScreen;
