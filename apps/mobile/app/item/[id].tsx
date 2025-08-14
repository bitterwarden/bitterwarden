import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function ItemDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { items, updateItem, deleteItem } = useVaultStore();

	const item = items.find((i) => i.id === id);

	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [url, setUrl] = useState("");
	const [notes, setNotes] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (item) {
			setName(item.name);
			setUsername(item.username || "");
			setPassword(item.password);
			setUrl(item.url || "");
			setNotes(item.notes || "");
		}
	}, [item]);

	if (!item) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Item not found</Text>
					<TouchableOpacity style={styles.button} onPress={() => router.back()}>
						<Text style={styles.buttonText}>Go Back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	const handleCopy = async (value: string, label: string) => {
		await Clipboard.setStringAsync(value);
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		Alert.alert("Copied", `${label} copied to clipboard`, [{ text: "OK" }]);
	};

	const handleSave = async () => {
		if (!name || !password) {
			Alert.alert("Error", "Name and password are required");
			return;
		}

		await updateItem(id, {
			name,
			username: username || undefined,
			password,
			url: url || undefined,
			notes: notes || undefined,
		});

		setIsEditing(false);
		Alert.alert("Success", "Item updated successfully");
	};

	const handleDelete = () => {
		Alert.alert(
			"Delete Item",
			`Are you sure you want to delete "${item.name}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						await deleteItem(id);
						router.back();
					},
				},
			],
		);
	};

	const renderViewMode = () => (
		<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
			<View style={styles.field}>
				<Text style={styles.label}>Name</Text>
				<TouchableOpacity
					style={styles.valueContainer}
					onPress={() => handleCopy(name, "Name")}
				>
					<Text style={styles.value}>{name}</Text>
				</TouchableOpacity>
			</View>

			{username && (
				<View style={styles.field}>
					<Text style={styles.label}>Username</Text>
					<TouchableOpacity
						style={styles.valueContainer}
						onPress={() => handleCopy(username, "Username")}
					>
						<Text style={styles.value}>{username}</Text>
					</TouchableOpacity>
				</View>
			)}

			<View style={styles.field}>
				<Text style={styles.label}>Password</Text>
				<View style={styles.passwordContainer}>
					<TouchableOpacity
						style={styles.passwordValueContainer}
						onPress={() => handleCopy(password, "Password")}
					>
						<Text style={styles.value}>
							{showPassword ? password : "••••••••"}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.eyeButton}
						onPress={() => setShowPassword(!showPassword)}
					>
						<Text style={styles.eyeIcon}>{showPassword ? "👁" : "👁‍🗨"}</Text>
					</TouchableOpacity>
				</View>
			</View>

			{url && (
				<View style={styles.field}>
					<Text style={styles.label}>URL</Text>
					<TouchableOpacity
						style={styles.valueContainer}
						onPress={() => handleCopy(url, "URL")}
					>
						<Text style={styles.value}>{url}</Text>
					</TouchableOpacity>
				</View>
			)}

			{notes && (
				<View style={styles.field}>
					<Text style={styles.label}>Notes</Text>
					<View style={styles.notesContainer}>
						<Text style={styles.notes}>{notes}</Text>
					</View>
				</View>
			)}

			<View style={styles.actions}>
				<TouchableOpacity
					style={[styles.button, styles.editButton]}
					onPress={() => setIsEditing(true)}
				>
					<Text style={styles.buttonText}>Edit</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.button, styles.deleteButton]}
					onPress={handleDelete}
				>
					<Text style={styles.buttonText}>Delete</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);

	const renderEditMode = () => (
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
						onPress={() => setIsEditing(false)}
					>
						<Text style={styles.buttonText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);

	return (
		<SafeAreaView style={styles.container} edges={["bottom"]}>
			{isEditing ? renderEditMode() : renderViewMode()}
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
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	errorText: {
		fontSize: 18,
		color: "#666",
		marginBottom: 24,
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
	valueContainer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 12,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	value: {
		fontSize: 16,
		color: "#000",
	},
	passwordContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	passwordValueContainer: {
		flex: 1,
		padding: 12,
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
	notesContainer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 12,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		minHeight: 80,
	},
	notes: {
		fontSize: 16,
		color: "#000",
		lineHeight: 22,
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
	textArea: {
		minHeight: 100,
	},
	actions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 24,
	},
	button: {
		flex: 1,
		height: 48,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	editButton: {
		backgroundColor: "#000",
	},
	deleteButton: {
		backgroundColor: "#ff3b30",
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
