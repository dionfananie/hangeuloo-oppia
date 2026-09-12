// learning-path-rollout.ts — deterministic, server-side cohort assignment helpers.
// Kept dependency-free so it can be unit-tested with node:test.

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export function hashUserId(userId: string): number {
	let hash = FNV_OFFSET_BASIS;
	for (let index = 0; index < userId.length; index += 1) {
		hash ^= userId.charCodeAt(index);
		hash = Math.imul(hash, FNV_PRIME);
	}
	return hash >>> 0;
}

export function parseRolloutPercent(value: string | undefined | null): number {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return 0;
	return Math.max(0, Math.min(100, Math.floor(parsed)));
}

export function isRolloutEnabled(userId: string, percent: number): boolean {
	if (percent <= 0) return false;
	if (percent >= 100) return true;
	return hashUserId(userId) % 100 < percent;
}
