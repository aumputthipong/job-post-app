import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { queryClient } from "@/lib/query-client";

// Side-effect import: initializes the Firebase app.
import "@/lib/firebase";

/** App-wide providers. Auth context joins this in 4.2. */
export function Providers({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* react-query is hoisted to root, so its types see a duplicate, older
          @types/react (18, pinned by legacy apps/mobile) — `as any` sidesteps
          that; not a real incompatibility. */}
      <QueryClientProvider client={queryClient}>{children as any}</QueryClientProvider>
    </GestureHandlerRootView>
  );
}
