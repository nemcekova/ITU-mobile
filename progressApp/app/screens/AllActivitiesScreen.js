import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";
import "react-native-gesture-handler";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

class AllActivitiesScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Activities",
  });

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
    };
  }

  obtainData() {
    this.getData("userToken").then((token) => {
      axios
        .get("http://10.0.2.2:8000/api/v1/activities", {
          headers: {
            Authorization: "Bearer ".concat(token),
          },
        })
        .then((res) => {
          this.setState({ data: res.data });
          this.setState({ isLoading: false });
        })
        .catch((error) => this.handleError(error));
    });
  }

  componentDidMount() {
    this.obtainData();
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () =>
      this.obtainData()
    );
  }

  componentWillUnmount() {
    this.focusListener.remove();
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
    const data = this.state.data;
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigate("CreateActivityScreen")}
          style={styles.btn1}
        >
          <Text style={styles.btnText}>Create activity</Text>
        </TouchableOpacity>

        {this.state.isLoading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={data}
            keyExtractor={({ activity_id }, index) => activity_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() =>
                    navigate("SingleActivityScreen", {
                      obj: item,
                      name: item.activity_name,
                      unit: item.unit,
                    })
                  }
                >
                  <Text>
                    {item.activity_name}{" "}
                    {item.unit ? "[" + item.unit + "]" : ""}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  btn: {
    width: 250,
    padding: 10,
    margin: 10,
    backgroundColor: "white",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 2,
  },
  btn1: {
    width: 250,
    padding: 10,
    margin: 10,
    backgroundColor: "black",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  container: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
  },
  name: {
    margin: 10,
    fontSize: 20,
    width: "40%",
    textTransform: "uppercase",
  },
});

export default AllActivitiesScreen;
