import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PasswordGenerator } from "./PasswordGenerator";

describe("PasswordGenerator Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("should render password generator components", () => {
		render(<PasswordGenerator />);

		expect(screen.getByText(/Generate Password/i)).toBeDefined();
		expect(screen.getByLabelText(/length/i)).toBeDefined();
	});

	it("should display length slider with default value", () => {
		render(<PasswordGenerator />);

		const slider = screen.getByLabelText(/length/i) as HTMLInputElement;
		expect(slider).toHaveProperty("type", "range");
		expect(slider).toHaveProperty("value", "20");
		expect(slider).toHaveProperty("min", "8");
		expect(slider).toHaveProperty("max", "128");
	});

	it("should update length when slider changes", () => {
		render(<PasswordGenerator />);

		const slider = screen.getByLabelText(/length/i) as HTMLInputElement;
		fireEvent.change(slider, { target: { value: "32" } });

		expect(slider.value).toBe("32");
		expect(screen.getByText(/32/)).toBeDefined();
	});

	it("should have checkboxes for password options", () => {
		render(<PasswordGenerator />);

		expect(screen.getByLabelText(/uppercase/i)).toBeDefined();
		expect(screen.getByLabelText(/lowercase/i)).toBeDefined();
		expect(screen.getByLabelText(/numbers/i)).toBeDefined();
		expect(screen.getByLabelText(/symbols/i)).toBeDefined();
	});

	it("should call onGenerate when generate button is clicked", () => {
		const onGenerate = mock(() => {});
		render(<PasswordGenerator onGenerate={onGenerate} />);

		const generateButton = screen.getByRole("button", { name: /generate/i });
		fireEvent.click(generateButton);

		// The onGenerate will be called with a generated password
		expect(onGenerate).toHaveBeenCalledTimes(1);
		expect(onGenerate.mock.calls[0][0]).toBeString();
		expect(onGenerate.mock.calls[0][0].length).toBeGreaterThan(0);
	});

	it("should display generated password in input field", () => {
		render(<PasswordGenerator />);

		const generateButton = screen.getByRole("button", { name: /generate/i });
		fireEvent.click(generateButton);

		const input = screen.getByPlaceholderText(
			/generated password/i,
		) as HTMLInputElement;
		expect(input.value).toBeTruthy();
		expect(input.value.length).toBeGreaterThan(0);
	});
});
