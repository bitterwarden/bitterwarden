import type { VaultItem } from "@bitterwarden/core";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVaultStore } from "@/stores/vault.store";
import "@/types/navigation";

export default function VaultScreen() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const { items, isLocked, lock, searchItems, deleteItem } = useVaultStore();

	useEffect(() => {
		if (isLocked) {
			router.replace("../");
		}
	}, [isLocked, router]);

	const filteredItems = useMemo(() => {
		if (!searchQuery) return items;
		return searchItems(searchQuery);
	}, [searchQuery, items, searchItems]);

	const handleCopyPassword = async (item: VaultItem) => {
		await Clipboard.setStringAsync(item.password);
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		Alert.alert("Copied", "Password copied to clipboard", [{ text: "OK" }]);
	};

	const handleCopyUsername = async (item: VaultItem) => {
		if (item.username) {
			await Clipboard.setStringAsync(item.username);
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			Alert.alert("Copied", "Username copied to clipboard", [{ text: "OK" }]);
		}
	};

	const handleDelete = (item: VaultItem) => {
		Alert.alert(
			"Delete Item",
			`Are you sure you want to delete "${item.name}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => deleteItem(item.id),
				},
			],
		);
	};

	const handleLock = () => {
		Alert.alert("Lock Vault", "Are you sure you want to lock your vault?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Lock",
				onPress: () => {
					lock();
					router.replace("../");
				},
			},
		]);
	};

	const renderItem = ({ item }: { item: VaultItem }) => (
		<TouchableOpacity
			style={styles.itemContainer}
			onPress={() => router.push(`./item/${item.id}`)}
			onLongPress={() => handleDelete(item)}
		>
			<View style={styles.itemContent}>
				<View style={styles.itemInfo}>
					<Text style={styles.itemName}>{item.name}</Text>
					{item.username && (
						<Text style={styles.itemUsername}>{item.username}</Text>
					)}
					{item.url && <Text style={styles.itemUrl}>{item.url}</Text>}
				</View>
				<View style={styles.itemActions}>
					{item.username && (
						<TouchableOpacity
							style={styles.actionButton}
							onPress={() => handleCopyUsername(item)}
						>
							<Text style={styles.actionIcon}>👤</Text>
						</TouchableOpacity>
					)}
					<TouchableOpacity
						style={styles.actionButton}
						onPress={() => handleCopyPassword(item)}
					>
						<Text style={styles.actionIcon}>🔑</Text>
					</TouchableOpacity>
				</View>
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.container} edges={["bottom"]}>
			<View style={styles.header}>
				<TextInput
					style={styles.searchInput}
					placeholder="Search vault..."
					placeholderTextColor="#999"
					value={searchQuery}
					onChangeText={setSearchQuery}
					autoCapitalize="none"
					autoCorrect={false}
				/>
				<View style={styles.headerActions}>
					<TouchableOpacity
						style={styles.headerButton}
						onPress={() => router.push("./item/new")}
					>
						<Text style={styles.headerButtonText}>+</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.headerButton}
						onPress={() => router.push("./settings")}
					>
						<Text style={styles.headerButtonText}>⚙</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.headerButton} onPress={handleLock}>
						<Text style={styles.headerButtonText}>🔒</Text>
					</TouchableOpacity>
				</View>
			</View>

			{filteredItems.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyStateText}>
						{searchQuery ? "No items found" : "No items in vault"}
					</Text>
					{!searchQuery && (
						<TouchableOpacity
							style={styles.addButton}
							onPress={() => router.push("./item/new")}
						>
							<Text style={styles.addButtonText}>Add your first item</Text>
						</TouchableOpacity>
					)}
				</View>
			) : (
				<FlatList
					data={filteredItems}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={styles.listContent}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	searchInput: {
		flex: 1,
		height: 40,
		backgroundColor: "#f5f5f5",
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 16,
		marginRight: 12,
	},
	headerActions: {
		flexDirection: "row",
		gap: 8,
	},
	headerButton: {
		width: 40,
		height: 40,
		backgroundColor: "#000",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	headerButtonText: {
		color: "#fff",
		fontSize: 20,
	},
	listContent: {
		paddingVertical: 8,
	},
	itemContainer: {
		backgroundColor: "#fff",
		marginHorizontal: 16,
		marginVertical: 4,
		borderRadius: 12,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	itemContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 16,
	},
	itemInfo: {
		flex: 1,
	},
	itemName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000",
		marginBottom: 4,
	},
	itemUsername: {
		fontSize: 14,
		color: "#666",
		marginBottom: 2,
	},
	itemUrl: {
		fontSize: 12,
		color: "#999",
	},
	itemActions: {
		flexDirection: "row",
		gap: 8,
	},
	actionButton: {
		width: 36,
		height: 36,
		backgroundColor: "#f5f5f5",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	actionIcon: {
		fontSize: 18,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	emptyStateText: {
		fontSize: 18,
		color: "#666",
		marginBottom: 24,
		textAlign: "center",
	},
	addButton: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		backgroundColor: "#000",
		borderRadius: 8,
	},
	addButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
