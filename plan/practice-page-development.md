# Practice Page Development

## Goal

Replace modal-based practice with a dedicated practice experience. Users should be able to open practice from Home or Lessons, choose a practice mode, and receive randomized Korean content with meanings and examples.

## Current Content

- 36 vocabulary items
- 9 sentence exercises
- 6 listening exercises
- 52 lesson items
- 36 vocabulary examples with Korean text, romanization, Indonesian meaning, English meaning, and example sentences

The practice vocabulary dataset should grow to **500 Korean text entries**. The existing 36 vocabulary records must remain available and should not be duplicated.

## Content Dataset

Create a new database migration that adds the missing vocabulary records to `vocabulary_items`.

Each record must include:

- Stable numeric ID
- Korean text
- Romanization
- Indonesian meaning
- English meaning
- Level from 0 to 2
- Topic
- Formality
- Korean example sentence
- Indonesian example translation
- English example translation

Content requirements:

- 500 total vocabulary records after migration
- No duplicate Korean text
- No duplicate IDs
- Natural Korean, not machine-generated placeholder text
- Correct romanization and translations
- Balanced coverage across levels 0, 1, and 2
- Coverage for greetings, people, food, places, transport, time, shopping, school, work, travel, feelings, daily life, questions, grammar, and common verbs
- Examples should be short enough for a practice card
- Korean examples should use vocabulary appropriate to the record's level

Recommended distribution:

- Level 0: 180 entries
- Level 1: 180 entries
- Level 2: 140 entries

## Routes

Add dedicated routes:

- `/practice`
- `/practice/vocabulary`
- `/practice/vocabulary/match`
- `/practice/vocabulary/korean-to-meaning`
- `/practice/vocabulary/meaning-to-korean`
- `/practice/vocabulary/image-guess`
- `/practice/sentence`
- `/practice/listening`
- `/practice/review`

`/practice` should show the practice home page with available modes and the user's progress. A mode route should render the selected exercise as a full page rather than a modal.

Unauthenticated users should be redirected to `/` using the existing authentication behavior.

## Home Entry Points

Add clear links from Home:

- A primary Practice link in the navigation
- A practice entry card in the main dashboard
- Links from the existing activity cards to the matching practice route
- A link to `/practice` for users who want to choose a mode

Keep the Lessons entry point separate. Lessons teach new material; Practice reinforces unlocked material.

## Practice Home Page

The page should display:

- Current level
- Total available vocabulary
- Items practiced today
- Due review count
- Current streak and XP
- Practice mode cards
- A prominent “Start random practice” action
- A recent or recommended practice mode

Practice mode cards should show whether the mode is locked, available, or has due content.

Vocabulary practice must provide four modes:

1. Match Korean words with their meanings
2. Translate Korean vocabulary into the user's guide-language meaning
3. Translate an English meaning into the correct Korean vocabulary
4. Guess the Korean vocabulary represented by an image

All four modes must select random words from the 500-word vocabulary dataset.

## Random Selection

Random practice must be deterministic enough to test but varied for users.

Selection priority:

1. Due review items for the current user
2. Unseen items within the user's unlocked level
3. Previously practiced items within the user's unlocked level

The server must select the random content. Do not load all 500 records into the browser just to randomize them.

Recommended query behavior:

- Filter by `level <= user_level`
- Exclude completed or unavailable lesson content when the mode requires unlocks
- Prefer records due in `user_vocabulary_progress`
- Use a randomized ordering with a stable fallback for SQLite/D1 compatibility
- Limit each practice round to 5 to 10 items
- Avoid repeating the same item twice in one round

The server should return a round identifier and the selected item IDs. Submission must validate those IDs against the server-side round data instead of trusting client-provided answers.

## Vocabulary Practice Modes

Vocabulary practice must use a full-page lesson-style player, not a modal. Reuse the visual structure from the lesson player:

- `lesson-player-shell`
- Lesson-style header with exit action
- Progress bar and current item count
- `learning-card` visual treatment
- Lesson-style footer actions
- Completion screen with XP and retry actions

Each round should contain 5 to 10 random vocabulary items, avoid duplicate items, and display immediate feedback before allowing the user to continue.

### Match Pairs

