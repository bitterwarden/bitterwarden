import { useRouter } from "expo-router";
import { useState } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
				<TouchableOpacity
					style={styles.cancelButtonContainer}
					onPress={() => router.back()}
				>
					<Text style={styles.cancelButton}>Cancel</Text>
				</TouchableOpacity>
				<Text style={styles.title}>New Item</Text>
				<TouchableOpacity
					style={styles.saveButtonContainer}
					onPress={handleSave}
				>
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
	cancelButtonContainer: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		marginLeft: -15,
	},
	cancelButton: {
		color: "#007AFF",
		fontSize: 16,
	},
	saveButtonContainer: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		marginRight: -15,
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
