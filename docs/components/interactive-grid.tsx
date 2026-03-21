"use client";

import { useState, useCallback } from "react";

interface InteractiveGridProps {
	width?: number;
	height?: number;
	squares?: [number, number];
}

export function InteractiveGrid({
	width = 36,
	height = 36,
	squares = [24, 24],
}: InteractiveGridProps) {
	const [horizontal, vertical] = squares;
	const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
	const [activeSquares, setActiveSquares] = useState<Set<number>>(new Set());

	const handleMouseEnter = useCallback((index: number) => {
		setHoveredSquare(index);
		setActiveSquares((prev) => {
			const next = new Set(prev);
			next.add(index);
			if (next.size > 15) {
				const first = next.values().next().value;
				if (first !== undefined) next.delete(first);
			}
			return next;
		});
	}, []);

	const handleMouseLeave = useCallback(() => {
		setHoveredSquare(null);
	}, []);

	return (
		<svg
			viewBox={`0 0 ${width * horizontal} ${height * vertical}`}
			preserveAspectRatio="xMidYMid slice"
			className="absolute inset-0 h-full w-full"
			aria-hidden="true"
		>
			{Array.from({ length: horizontal * vertical }).map((_, index) => {
				const x = (index % horizontal) * width;
				const y = Math.floor(index / horizontal) * height;
				const isHovered = hoveredSquare === index;
				const isActive = activeSquares.has(index);

				let fill: string;
				let stroke: string;
				let transition: string;

				if (isHovered) {
					fill = "rgba(201, 168, 76, 0.18)";
					stroke = "rgba(201, 168, 76, 0.3)";
					transition = "fill 75ms ease-in-out, stroke 75ms ease-in-out";
				} else if (isActive) {
					fill = "rgba(201, 168, 76, 0.07)";
					stroke = "rgba(201, 168, 76, 0.1)";
					transition = "fill 1500ms ease-in-out, stroke 1500ms ease-in-out";
				} else {
					fill = "transparent";
					stroke = "rgba(201, 168, 76, 0.04)";
					transition = "fill 2000ms ease-in-out, stroke 2000ms ease-in-out";
				}

				return (
					<rect
						key={index}
						x={x}
						y={y}
						width={width}
						height={height}
						style={{ fill, stroke, strokeWidth: 0.5, transition }}
						onMouseEnter={() => handleMouseEnter(index)}
						onMouseLeave={handleMouseLeave}
					/>
				);
			})}
		</svg>
	);
}
