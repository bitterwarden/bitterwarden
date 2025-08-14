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

	const filteredItems = items.filter((item) => {
		const query = searchQuery.toLowerCase();
		return (
			item.name.toLowerCase().includes(query) ||
			item.username?.toLowerCase().includes(query)
		);
	});

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

			<View style={styles.searchContainer}>
				<TextInput
					style={styles.searchInput}
					placeholder="Search names or usernames..."
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
				{searchQuery.length > 0 && (
					<TouchableOpacity
						style={styles.clearButton}
						onPress={() => setSearchQuery("")}
					>
						<Text style={styles.clearButtonText}>✕</Text>
					</TouchableOpacity>
				)}
			</View>

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
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 20,
		marginVertical: 10,
		position: "relative",
	},
	searchInput: {
		flex: 1,
		height: 40,
		paddingHorizontal: 15,
		paddingRight: 40,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		fontSize: 16,
	},
	clearButton: {
		position: "absolute",
		right: 0,
		height: 40,
		width: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	clearButtonText: {
		fontSize: 18,
		color: "#999",
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
