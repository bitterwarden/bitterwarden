import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVault } from "./context/VaultContext";

export default function VaultScreen() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const { items, isLocked } = useVault();

	useEffect(() => {
		if (isLocked) {
			router.replace("/");
		}
	}, [isLocked, router.replace]);

	const filteredItems = items.filter((item) =>
		item.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.settingsButton}
					onPress={() => router.push("/settings")}
				>
					<Text style={styles.settingsButtonText}>⚙️</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Vault</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => router.push("/new-item")}
				>
					<Text style={styles.addButtonText}>+</Text>
				</TouchableOpacity>
			</View>

			<TextInput
				style={styles.searchInput}
				placeholder="Search vault..."
				value={searchQuery}
				onChangeText={setSearchQuery}
			/>

			<FlatList
				data={filteredItems}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.item}
						onPress={() => router.push(`/item/${item.id}`)}
					>
						<View>
							<Text style={styles.itemName}>{item.name}</Text>
							<Text style={styles.itemUsername}>{item.username}</Text>
						</View>
					</TouchableOpacity>
				)}
			/>
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
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		flex: 1,
		textAlign: "center",
	},
	addButton: {
		backgroundColor: "#007AFF",
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
	},
	addButtonText: {
		color: "#fff",
		fontSize: 28,
		fontWeight: "400",
		lineHeight: 30,
	},
	settingsButton: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
	},
	settingsButtonText: {
		fontSize: 24,
	},
	searchInput: {
		height: 40,
		marginHorizontal: 20,
		marginVertical: 10,
		paddingHorizontal: 15,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		fontSize: 16,
	},
	item: {
		padding: 15,
		marginHorizontal: 20,
		marginVertical: 5,
		backgroundColor: "#f9f9f9",
		borderRadius: 8,
	},
	itemName: {
		fontSize: 16,
		fontWeight: "600",
	},
	itemUsername: {
		fontSize: 14,
		color: "#666",
		marginTop: 4,
	},
});
