import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useVaultStore } from "@/stores/vault.store";
import "@/types/navigation";

export default function UnlockScreen() {
	const router = useRouter();
	const [masterPassword, setMasterPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const {
		isLocked,
		isLoading,
		error,
		biometricEnabled,
		unlock,
		unlockWithBiometric,
	} = useVaultStore();

	const handleBiometricUnlock = useCallback(async () => {
		const success = await unlockWithBiometric();
		if (success) {
			router.replace("./vault");
		}
	}, [unlockWithBiometric, router]);

	useEffect(() => {
		if (!isLocked) {
			router.replace("./vault");
		}
	}, [isLocked, router]);

	useEffect(() => {
		if (biometricEnabled && isLocked) {
			handleBiometricUnlock();
		}
	}, [biometricEnabled, isLocked, handleBiometricUnlock]);

	const handleUnlock = async () => {
		if (!masterPassword) {
			Alert.alert("Error", "Please enter your master password");
			return;
		}

		const success = await unlock(masterPassword);
		if (success) {
			setMasterPassword("");
			router.replace("./vault");
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.content}
			>
				<View style={styles.logoContainer}>
					<Svg width={80} height={80} viewBox="0 0 24 24" fill="none">
						<Path
							d="M12 2L3 7V11C3 16.5 6.8 21.7 12 23C17.2 21.7 21 16.5 21 11V7L12 2Z"
							fill="#000"
						/>
						<Path
							d="M12 6L7 8.5V11C7 14 8.9 16.8 12 17.5C15.1 16.8 17 14 17 11V8.5L12 6Z"
							fill="#fff"
						/>
					</Svg>
					<Text style={styles.title}>Bitterwarden</Text>
					<Text style={styles.subtitle}>Secure Password Manager</Text>
				</View>

				<View style={styles.form}>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder="Master Password"
							placeholderTextColor="#999"
							secureTextEntry={!showPassword}
							value={masterPassword}
							onChangeText={setMasterPassword}
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

					{error && <Text style={styles.error}>{error}</Text>}

					<TouchableOpacity
						style={[styles.button, isLoading && styles.buttonDisabled]}
						onPress={handleUnlock}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.buttonText}>Unlock Vault</Text>
						)}
					</TouchableOpacity>

					{biometricEnabled && (
						<TouchableOpacity
							style={[styles.button, styles.biometricButton]}
							onPress={handleBiometricUnlock}
						>
							<Text style={styles.buttonText}>Unlock with Biometric</Text>
						</TouchableOpacity>
					)}
				</View>
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
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 48,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#000",
		marginTop: 16,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		marginTop: 8,
	},
	form: {
		width: "100%",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		marginBottom: 16,
	},
	input: {
		flex: 1,
		height: 56,
		paddingHorizontal: 16,
		fontSize: 16,
		color: "#000",
	},
	eyeButton: {
		padding: 16,
	},
	eyeIcon: {
		fontSize: 20,
	},
	button: {
		height: 56,
		backgroundColor: "#000",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	biometricButton: {
		backgroundColor: "#333",
	},
	error: {
		color: "#ff3b30",
		fontSize: 14,
		marginBottom: 12,
		textAlign: "center",
	},
});
