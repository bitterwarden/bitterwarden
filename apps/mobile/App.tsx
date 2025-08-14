import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { VaultProvider } from "./src/contexts/VaultContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { VaultScreen } from "./src/screens/VaultScreen";

const Stack = createNativeStackNavigator();

export default function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const checkAuthStatus = useCallback(async () => {
		try {
			const hasVault = await SecureStore.getItemAsync("hasVault");

			if (hasVault === "true") {
				const hasHardware = await LocalAuthentication.hasHardwareAsync();
				const isEnrolled = await LocalAuthentication.isEnrolledAsync();

				if (hasHardware && isEnrolled) {
					const result = await LocalAuthentication.authenticateAsync({
						promptMessage: "Unlock Bitterwarden",
						fallbackLabel: "Use Password",
					});

					setIsAuthenticated(result.success);
				}
			}
		} catch (error) {
			console.error("Auth check failed:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		checkAuthStatus();
	}, [checkAuthStatus]);

	if (isLoading) {
		return null;
	}

	return (
		<VaultProvider>
			<NavigationContainer>
				<Stack.Navigator
					initialRouteName={isAuthenticated ? "Vault" : "Login"}
					screenOptions={{
						headerStyle: {
							backgroundColor: "#1a1a1a",
						},
						headerTintColor: "#fff",
						headerTitleStyle: {
							fontWeight: "bold",
						},
					}}
				>
					<Stack.Screen
						name="Login"
						component={LoginScreen}
						options={{ title: "Bitterwarden" }}
					/>
					<Stack.Screen
						name="Vault"
						component={VaultScreen}
						options={{
							title: "Vault",
							headerRight: () => null,
						}}
					/>
					<Stack.Screen
						name="Settings"
						component={SettingsScreen}
						options={{ title: "Settings" }}
					/>
				</Stack.Navigator>
			</NavigationContainer>
			<StatusBar style="light" />
		</VaultProvider>
	);
}
