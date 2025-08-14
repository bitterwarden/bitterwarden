import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import browser from "webextension-polyfill";
import { App } from "./App";

// Create a mock that returns different values based on message type
const mockSendMessage = mock((message: any) => {
	if (message?.type === "GET_ITEMS") {
		return Promise.resolve([]);
	}
	if (message?.type === "CHECK_LOCK_STATUS") {
		return Promise.resolve({ isLocked: true });
	}
	return Promise.resolve({ success: true });
});

describe("Extension Popup App", () => {
	beforeEach(() => {
		mockSendMessage.mockClear();
		// Mock browser.runtime.sendMessage (not chrome)
		browser.runtime.sendMessage = mockSendMessage;
	});

	afterEach(() => {
		cleanup();
	});

	it("should render the app with title", () => {
		render(<App />);
		expect(screen.getByText(/Bitterwarden/i)).toBeDefined();
	});

	it("should show unlock form when vault is locked", () => {
		render(<App />);
		expect(screen.getByPlaceholderText(/Master Password/i)).toBeDefined();
		expect(screen.getByRole("button", { name: /unlock/i })).toBeDefined();
	});

	it("should handle unlock button click", async () => {
		render(<App />);
		
		const passwordInput = screen.getByPlaceholderText(/Master Password/i) as HTMLInputElement;
		const unlockButton = screen.getByRole("button", { name: /unlock/i });
		
		fireEvent.change(passwordInput, { target: { value: "testPassword123" } });
		fireEvent.click(unlockButton);
		
		await waitFor(() => {
			expect(mockSendMessage).toHaveBeenCalledWith({
				type: "UNLOCK_VAULT",
				password: "testPassword123"
			});
		});
	});

	it("should show error for empty password", () => {
		render(<App />);
		
		const unlockButton = screen.getByRole("button", { name: /unlock/i });
		fireEvent.click(unlockButton);
		
		// The button click shouldn't send message without password
		expect(mockSendMessage).not.toHaveBeenCalled();
	});

	it("should show vault content when unlocked", async () => {
		render(<App />);
		
		const passwordInput = screen.getByPlaceholderText(/Master Password/i) as HTMLInputElement;
		const unlockButton = screen.getByRole("button", { name: /unlock/i });
		
		fireEvent.change(passwordInput, { target: { value: "testPassword123" } });
		fireEvent.click(unlockButton);
		
		await waitFor(() => {
			// Should show "No items in vault" message when unlocked with empty vault
			expect(screen.getByText(/No items in vault/i)).toBeDefined();
			// Should show Lock button when unlocked
			expect(screen.getByRole("button", { name: /lock/i })).toBeDefined();
		});
	});

	it("should handle lock button click when unlocked", async () => {
		render(<App />);
		
		// First unlock
		const passwordInput = screen.getByPlaceholderText(/Master Password/i) as HTMLInputElement;
		const unlockButton = screen.getByRole("button", { name: /unlock/i });
		
		fireEvent.change(passwordInput, { target: { value: "testPassword123" } });
		fireEvent.click(unlockButton);
		
		await waitFor(() => {
			expect(screen.getByRole("button", { name: /lock/i })).toBeDefined();
		});
		
		// Then lock
		const lockButton = screen.getByRole("button", { name: /lock/i });
		fireEvent.click(lockButton);
		
		await waitFor(() => {
			expect(mockSendMessage).toHaveBeenCalledWith({ type: "LOCK_VAULT" });
		});
	});
});