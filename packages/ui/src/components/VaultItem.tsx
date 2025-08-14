import { cn } from "../lib/utils";

interface VaultItemProps {
	name: string;
	username?: string;
	url?: string;
	onClick?: () => void;
	className?: string;
}

export function VaultItem({
	name,
	username,
	url,
	onClick,
	className,
}: VaultItemProps) {
	return (
		<button
			type="button"
			className={cn(
				"p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors w-full text-left",
				className,
			)}
			onClick={onClick}
		>
			<div className="font-medium">{name}</div>
			{username && (
				<div className="text-sm text-muted-foreground">{username}</div>
			)}
			{url && <div className="text-xs text-muted-foreground mt-1">{url}</div>}
		</button>
	);
}
