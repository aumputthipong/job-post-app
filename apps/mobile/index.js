// Local entry point instead of expo/AppEntry.js.
//
// expo/AppEntry.js does `import App from '../../App'`, which only works when
// the expo package sits at <app>/node_modules/expo/. In this monorepo npm
// hoists expo to the workspace root, so that relative path escapes the app
// and fails to resolve. Registering the root component here avoids depending
// on where expo happens to be installed — this is also what Expo SDK 50+
// templates do by default.
import { registerRootComponent } from "expo";

import App from "./App";

registerRootComponent(App);
