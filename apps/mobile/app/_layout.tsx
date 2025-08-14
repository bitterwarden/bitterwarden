import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { VaultProvider } from "./context/VaultContext";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<VaultProvider>
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="vault" options={{ headerShown: false }} />
					<Stack.Screen
						name="new-item"
						options={{ headerShown: false, presentation: "modal" }}
					/>
					<Stack.Screen name="item/[id]" options={{ headerShown: false }} />
					<Stack.Screen name="settings" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
				<StatusBar style="auto" />
			</VaultProvider>
		</ThemeProvider>
	);
}
