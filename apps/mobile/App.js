import React from "react";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";

import MyNavigator from "./navigation/MyNavigator";
import hiresReducer from "./store/reducers/hireReducer";
import jobsReducer from "./store/reducers/jobsReducer";
import usersReducer from "./store/reducers/usersReducer";

const rootReducer = combineReducers({
  jobs: jobsReducer,
  hires: hiresReducer,
  users: usersReducer,
});

// thunk lets the action creators await the API before telling the reducer what
// happened, which is what got the network calls out of the reducers.
const store = createStore(rootReducer, applyMiddleware(thunk));

export default function App() {
  return (
    <Provider store={store}>
      <MyNavigator />
    </Provider>
  );
}
