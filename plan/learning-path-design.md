# Learning Path — Design Specification

## Status

- Document type: Product design specification
- Source: Grilling interview session (Q1–Q104), confirmed by product owner
- Supersedes: parts of [`hangeuloo-lessons-prd.md`](hangeuloo-lessons-prd.md) for new Level 0 learners
- Companion document: [`learning-path-implementation.md`](learning-path-implementation.md)

## 1. Summary

The Learning Path is the structured journey a learner follows from not knowing Hangul to holding everyday Korean conversations. It replaces the current linear lesson catalog for newly onboarded Level 0 learners.

Principles:

> Learn first, practice next. Foundations before branches. Mastery before progression.

The path has three layers:

1. A shared **Hangul Foundation** every absolute beginner completes.
2. Personalized **contextual branches** chosen by goal, ranked by interests.
3. **Shared checkpoints** where branches reconnect to common proficiency.

## 2. Decisions Record

Every decision below was explicitly confirmed during the interview. The recommendation listed is the accepted answer.

| #    | Topic                          | Decision                                                                                                                                                         |
| ---- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1   | Product promise                | Shared foundation followed by personalized contextual branches                                                                                                   |
| Q2   | Target learner (v1)            | Complete beginners who cannot read Hangul                                                                                                                        |
| Q3   | Foundation sequence            | Alternate foundations and contexts: symbol groups applied immediately in useful words and phrases                                                                |
| Q4   | Meaning of context             | Combination: contextual examples on every card, scenario modules, and personalized scenario ordering                                                             |
| Q5   | Foundation outcome             | Decode unfamiliar syllable blocks plus a small set of useful phrases; handwriting optional, listening practiced but not gate-level                               |
| Q6   | Learning cadence               | Small symbol group → immediate application → next group, with larger scenario lessons interleaved                                                                |
| Q7   | Unlock strictness              | Foundation milestones mandatory; contextual branches recommended but freely selectable once unlocked                                                             |
| Q8   | Completion evidence            | Passing a short check at 80%, immediate correction, unlimited retries; retention tracked separately                                                              |
| Q9   | Personalization                | Goal chooses branch direction; interests rank scenarios; other branches stay visible; TOPIK is later scope                                                       |
| Q10  | First delivery scope           | Agree the full model now, implement as vertical slices: foundation + Everyday Conversation                                                                       |
| Q11  | Path hierarchy                 | Path → Milestone → Lesson/Practice → Check; levels remain broad proficiency labels                                                                               |
| Q12  | First reading sequence         | Basic vowel recognition first, then a small consonant-and-block set that quickly unlocks readable Korean                                                         |
| Q13  | Branch topology                | Branches teach relevant situations and periodically rejoin at shared proficiency checks                                                                          |
| Q14  | First context branch           | Everyday Conversation                                                                                                                                            |
| Q15  | Foundation check               | Recognition, sound matching, syllable construction, reading simple words; 5–10 short questions; no speech/handwriting scoring                                    |
| Q16  | Failed check                   | Corrections shown, targeted review, fresh attempt; unlimited attempts, no penalty                                                                                |
| Q17  | Romanization                   | Shown at entry, hidden by default once learners can decode syllable blocks                                                                                       |
| Q18  | Hangul coverage                | Basic vowels, basic consonants, simple CV blocks, batchim; compound vowels/double consonants introduced gradually later                                          |
| Q19  | Lesson shape                   | Introduction → modeled examples → guided interaction → short independent check; 5–8 minutes                                                                      |
| Q20  | Context skills                 | Reading, vocabulary, grammar, listening, low-pressure unscored speaking                                                                                          |
| Q21  | Practice placement             | Short practice inside lessons; completion unlocks related standalone practice                                                                                    |
| Q22  | Branch switching               | Goal branch highlighted; all eligible branches visible; progress kept independently                                                                              |
| Q23  | Progress meaning               | Separate progress for foundation, active branch, and skill development; no 500-word denominator                                                                  |
| Q24  | Daily target                   | Mission composition (count/size of activities) fits the selected 5–20 minutes; curriculum order unchanged                                                        |
| Q25  | Existing content               | Reused where suitable, reorganized/rewritten where the new sequence requires it                                                                                  |
| Q26  | Foundation milestones          | Five milestones: basic vowels → first consonants and blocks → remaining basic consonants → batchim → decoding fluency check                                      |
| Q27  | Authentic Korean early         | Assessed reading is decodable; clearly labeled preview phrases allowed for listening and meaning                                                                 |
| Q28  | Conversation outcome           | Greet, introduce self, ask/answer basic personal questions, express preferences, close politely                                                                  |
| Q29  | Grammar teaching               | Pattern-based main flow; expandable detailed explanations optional                                                                                               |
| Q30  | Speech level                   | Standard polite `-아요/-어요`; formal fixed expressions taught as phrases                                                                                        |
| Q31  | Vocabulary load                | 4–7 explicitly taught items per lesson (near five); previews not enrolled in checks or review                                                                    |
| Q32  | Localization parity            | Both Indonesian and English complete at release                                                                                                                  |
| Q33  | Batchim depth                  | Seven representative final sounds and basic carryover; no cluster/exception deep dive                                                                            |
| Q34  | Branch catalog                 | Everyday Conversation, Travel, Work implemented; TOPIK visible as future content; interests become tagged scenarios                                              |
| Q35  | Conversation sequence          | Greetings → name/identity → personal questions → likes/dislikes → meet-and-greet dialogue → branch checkpoint                                                    |
| Q36  | Shared checkpoints             | Every 2–3 contextual lessons                                                                                                                                     |
| Q37  | Branch completion              | Lessons completed plus an integrated scenario check (reading, listening, sentence construction) at 80%; speaking unscored                                        |
| Q38  | Changing goals                 | Keep all progress, switch active branch, recalculate recommendations                                                                                             |
| Q39  | TOPIK selection                | Allow selection, assign foundation + Conversation, label TOPIK as coming soon                                                                                    |
| Q40  | Existing higher-level learners | Preserve legacy curriculum and progress until deliberate migration                                                                                               |
| Q41  | Path presentation              | Vertical journey map; single-column on mobile; recommended route prominent, alternates visible                                                                   |
| Q42  | Branch entry                   | Branch-choice screen after foundation; goal branch recommended with explanation; learner confirms or chooses                                                     |
| Q43  | Mission composition            | Capped due review first, next path activity, then practice fills remaining time                                                                                  |
| Q44  | Practice unlocks               | Only practice generated from the lesson's taught content; server-enforced                                                                                        |
| Q45  | Skill tracking                 | Hangul decoding, vocabulary, grammar, reading, listening mastery + speaking participation (practice-completed label)                                             |
| Q46  | Checkpoint scoring             | 80% overall AND at least one correct answer in every assessed category                                                                                           |
| Q47  | Completed path                 | Celebrate, recommend another branch, keep due review available                                                                                                   |
| Q48  | Path data model                | Explicit prerequisite edges between stable path nodes                                                                                                            |
| Q49  | Content authoring              | Validated, version-controlled content files with import/seed process                                                                                             |
| Q50  | Curriculum versioning          | Learners pinned to immutable curriculum versions; explicit migration when needed                                                                                 |
| Q51  | Existing Level 0 progress      | Preserved as prior exposure; new foundation checkpoint still required before branches                                                                            |
| Q52  | Audio standard                 | Reviewed human recordings for scored listening; synthesis fallback for instruction only                                                                          |
| Q53  | Assessment integrity           | Item-bank retries, server-side scoring, retained attempt history                                                                                                 |
| Q54  | Content review                 | Automated structural checks plus Korean-language reviewer sign-off                                                                                               |
| Q55  | AI boundaries                  | Drafting only; human review before publication; no AI scoring                                                                                                    |
| Q56  | Account requirement            | Google authentication mandatory in the first slice                                                                                                               |
| Q57  | Speaking privacy               | Recordings stay in memory on device; never uploaded                                                                                                              |
| Q58  | Offline support                | Online-only for the first release                                                                                                                                |
| Q59  | Accessibility                  | Keyboard access, screen-reader semantics, visible focus, reduced motion, contrast, captions/transcripts, no audio-only instructions                              |
| Q60  | Learner tone                   | Concise, encouraging, age-neutral, respectful                                                                                                                    |
| Q61  | Success metric                 | Funnel: foundation start → pass → branch selection → first branch lesson → branch completion                                                                     |
| Q62  | Learning analytics             | Attempt score, category results, missed competency IDs, timing, remediation outcome; no unnecessary answer text or recordings                                    |
| Q63  | Release strategy               | Feature flag; new Level 0 learners first; monitor; expand deliberately                                                                                           |
| Q64  | Recovery                       | Save after each meaningful interaction; resume from last confirmed point; regenerate exposed check items                                                         |
| Q65  | Gate hierarchy                 | Foundation lesson checks and checkpoints gate; contextual lessons sequential in-branch; practice/review never hard-block                                         |
| Q66  | Mastery decay                  | Completion preserved; weakened mastery shown and prioritized in review                                                                                           |
| Q67  | Future test-out                | Optional foundation challenge later; records competencies, not fabricated completions                                                                            |
| Q68  | Level meaning                  | Level 0 = Hangul Foundation; Level 1 = First Interactions; Level 2 = Everyday Korean                                                                             |
| Q69  | Rewards and retries            | Completion XP once; no failure penalty; meaningful learning activity counts toward streak                                                                        |
| Q70  | Reminders                      | Outside the first release; due-review data retained for later                                                                                                    |
| Q71  | Audio failure                  | Scored listening pauses with recovery option; synthesis never substitutes in scored questions                                                                    |
| Q72  | Missing translation            | Publication validation prevents release of versions with incomplete localization                                                                                 |
| Q73  | Unavailable goal branches      | Show selected branch as coming soon; offer Everyday Conversation                                                                                                 |
| Q74  | Level 0 rollout                | New Level 0 learners first; existing Level 0 learners migrate after validation                                                                                   |
| Q75  | Interest ranking               | Content-tag overlap plus stable curriculum-defined priority; manual selection allowed                                                                            |
| Q76  | Active branch state            | Exactly one active branch; all progress retained                                                                                                                 |
| Q77  | Review enrollment              | Vocabulary enters spaced repetition after the lesson check passes                                                                                                |
| Q78  | Lesson replay                  | Unrestricted replay; completion preserved; no duplicate XP; replays cannot erase a pass                                                                          |
| Q79  | Remediation missions           | Failed required check makes remediation + fresh attempt the primary daily mission                                                                                |
| Q80  | Assessment size                | 3–5 items lesson checks; 8–12 milestone checkpoints; 10–15 integrated branch checkpoints                                                                         |
| Q81  | Travel outcome                 | Transport, lodging, food ordering, shopping, directions, basic problems via guided exchanges                                                                     |
| Q82  | Work outcome                   | Professional basics first, then a job-interview milestone; single branch                                                                                         |
| Q83  | Interest scenarios             | Food, School, K-culture, Daily Life become optional tagged scenario modules                                                                                      |
| Q84  | Shared content reuse           | One shared node satisfies every relevant branch; scenario practice may repeat                                                                                    |
| Q85  | Branch size                    | 2–3 milestones, roughly 10–15 micro-lessons plus checkpoints                                                                                                     |
| Q86  | Level distribution             | Level 1 covers guided first interactions; Level 2 extends branches into connected everyday scenarios                                                             |
| Q87  | TOPIK later                    | Exam-preparation branch dependent on shared competencies; adds exam-specific skills                                                                              |
| Q88  | Cultural guidance              | Concise scenario-specific cultural notes; reviewed                                                                                                               |
| Q89  | Vertical slice boundary        | Onboarding routing + 5 foundation milestones + checks + remediation + branch selection + 6-part Conversation branch + lesson practice + progress + daily mission |
| Q90  | Route strategy                 | Evolve existing `/lessons` routes; server-provided navigation; no parallel system                                                                                |
| Q91  | Product label                  | "Learning Path"                                                                                                                                                  |
| Q92  | New user placement             | Level 0 selection enters the new path; Level 1/2 selections keep legacy flow                                                                                     |
| Q93  | Level advancement              | Level 0 → 1 immediately after passing the final Hangul decoding checkpoint                                                                                       |
| Q94  | Level 2 advancement            | Requires a broader shared Level 1 proficiency checkpoint; first slice ends at Level 1 branch completion                                                          |
| Q95  | Dashboard priority             | Next path lesson, remediation, or checkpoint selected by mission logic                                                                                           |
| Q96  | Release quality gate           | Unit, integration, route, and E2E tests plus publication validation                                                                                              |
| Q97  | Rollout assignment             | Deterministic percentage by user ID, persisted with curriculum version; changes affect only new assignments                                                      |
| Q98  | Content deployment             | Immutable schema migrations; validated idempotent content importer with release version and hash                                                                 |
| Q99  | Vocabulary identity bug        | Fix identity boundary before lesson-specific practice using stable namespaced keys; do not renumber persisted records                                            |
| Q100 | Recording dependency           | Scored listening items cannot publish without approved recordings                                                                                                |
| Q101 | Language sign-off              | Recorded reviewer identity and approval state in the content-release process                                                                                     |
| Q102 | Test infrastructure            | Unit/content tests, Cloudflare-backed D1 integration tests, Playwright E2E, isolated test bindings                                                               |
| Q103 | Rollout stages                 | Internal → 1% → 10% → 50% → 100%, pausing on anomalies                                                                                                           |
| Q104 | External content dependencies  | Ship with draft bilingual content, recording scripts, and review gates; block activation until approved                                                          |

