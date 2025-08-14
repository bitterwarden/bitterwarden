import { useState } from "react";
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

export default function NewItemScreen() {
	const router = useRouter();
	const { addItem } = useVault();
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSave = () => {
		if (!name || !password) {
			Alert.alert("Error", "Name and password are required");
			return;
		}

		addItem({ name, username, password });
		router.back();
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Text style={styles.cancelButton}>Cancel</Text>
				</TouchableOpacity>
				<Text style={styles.title}>New Item</Text>
				<TouchableOpacity onPress={handleSave}>
					<Text style={styles.saveButton}>Save</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.form}>
				<TextInput
					style={styles.input}
					placeholder="Name"
					value={name}
					onChangeText={setName}
				/>
				<TextInput
					style={styles.input}
					placeholder="Username"
					value={username}
					onChangeText={setUsername}
					autoCapitalize="none"
				/>
				<TextInput
					style={styles.input}
					placeholder="Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
	},
	cancelButton: {
		color: "#007AFF",
		fontSize: 16,
	},
	saveButton: {
		color: "#007AFF",
		fontSize: 16,
		fontWeight: "600",
	},
	form: {
		padding: 20,
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		marginBottom: 15,
	},
});