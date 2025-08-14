import { mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Register Happy DOM globally for tests
GlobalRegistrator.register();

interface BrowserMessage {
	type?: string;
	[key: string]: unknown;
}

// Mock browser extension APIs with proper functions
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

// Extend the global object to include chrome and browser
declare global {
	let chrome: typeof mockBrowserAPI;
	let browser: typeof mockBrowserAPI;
}

// Both chrome and browser globals are needed for extension tests
globalThis.chrome = mockBrowserAPI;
globalThis.browser = mockBrowserAPI;
