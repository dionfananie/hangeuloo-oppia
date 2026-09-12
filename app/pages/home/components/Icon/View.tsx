import type { IconName } from "./types";

const paths: Record<IconName, React.ReactNode> = {
	home: (
		<>
			<path d="m3 11 9-8 9 8" />
			<path d="M5 10v10h14V10" />
			<path d="M9 20v-6h6v6" />
		</>
	),
	map: (
		<>
			<path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z" />
			<path d="M8 3v15M16 6v15" />
		</>
	),
	game: (
		<>
			<path d="M8 12h.01M16 12h.01M12 8v8M8 12h8" />
			<path d="M7 6h10a5 5 0 0 1 4.6 7l-1.2 2.8a3 3 0 0 1-4.7 1.1L13.8 15h-3.6l-1.9 1.9a3 3 0 0 1-4.7-1.1L2.4 13A5 5 0 0 1 7 6Z" />
		</>
	),
	mic: (
		<>
			<rect x="9" y="3" width="6" height="11" rx="3" />
			<path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
		</>
	),
	chart: (
		<>
			<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
		</>
	),
	flame: <path d="M12 22c4 0 7-3 7-7 0-5-3-7-2-11-4 2-7 5-7 9-1-2-2-3-4-4-1 2-1 4-1 6 0 4 3 7 7 7Z" />,
	bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7Z" />,
	book: (
		<>
			<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
			<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
		</>
	),
	headphones: (
		<>
			<path d="M4 14v-2a8 8 0 0 1 16 0v2" />
			<path d="M4 14h4v7H6a2 2 0 0 1-2-2ZM20 14h-4v7h2a2 2 0 0 0 2-2Z" />
		</>
	),
	message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />,
	brain: (
		<>
			<path d="M9.5 4A3.5 3.5 0 0 0 6 7.5v.7a4 4 0 0 0-2 6.8 3.5 3.5 0 0 0 5.5 4.1M14.5 4A3.5 3.5 0 0 1 18 7.5v.7a4 4 0 0 1 2 6.8 3.5 3.5 0 0 1-5.5 4.1" />
			<path d="M12 3v18M8 9h4M12 15h4" />
		</>
	),
	play: <path d="m9 6 9 6-9 6Z" />,
	arrow: <path d="m9 18 6-6-6-6" />,
	check: <path d="m5 12 4 4L19 6" />,
	lock: (
		<>
			<rect x="5" y="10" width="14" height="11" rx="2" />
			<path d="M8 10V7a4 4 0 0 1 8 0v3" />
		</>
	),
	star: <path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17.3l-6.3 3.2L7 13.7 2 8.9 9 8Z" />,
	heart: (
		<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</>
	),
	sparkles: (
		<>
			<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2Z" />
			<path d="m5 15 .8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8Z" />
		</>
	),
	close: (
		<>
			<path d="m6 6 12 12M18 6 6 18" />
		</>
	),
	refresh: (
		<>
			<path d="M21 12a9 9 0 1 1-2.6-6.4" />
			<path d="M21 4v5h-5" />
		</>
	),
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
	return (
		<svg
			aria-hidden="true"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{paths[name]}
		</svg>
	);
}

export default Icon;
