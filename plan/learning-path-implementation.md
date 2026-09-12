# Learning Path — Implementation Plan

## Status

- Document type: Technical implementation plan
- Source: Grilling interview session (Q1–Q104) plus repository implementation exploration
- Companion document: [`learning-path-design.md`](learning-path-design.md)
- Guideline: [`clean-code-repository.md`](clean-code-repository.md)

## 1. Strategy

Evolve the existing `/lessons` surface into the Learning Path for **newly onboarded Level 0 learners only**, behind a persisted cohort assignment. All other learners continue the legacy curriculum unchanged.

Core principles:

1. Keep the existing lesson tables, server functions, level pages, and practice behavior as the **legacy curriculum**.
2. Persist a one-time lesson-experience assignment during onboarding.
3. Store the new path in **separate, versioned curriculum-node tables**, never in the current `lessons` table.
4. Dispatch the existing `/lessons` and `/lessons/:lessonId` routes by assignment.
5. Derive all v2 locks and "continue" behavior from **graph edges**, not from `learning_profiles.level` or `lesson_order`.
6. Keep existing assignments pinned to their curriculum version permanently.

### Cohort contract

| User state                                                  | Assignment                                               |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| Profile exists before rollout migration                     | `legacy`                                                 |
| New onboarding, Level 1 or 2                                | `legacy`                                                 |
| New onboarding, Level 0, rollout disabled                   | `legacy`                                                 |
| New onboarding, Level 0, rollout enabled                    | `learning_path`, pinned to the active curriculum version |
| Missing/corrupt assignment                                  | Fail closed to `legacy`                                  |
| Previously assigned `learning_path`, rollout later disabled | Remains `learning_path`                                  |

Configuration: `LEARNING_PATH_ROLLOUT_PERCENT` (default `0`), deterministic hash of user ID, server-only. The flag controls **new assignment only**; it must never reinterpret enrolled users as legacy.

## 2. Schema (additive migrations)

Add — never modify `0001` or `0005`:

1. `migrations/0006_learning_path_schema.sql`
2. `migrations/0007_learning_path_v1_content.sql`

### Tables

**`curriculum_versions`** — `id`, `version_key`, `version_number`, `status` (`draft | active | retired`), `published_at`, `created_at`. Partial unique index so only one version is active for new assignments.

**`lesson_experience_assignments`** — `user_id` PK/FK, `variant` (`legacy | learning_path`), `curriculum_version_id` (nullable only for legacy), `selected_branch_id`, `assigned_at`, `branch_selected_at`. Backfill every existing `learning_profiles.user_id` as `legacy`; backfill again immediately before rollout/content activation.

**`curriculum_branches`** — `id`, `curriculum_version_id`, stable branch key, localized title/description, `availability` (`available | coming_soon`), display order. Seed Everyday Conversation as available; others as coming soon.

**`curriculum_milestones`** — `id`, `curriculum_version_id`, stable key, localized title/description, milestone order. Seed exactly five Hangul foundation milestones.

**`curriculum_nodes`** — `id`, `curriculum_version_id`, `node_type` (`lesson | check | practice | branch_choice`), `lesson_role` (`core | remediation`, nullable), `milestone_id`, `branch_id`, localized title/description, estimated minutes, XP reward, display order.

**`curriculum_prerequisites`** — `node_id`, `prerequisite_node_id`, `required_outcome` (`completed | passed | failed | branch_selected`), composite PK.

**`curriculum_node_items`** — versioned teaching/remediation cards, structurally equivalent to `lesson_items` (`character | word | sentence`, Korean text, romanization, localized translation/pronunciation/explanation/examples, audio URL, optional vocabulary reference, item order).

**`user_curriculum_node_progress`** — `user_id`, `node_id`, `status` (`in_progress | completed`), `current_item_index`, timestamps; composite PK.

**`curriculum_check_items`** — `id`, `check_node_id`, question type, localized prompt, choices/payload JSON, server-only correct answer, localized explanation, item order. Loaders must never return answer keys.

