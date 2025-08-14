import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useVaultStore } from "@/stores/vault.store";

export default function RootLayout() {
	const initialize = useVaultStore((state) => state.initialize);

	useEffect(() => {
		initialize();
	}, [initialize]);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<StatusBar style="auto" />
				<Stack
					screenOptions={{
						headerStyle: {
							backgroundColor: "#000",
						},
						headerTintColor: "#fff",
						headerTitleStyle: {
							fontWeight: "bold",
						},
					}}
				>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="vault" options={{ title: "Vault" }} />
					<Stack.Screen name="item/[id]" options={{ title: "Item Details" }} />
					<Stack.Screen name="item/new" options={{ title: "New Item" }} />
					<Stack.Screen name="settings" options={{ title: "Settings" }} />
				</Stack>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
