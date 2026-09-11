import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/lib/auth-context";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* react-query is hoisted to root, so its types see a duplicate, older
          @types/react (18, pinned by legacy apps/mobile) — `as any` sidesteps
          that; not a real incompatibility. */}
      <QueryClientProvider client={queryClient}>
        {(<AuthProvider>{children}</AuthProvider>) as any}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
