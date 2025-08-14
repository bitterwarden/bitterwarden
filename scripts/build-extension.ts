#!/usr/bin/env bun
import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

const extensionDir = join(process.cwd(), "apps/extension");
const distDir = join(extensionDir, "dist");
const buildDir = join(process.cwd(), "dist/extension");

async function buildExtension() {
	console.log("Building browser extension...");

	// Clean dist directory
	await $`rm -rf ${distDir}`;
	await mkdir(distDir, { recursive: true });

	// Build the extension
	process.chdir(extensionDir);
	await $`bun run build`;

	// Create distribution package
	await mkdir(buildDir, { recursive: true });

	// Copy manifest and built files
	await cp(
		join(extensionDir, "manifest.json"),
		join(buildDir, "manifest.json"),
	);
	await cp(join(extensionDir, "popup.html"), join(buildDir, "popup.html"));
	await cp(join(extensionDir, "options.html"), join(buildDir, "options.html"), {
		force: true,
	}).catch(() => {});
	await cp(distDir, join(buildDir, "dist"), { recursive: true });

	// Create zip for Chrome Web Store
	await $`zip -r ${join(process.cwd(), "dist/bitterwarden-chrome.zip")} ${buildDir}`;

	console.log("Extension built successfully!");
	console.log(`Output: dist/bitterwarden-chrome.zip`);
}

buildExtension().catch(console.error);
