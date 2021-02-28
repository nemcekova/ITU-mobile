import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserAvatar from "react-native-user-avatar";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";
import _ from "lodash";
import Carousel, { Pagination } from "react-native-snap-carousel";
import moment from "moment";

class ProfileScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    tabBarLabel: "Profile",
  });

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      body_parameter: [],
      isLoading: true,
      logs: [],
      body_logs: {},
      activeSlide: 0,
      add_log_value: "",
      active_body_param: "",
    };
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
    this.getData("userToken")
      .then((token) => {
        axios
          .get("http://10.0.2.2:8000/api/v1/me", {
            headers: {
              Authorization: "Bearer ".concat(token),
            },
          })
          .then((res) => {
            this.setState({ data: res.data });
          })
          .catch((error) => this.handleError(error));
        this.getData("userToken").then((token) => {
          axios
            .get("http://10.0.2.2:8000/api/v1/bodyparameters", {
              headers: {
                Authorization: "Bearer ".concat(token),
              },
            })
            .then((res) => {
              this.setState({
                body_parameter: res.data,
                active_body_param: res.data[0]
                  ? res.data[0].body_parameter_id
                  : "",
              });
            })
            .catch((error) => this.handleError(error));

          axios
            .get("http://10.0.2.2:8000/api/v1/bodyparamlogs", {
              headers: {
                Authorization: "Bearer ".concat(token),
              },
            })
            .then((res) => {
              this.setState({ logs: res.data });
            })
            .catch((error) => this.handleError(error));
        });
      })
      .then(() => this.setState({ isLoading: false }));

    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () =>
      this.getLogs()
    );
  }

  componentWillUnmount() {
    this.focusListener.remove();
  }

  logout() {
    this.getData("userToken").then((token) => {
      axios
        .post(
          "http://10.0.2.2:8000/api/v1/logout",
          {},
          {
            headers: {
              Authorization: "Bearer ".concat(token),
            },
          }
        )
        .then((res) => {
          if (res.status == 200) {
            this.removeData("userToken").then(() => {
              this.props.navigation.navigate("SplashScreen");
            });
          }
        })
        .catch((error) => this.handleError(error));
    });
  }

  getLogs() {
    this.getData("userToken").then((token) => {
      axios
        .get("http://10.0.2.2:8000/api/v1/bodyparameters", {
          headers: {
            Authorization: "Bearer ".concat(token),
          },
        })
        .then((res) => {
          this.setState({
            body_parameter: res.data,
          });
          if (
            this.state.active_body_param == "" &&
            this.state.body_parameter.length > 0
          ) {
            this.setState({
              active_body_param: res.data[0].body_parameter_id,
            });
          }
        })
        .catch((error) => this.handleError(error));

      axios
        .get("http://10.0.2.2:8000/api/v1/bodyparamlogs", {
          headers: {
            Authorization: "Bearer ".concat(token),
          },
        })
        .then((res) => {
          this.setState({ logs: res.data });
        })
        .catch((error) => this.handleError(error));
    });
  }

  addLog() {
    let collection = {};
    collection.body_parameter_id = this.state.active_body_param;
    collection.value = this.state.add_log_value;
    this.getData("userToken").then((token) => {
      axios
        .post("http://10.0.2.2:8000/api/v1/log/", JSON.stringify(collection), {
          headers: {
            Authorization: "Bearer ".concat(token),
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status == 201) {
            this.setState({ add_log_value: "" });
            this.getLogs();
          }
        })
        .catch((error) => this.handleError(error));
    });
    Keyboard.dismiss();
  }

  deleteLastLog() {
    const logs = _.uniqBy(this.state.logs, "body_parameter_id");
    let log_id = 0;
    for (const log in logs) {
      if (logs[log].body_parameter_id == this.state.active_body_param)
        log_id = logs[log].log_id;
    }
    this.getData("userToken").then((token) => {
      axios
        .delete("http://10.0.2.2:8000/api/v1/log/" + log_id, {
          headers: {
            Authorization: "Bearer ".concat(token),
          },
        })
        .then((res) => {
          if (res.status == 200) {
            this.getLogs();
          }
        })
        .catch((error) => this.handleError(error));
    });
  }

  unregister() {
    Alert.alert(
      "",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => {
            this.getData("userToken").then((token) => {
              axios
                .delete("http://10.0.2.2:8000/api/v1/unregister", {
                  headers: {
                    Authorization: "Bearer ".concat(token),
                  },
                })
                .then((res) => {
                  if (res.status == 200) {
                    this.removeData("userToken").then(() => {
                      this.props.navigation.navigate("SplashScreen");
                    });
                  }
                })
                .catch((error) => this.handleError(error));
            });
          },
        },
      ],
      { cancelable: false }
    );
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
    const data = this.state.data;
    const activeSlide = this.state.activeSlide;
    const { navigate } = this.props.navigation;

    const body_logs = _.groupBy(this.state.logs, "body_parameter_id");
    const arrayList = [];

    for (const group in body_logs) {
      const group_log = body_logs[group].reverse();
      const obj = {
        title: "",
        labels: [],
        unit: "",
        id: "",
        datasets: [
          {
            data: [],
          },
        ],
      };
      for (const log in group_log) {
        obj["title"] = group_log[log].body_parameter_name;
        obj.datasets[0].data.push(group_log[log].value);
        const date = moment(
          group_log[log].created_at,
          "YYYY-MM-DD hh:mm:ss"
        ).format("DD.MM.");
        obj["labels"].push(date);
        obj.unit = group_log[log].unit;
        obj.id = group_log[log].body_parameter_id;
      }
      arrayList.push(obj);
    }
    const { width: windowWidth, height: windowHeight } = Dimensions.get(
      "window"
    );

    const chartConfig = {
      backgroundGradientFrom: "#1E2923",
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: "#08130D",
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => this.logout()}
          style={styles.btnLogout}
        >
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.unregister()}
          style={styles.btnUnregister}
        >
          <Text style={styles.btnText}>Unregister</Text>
        </TouchableOpacity>

        {this.state.isLoading ? (
          <ActivityIndicator />
        ) : (
          <View>
            <UserAvatar
              size={75}
              borderRadius={25}
              style={styles.avatar}
              name={data.login}
            />
            <View style={styles.content}>
              <Text style={styles.item}>{data.login}</Text>
              <Text style={styles.item}>{data.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.btn3}
              onPress={() => navigate("CreateBodyParameterScreen")}
            >
              <Text style={{ color: "white" }}>Add new body parameter</Text>
            </TouchableOpacity>

            <Carousel
              ref={(c) => {
                this._carousel = c;
              }}
              data={arrayList}
              onSnapToItem={(index) =>
                this.setState({
                  activeSlide: index,
                  active_body_param: arrayList[index].id,
                })
              }
              renderItem={({ item }) => (
                <View style={styles.slide}>
                  {item.datasets[0].data.includes(null) ? (
                    <View>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.title}>Add some data please...</Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.title}>
                        {item.title}
                        {": "}
                        {_.last(item.datasets[0].data)} {item.unit}
                      </Text>
                      <LineChart
                        data={item}
                        width={350}
                        height={200}
                        chartConfig={chartConfig}
                      />
                    </View>
                  )}
                </View>
              )}
              sliderWidth={350}
              itemWidth={350}
            />
            <Pagination
              dotsLength={arrayList.length}
              activeDotIndex={activeSlide}
              containerStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.75)",
              }}
              dotStyle={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginHorizontal: 8,
                backgroundColor: "rgba(0, 0, 0, 0.92)",
              }}
              inactiveDotStyle={
                {
                  // Define styles for inactive dots here
                }
              }
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />

            <View style={styles.buttons}>
              <TextInput
                placeholder="New log"
                //value={oldLog}
                style={styles.placeholder}
                onChangeText={(text) => this.setState({ add_log_value: text })}
              />

              <TouchableOpacity
                style={styles.btn2}
                onPress={() => this.addLog()}
              >
                <Text>Add log</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btn2}
                onPress={() => this.deleteLastLog()}
              >
                <Text>Delete last log</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 38,
    width: 75,
    alignSelf: "center",
    margin: 25,
  },
  btnLogout: {
    margin: 10,
    padding: 10,
    backgroundColor: "black",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 5,
  },
  btnUnregister: {
    margin: 10,
    padding: 10,
    backgroundColor: "red",
    alignItems: "center",
    position: "absolute",
    top: 5,
    left: 5,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  btn: {
    width: "30%",
    padding: 5,
    margin: 10,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  btn2: {
    width: "30%",
    padding: 5,
    margin: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "black",
    borderWidth: 2,
  },
  btn3: {
    width: "50%",
    padding: 5,
    margin: 10,
    backgroundColor: "black",
    alignSelf: "center",
    justifyContent: "center",
    borderColor: "black",
    borderWidth: 2,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttons: {
    // flex: 1,
    flexDirection: "row",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {},
  item: {
    alignSelf: "center",
    fontSize: 20,
    marginTop: 7,
  },
  title: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 12,
    textTransform: "uppercase",
    alignSelf: "center",
  },
  pageName: {
    margin: 10,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },

  carousel: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: "20%",
    padding: 5,
    margin: 10,
    borderColor: "#333",
    borderBottomWidth: 1.5,
    alignItems: "center",
  },
});

export default ProfileScreen;