**`user_curriculum_check_attempts`** — attempt ID/idempotency key, user, check node, submitted answers, correct/total, score, `passed`, timestamp. Repeated failed attempts allowed; first passing attempt completes the check.

**`curriculum_practice_items`** — `practice_node_id`, item order, exercise kind, exactly one source reference (curriculum lesson item, `vocabulary_items`, `sentence_exercises`, `listening_exercises`); SQL `CHECK` enforces exactly one source.

**`user_curriculum_practice_attempts`** — attempt ID/idempotency key, user, practice node, submitted answers, server-calculated score, completion status, timestamp.

**`learning_activity_ledger`** — unique `(user_id, source_type, source_id)`, XP, correct/total, activity date, timestamp. `AFTER INSERT` trigger upserts `daily_progress`; retries cannot double-award XP or daily activity.

**`learning_path_events`** (optional) — branch selections, check outcomes, remediation recommendations, node opens. Existing `lesson_events.event_type` constraints cannot represent these safely.

### Graph topology

```text
Foundation lesson 1 -> Check 1
Check 1 passed       -> Foundation lesson 2
Check 1 failed       -> Remediation 1 -> Check 1 retry
... repeat through milestone 5 ...
Check 5 passed       -> Branch choice
Branch choice (Everyday selected)
  -> Everyday part 1 lesson -> part 1 practice
  -> ... -> part 6 lesson -> part 6 practice
  -> Branch checkpoint
```

## 3. Server Modules

### New

- **`app/lib/lesson-experience.server.ts`** — rollout parsing/hash, assignment lookup, active curriculum lookup, atomic onboarding assignment, legacy default, branch selection. API: `getLessonExperience`, `prepareOnboardingAssignment`, `selectCurriculumBranch`.
- **`app/lib/learning-path.server.ts`** — version/node/edge queries, graph evaluation, milestone/branch summaries, node authorization, continue-activity selection, item progress, v2 lesson completion. API: `getLearningPathCatalog`, `getLearningPathLesson`, `viewLearningPathItem`, `completeLearningPathLesson`, `authorizeCurriculumNode`, `getNextLearningPathActivity`. Node states: `locked`, `available`, `in_progress`, `completed`, `failed_check`, `passed_check`.
- **`app/lib/lesson-checks.server.ts`** — check loading without answers, server-side scoring, attempt storage/idempotency, pass/fail and remediation response.
- **`app/lib/lesson-practice.server.ts`** — curated practice loading, graph-based authorization, server-side scoring, attempt recording. Never route v2 submissions through the client-trusting `completeSession`.
- **`app/lib/learning-activity.server.ts`** — ledger insertion, one-time XP/activity awards, vocabulary review-queue insertion.

### Changed

- **`app/lib/learning.server.ts`** — expose a profile-write helper so onboarding profile + assignment commit in one D1 batch; keep `getDashboard` and legacy `completeSession` intact; never let `learning_profiles.level` represent v2 path progress.
- **`app/lib/lessons.server.ts`** — leave all catalog/access/completion functions legacy-only; extract reusable DTO types/pure helpers; do not add graph branches to `lesson_order` queries.

## 4. Routes and UI

### Routes

- Keep existing routes; add `/lessons/checks/:checkNodeId` and `/lessons/practice/:practiceNodeId` (declared before `/lessons/:lessonId`).
- **`app/routes/lessons.tsx`** — authenticate, resolve persisted experience, return a discriminated loader result (legacy catalog or version-pinned path catalog); add a `select-branch` action.
- **`app/routes/lesson.tsx`** — dispatch loader/action by assignment; v2 authorization via the graph; actions return server-generated navigation (`returnHref`, `nextHref`, `practiceHref`, completion kind).
- **`app/routes/lesson-level.tsx`** — legacy only; redirect assigned users to `/lessons`.
- New route modules: `app/routes/lesson-check.tsx`, `app/routes/lesson-practice.tsx`, both with server-side node authorization.
- **`app/routes/home.tsx`** — resolve assignment once; for v2 load a compact path summary (current milestone, next required node, CTA/href, today-completed state, foundation/branch progress); make onboarding profile + assignment atomic; reject repeat onboarding.

