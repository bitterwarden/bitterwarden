import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVault } from "../context/VaultContext";

export default function ItemDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const { items } = useVault();
	const [showPassword, setShowPassword] = useState(false);

	const item = items.find((i) => i.id === id);

	if (!item) {
		return (
			<SafeAreaView style={styles.container}>
				<Text>Item not found</Text>
			</SafeAreaView>
		);
	}

	const handleCopy = (_text: string, label: string) => {
		// In a real app, we'd use Clipboard API here
		Alert.alert("Copied", `${label} copied to clipboard`);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Text style={styles.backButton}>Back</Text>
				</TouchableOpacity>
				<Text style={styles.title}>{item.name}</Text>
				<View style={{ width: 40 }} />
			</View>

			<View style={styles.content}>
				{item.username && (
					<View style={styles.field}>
						<Text style={styles.label}>Username</Text>
						<View style={styles.valueContainer}>
							<Text style={styles.value}>{item.username}</Text>
							<TouchableOpacity
								onPress={() => handleCopy(item.username || "", "Username")}
								style={styles.copyButtonContainer}
							>
								<Text style={styles.copyButton}>Copy</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}

				<View style={styles.field}>
					<Text style={styles.label}>Password</Text>
					<View style={styles.valueContainer}>
						<Text style={styles.value}>
							{showPassword ? item.password : "••••••••"}
						</Text>
						<View style={styles.passwordActions}>
							<TouchableOpacity
								onPress={() => setShowPassword(!showPassword)}
								style={styles.showButton}
							>
								<Text style={styles.actionText}>
									{showPassword ? "Hide" : "Show"}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handleCopy(item.password, "Password")}
								style={styles.copyButtonContainer}
							>
								<Text style={styles.copyButton}>Copy</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
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
	backButton: {
		color: "#007AFF",
		fontSize: 16,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
	},
	content: {
		padding: 20,
	},
	field: {
		marginBottom: 25,
	},
	label: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
	},
	valueContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 15,
		backgroundColor: "#f9f9f9",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#eee",
	},
	value: {
		fontSize: 16,
		flex: 1,
	},
	copyButton: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	passwordActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	showButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: "#f0f0f0",
		borderRadius: 8,
	},
	copyButtonContainer: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: "#007AFF",
		borderRadius: 8,
	},
	actionText: {
		color: "#007AFF",
		fontSize: 16,
		fontWeight: "600",
	},
});
