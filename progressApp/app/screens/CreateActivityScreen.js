import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

class CreateActivityScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "New activity",
  });

  constructor() {
    super();
    this.state = {
      activity_name: "",
      user_id: "",
      unit: "",
    };
  }

  updateValue(text, field) {
    switch (field) {
      case "activity_name":
        this.setState({
          activity_name: text,
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
    collection.activity_name = this.state.activity_name;
    collection.user_id = this.state.user_id;
    collection.unit = this.state.unit;

    this.getData("userToken").then((token) => {
      axios
        .post(
          "http://10.0.2.2:8000/api/v1/activities",
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
            // why 200? should be 201
            this.props.navigation.navigate("AllActivitiesScreen");
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TextInput
              placeholder="Activity name"
              style={styles.placeholder}
              onChangeText={(text) => this.updateValue(text, "activity_name")}
            />

            <TextInput
              placeholder="Unit (km/kg/m)"
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

export default CreateActivityScreen;
