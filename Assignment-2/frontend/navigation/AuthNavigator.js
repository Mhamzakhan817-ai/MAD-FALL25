// navigation/AuthNavigator.js – FINAL & WORKING
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// CORRECT PATHS — from your real screens folder
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}