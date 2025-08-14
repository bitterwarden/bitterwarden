import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button Component", () => {
	afterEach(() => {
		cleanup();
	});
	it("should render button with text", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeDefined();
	});

	it("should apply default variant classes", () => {
		render(<Button>Default Button</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("bg-primary");
		expect(button.className).toContain("text-primary-foreground");
	});

	it("should apply secondary variant classes", () => {
		render(<Button variant="secondary">Secondary Button</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("bg-secondary");
		expect(button.className).toContain("text-secondary-foreground");
	});

	it("should apply destructive variant classes", () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("bg-destructive");
		expect(button.className).toContain("text-destructive-foreground");
	});

	it("should apply small size classes", () => {
		render(<Button size="sm">Small Button</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("h-9");
		expect(button.className).toContain("px-3");
	});

	it("should apply large size classes", () => {
		render(<Button size="lg">Large Button</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("h-11");
		expect(button.className).toContain("px-8");
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Button disabled>Disabled Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveProperty("disabled", true);
		expect(button.className).toContain("disabled:opacity-50");
	});

	it("should merge custom className", () => {
		render(<Button className="custom-class">Custom Button</Button>);
		const button = screen.getByRole("button");
		expect(button.className).toContain("custom-class");
	});
});