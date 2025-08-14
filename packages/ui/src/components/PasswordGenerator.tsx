import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./Button";
import { Input } from "./Input";

interface PasswordGeneratorProps {
	onGenerate?: (password: string) => void;
	className?: string;
}

export function PasswordGenerator({
	onGenerate,
	className,
}: PasswordGeneratorProps) {
	const [length, setLength] = React.useState(20);
	const [options, setOptions] = React.useState({
		uppercase: true,
		lowercase: true,
		numbers: true,
		symbols: true,
	});
	const [password, setPassword] = React.useState("");

	const generatePassword = () => {
		let charset = "";
		if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
		if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		if (options.numbers) charset += "0123456789";
		if (options.symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

		if (!charset) charset = "abcdefghijklmnopqrstuvwxyz";

		const array = new Uint32Array(length);
		crypto.getRandomValues(array);

		let newPassword = "";
		for (let i = 0; i < length; i++) {
			newPassword += charset[array[i] % charset.length];
		}

		setPassword(newPassword);
		onGenerate?.(newPassword);
	};

	return (
		<div className={cn("space-y-4", className)}>
			<div>
				<label className="text-sm font-medium">Length: {length}</label>
				<input
					type="range"
					min="8"
					max="128"
					value={length}
					onChange={(e) => setLength(Number(e.target.value))}
					className="w-full"
				/>
			</div>

			<div className="space-y-2">
				{Object.entries(options).map(([key, value]) => (
					<label key={key} className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={value}
							onChange={(e) =>
								setOptions({ ...options, [key]: e.target.checked })
							}
						/>
						<span className="text-sm capitalize">{key}</span>
					</label>
				))}
			</div>

			<Input
				value={password}
				readOnly
				placeholder="Generated password will appear here"
			/>

			<Button onClick={generatePassword} className="w-full">
				Generate Password
			</Button>
		</div>
	);
}
