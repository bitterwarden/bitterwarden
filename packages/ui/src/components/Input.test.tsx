import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input Component", () => {
	afterEach(() => {
		cleanup();
	});
	it("should render input element", () => {
		render(<Input placeholder="Enter text" />);
		const input = screen.getByPlaceholderText("Enter text");
		expect(input).toBeDefined();
	});

	it("should apply default classes", () => {
		render(<Input data-testid="test-input" />);
		const input = screen.getByTestId("test-input");
		expect(input.className).toContain("border");
		expect(input.className).toContain("rounded-md");
		expect(input.className).toContain("px-3");
		expect(input.className).toContain("py-2");
	});

	it("should accept type prop", () => {
		render(<Input type="password" data-testid="password-input" />);
		const input = screen.getByTestId("password-input");
		expect(input).toHaveProperty("type", "password");
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Input disabled data-testid="disabled-input" />);
		const input = screen.getByTestId("disabled-input");
		expect(input).toHaveProperty("disabled", true);
		expect(input.className).toContain("disabled:cursor-not-allowed");
		expect(input.className).toContain("disabled:opacity-50");
	});

	it("should merge custom className", () => {
		render(<Input className="custom-input-class" data-testid="custom-input" />);
		const input = screen.getByTestId("custom-input");
		expect(input.className).toContain("custom-input-class");
	});

	it("should forward ref correctly", () => {
		let inputRef: HTMLInputElement | null = null;
		const TestComponent = () => {
			return <Input ref={(el) => (inputRef = el)} data-testid="ref-input" />;
		};
		
		render(<TestComponent />);
		const input = screen.getByTestId("ref-input");
		expect(inputRef).toBe(input);
	});

	it("should accept value prop", () => {
		render(<Input value="test value" onChange={() => {}} data-testid="value-input" />);
		const input = screen.getByTestId("value-input") as HTMLInputElement;
		expect(input.value).toBe("test value");
	});
});