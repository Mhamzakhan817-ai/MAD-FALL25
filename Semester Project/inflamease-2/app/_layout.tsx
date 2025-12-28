import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ConvexProvider>
  );
}
