import { useRouter } from "expo-router";
import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVaultStore } from "@/stores/vault.store";
import "@/types/navigation";

export default function NewItemScreen() {
	const router = useRouter();
	const { addItem } = useVaultStore();

	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [url, setUrl] = useState("");
	const [notes, setNotes] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const generatePassword = () => {
		const length = 16;
		const charset =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
		let newPassword = "";
		const randomValues = new Uint8Array(length);
		crypto.getRandomValues(randomValues);

		for (let i = 0; i < length; i++) {
			newPassword += charset[randomValues[i] % charset.length];
		}

		setPassword(newPassword);
		setShowPassword(true);
	};

	const handleSave = async () => {
		if (!name || !password) {
			Alert.alert("Error", "Name and password are required");
			return;
		}

		try {
			await addItem({
				name,
				username: username || undefined,
				password,
				url: url || undefined,
				notes: notes || undefined,
				tags: [],
			});

			Alert.alert("Success", "Item added successfully", [
				{ text: "OK", onPress: () => router.back() },
			]);
		} catch (_error) {
			Alert.alert("Error", "Failed to add item");
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={["bottom"]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.content}
			>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.field}>
						<Text style={styles.label}>Name *</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							placeholder="Item name"
							placeholderTextColor="#999"
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Username</Text>
						<TextInput
							style={styles.input}
							value={username}
							onChangeText={setUsername}
							placeholder="Username or email"
							placeholderTextColor="#999"
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Password *</Text>
						<View style={styles.passwordInputContainer}>
							<TextInput
								style={styles.passwordInput}
								value={password}
								onChangeText={setPassword}
								placeholder="Password"
								placeholderTextColor="#999"
								secureTextEntry={!showPassword}
								autoCapitalize="none"
								autoCorrect={false}
							/>
							<TouchableOpacity
								style={styles.eyeButton}
								onPress={() => setShowPassword(!showPassword)}
							>
								<Text style={styles.eyeIcon}>{showPassword ? "👁" : "👁‍🗨"}</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							style={styles.generateButton}
							onPress={generatePassword}
						>
							<Text style={styles.generateButtonText}>
								Generate Strong Password
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>URL</Text>
						<TextInput
							style={styles.input}
							value={url}
							onChangeText={setUrl}
							placeholder="https://example.com"
							placeholderTextColor="#999"
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="url"
						/>
					</View>

					<View style={styles.field}>
						<Text style={styles.label}>Notes</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={notes}
							onChangeText={setNotes}
							placeholder="Additional notes..."
							placeholderTextColor="#999"
							multiline
							numberOfLines={4}
							textAlignVertical="top"
						/>
					</View>

					<View style={styles.actions}>
						<TouchableOpacity
							style={[styles.button, styles.saveButton]}
							onPress={handleSave}
						>
							<Text style={styles.buttonText}>Save</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.button, styles.cancelButton]}
							onPress={() => router.back()}
						>
							<Text style={styles.buttonText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	content: {
		flex: 1,
		padding: 16,
	},
	field: {
		marginBottom: 20,
	},
	label: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
		fontWeight: "600",
	},
	input: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		color: "#000",
	},
	passwordInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	passwordInput: {
		flex: 1,
		padding: 12,
		fontSize: 16,
		color: "#000",
	},
	eyeButton: {
		padding: 12,
	},
	eyeIcon: {
		fontSize: 20,
	},
	generateButton: {
		marginTop: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: "#007AFF",
		borderRadius: 6,
		alignSelf: "flex-start",
	},
	generateButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	textArea: {
		minHeight: 100,
	},
	actions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 24,
		marginBottom: 32,
	},
	button: {
		flex: 1,
		height: 48,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	saveButton: {
		backgroundColor: "#34c759",
	},
	cancelButton: {
		backgroundColor: "#999",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
