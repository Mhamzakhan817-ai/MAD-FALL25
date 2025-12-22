// App.js – FINAL, CLEAN, CORRECT
import "react-native-gesture-handler";
import React from "react";
import { Provider } from "react-redux";
import { LogBox } from "react-native";

import store from "./redux/store";
import AppNavigator from "./navigation/AppNavigator";

// Ignore harmless warning
LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}