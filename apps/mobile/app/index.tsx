import { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useVault } from "./context/VaultContext";

export default function LoginScreen() {
	const [password, setPassword] = useState("");
	const router = useRouter();
	const { unlock, isLocked } = useVault();

	useEffect(() => {
		if (!isLocked) {
			router.replace("/vault");
		}
	}, [isLocked]);

	const handleUnlock = () => {
		if (unlock(password)) {
			router.push("/vault");
		} else {
			Alert.alert("Error", "Please enter a password");
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Bitterwarden</Text>
				<TextInput
					style={styles.input}
					placeholder="Master Password"
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				/>
				<TouchableOpacity style={styles.button} onPress={handleUnlock}>
					<Text style={styles.buttonText}>Unlock</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 40,
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		marginBottom: 20,
	},
	button: {
		height: 50,
		backgroundColor: "#000",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});