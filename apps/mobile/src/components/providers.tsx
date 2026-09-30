import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AuthProvider } from "@/lib/auth-context";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Without statusBarTranslucent it keeps Android from drawing under the status bar, which
          left a white strip above the navy headers. Screens pad by the safe area themselves. */}
      <KeyboardProvider statusBarTranslucent>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