## 3. Design Tree

```text
Learning Path
|
+-- Audience: newly onboarded absolute beginners
|   +-- Existing Level 1/2 learners remain on legacy curriculum
|   +-- Existing Level 0 learners migrate only after validation
|   +-- Future knowledgeable learners may take a test-out challenge
|
+-- Structure: Path -> Milestones -> Lessons/Practice -> Checkpoints
|   +-- Broad levels remain proficiency summaries
|   +-- Level 0: Hangul Foundation
|   +-- Level 1: First Interactions
|   +-- Level 2: Everyday Korean
|
+-- Shared Hangul Foundation
|   +-- Basic vowels
|   +-- First consonants and syllable blocks
|   +-- Remaining basic consonants
|   +-- Seven representative batchim sounds and basic carryover
|   +-- Decoding-fluency checkpoint
|   +-- Authentic preview phrases may exceed taught material
|   +-- Assessed reading uses only taught material
|   +-- Romanization fades after syllable decoding
|
+-- Progression
|   +-- Foundation prerequisites are enforced
|   +-- Lesson completion requires an 80% short check
|   +-- Milestone and branch checkpoints also require 80%
|   +-- Every assessed category must contain at least one correct answer
|   +-- Failure unlocks targeted remediation and unlimited retries
|   +-- Optional practice and spaced review never hard-block progression
|   +-- Later forgetting recommends review but never removes completion
|
+-- Contextual Learning
|   +-- Goal recommends a branch
|   +-- Interests rank tagged scenarios and examples
|   +-- One branch is active, but all available branches remain accessible
|   +-- Shared competency nodes count across every relevant branch
|   +-- Branches reconnect through shared checkpoints every 2-3 lessons
|
+-- Branches
|   +-- Everyday Conversation
|   |   +-- Greetings
|   |   +-- Identity and introductions
|   |   +-- Basic personal questions
|   |   +-- Likes and dislikes
|   |   +-- Integrated meet-and-greet
|   |   +-- Final branch checkpoint
|   +-- Travel: transport, lodging, food, shopping, directions, problems
|   +-- Work: professional basics followed by a job-interview milestone
|   +-- TOPIK: coming soon, later added as a dependent exam branch
|   +-- Food, School, K-culture, and Daily Life: optional tagged scenarios
|
+-- Lesson Experience
|   +-- 5-8 minute micro-lessons
|   +-- 4-7 explicitly taught words or expressions
|   +-- Model -> guided interaction -> independent check
|   +-- Reading, vocabulary, grammar, listening, and speaking practice
|   +-- Speaking is unscored and recordings remain device-local
|   +-- Reviewed audio is mandatory for scored listening
|   +-- Indonesian and English publication parity is mandatory
|
+-- Learner Interface
|   +-- /lessons becomes Learning Path
|   +-- Vertical journey with locks, checkpoints, remediation, and forks
|   +-- Mobile uses a single-column journey
|   +-- Dashboard prioritizes the next path activity
|   +-- Daily mission balances short review, progression, and extra practice
|   +-- Progress separates foundation, active branch, and skill development
|   +-- Branch completion recommends another branch and continued review
|
+-- Delivery
    +-- First slice: foundation plus Everyday Conversation
    +-- New Level 0 learners receive deterministic, persisted assignment
    +-- Curriculum versions are immutable per learner
    +-- Travel, Work, and TOPIK appear honestly as coming soon
    +-- Rollout: internal -> 1% -> 10% -> 50% -> 100%
    +-- Unapproved content cannot be activated
```

