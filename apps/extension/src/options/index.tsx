import React from "react";
import ReactDOM from "react-dom/client";

function Options() {
	return (
		<div style={{ padding: "20px", fontFamily: "system-ui" }}>
			<h1>Bitterwarden Options</h1>
			<p>Settings will be available here in future versions.</p>
		</div>
	);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Root element not found");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
	<React.StrictMode>
		<Options />
	</React.StrictMode>,
);
