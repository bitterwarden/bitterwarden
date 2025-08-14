import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useVault } from "../contexts/VaultContext";

export function LoginScreen() {
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigation = useNavigation<any>();
	const { unlock } = useVault();

	async function handleUnlock() {
		if (!password) {
			Alert.alert("Error", "Please enter your master password");
			return;
		}

		setIsLoading(true);
		const success = await unlock(password);
		setIsLoading(false);

		if (success) {
			navigation.replace("Vault");
		} else {
			Alert.alert("Error", "Invalid master password");
		}
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<View style={styles.content}>
				<Text style={styles.title}>Welcome to Bitterwarden</Text>
				<Text style={styles.subtitle}>Your offline-first password manager</Text>

				<TextInput
					style={styles.input}
					placeholder="Master Password"
					placeholderTextColor="#666"
					secureTextEntry
					value={password}
					onChangeText={setPassword}
					editable={!isLoading}
				/>

				<TouchableOpacity
					style={[styles.button, isLoading && styles.buttonDisabled]}
					onPress={handleUnlock}
					disabled={isLoading}
				>
					<Text style={styles.buttonText}>
						{isLoading ? "Unlocking..." : "Unlock Vault"}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.linkButton}>
					<Text style={styles.linkText}>Create New Vault</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#fff",
		textAlign: "center",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#999",
		textAlign: "center",
		marginBottom: 40,
	},
	input: {
		backgroundColor: "#1a1a1a",
		borderWidth: 1,
		borderColor: "#333",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: "#fff",
		marginBottom: 20,
	},
	button: {
		backgroundColor: "#4CAF50",
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: "center",
		marginBottom: 16,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	linkButton: {
		alignItems: "center",
		paddingVertical: 8,
	},
	linkText: {
		color: "#4CAF50",
		fontSize: 14,
	},
});
