import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Keyboard,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

class CreateBodyParameterScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "New body parameter",
  });

  constructor() {
    super();
    this.state = {
      body_parameter_name: "",
      user_id: "",
      unit: "",
    };
  }

  updateValue(text, field) {
    switch (field) {
      case "body_parameter_name":
        this.setState({
          body_parameter_name: text,
        });
        break;
      case "user_id":
        this.setState({
          user_id: text,
        });
        break;
      case "unit":
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
  };

  removeData = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.log(e);
    }
  };

  componentDidMount() {
    this.getData("userToken").then((token) => {
      axios
        .get("http://10.0.2.2:8000/api/v1/me", {
          headers: {
            Authorization: "Bearer ".concat(token),
          },
        })
        .then((res) => {
          this.updateValue(res.data.id, "user_id");
        })
        .catch((error) => this.handleError(error));
    });
  }

  submit() {
    let collection = {};
    collection.body_parameter_name = this.state.body_parameter_name;
    collection.user_id = this.state.user_id;
    collection.unit = this.state.unit;

    this.getData("userToken").then((token) => {
      axios
        .post(
          "http://10.0.2.2:8000/api/v1/bodyparameters",
          JSON.stringify(collection),
          {
            headers: {
              Authorization: "Bearer ".concat(token),
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          if (res.status == 200) {
            this.props.navigation.navigate("ProfileScreen");
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
          alert("New login is necessary");
          this.removeData("userToken").then(() => {
            this.props.navigation.navigate("SplashScreen");
          });
          break;
        case 500:
          // SQL Error
          alert("Invalid data");
          break;
        default:
          alert(error.response.data.message);
          break;
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="Body parameter name"
          style={styles.placeholder}
          onChangeText={(text) => this.updateValue(text, "body_parameter_name")}
        />

        <TextInput
          placeholder="Unit (%/kg/cm)"
          style={styles.placeholder}
          onChangeText={(text) => this.updateValue(text, "unit")}
        />

        <TouchableOpacity style={styles.btn} onPress={() => this.submit()}>
          <Text style={styles.btnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  btn: {
    width: 250,
    padding: 10,
    backgroundColor: "black",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  placeholder: {
    width: 250,
    padding: 5,
    margin: 10,
    borderColor: "#333",
    borderBottomWidth: 1.5,
  },
});

export default CreateBodyParameterScreen;
