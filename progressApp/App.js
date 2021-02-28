import Constants from "expo-constants";
import React, { Component } from "react";
import {
    AppRegistry,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createMaterialTopTabNavigator } from "react-navigation-tabs";
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from "./app/screens/HomeScreen";
import LoginScreen from "./app/screens/LoginScreen";
import RegisterScreen from "./app/screens/RegisterScreen";
import ProfileScreen from "./app/screens/ProfileScreen";
import SplashScreen from "./app/screens/SplashScreen";
import EditActivityScreen from "./app/screens/EditActivityScreen";
import CreateActivityScreen from "./app/screens/CreateActivityScreen";
import AllActivitiesScreen from "./app/screens/AllActivitiesScreen";
import SingleActivityScreen from "./app/screens/SingleActivityScreen";
import CreateBodyParameterScreen from "./app/screens/CreateBodyParameterScreen";

const AppStack = createStackNavigator({
    AllActivitiesScreen: {
        screen: AllActivitiesScreen,
        navigationOptions: {
            header: () => {
                visible: false;
            },
        },
    },
    SingleActivityScreen: { screen: SingleActivityScreen },
    EditActivityScreen: { screen: EditActivityScreen },
    CreateActivityScreen: { screen: CreateActivityScreen },
});

const ProfileStack = createStackNavigator({
    ProfileScreen: {
        screen: ProfileScreen,
        navigationOptions: {
            header: () => {
                visible: false;
            },
        },
    },
    CreateBodyParameterScreen: { screen: CreateBodyParameterScreen },
});

const AppNavigator = createMaterialTopTabNavigator(
    {
        Profile: ProfileStack,
        Activities: AppStack,
    },
    {
        tabBarOptions: {
            activeTintColor: "white",
            style: {
                backgroundColor: "black",
                marginTop: Constants.statusBarHeight,
                height: 75,
                justifyContent: "center",
            },
        },
    }
);

const AuthStack = createStackNavigator({
    HomeScreen: {
        screen: HomeScreen,
        navigationOptions: {
            header: () => {
                visible: false;
            },
        },
    },
    LoginScreen: { screen: LoginScreen },
    RegisterScreen: { screen: RegisterScreen },
});

export default createAppContainer(
    createSwitchNavigator(
        {
            SplashScreen: SplashScreen,
            App: AppNavigator,
            Auth: AuthStack,
        },
        {
            initialRouteName: "SplashScreen",
        }
    )
);