## 4. Curriculum Detail

### 4.1 Hangul Foundation (Level 0)

Five milestones, each with micro-lessons and a short check; small contextual applications inside every milestone:

1. **Basic vowels** — ㅏ ㅓ ㅗ ㅜ ㅣ ㅑ ㅕ ㅛ ㅠ ㅡ, recognition and sound.
2. **First consonants and syllable blocks** — a small high-frequency consonant set combined into readable blocks, applied in useful words.
3. **Remaining basic consonants** — completion of the basic consonant inventory with continued reading application.
4. **Batchim** — seven representative final sounds and basic carryover.
5. **Decoding fluency checkpoint** — 8–12 items covering recognition, sound matching, syllable construction, and reading simple words; 80% overall and at least one correct per category.

Rules:

- Assessed reading contains only taught material.
- Authentic phrases may appear as clearly labeled previews for listening and meaning.
- Romanization is displayed initially and hidden by default after syllable decoding is established.
- Passing the final checkpoint advances the learner from Level 0 to Level 1 (Q93).

### 4.2 Everyday Conversation (first branch, Level 1)

Six sequential parts, each a lesson plus lesson-specific practice, followed by the branch checkpoint:

1. Choosing an appropriate greeting
2. Saying your name and basic identity
3. Asking and answering simple personal questions
4. Expressing likes and dislikes
5. Combining the material in a short meet-and-greet dialogue
6. Branch checkpoint — 10–15 integrated items covering reading, listening, and sentence construction

