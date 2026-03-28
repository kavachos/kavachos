"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function InteractiveGrid({
	width = 36,
	height = 36,
	squares = [24, 24],
}: {
	width?: number;
	height?: number;
	squares?: [number, number];
}) {
	const [horizontal, vertical] = squares;
	const total = horizontal * vertical;
	const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
	const [activeSquares, setActiveSquares] = useState<Set<number>>(new Set());
	const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const handleMouseEnter = useCallback((index: number) => {
		if (clearTimerRef.current) {
			clearTimeout(clearTimerRef.current);
			clearTimerRef.current = null;
		}
		setHoveredSquare(index);
		setActiveSquares((prev) => {
			const next = new Set(prev);
			next.add(index);
			if (next.size > 12) {
				const first = next.values().next().value;
				if (first !== undefined) next.delete(first);
			}
			return next;
		});
	}, []);

	const handleMouseLeave = useCallback(() => {
		setHoveredSquare(null);
	}, []);

	const handleSvgMouseLeave = useCallback(() => {
		setHoveredSquare(null);
		clearTimerRef.current = setTimeout(() => {
			setActiveSquares(new Set());
		}, 1500);
	}, []);

	// Auto-activate random squares periodically
	useEffect(() => {
		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (motionQuery.matches) return;

		autoIntervalRef.current = setInterval(() => {
			const randomIndex = Math.floor(Math.random() * total);
			setActiveSquares((prev) => {
				const next = new Set(prev);
				next.add(randomIndex);
				if (next.size > 8) {
					const first = next.values().next().value;
					if (first !== undefined) next.delete(first);
				}
				return next;
			});
		}, 600);

		return () => {
			if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
		};
	}, [total]);

	useEffect(() => {
		return () => {
			if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
		};
	}, []);

	return (
		<svg
			viewBox={`0 0 ${width * horizontal} ${height * vertical}`}
			preserveAspectRatio="xMidYMid slice"
			className="absolute inset-0 h-full w-full opacity-[0.12] dark:opacity-100"
			aria-hidden="true"
			onMouseLeave={handleSvgMouseLeave}
		>
			{Array.from({ length: total }).map((_, index) => {
				const x = (index % horizontal) * width;
				const y = Math.floor(index / horizontal) * height;
				const isHovered = hoveredSquare === index;
				const isActive = activeSquares.has(index);

				let fill: string;
				let stroke: string;
				let transition: string;

				if (isHovered) {
					fill = "rgba(201, 168, 76, 0.3)";
					stroke = "rgba(154, 123, 34, 0.5)";
					transition = "fill 50ms ease-out, stroke 50ms ease-out";
				} else if (isActive) {
					fill = "rgba(201, 168, 76, 0.15)";
					stroke = "rgba(154, 123, 34, 0.25)";
					transition = "fill 800ms ease-out, stroke 800ms ease-out";
				} else {
					fill = "transparent";
					stroke = "rgba(154, 123, 34, 0.08)";
					transition = "fill 1200ms ease-out, stroke 1200ms ease-out";
				}

				return (
					<rect
						key={index}
						x={x}
						y={y}
						width={width}
						height={height}
						rx={2}
						style={{ fill, stroke, strokeWidth: 0.5, transition }}
						onMouseEnter={() => handleMouseEnter(index)}
						onMouseLeave={handleMouseLeave}
					/>
				);
			})}
		</svg>
	);
}
