import { mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Register Happy DOM globally for all tests
GlobalRegistrator.register();

interface BrowserMessage {
	type?: string;
	[key: string]: unknown;
}

// Mock browser extension APIs for extension tests
const mockBrowserAPI = {
	runtime: {
		id: "test-extension-id",
		sendMessage: mock((message: BrowserMessage) => {
			// Return appropriate response based on message type
			if (message?.type === "GET_ITEMS") {
				return Promise.resolve([]);
			}
			if (message?.type === "CHECK_LOCK_STATUS") {
				return Promise.resolve({ isLocked: true });
			}
			return Promise.resolve({ success: true });
		}),
		onMessage: {
			addListener: mock(() => {}),
		},
	},
	storage: {
		local: {
			get: mock(() => Promise.resolve({})),
			set: mock(() => Promise.resolve()),
			remove: mock(() => Promise.resolve()),
		},
	},
	tabs: {
		onUpdated: {
			addListener: mock(() => {}),
		},
		query: mock(() => Promise.resolve([])),
		sendMessage: mock(() => Promise.resolve()),
	},
};

// Define mock browser API type
type MockBrowserAPI = typeof mockBrowserAPI;

// Extend the global object
declare global {
	interface Window {
		chrome: MockBrowserAPI;
		browser: MockBrowserAPI;
	}
	let chrome: MockBrowserAPI;
	let browser: MockBrowserAPI;
}

// Set the mocks on global using Object.assign to avoid type errors
Object.assign(globalThis, {
	chrome: mockBrowserAPI,
	browser: mockBrowserAPI,
});
