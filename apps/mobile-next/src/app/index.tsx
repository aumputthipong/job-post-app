import { Redirect } from "expo-router";

// Placeholder until 4.2 adds a real Firebase auth check and sends signed-in
// users straight to (tabs) instead.
export default function Index() {
  return <Redirect href="/welcome" />;
}