### Pages (per `clean-code-repository.md` page structure)

- `app/pages/lessons/LearningPath/` — journey map with five foundation milestones, check/remediation nodes, branch gate, six Conversation parts, exact next action, explicit locked reasons. Components: `MilestoneCard`, `BranchChoice`.
- `app/pages/lessons/LessonCheck/` — question progress, server-confirmed result, pass CTA to next node, fail CTA to remediation/retry, loading/error/retry states.
- `app/pages/lessons/LessonPractice/` — curated items for the specific practice node; reuse visual elements from vocabulary practice.
- Modify `app/pages/lessons/LessonDetail/` — remove hard-coded practice mapping, global-practice CTAs, linear next-lesson logic, and `/lessons/levels/:level` exit; use server-provided URLs.
- Modify `app/pages/home/View.tsx` — legacy branch unchanged; v2 branch renders the exact next path node (check, remediation, branch choice, practice, or lesson). Add `LearningPathMission` and `LearningPathProgress` components.
- Prefer a feature-local stylesheet (`app/pages/lessons/LearningPath/styles.css`) over expanding `app/app.css`.

## 5. Content Pipeline

1. Create a canonical version-controlled `content/` boundary: one file per lesson, nested `localized.id` / `localized.en` objects, stable semantic keys, graph metadata, assessment banks, remediation mappings, audio manifests, review status, and release hashes.
2. Build `scripts/content/` tooling: `load.mjs`, `validate.mjs`, `compile-d1.mjs`, `import-d1.mjs`, `validate-assets.mjs`.
3. Validation rejects: cycles, unreachable nodes, dangling prerequisites, missing translations, invalid answers, broken references, missing scored audio, and releases without recorded Korean-language approval.
4. Import is idempotent, records the content release version and hash, and is separate from schema migrations.
5. Package scripts: `content:validate`, `content:compile`, `content:import:local`, `content:import:remote`, `content:assets:check`.

### Vocabulary identity fix (Q99)

The bundled 500-word bank (`public/500words.json`) and D1 `vocabulary_items` reuse numeric IDs for different words (word-bank ID 1 is `밥`; D1 ID 1 is `안녕하세요`), so submissions can update progress for the wrong word. Fix the identity boundary before lesson-specific practice: stable namespaced content keys resolved to authoritative D1 records; do not renumber persisted records.

## 6. Implementation Phases

1. **Contract and graph tests** — define stable keys for all milestones, lessons, checks, remediation, branch choice, and Conversation nodes; add pure graph validation tests (`tests/learning-path.test.ts`, `tests/curriculum-v1.test.ts`) covering dangling edges, cycles, unreachable nodes, branch leakage.
2. **Schema migration** — add `0006_learning_path_schema.sql`; create tables; backfill legacy assignments; rollout at `0`; harmless to the deployed application.
3. **Assignment and server domain** — server modules; atomic onboarding assignment; acceptance matrix for all cohort states; deploy with rollout at `0`.
4. **Route discrimination** — dispatch `/lessons`, `/lessons/:lessonId`, `/lessons/levels/:level` by assignment; legacy users see byte-for-byte equivalent behavior; treatment users cannot enter legacy level pages.
5. **Seed and validate curriculum v1** — add `0007_learning_path_v1_content.sql`; seed version, milestones, topology, Conversation branch, items, curated exercises; keep `draft` until validation succeeds, then activate.
6. **Learning Path and checks UI** — treatment view and check route; failed check unlocks only its remediation; remediation returns to check retry; passing unlocks the next milestone; refresh/repost cannot duplicate attempts or XP.
7. **Branch choice and Conversation branch** — selection as a `/lessons` action; final foundation check required; branch belongs to the assigned version; first selection idempotent.
8. **Lesson-specific practice** — dedicated route and server scoring; progression `lesson completion -> that lesson's practice -> next part`; generic `/practice` never satisfies v2 prerequisites.
9. **Dashboard mission integration** — server-derived mission priority: in-progress lesson → failed-check remediation → available check retry → required practice → branch choice → next lesson → optional review. Ledger trigger keeps XP/streak/daily counters working.
10. **Controlled rollout** — internal test accounts → small deterministic percentage → verify assignment counts, check pass/fail rates, remediation frequency, practice completion, legacy regression → increase without moving existing assignments.

