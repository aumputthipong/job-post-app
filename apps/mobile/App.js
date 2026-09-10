
import React from "react";
import { StyleSheet } from "react-native";
import { createStore, combineReducers } from "redux";
import jobsReducer from "./store/reducers/jobsReducer";
import { Provider } from "react-redux";
import MyNavigator from "./navigation/MyNavigator";
import hiresReducer from "./store/reducers/hireReducer";
import usersReducer from "./store/reducers/usersReducer";


const rootReducer = combineReducers({
  jobs: jobsReducer,
  hires: hiresReducer,
  users:usersReducer,
  })

const store = createStore(rootReducer);
  
// main
export default function App() {
  return (
    <Provider store={store}><MyNavigator/></Provider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
});
