import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVault } from "./context/VaultContext";

export default function SettingsScreen() {
	const router = useRouter();
	const { lock } = useVault();

	const handleLock = () => {
		lock();
		router.replace("/");
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButtonContainer}
					onPress={() => router.back()}
				>
					<Text style={styles.backButton}>← Back</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Settings</Text>
				<View style={{ width: 60 }} />
			</View>

			<View style={styles.content}>
				<TouchableOpacity style={styles.lockButton} onPress={handleLock}>
					<Text style={styles.lockIcon}>🔒</Text>
					<Text style={styles.lockButtonText}>Lock Vault</Text>
				</TouchableOpacity>

				<Text style={styles.version}>Version 1.0.0</Text>
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
	backButtonContainer: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		marginLeft: -15,
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
	lockButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#ff3b30",
		padding: 16,
		borderRadius: 12,
		marginTop: 20,
		gap: 10,
	},
	lockIcon: {
		fontSize: 20,
	},
	lockButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	version: {
		textAlign: "center",
		color: "#999",
		marginTop: 40,
		fontSize: 14,
	},
});