Outcome (Q28): the learner can greet someone, introduce themselves, ask and answer basic personal questions, express simple preferences, and close politely.

### 4.3 Later Branches

- **Travel** (Q81): transport, accommodation, food ordering, shopping, directions, basic problems; emergency language as reference only.
- **Work** (Q82): professional introductions and workplace basics first, then a job-interview milestone.
- **TOPIK** (Q87, later): exam-preparation branch depending on shared competencies; adds exam formats, timing, reading/listening strategies, score-oriented checkpoints.
- **Interest scenarios** (Q83): Food, School, K-culture, Daily Life as optional tagged modules reinforcing shared competencies.

### 4.4 Checks and Remediation

- Lesson checks: 3–5 items; milestone checkpoints: 8–12; branch checkpoints: 10–15 (Q80).
- Pass threshold: 80% overall with at least one correct answer in every assessed category (Q46).
- Failure: corrections shown, targeted remediation on missed competencies, unlimited fresh attempts, no penalty (Q16).
- Retries draw equivalent questions from an item bank; scoring is server-side; attempts are recorded (Q53).
- A failed required check makes remediation + retry the primary daily mission (Q79).

## 5. Learner Experience

### 5.1 Daily Mission

Mission logic (Q43, Q95): capped due review when needed → next path activity (in-progress lesson, remediation, checkpoint retry, required practice, branch choice, or next lesson) → optional practice fills remaining time. Mission size fits the 5–20 minute daily target without changing prerequisites (Q24).