- Display Korean words in one column
- Display shuffled meanings in another column
- Require the user to match every pair
- Mark correct pairs as complete
- Show an error state for incorrect matches

### Korean to Meaning

- Display the Korean word prominently
- Display romanization and optional audio
- Ask the user to choose or enter the meaning
- Accept the user's guide language as the primary answer language
- Reveal the English meaning and example after answering

### Meaning to Korean

- Display the English meaning prominently
- Provide Korean answer choices or a Korean text input
- Validate the answer against the selected vocabulary record
- Show Korean text, romanization, and example after answering

### Image Guessing

- Display an image representing the vocabulary item
- Provide four Korean answer choices
- Require the user to select the correct Korean word
- Show the Korean word, romanization, meaning, and example after answering
- Provide accessible alternative text for every image

Each vocabulary record must support image content:

- `image_url` or a stable local asset key
- `image_alt`

Prefer local optimized images or generated topic illustrations so production does not depend on third-party image URLs. Use a topic illustration fallback when an item has no dedicated image.

## Vocabulary Practice Card

Each vocabulary card should show:

- Korean text
- Romanization
- Meaning in the user's guide language
- Optional English meaning
- Korean example sentence
- Example translation
- Topic and level
- Audio playback when browser speech synthesis is available

The card must support the active practice mode and must be rendered inside the practice page rather than a modal.

## Sentence and Listening Practice

Move the existing sentence and listening panels into page-level route components.

Reuse the current data and submission behavior:

- Sentence token ordering
- Listening dictation and fill-in-the-blank modes
- Correct and total answer counts
- XP calculation
- Daily progress updates

The old components may be extracted into shared page components, but they should no longer depend on modal-only layout styles or modal close callbacks.

## Progress and XP

Continue using the existing `game_sessions` and `daily_progress` tables.

On round completion:

- Validate the round and item IDs on the server
- Calculate the score on the server
- Update vocabulary progress
- Update due dates and memory state
- Record XP and daily activity progress
- Show a completion summary page
- Offer “Practice again” and “Back to dashboard” actions

Do not award XP from client-provided values.

## Data API

Add server-side functions in `app/lib/learning.server.ts` or a dedicated `practice.server.ts` module:

- `getPracticeSummary`
- `createPracticeRound`
- `getPracticeRound`
- `submitPracticeRound`
- `getRandomVocabularyItems`

Keep database access out of React components.

## Migration Validation

Add automated checks for:

- Exactly 500 vocabulary records after all migrations
- No duplicate Korean text
- No duplicate IDs
- Every record has both translations
- Every record has a non-empty example sentence
- Every record has a valid level and topic

The existing lesson and learning tests should continue to pass.

## Responsive UI

The practice page must work on desktop and mobile.

- Use a single-column layout on small screens
- Keep the Korean text visually dominant
- Make answer controls large enough for touch input
- Keep progress and exit controls visible while scrolling
- Avoid modal-only overflow behavior
- Preserve the existing Hangeuloo visual language

## Implementation Order

1. Add and validate the 500-item vocabulary migration.
2. Add server-side random round creation and validation.
3. Add `/practice` summary route.
4. Move vocabulary practice to `/practice/vocabulary`.
5. Move sentence, listening, and review practice to their page routes.
6. Add Home and Lessons entry points.
7. Add completion and retry flows.
8. Remove modal-only practice wiring and unused styles.
9. Run typecheck, tests, build, and migration validation.

## Acceptance Criteria

- A signed-in user can open Practice from Home.
- A user can select a practice mode without opening a modal.
- Vocabulary practice includes match-pairs, Korean-to-meaning, meaning-to-Korean, and image-guessing modes.
- Every vocabulary mode uses random words from the 500-item dataset.
- Vocabulary practice uses the lesson-player layout and full-page navigation.
- Random vocabulary rounds return different items across requests.
- Random items are limited to the user's unlocked level.
- Due review items are prioritized.
- Korean text and the correct meaning are displayed together.
- Image practice provides a valid image or topic fallback with accessible alternative text.
- Round completion updates XP and progress exactly once.
- Refreshing or replaying a round cannot award duplicate XP.
- All 500 vocabulary records are present after migration.
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run build` passes.
