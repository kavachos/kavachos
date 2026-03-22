/**
 * Minimal CBOR decoder (RFC 7049) for WebAuthn attestation objects.
 *
 * Handles the subset of CBOR used by authenticators:
 *   Major type 0 — unsigned integer
 *   Major type 1 — negative integer
 *   Major type 2 — byte string
 *   Major type 3 — text string
 *   Major type 4 — array
 *   Major type 5 — map
 *   Major type 7 — simple values (true, false, null, float)
 */

interface DecoderState {
	data: Uint8Array;
	offset: number;
}

function readByte(state: DecoderState): number {
	const byte = state.data[state.offset];
	if (byte === undefined) throw new Error("CBOR: unexpected end of data");
	state.offset++;
	return byte;
}

function readBytes(state: DecoderState, length: number): Uint8Array {
	const end = state.offset + length;
	if (end > state.data.length) throw new Error("CBOR: unexpected end of data");
	const slice = state.data.slice(state.offset, end);
	state.offset = end;
	return slice;
}

function readUint(state: DecoderState, additionalInfo: number): number {
	if (additionalInfo <= 23) return additionalInfo;
	if (additionalInfo === 24) return readByte(state);
	if (additionalInfo === 25) {
		const b = readBytes(state, 2);
		return ((b[0] ?? 0) << 8) | (b[1] ?? 0);
	}
	if (additionalInfo === 26) {
		const b = readBytes(state, 4);
		return (((b[0] ?? 0) << 24) | ((b[1] ?? 0) << 16) | ((b[2] ?? 0) << 8) | (b[3] ?? 0)) >>> 0;
	}
	if (additionalInfo === 27) {
		// 64-bit — we only handle values that fit in a JS number safely
		const b = readBytes(state, 8);
		const hi = ((b[0] ?? 0) * 0x1000000 + (b[1] ?? 0)) * 0x10000 + ((b[2] ?? 0) << 8) + (b[3] ?? 0);
		const lo = ((b[4] ?? 0) * 0x1000000 + (b[5] ?? 0)) * 0x10000 + ((b[6] ?? 0) << 8) + (b[7] ?? 0);
		return hi * 0x100000000 + lo;
	}
	throw new Error(`CBOR: unsupported additional info ${additionalInfo} for uint`);
}

function decodeItem(state: DecoderState): unknown {
	const initialByte = readByte(state);
	const majorType = (initialByte >> 5) & 0x07;
	const additionalInfo = initialByte & 0x1f;

	switch (majorType) {
		case 0: {
			// Unsigned integer
			return readUint(state, additionalInfo);
		}

		case 1: {
			// Negative integer: -1 - n
			const n = readUint(state, additionalInfo);
			return -1 - n;
		}

		case 2: {
			// Byte string
			const length = readUint(state, additionalInfo);
			return readBytes(state, length);
		}

		case 3: {
			// Text string
			const length = readUint(state, additionalInfo);
			const bytes = readBytes(state, length);
			return new TextDecoder().decode(bytes);
		}

		case 4: {
			// Array
			const count = readUint(state, additionalInfo);
			const arr: unknown[] = [];
			for (let i = 0; i < count; i++) {
				arr.push(decodeItem(state));
			}
			return arr;
		}

		case 5: {
			// Map
			const count = readUint(state, additionalInfo);
			const map = new Map<unknown, unknown>();
			for (let i = 0; i < count; i++) {
				const key = decodeItem(state);
				const value = decodeItem(state);
				map.set(key, value);
			}
			return map;
		}

		case 7: {
			// Simple values and floats
			if (additionalInfo === 20) return false;
			if (additionalInfo === 21) return true;
			if (additionalInfo === 22) return null;
			if (additionalInfo === 25) {
				// IEEE 754 half-precision float (16-bit)
				const b = readBytes(state, 2);
				const half = ((b[0] ?? 0) << 8) | (b[1] ?? 0);
				const exp = (half >> 10) & 0x1f;
				const mant = half & 0x3ff;
				const sign = half >> 15 ? -1 : 1;
				let val: number;
				if (exp === 0) val = sign * 5.96046e-8 * mant;
				else if (exp === 31) val = mant ? NaN : sign * Infinity;
				else val = sign * 2 ** (exp - 15) * (1 + mant / 1024);
				return val;
			}
			if (additionalInfo === 26) {
				// IEEE 754 single-precision float
				const b = readBytes(state, 4);
				const buf = new ArrayBuffer(4);
				new Uint8Array(buf).set(b);
				return new DataView(buf).getFloat32(0, false);
			}
			if (additionalInfo === 27) {
				// IEEE 754 double-precision float
				const b = readBytes(state, 8);
				const buf = new ArrayBuffer(8);
				new Uint8Array(buf).set(b);
				return new DataView(buf).getFloat64(0, false);
			}
			throw new Error(`CBOR: unsupported simple value ${additionalInfo}`);
		}

		default:
			throw new Error(`CBOR: unsupported major type ${majorType}`);
	}
}

/**
 * Decode a CBOR-encoded byte array into a JavaScript value.
 *
 * Maps are decoded as `Map<unknown, unknown>` to preserve numeric keys
 * (COSE keys use negative integers).
 */
export function decodeCbor(data: Uint8Array): unknown {
	const state: DecoderState = { data, offset: 0 };
	return decodeItem(state);
}
