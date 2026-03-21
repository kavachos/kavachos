"use client";

import { useEffect, useRef } from "react";

export function ParticleGrid() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationId: number;
		let time = 0;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			ctx.scale(dpr, dpr);
		};

		resize();
		window.addEventListener("resize", resize);

		const isDark = () => document.documentElement.classList.contains("dark");

		const draw = () => {
			const rect = canvas.getBoundingClientRect();
			const w = rect.width;
			const h = rect.height;

			ctx.clearRect(0, 0, w, h);

			const spacing = 32;
			const boxSize = 6;
			const cols = Math.ceil(w / spacing) + 1;
			const rows = Math.ceil(h / spacing) + 1;
			const dark = isDark();

			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					const x = i * spacing;
					const y = j * spacing;

					// Multiple overlapping waves for organic feel
					const wave1 = Math.sin(time * 0.6 + i * 0.4 + j * 0.3);
					const wave2 = Math.cos(time * 0.4 + i * 0.2 - j * 0.5);
					const wave3 = Math.sin(time * 0.8 - i * 0.15 + j * 0.25);
					const combined = (wave1 + wave2 + wave3) / 3; // -1 to 1

					// Flip effect: scale on one axis based on wave
					const scaleX = 0.3 + (combined * 0.5 + 0.5) * 0.7; // 0.3 to 1
					const flipAngle = combined * Math.PI * 0.15; // slight rotation

					// Gold squares appear in a traveling wave pattern
					const goldWave = Math.sin(time * 1.2 + i * 0.5 + j * 0.3);
					const isGold = goldWave > 0.7;
					const isHighlight = goldWave > 0.85;

					// Opacity based on wave
					const baseOpacity = combined * 0.5 + 0.5; // 0 to 1

					ctx.save();
					ctx.translate(x + boxSize / 2, y + boxSize / 2);
					ctx.rotate(flipAngle);
					ctx.scale(scaleX, 1);

					const halfBox = boxSize / 2;

					if (isHighlight) {
						// Bright gold squares with glow
						if (dark) {
							ctx.shadowColor = "rgba(201, 168, 76, 0.4)";
							ctx.shadowBlur = 8;
							ctx.fillStyle = `rgba(201, 168, 76, ${0.35 + baseOpacity * 0.3})`;
						} else {
							ctx.shadowColor = "rgba(154, 123, 34, 0.3)";
							ctx.shadowBlur = 6;
							ctx.fillStyle = `rgba(154, 123, 34, ${0.25 + baseOpacity * 0.25})`;
						}
						ctx.fillRect(-halfBox, -halfBox, boxSize, boxSize);
					} else if (isGold) {
						// Subtle gold
						if (dark) {
							ctx.fillStyle = `rgba(201, 168, 76, ${baseOpacity * 0.15})`;
						} else {
							ctx.fillStyle = `rgba(154, 123, 34, ${baseOpacity * 0.12})`;
						}
						ctx.fillRect(-halfBox, -halfBox, boxSize, boxSize);
					} else {
						// Regular squares
						if (dark) {
							ctx.fillStyle = `rgba(255, 255, 255, ${baseOpacity * 0.04})`;
						} else {
							ctx.fillStyle = `rgba(0, 0, 0, ${baseOpacity * 0.03})`;
						}
						ctx.fillRect(-halfBox, -halfBox, boxSize, boxSize);

						// Border on some
						if (baseOpacity > 0.6) {
							if (dark) {
								ctx.strokeStyle = `rgba(255, 255, 255, ${(baseOpacity - 0.6) * 0.08})`;
							} else {
								ctx.strokeStyle = `rgba(0, 0, 0, ${(baseOpacity - 0.6) * 0.06})`;
							}
							ctx.lineWidth = 0.5;
							ctx.strokeRect(-halfBox, -halfBox, boxSize, boxSize);
						}
					}

					ctx.restore();
				}
			}

			time += 0.012;
			animationId = requestAnimationFrame(draw);
		};

		const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (!motionQuery.matches) {
			draw();
		} else {
			// Static version for reduced motion
			time = 0;
			const drawOnce = () => {
				const rect = canvas.getBoundingClientRect();
				const w = rect.width;
				const h = rect.height;
				ctx.clearRect(0, 0, w, h);
				const spacing = 32;
				const cols = Math.ceil(w / spacing) + 1;
				const rows = Math.ceil(h / spacing) + 1;
				const dark = isDark();
				for (let i = 0; i < cols; i++) {
					for (let j = 0; j < rows; j++) {
						const x = i * spacing;
						const y = j * spacing;
						if (dark) {
							ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
						} else {
							ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
						}
						ctx.fillRect(x, y, 4, 4);
					}
				}
			};
			drawOnce();
		}

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none absolute inset-0 h-full w-full"
			aria-hidden="true"
		/>
	);
}
