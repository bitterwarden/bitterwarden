import browser from "webextension-polyfill";

// Listen for messages from the background script
browser.runtime.onMessage.addListener((request) => {
	if (request.type === "PAGE_LOADED") {
		detectPasswordFields();
	}
});

function detectPasswordFields() {
	const passwordFields = document.querySelectorAll('input[type="password"]');
	const usernameFields = document.querySelectorAll(
		'input[type="text"], input[type="email"]',
	);

	passwordFields.forEach((field) => {
		if (!field.hasAttribute("data-bitterwarden")) {
			field.setAttribute("data-bitterwarden", "true");

			// Add autofill icon
			const icon = createAutofillIcon();
			field.parentElement?.appendChild(icon);

			icon.addEventListener("click", async () => {
				const response = await browser.runtime.sendMessage({
					type: "AUTOFILL",
				});

				if (response && response.length > 0) {
					// Show credential selector
					showCredentialSelector(response, field as HTMLInputElement);
				}
			});
		}
	});
}

function createAutofillIcon(): HTMLElement {
	const icon = document.createElement("div");
	icon.className = "bitterwarden-autofill-icon";
	icon.innerHTML = "🔐";
	icon.style.cssText = `
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    z-index: 10000;
    font-size: 16px;
  `;
	return icon;
}

function showCredentialSelector(
	credentials: any[],
	field: HTMLInputElement,
): void {
	// Implementation for showing credential selector UI
	console.log("Available credentials:", credentials);
}

// Initial detection
detectPasswordFields();

// Observe DOM changes for dynamically added forms
const observer = new MutationObserver(() => {
	detectPasswordFields();
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
});
