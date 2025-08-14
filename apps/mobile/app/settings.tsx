import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { biometricAuth } from "@/lib/biometric";
import { storage } from "@/lib/storage";
import { useVaultStore } from "@/stores/vault.store";
import "@/types/navigation";

export default function SettingsScreen() {
	const router = useRouter();
	const {
		biometricEnabled,
		enableBiometric,
		disableBiometric,
		lock,
		vaultService,
	} = useVaultStore();

	const [isExporting, setIsExporting] = useState(false);

	const handleBiometricToggle = async (value: boolean) => {
		if (value) {
			const isAvailable = await biometricAuth.isAvailable();
			if (!isAvailable) {
				Alert.alert(
					"Not Available",
					"Biometric authentication is not available on this device",
				);
				return;
			}

			Alert.prompt(
				"Enable Biometric",
				"Enter your master password to enable biometric unlock",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Enable",
						onPress: async (password) => {
							if (password) {
								await enableBiometric(password);
							}
						},
					},
				],
				"secure-text",
			);
		} else {
			Alert.alert(
				"Disable Biometric",
				"Are you sure you want to disable biometric unlock?",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Disable",
						style: "destructive",
						onPress: () => disableBiometric(),
					},
				],
			);
		}
	};

	const handleExportVault = async () => {
		Alert.alert(
			"Export Vault",
			"This will export your vault data. The export will be encrypted. Keep it secure!",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Export",
					onPress: async () => {
						setIsExporting(true);
						try {
							if (vaultService && !vaultService.isLocked()) {
								const vault = vaultService.export();
								const vaultData = JSON.stringify(vault, null, 2);
								await Clipboard.setStringAsync(vaultData);
								Alert.alert(
									"Export Complete",
									"Vault data has been copied to clipboard",
								);
							} else {
								Alert.alert("Error", "Vault is locked");
							}
						} catch (_error) {
							Alert.alert("Error", "Failed to export vault");
						} finally {
							setIsExporting(false);
						}
					},
				},
			],
		);
	};

	const handleClearData = () => {
		Alert.alert(
			"Clear All Data",
			"This will permanently delete all your vault data from this device. This action cannot be undone!",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear All Data",
					style: "destructive",
					onPress: async () => {
						await storage.clearVault();
						await storage.clearMasterKeyHash();
						await biometricAuth.clearBiometricKey();
						await lock();
						router.replace("../");
					},
				},
			],
		);
	};

	const handleChangeMasterPassword = () => {
		Alert.alert(
			"Change Master Password",
			"This feature will be available in a future update",
			[{ text: "OK" }],
		);
	};

	const handleAbout = () => {
		Alert.alert(
			"Bitterwarden",
			"Version 1.0.0\n\nA secure, offline-first password manager\n\n© 2024 Bitterwarden",
			[{ text: "OK" }],
		);
	};

	return (
		<SafeAreaView style={styles.container} edges={["bottom"]}>
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Security</Text>

					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>Biometric Unlock</Text>
							<Text style={styles.settingDescription}>
								Use Face ID or Touch ID to unlock your vault
							</Text>
						</View>
						<Switch
							value={biometricEnabled}
							onValueChange={handleBiometricToggle}
							trackColor={{ false: "#767577", true: "#34c759" }}
							thumbColor="#fff"
						/>
					</View>

					<TouchableOpacity
						style={styles.settingButton}
						onPress={handleChangeMasterPassword}
					>
						<Text style={styles.settingLabel}>Change Master Password</Text>
						<Text style={styles.chevron}>›</Text>
					</TouchableOpacity>

					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>Auto-lock</Text>
							<Text style={styles.settingDescription}>
								Vault locks after 5 minutes of inactivity
							</Text>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Data</Text>

					<TouchableOpacity
						style={styles.settingButton}
						onPress={handleExportVault}
						disabled={isExporting}
					>
						<Text style={styles.settingLabel}>Export Vault</Text>
						<Text style={styles.chevron}>›</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.settingButton}
						onPress={() => Alert.alert("Import", "Import feature coming soon")}
					>
						<Text style={styles.settingLabel}>Import Data</Text>
						<Text style={styles.chevron}>›</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Sync</Text>

					<TouchableOpacity
						style={styles.settingButton}
						onPress={() =>
							Alert.alert("Git Sync", "Git sync configuration coming soon")
						}
					>
						<Text style={styles.settingLabel}>Configure Git Sync</Text>
						<Text style={styles.chevron}>›</Text>
					</TouchableOpacity>

					<View style={styles.settingRow}>
						<View style={styles.settingInfo}>
							<Text style={styles.settingLabel}>Last Sync</Text>
							<Text style={styles.settingDescription}>Never</Text>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>About</Text>

					<TouchableOpacity style={styles.settingButton} onPress={handleAbout}>
						<Text style={styles.settingLabel}>About Bitterwarden</Text>
						<Text style={styles.chevron}>›</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.settingButton}
						onPress={() =>
							Alert.alert("Privacy Policy", "Privacy policy coming soon")
						}
					>
						<Text style={styles.settingLabel}>Privacy Policy</Text>
						<Text style={styles.chevron}>›</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.dangerSection}>
					<TouchableOpacity
						style={styles.dangerButton}
						onPress={handleClearData}
					>
						<Text style={styles.dangerButtonText}>Clear All Data</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
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
	},
	section: {
		marginTop: 24,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: "#e0e0e0",
	},
	sectionTitle: {
		fontSize: 13,
		color: "#666",
		fontWeight: "600",
		textTransform: "uppercase",
		marginHorizontal: 16,
		marginTop: 24,
		marginBottom: 8,
	},
	settingRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
	},
	settingButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
	},
	settingInfo: {
		flex: 1,
		marginRight: 12,
	},
	settingLabel: {
		fontSize: 16,
		color: "#000",
	},
	settingDescription: {
		fontSize: 13,
		color: "#666",
		marginTop: 2,
	},
	chevron: {
		fontSize: 20,
		color: "#999",
	},
	dangerSection: {
		marginTop: 40,
		marginBottom: 40,
		paddingHorizontal: 16,
	},
	dangerButton: {
		backgroundColor: "#ff3b30",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	dangerButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