## 7. Test Infrastructure and Coverage

Add: `vitest.config.ts`, `playwright.config.ts`, `wrangler.test.json` (isolated local bindings), and test suites:

```text
tests/unit/           # graph resolution, scoring, remediation, rollout
tests/content/        # learning-path content validation
tests/integration/    # D1 via the Cloudflare Vitest pool: graph authorization,
                      # check submission, progress migration, lesson routes
tests/e2e/            # beginner journey, server tampering
tests/fixtures/       # legacy-progress.sql, e2e-user.sql
```

Required coverage:

- Cohort assignment matrix and backfill; version pinning after a new version activates.
- Graph authorization for every node type; direct-URL rejection; cross-version ID rejection.
- Check scoring: correct, incorrect, malformed, missing, expired, replayed, cross-user submissions; boundary at the passing threshold; no answer key in loader JSON; concurrent submissions produce one scored attempt and one reward.
- Remediation: failure blocks dependents; remediation enables retake without silently passing; idempotent completion; consistent state across catalog, detail, and next-step recommendation.
- Migration: fresh path from `0001`; upgrade from `0005` with legacy fixtures; `PRAGMA foreign_key_check`; idempotent backfill; no XP awarded by migration.
- Legacy regression: Level 0/1/2 catalog and completion unchanged; new Level 1/2 onboarding stays legacy; flag-off behavior.
- E2E beginner journey: onboarding → assignment → locked practice → first lesson → failed check → remediation → pass → next node → practice → persistence across reload → sign-out behavior. Use role/label selectors; seed sessions directly into test D1.
- Capture the existing regression: completion maps listening to `/practice/listen` but the configured route is `/practice/listening` (`app/pages/lessons/LessonDetail/View.tsx:7`, `app/routes.ts:11`).

## 8. Key Risks and Invariants

1. **`learning_profiles.level` has two meanings** — placement vs. progression. For v2, keep it at the onboarding value; never call `levelAfterCompletion`.
2. **Catalog vs. access rules diverge in legacy** — the graph resolver is the single source of truth for v2.
3. **Legacy completion is not atomic** — v2 uses the unique activity ledger plus trigger for exactly-once rewards.
4. **Practice authorization is currently global and bypassable** — v2 authorizes a specific practice node and its parent lesson.
5. **Practice currently trusts client-reported correctness** — v2 submits selected answers and scores on the server.
6. **Word-bank and database IDs collide** — use namespaced keys; never bare numeric word-bank IDs.
7. **Never reuse legacy lesson/progress IDs** — every versioned node/item ID is immutable and globally unique.
8. **Never seed v2 into `lessons`** — old deployed binaries would expose the rows; separate tables enable safe rollback.
9. **Branch choice must not reuse `learning_profiles.goal`** — the goal recommends; the stored selection is authoritative.
10. **Hard-coded UI URLs encode the legacy model** — the server provides navigation.

## 9. Definition of Done

- v2 progression is entirely graph/version/assignment driven.
- Users assigned legacy continue through the current level/order flow with existing IDs, progress, unlocks, and dashboard history untouched.
- `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build`, and the content validation all pass.
- The E2E beginner journey passes against an isolated local environment.
- No production activation occurs without approved Korean-language review and reviewed audio for scored listening.
