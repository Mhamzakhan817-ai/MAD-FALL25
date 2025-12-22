// navigation/AppNavigator.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../redux/slices/authSlice";

import AuthNavigator from "./AuthNavigator";
import StackNavigator from "./StackNavigator";

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const init = async () => {
      await dispatch(loadUser());
      setBootstrapped(true);
    };
    init();
  }, []);

  // ⏳ Prevent wrong screen flash
  if (!bootstrapped) return null;

  return (
    <NavigationContainer>
      {token ? <StackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