### 5.2 Progress Display

- Foundation progress: e.g. "Hangul Foundation 4/6 milestones."
- Active branch progress: e.g. "Conversation Path 2/8."
- Skill indicators: Hangul decoding, vocabulary, grammar, reading, listening mastery; speaking shown as practice completed (Q45).
- Retention weakening shows as a review priority, never as revoked completion (Q66).

### 5.3 Gamification

- Completion XP awarded once per node (Q69).
- No penalty for failed checks; meaningful learning activity counts toward the daily streak.
- Branch completion celebrates, recommends another branch, keeps review available (Q47).

### 5.4 Accessibility and Tone

- Accessibility bar (Q59): keyboard access, screen-reader semantics, visible focus, reduced motion, contrast, captions/transcripts, no audio-only instructions.
- Tone (Q60): concise, encouraging, age-neutral, respectful.

## 6. Personalization Rules

- Onboarding goal recommends the branch; the learner confirms or chooses on the branch-choice screen (Q42).
- Interests rank scenarios via content-tag overlap and a stable curriculum-defined priority; ties are deterministic; manual selection always allowed (Q75).
- Exactly one active branch; switching keeps all progress and recalculates recommendations (Q38, Q76).
- Shared competency nodes count once across every relevant branch (Q84).
- Branch changes after the foundation are honest: unavailable goals (TOPIK, Travel, Work before implementation) show as coming soon with Everyday Conversation offered (Q73).

## 7. Content and Quality Standards

- Both Indonesian and English complete at publication (Q32, Q72).
- Reviewed human recordings required for scored listening (Q52, Q100); synthesis fallback for instruction only.
- Korean-language reviewer sign-off recorded in the release process (Q54, Q101).
- AI may draft examples and distractors; humans review before publication; no AI-generated progression scoring (Q55).
- Concise reviewed cultural notes on scenario lessons (Q88).
- 4–7 explicitly taught items per lesson; only taught items enter checks and spaced repetition (Q31, Q77).

## 8. Explicit Non-Goals

- Anonymous learning and account merging
- Offline synchronization
- Automated pronunciation or handwriting scoring
- Runtime-generated curriculum or AI scoring
- TOPIK implementation
- Notifications and reminders
- A curriculum CMS
- Immediate migration of existing learners
- Level 2 advancement from the first Conversation branch
- Production activation without reviewed audio and Korean-language approval

## 9. Success Metrics

Primary funnel (Q61):

1. Foundation start
2. Foundation pass
3. Branch selection
4. First branch lesson completion
5. Branch completion

Tracked alongside: check pass/fail rates, remediation frequency, error and abandonment rates per milestone, legacy regression indicators.

Expansion beyond the initial cohort requires (Q97/Q103): no severe progression or data-loss defects, reliable checkpoint submissions, acceptable funnel completion, and reviewed learner feedback.
