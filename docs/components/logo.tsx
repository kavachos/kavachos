interface LogoProps {
	size?: number;
	className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 512 512"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-label="KavachOS logo"
		>
			<defs>
				<linearGradient id="kavach-gold" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#F0D87A" />
					<stop offset="50%" stopColor="#C9A84C" />
					<stop offset="100%" stopColor="#8B6914" />
				</linearGradient>
			</defs>
			{/* Outer ring */}
			<rect
				x="32"
				y="32"
				width="448"
				height="448"
				rx="96"
				stroke="url(#kavach-gold)"
				strokeWidth="24"
				fill="none"
			/>
			{/* Middle ring */}
			<rect
				x="96"
				y="96"
				width="320"
				height="320"
				rx="64"
				stroke="url(#kavach-gold)"
				strokeWidth="20"
				fill="none"
				opacity="0.7"
			/>
			{/* Inner ring */}
			<rect
				x="160"
				y="160"
				width="192"
				height="192"
				rx="40"
				stroke="url(#kavach-gold)"
				strokeWidth="16"
				fill="none"
				opacity="0.5"
			/>
			{/* Center dot */}
			<circle cx="256" cy="256" r="24" fill="url(#kavach-gold)" />
		</svg>
	);
}
