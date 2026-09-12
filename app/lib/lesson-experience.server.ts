import { isRolloutEnabled } from "./learning-path-rollout";

export type ExperienceVariant = "legacy" | "learning_path";

export type LessonExperience = {
	variant: ExperienceVariant;
	curriculumVersionId: string | null;
	selectedBranchId: string | null;
};

const LEGACY: LessonExperience = {
	variant: "legacy",
	curriculumVersionId: null,
	selectedBranchId: null,
};

export async function getActiveCurriculumVersion(db: D1Database): Promise<{ id: string } | null> {
	return db
		.prepare("SELECT id FROM curriculum_versions WHERE status = 'active' LIMIT 1")
		.first<{ id: string }>();
}

export async function getLessonExperience(db: D1Database, userId: string): Promise<LessonExperience> {
	const row = await db
		.prepare(
			"SELECT variant, curriculum_version_id, selected_branch_id FROM lesson_experience_assignments WHERE user_id = ?",
		)
		.bind(userId)
		.first<{
			variant: ExperienceVariant;
			curriculum_version_id: string | null;
			selected_branch_id: string | null;
		}>();
	if (!row) return LEGACY;
	return {
		variant: row.variant,
		curriculumVersionId: row.curriculum_version_id ?? null,
		selectedBranchId: row.selected_branch_id ?? null,
	};
}

export async function assignExperience(
	db: D1Database,
	userId: string,
	level: number,
	rolloutPercent: number,
): Promise<LessonExperience> {
	const version = await getActiveCurriculumVersion(db);
	const activeVersionId = version?.id ?? null;
	const enabled = level === 0 && activeVersionId != null && isRolloutEnabled(userId, rolloutPercent);
	const variant: ExperienceVariant = enabled ? "learning_path" : "legacy";
	await db
		.prepare(
			`INSERT INTO lesson_experience_assignments (user_id, variant, curriculum_version_id)
			VALUES (?, ?, ?) ON CONFLICT(user_id) DO NOTHING`,
		)
		.bind(userId, variant, enabled ? activeVersionId : null)
		.run();
	return getLessonExperience(db, userId);
}

export async function selectCurriculumBranch(
	db: D1Database,
	userId: string,
	branchId: string,
): Promise<string> {
	const experience = await getLessonExperience(db, userId);
	if (experience.variant !== "learning_path" || !experience.curriculumVersionId)
		throw new Response("Learning path not assigned", { status: 403 });
	const branch = await db
		.prepare(
			"SELECT id FROM curriculum_branches WHERE id = ? AND curriculum_version_id = ? AND availability = 'available'",
		)
		.bind(branchId, experience.curriculumVersionId)
		.first<{ id: string }>();
	if (!branch) throw new Response("That branch is not available", { status: 400 });
	await db
		.prepare(
			`UPDATE lesson_experience_assignments
			SET selected_branch_id = ?, branch_selected_at = CURRENT_TIMESTAMP
			WHERE user_id = ? AND selected_branch_id IS NULL`,
		)
		.bind(branchId, userId)
		.run();
	const current = await getLessonExperience(db, userId);
	return current.selectedBranchId ?? branchId;
}
