import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_KEY = "@bitterwarden:biometric_key";

export class BiometricAuth {
	async isAvailable(): Promise<boolean> {
		const compatible = await LocalAuthentication.hasHardwareAsync();
		if (!compatible) return false;

		const enrolled = await LocalAuthentication.isEnrolledAsync();
		return enrolled;
	}

	async authenticate(reason = "Unlock your vault"): Promise<boolean> {
		try {
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: reason,
				fallbackLabel: "Use master password",
				cancelLabel: "Cancel",
			});
			return result.success;
		} catch (error) {
			console.error("Biometric auth failed:", error);
			return false;
		}
	}

	async saveBiometricKey(key: string): Promise<void> {
		try {
			await SecureStore.setItemAsync(BIOMETRIC_KEY, key, {
				requireAuthentication: true,
				authenticationPrompt: "Save your vault key",
			});
		} catch (error) {
			console.error("Failed to save biometric key:", error);
			throw error;
		}
	}

	async getBiometricKey(): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync(BIOMETRIC_KEY);
		} catch (error) {
			console.error("Failed to get biometric key:", error);
			return null;
		}
	}

	async clearBiometricKey(): Promise<void> {
		try {
			await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
		} catch (error) {
			console.error("Failed to clear biometric key:", error);
		}
	}

	async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
		return await LocalAuthentication.supportedAuthenticationTypesAsync();
	}
}

export const biometricAuth = new BiometricAuth();
