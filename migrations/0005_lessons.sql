PRAGMA foreign_keys = ON;

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_id TEXT NOT NULL,
  description_en TEXT NOT NULL,
  lesson_order INTEGER NOT NULL,
  estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes > 0),
  practice_type TEXT NOT NULL CHECK (practice_type IN ('vocabulary', 'sentence', 'listening')),
  xp_reward INTEGER NOT NULL DEFAULT 20 CHECK (xp_reward >= 0),
  UNIQUE (level, lesson_order)
);

CREATE TABLE lesson_items (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('character', 'word', 'sentence')),
  korean_text TEXT NOT NULL,
  romanization TEXT NOT NULL,
  translation_id TEXT NOT NULL,
  translation_en TEXT NOT NULL,
  pronunciation_id TEXT NOT NULL,
  pronunciation_en TEXT NOT NULL,
  explanation_id TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  example_ko TEXT NOT NULL,
  example_id TEXT NOT NULL,
  example_en TEXT NOT NULL,
  audio_url TEXT,
  vocabulary_id INTEGER REFERENCES vocabulary_items(id) ON DELETE SET NULL,
  item_order INTEGER NOT NULL,
  UNIQUE (lesson_id, item_order)
);

CREATE TABLE user_lesson_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  current_item_index INTEGER NOT NULL DEFAULT 0 CHECK (current_item_index >= 0),
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  last_accessed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE practice_unlocks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  practice_type TEXT NOT NULL CHECK (practice_type IN ('vocabulary', 'sentence', 'listening', 'review')),
  unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id, practice_type)
);

CREATE TABLE lesson_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  lesson_item_id TEXT REFERENCES lesson_items(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('lesson_opened', 'item_viewed', 'audio_played', 'audio_replayed', 'audio_error', 'speed_changed', 'translation_revealed', 'lesson_completed', 'practice_clicked')),
  event_value TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_level_order ON lessons(level, lesson_order);
CREATE INDEX idx_lesson_items_lesson_order ON lesson_items(lesson_id, item_order);
CREATE INDEX idx_lesson_progress_user ON user_lesson_progress(user_id, status);
CREATE INDEX idx_lesson_events_user_date ON lesson_events(user_id, created_at);

INSERT INTO lessons (id, level, title_id, title_en, description_id, description_en, lesson_order, estimated_minutes, practice_type, xp_reward) VALUES
  ('l0-vowels', 0, 'Vokal dasar', 'Basic vowels', 'Kenali bentuk dan bunyi vokal Hangul yang paling penting.', 'Recognize the shapes and sounds of essential Hangul vowels.', 1, 7, 'listening', 25),
  ('l0-consonants', 0, 'Konsonan dasar', 'Basic consonants', 'Pelajari konsonan yang membangun setiap blok Hangul.', 'Learn the consonants that build every Hangul block.', 2, 8, 'vocabulary', 25),
  ('l0-blocks', 0, 'Blok suku kata', 'Syllable blocks', 'Gabungkan huruf dan kenali batchim sederhana.', 'Combine letters and recognize a simple batchim.', 3, 8, 'vocabulary', 25),
  ('l1-greetings', 1, 'Salam sehari-hari', 'Everyday greetings', 'Sapa orang lain dengan ungkapan Korea yang sopan.', 'Greet people with polite Korean expressions.', 1, 6, 'listening', 20),
  ('l1-introductions', 1, 'Perkenalan diri', 'Introducing yourself', 'Gunakan pola dasar untuk nama, peran, dan kesukaan.', 'Use essential patterns for names, roles, and likes.', 2, 8, 'sentence', 25),
  ('l1-particles', 1, 'Partikel inti', 'Core particles', 'Pahami fungsi 은/는, 이/가, dan 을/를.', 'Understand how 은/는, 이/가, and 을/를 work.', 3, 9, 'sentence', 25),
  ('l2-tenses', 2, 'Kemarin dan besok', 'Yesterday and tomorrow', 'Bicarakan kejadian lampau dan rencana masa depan.', 'Talk about past events and future plans.', 1, 9, 'sentence', 30),
  ('l2-reasons', 2, 'Negasi dan alasan', 'Negation and reasons', 'Katakan tidak dan hubungkan alasan dengan hasil.', 'Say what did not happen and connect reasons to results.', 2, 9, 'sentence', 30),
  ('l2-around-town', 2, 'Berkeliling kota', 'Around town', 'Gunakan ungkapan praktis di restoran dan transportasi.', 'Use practical expressions in restaurants and transport.', 3, 8, 'listening', 25);

INSERT INTO lesson_items (id, lesson_id, type, korean_text, romanization, translation_id, translation_en, pronunciation_id, pronunciation_en, explanation_id, explanation_en, example_ko, example_id, example_en, vocabulary_id, item_order) VALUES
  ('l0v-1', 'l0-vowels', 'character', 'ㅏ', 'a', 'Vokal “a”', 'The vowel “a”', 'Buka mulut dengan rileks seperti “a” pada kata “apa”.', 'Open your mouth naturally, like “a” in “father”.', 'Garis pendek mengarah ke kanan. Vokal ini diletakkan di kanan konsonan.', 'The short stroke points right. This vowel sits to the right of a consonant.', '가 · 나 · 다', 'Bunyi a pada ga, na, dan da.', 'The a sound in ga, na, and da.', NULL, 1),
  ('l0v-2', 'l0-vowels', 'character', 'ㅓ', 'eo', 'Vokal “eo”', 'The vowel “eo”', 'Ucapkan bunyi di antara “o” dan “a” dengan rahang rileks.', 'Make an open “uh” sound with a relaxed jaw.', 'Garis pendek mengarah ke kiri dan huruf diletakkan di kanan konsonan.', 'The short stroke points left and the vowel sits to the right of a consonant.', '거 · 너 · 더', 'Bunyi eo pada geo, neo, dan deo.', 'The eo sound in geo, neo, and deo.', NULL, 2),
  ('l0v-3', 'l0-vowels', 'character', 'ㅗ', 'o', 'Vokal “o”', 'The vowel “o”', 'Bulatkan bibir tanpa memanjangkan bunyinya.', 'Round your lips without stretching the sound.', 'Vokal horizontal ini diletakkan di bawah konsonan.', 'This horizontal vowel is placed below a consonant.', '고 · 노 · 도', 'Bunyi o pada go, no, dan do.', 'The o sound in go, no, and do.', NULL, 3),
  ('l0v-4', 'l0-vowels', 'character', 'ㅜ', 'u', 'Vokal “u”', 'The vowel “u”', 'Bulatkan bibir seperti mengucapkan “u”.', 'Round your lips like the “oo” in “moon”.', 'Garis pendek mengarah ke bawah dan diletakkan di bawah konsonan.', 'The short stroke points down and sits below a consonant.', '구 · 누 · 두', 'Bunyi u pada gu, nu, dan du.', 'The u sound in gu, nu, and du.', NULL, 4),
  ('l0v-5', 'l0-vowels', 'character', 'ㅣ', 'i', 'Vokal “i”', 'The vowel “i”', 'Tersenyum ringan dan ucapkan “i” dengan jelas.', 'Keep your lips slightly wide and say “ee”.', 'Satu garis vertikal yang diletakkan di kanan konsonan.', 'A single vertical line placed to the right of a consonant.', '기 · 니 · 디', 'Bunyi i pada gi, ni, dan di.', 'The i sound in gi, ni, and di.', NULL, 5),
  ('l0v-6', 'l0-vowels', 'character', 'ㅑ', 'ya', 'Vokal “ya”', 'The vowel “ya”', 'Mulai dengan y ringan lalu lanjutkan ke bunyi a.', 'Begin with a light y and move into the a sound.', 'Dua garis pendek membedakan ㅑ dari ㅏ.', 'Two short strokes distinguish ㅑ from ㅏ.', '야 · 냐 · 랴', 'Bunyi ya pada ya, nya, dan rya.', 'The ya sound in ya, nya, and rya.', NULL, 6),
  ('l0v-7', 'l0-vowels', 'character', 'ㅕ', 'yeo', 'Vokal “yeo”', 'The vowel “yeo”', 'Mulai dengan y ringan lalu buka ke bunyi eo.', 'Begin with a light y and open into the eo sound.', 'Dua garis pendek mengarah ke kiri.', 'Two short strokes point to the left.', '여 · 녀 · 셔', 'Bunyi yeo pada yeo, nyeo, dan syeo.', 'The yeo sound in yeo, nyeo, and syeo.', NULL, 7),
  ('l0v-8', 'l0-vowels', 'character', 'ㅛ', 'yo', 'Vokal “yo”', 'The vowel “yo”', 'Bulatkan bibir dan awali dengan y singkat.', 'Round your lips and begin with a short y.', 'Dua garis di atas membedakan ㅛ dari ㅗ.', 'Two upper strokes distinguish ㅛ from ㅗ.', '요 · 교 · 쇼', 'Bunyi yo pada yo, gyo, dan syo.', 'The yo sound in yo, gyo, and syo.', NULL, 8),
  ('l0v-9', 'l0-vowels', 'character', 'ㅠ', 'yu', 'Vokal “yu”', 'The vowel “yu”', 'Awali dengan y lalu bulatkan bibir untuk u.', 'Begin with y, then round your lips for u.', 'Dua garis ke bawah membedakan ㅠ dari ㅜ.', 'Two downward strokes distinguish ㅠ from ㅜ.', '유 · 규 · 슈', 'Bunyi yu pada yu, gyu, dan syu.', 'The yu sound in yu, gyu, and syu.', NULL, 9),
  ('l0v-10', 'l0-vowels', 'character', 'ㅡ', 'eu', 'Vokal “eu”', 'The vowel “eu”', 'Ratakan bibir dan tarik bunyi dari bagian belakang mulut.', 'Keep your lips flat and form the sound toward the back of the mouth.', 'Vokal horizontal tunggal ini diletakkan di bawah konsonan.', 'This single horizontal vowel sits below a consonant.', '그 · 느 · 드', 'Bunyi eu pada geu, neu, dan deu.', 'The eu sound in geu, neu, and deu.', NULL, 10),

  ('l0c-1', 'l0-consonants', 'character', 'ㄱ', 'g/k · giyeok', 'Konsonan g/k', 'The g/k consonant', 'Di awal suku kata terdengar lembut seperti g; di akhir lebih dekat ke k.', 'At the start it is a light g; at the end it is closer to k.', 'Nama huruf ini 기역 (giyeok). Bentuknya mengingatkan sudut lidah.', 'Its name is 기역 (giyeok). Its shape suggests the tongue angle.', '가 · 고 · 국', 'ga, go, dan guk', 'ga, go, and guk', NULL, 1),
  ('l0c-2', 'l0-consonants', 'character', 'ㄴ', 'n · nieun', 'Konsonan n', 'The n consonant', 'Sentuhkan ujung lidah di belakang gigi atas.', 'Touch the tip of your tongue behind your upper teeth.', 'Nama huruf ini 니은 (nieun).', 'Its name is 니은 (nieun).', '나 · 너 · 눈', 'na, neo, dan nun', 'na, neo, and nun', NULL, 2),
  ('l0c-3', 'l0-consonants', 'character', 'ㅁ', 'm · mieum', 'Konsonan m', 'The m consonant', 'Tutup kedua bibir seperti bunyi m dalam Bahasa Indonesia.', 'Close both lips, just like an English m.', 'Nama huruf ini 미음 (mieum).', 'Its name is 미음 (mieum).', '마 · 모 · 몸', 'ma, mo, dan mom', 'ma, mo, and mom', NULL, 3),
  ('l0c-4', 'l0-consonants', 'character', 'ㅅ', 's · siot', 'Konsonan s', 'The s consonant', 'Di depan ㅣ, bunyinya menjadi lebih dekat ke “sy”.', 'Before ㅣ, the sound becomes closer to “sh”.', 'Nama huruf ini 시옷 (siot).', 'Its name is 시옷 (siot).', '사 · 소 · 시', 'sa, so, dan si', 'sa, so, and si', NULL, 4),
  ('l0c-5', 'l0-consonants', 'character', 'ㅎ', 'h · hieut', 'Konsonan h', 'The h consonant', 'Hembuskan udara ringan saat mengucapkan h.', 'Release a light breath as you say h.', 'Nama huruf ini 히읗 (hieut).', 'Its name is 히읗 (hieut).', '하 · 호 · 한', 'ha, ho, dan han', 'ha, ho, and han', NULL, 5),
  ('l0c-6', 'l0-consonants', 'character', 'ㄷ', 'd/t · digeut', 'Konsonan d/t', 'The d/t consonant', 'Di awal terdengar seperti d ringan dan di akhir seperti t pendek.', 'At the start it is a light d; at the end it is a short t.', 'Nama huruf ini 디귿 (digeut).', 'Its name is 디귿 (digeut).', '다 · 도 · 닫', 'da, do, dan dat', 'da, do, and dat', NULL, 6),
  ('l0c-7', 'l0-consonants', 'character', 'ㄹ', 'r/l · rieul', 'Konsonan r/l', 'The r/l consonant', 'Di antara vokal terdengar seperti r ringan; di akhir mendekati l.', 'Between vowels it is a light r; at the end it is closer to l.', 'Nama huruf ini 리을 (rieul).', 'Its name is 리을 (rieul).', '라 · 로 · 말', 'ra, ro, dan mal', 'ra, ro, and mal', NULL, 7),
  ('l0c-8', 'l0-consonants', 'character', 'ㅂ', 'b/p · bieup', 'Konsonan b/p', 'The b/p consonant', 'Awali dengan b lembut; batchim-nya terdengar seperti p pendek.', 'Begin with a soft b; as batchim it sounds like a short p.', 'Nama huruf ini 비읍 (bieup).', 'Its name is 비읍 (bieup).', '바 · 보 · 밥', 'ba, bo, dan bap', 'ba, bo, and bap', NULL, 8),
  ('l0c-9', 'l0-consonants', 'character', 'ㅇ', 'silent/ng · ieung', 'Konsonan diam/ng', 'The silent/ng consonant', 'Diam di awal suku kata dan berbunyi ng sebagai batchim.', 'It is silent at the start and sounds ng as batchim.', 'Nama huruf ini 이응 (ieung).', 'Its name is 이응 (ieung).', '아 · 오 · 강', 'a, o, dan gang', 'a, o, and gang', NULL, 9),
  ('l0c-10', 'l0-consonants', 'character', 'ㅈ', 'j · jieut', 'Konsonan j', 'The j consonant', 'Ucapkan j dengan pelepasan udara yang ringan.', 'Say j with a light release of air.', 'Nama huruf ini 지읒 (jieut).', 'Its name is 지읒 (jieut).', '자 · 조 · 집', 'ja, jo, dan jip', 'ja, jo, and jip', NULL, 10),
  ('l0c-11', 'l0-consonants', 'character', 'ㅊ', 'ch · chieut', 'Konsonan ch', 'The ch consonant', 'Bunyinya seperti j dengan hembusan udara lebih kuat.', 'It sounds like j with a stronger puff of air.', 'Nama huruf ini 치읓 (chieut).', 'Its name is 치읓 (chieut).', '차 · 초 · 춤', 'cha, cho, dan chum', 'cha, cho, and chum', NULL, 11),
  ('l0c-12', 'l0-consonants', 'character', 'ㅋ', 'k · kieuk', 'Konsonan k', 'The k consonant', 'Lepaskan udara lebih kuat daripada ㄱ.', 'Release more air than with ㄱ.', 'Nama huruf ini 키읔 (kieuk).', 'Its name is 키읔 (kieuk).', '카 · 코 · 키', 'ka, ko, dan ki', 'ka, ko, and ki', NULL, 12),
  ('l0c-13', 'l0-consonants', 'character', 'ㅌ', 't · tieut', 'Konsonan t', 'The t consonant', 'Lepaskan udara lebih kuat daripada ㄷ.', 'Release more air than with ㄷ.', 'Nama huruf ini 티읕 (tieut).', 'Its name is 티읕 (tieut).', '타 · 토 · 틀', 'ta, to, dan teul', 'ta, to, and teul', NULL, 13),
  ('l0c-14', 'l0-consonants', 'character', 'ㅍ', 'p · pieup', 'Konsonan p', 'The p consonant', 'Lepaskan udara lebih kuat daripada ㅂ.', 'Release more air than with ㅂ.', 'Nama huruf ini 피읖 (pieup).', 'Its name is 피읖 (pieup).', '파 · 포 · 풀', 'pa, po, dan pul', 'pa, po, and pul', NULL, 14),

  ('l0b-1', 'l0-blocks', 'character', '가', 'ga', 'Suku kata ga', 'The syllable ga', 'Baca ㄱ lalu ㅏ sebagai satu bunyi, bukan dua huruf terpisah.', 'Read ㄱ and ㅏ as one sound, not as separate letters.', 'Konsonan berada di kiri karena ㅏ adalah vokal vertikal.', 'The consonant sits left because ㅏ is a vertical vowel.', '가수', 'gasu · penyanyi', 'gasu · singer', NULL, 1),
  ('l0b-2', 'l0-blocks', 'character', '한', 'han', 'Suku kata han', 'The syllable han', 'Mulai dengan h, lanjutkan a, lalu tutup dengan n.', 'Start with h, continue with a, and close with n.', 'ㄴ di bagian bawah adalah batchim, yaitu konsonan akhir.', 'The ㄴ at the bottom is batchim, a final consonant.', '한국', 'hanguk · Korea', 'hanguk · Korea', NULL, 2),
  ('l0b-3', 'l0-blocks', 'word', '물', 'mul', 'Air', 'Water', 'Bunyi ㄹ akhir terdengar singkat, di antara l dan r.', 'The final ㄹ is short and sounds close to l.', 'ㅁ + ㅜ + ㄹ membentuk satu blok suku kata.', 'ㅁ + ㅜ + ㄹ form one syllable block.', '물을 마셔요.', 'Saya minum air.', 'I drink water.', 7, 3),
  ('l0b-4', 'l0-blocks', 'word', '집', 'jip', 'Rumah', 'Home', 'Batchim ㅂ di akhir dilepas seperti p pendek.', 'Final ㅂ is released like a short p.', 'ㅈ dan ㅣ membentuk ji, lalu ㅂ menjadi batchim.', 'ㅈ and ㅣ form ji, then ㅂ becomes the batchim.', '집에 가요.', 'Saya pulang.', 'I go home.', 9, 4),

  ('l1g-1', 'l1-greetings', 'word', '안녕하세요', 'annyeonghaseyo', 'Halo', 'Hello', 'Tekankan ritme secara merata: an-nyeong-ha-se-yo.', 'Keep an even rhythm: an-nyeong-ha-se-yo.', 'Ungkapan sopan yang aman digunakan hampir di semua situasi.', 'A polite greeting that is safe in almost any situation.', '안녕하세요, 선생님!', 'Halo, Guru!', 'Hello, teacher!', 1, 1),
  ('l1g-2', 'l1-greetings', 'word', '감사합니다', 'gamsahamnida', 'Terima kasih', 'Thank you', 'Dalam ucapan alami, 합니다 terdengar mendekati hamnida.', 'In natural speech, 합니다 sounds close to hamnida.', 'Gunakan untuk mengucapkan terima kasih dengan sopan atau formal.', 'Use it to say thank you politely or formally.', '정말 감사합니다.', 'Terima kasih banyak.', 'Thank you very much.', 2, 2),
  ('l1g-3', 'l1-greetings', 'sentence', '만나서 반가워요', 'mannaseo bangawoyo', 'Senang bertemu dengan Anda.', 'Nice to meet you.', 'Sambungkan 만나서 tanpa jeda panjang.', 'Connect 만나서 without a long pause.', 'Ungkapan sopan dan ramah setelah berkenalan.', 'A friendly polite expression after an introduction.', '저도 만나서 반가워요.', 'Saya juga senang bertemu dengan Anda.', 'Nice to meet you too.', NULL, 3),
  ('l1g-4', 'l1-greetings', 'word', '안녕히 가세요', 'annyeonghi gaseyo', 'Selamat jalan', 'Goodbye', 'ㅎ pada 안녕히 terdengar lembut dalam ucapan cepat.', 'The ㅎ in 안녕히 is light in quick speech.', 'Ucapkan kepada orang yang pergi ketika Anda tetap berada di tempat.', 'Say this to the person leaving when you are staying.', '내일 봐요. 안녕히 가세요!', 'Sampai besok. Selamat jalan!', 'See you tomorrow. Goodbye!', NULL, 4),

  ('l1i-1', 'l1-introductions', 'sentence', '저는 학생입니다', 'jeoneun haksaengimnida', 'Saya seorang pelajar.', 'I am a student.', '입니다 diucapkan imnida karena perubahan bunyi alami.', '입니다 is pronounced imnida because of a natural sound change.', 'Pola 저는 …입니다 adalah perkenalan formal yang sederhana.', 'The 저는 …입니다 pattern is a simple formal introduction.', '저는 디온입니다.', 'Saya Dion.', 'I am Dion.', 13, 1),
  ('l1i-2', 'l1-introductions', 'sentence', '제 이름은 민지예요', 'je ireumeun minjiyeyo', 'Nama saya Minji.', 'My name is Minji.', '제 terdengar seperti “je”, bukan “je-i”.', '제 is one syllable, pronounced “je”.', '제 berarti “milik saya” dalam bentuk sopan.', '제 is the polite form of “my”.', '제 이름은 수진이에요.', 'Nama saya Sujin.', 'My name is Sujin.', NULL, 2),
  ('l1i-3', 'l1-introductions', 'sentence', '저는 음악을 좋아해요', 'jeoneun eumageul joahaeyo', 'Saya suka musik.', 'I like music.', '좋아해요 dibaca jo-a-hae-yo; pertahankan empat ketukan ringan.', 'Read 좋아해요 as jo-a-hae-yo with four light beats.', 'Gunakan kata benda + 을/를 + 좋아해요 untuk menyatakan kesukaan.', 'Use noun + 을/를 + 좋아해요 to express a preference.', '저는 한국어를 좋아해요.', 'Saya suka Bahasa Korea.', 'I like Korean.', 16, 3),
  ('l1i-4', 'l1-introductions', 'word', '친구', 'chingu', 'Teman', 'Friend', 'ㄱ di tengah kata terdengar lebih dekat ke g.', 'The ㄱ in the middle sounds closer to g.', 'Kata benda umum untuk teman tanpa membedakan gender.', 'A common noun for a friend of any gender.', '민수는 제 친구예요.', 'Minsu adalah teman saya.', 'Minsu is my friend.', 6, 4),

  ('l1p-1', 'l1-particles', 'sentence', '저는 학생이에요', 'jeoneun haksaengieyo', 'Saya seorang pelajar.', 'I am a student.', '는 menempel pada 저 tanpa jeda.', 'Attach 는 to 저 without a pause.', '은/는 menandai topik. Gunakan 는 setelah vokal dan 은 setelah konsonan.', '은/는 marks the topic. Use 는 after a vowel and 은 after a consonant.', '오늘은 월요일이에요.', 'Hari ini hari Senin.', 'Today is Monday.', 13, 1),
  ('l1p-2', 'l1-particles', 'sentence', '친구가 있어요', 'chinguga isseoyo', 'Ada teman.', 'There is a friend.', 'Pada 있어요, ㅆ adalah bunyi s yang tegang.', 'In 있어요, ㅆ is a tense s sound.', '이/가 menandai subjek atau informasi baru. Gunakan 가 setelah vokal.', '이/가 marks a subject or new information. Use 가 after a vowel.', '시간이 있어요.', 'Saya punya waktu.', 'I have time.', 6, 2),
  ('l1p-3', 'l1-particles', 'sentence', '물을 마셔요', 'mureul masyeoyo', 'Saya minum air.', 'I drink water.', 'Saat berbicara, ㄹ di antara vokal terdengar seperti r ringan.', 'Between vowels, ㄹ sounds like a light r.', '을/를 menandai objek. Gunakan 를 setelah vokal dan 을 setelah konsonan.', '을/를 marks an object. Use 를 after a vowel and 을 after a consonant.', '밥을 먹어요.', 'Saya makan.', 'I eat a meal.', 7, 3),
  ('l1p-4', 'l1-particles', 'sentence', '학교에 가요', 'hakgyoe gayo', 'Saya pergi ke sekolah.', 'I go to school.', '에 melekat pada 학교: hak-gyo-e.', 'Attach 에 to 학교: hak-gyo-e.', '에 menunjukkan tujuan atau lokasi keberadaan.', '에 marks a destination or location.', '집에 있어요.', 'Saya berada di rumah.', 'I am at home.', 10, 4),

  ('l2t-1', 'l2-tenses', 'word', '어제', 'eoje', 'Kemarin', 'Yesterday', 'Pisahkan dua suku kata dengan ringan: eo-je.', 'Keep the two syllables clear: eo-je.', 'Letakkan keterangan waktu dekat awal kalimat.', 'Place time expressions near the start of a sentence.', '어제 영화를 봤어요.', 'Kemarin saya menonton film.', 'I watched a movie yesterday.', 25, 1),
  ('l2t-2', 'l2-tenses', 'sentence', '어제 학교에 갔어요', 'eoje hakgyoe gasseoyo', 'Kemarin saya pergi ke sekolah.', 'I went to school yesterday.', '갔어요 memiliki bunyi s tegang sebelum eo.', '갔어요 has a tense s sound before eo.', '-았어요/-었어요 membentuk lampau sopan. 가다 berubah menjadi 갔어요.', '-았어요/-었어요 forms the polite past. 가다 becomes 갔어요.', '어제 친구를 만났어요.', 'Kemarin saya bertemu teman.', 'I met a friend yesterday.', 10, 2),
  ('l2t-3', 'l2-tenses', 'word', '내일', 'naeil', 'Besok', 'Tomorrow', 'Gabungkan vokal ae dan il dengan halus.', 'Connect ae and il smoothly.', 'Kata waktu untuk rencana pada hari berikutnya.', 'A time word for plans on the following day.', '내일 만나요.', 'Sampai jumpa besok.', 'See you tomorrow.', 26, 3),
  ('l2t-4', 'l2-tenses', 'sentence', '내일 공부할 거예요', 'naeil gongbuhal geoyeyo', 'Besok saya akan belajar.', 'I will study tomorrow.', '할 거예요 diucapkan sebagai tiga kelompok ringan.', 'Say 할 거예요 in three light groups.', '-(으)ㄹ 거예요 menyatakan rencana atau dugaan masa depan.', '-(으)ㄹ 거예요 expresses a future plan or prediction.', '주말에 여행할 거예요.', 'Saya akan bepergian akhir pekan ini.', 'I will travel this weekend.', 26, 4),

  ('l2r-1', 'l2-reasons', 'sentence', '커피를 안 마셔요', 'keopireul an masyeoyo', 'Saya tidak minum kopi.', 'I do not drink coffee.', '안 diucapkan singkat tepat sebelum kata kerja.', 'Say 안 briefly right before the verb.', 'Letakkan 안 sebelum kata kerja untuk negasi sederhana.', 'Place 안 before a verb for simple negation.', '오늘은 안 바빠요.', 'Hari ini saya tidak sibuk.', 'I am not busy today.', NULL, 1),
  ('l2r-2', 'l2-reasons', 'sentence', '학교에 가지 않아요', 'hakgyoe gaji anayo', 'Saya tidak pergi ke sekolah.', 'I do not go to school.', '않아요 terdengar seperti anayo; ㅎ tidak dilepas kuat.', '않아요 sounds like anayo; the ㅎ is not strongly released.', '-지 않아요 adalah pola negasi yang lebih eksplisit.', '-지 않아요 is a more explicit negation pattern.', '고기를 먹지 않아요.', 'Saya tidak makan daging.', 'I do not eat meat.', 10, 2),
  ('l2r-3', 'l2-reasons', 'sentence', '비가 와서 집에 있었어요', 'biga waseo jibe isseosseoyo', 'Karena hujan, saya berada di rumah.', 'Because it rained, I stayed home.', 'Hubungkan 와서 tanpa berhenti di tengah.', 'Connect 와서 without pausing in the middle.', '-아서/어서 menghubungkan alasan dengan hasil secara alami.', '-아서/어서 naturally connects a reason with its result.', '피곤해서 일찍 잤어요.', 'Karena lelah, saya tidur lebih awal.', 'Because I was tired, I slept early.', 9, 3),
  ('l2r-4', 'l2-reasons', 'sentence', '시간이 없어서 못 갔어요', 'sigani eopseoseo mot gasseoyo', 'Karena tidak ada waktu, saya tidak bisa pergi.', 'I could not go because I had no time.', '없어서 dimulai dengan eo dan diakhiri seo tanpa jeda.', 'Move from eop to seo without a pause.', '못 sebelum kata kerja menyatakan tidak mampu melakukan sesuatu.', '못 before a verb means being unable to do something.', '아파서 공부를 못 했어요.', 'Karena sakit, saya tidak bisa belajar.', 'I could not study because I was sick.', NULL, 4),

  ('l2a-1', 'l2-around-town', 'word', '식당', 'sikdang', 'Restoran', 'Restaurant', 'Batchim ㄱ bertemu ㄷ sehingga terdengar seperti k-t yang rapat.', 'The final ㄱ meets ㄷ in a compact k-t transition.', 'Kata umum untuk tempat makan atau restoran.', 'A common word for a restaurant or eating place.', '식당에서 만나요.', 'Mari bertemu di restoran.', 'Let us meet at the restaurant.', 28, 1),
  ('l2a-2', 'l2-around-town', 'sentence', '비빔밥 하나 주세요', 'bibimbap hana juseyo', 'Tolong satu bibimbap.', 'One bibimbap, please.', '주세요 diucapkan ju-se-yo dengan nada sopan.', 'Say 주세요 as ju-se-yo with a polite tone.', 'Gunakan benda + jumlah + 주세요 untuk memesan dengan sopan.', 'Use item + quantity + 주세요 to order politely.', '물 두 병 주세요.', 'Tolong dua botol air.', 'Two bottles of water, please.', NULL, 2),
  ('l2a-3', 'l2-around-town', 'word', '지하철', 'jihacheol', 'Kereta bawah tanah', 'Subway', '철 berakhir dengan bunyi l yang singkat.', '철 ends with a short l sound.', 'Kata untuk sistem kereta bawah tanah.', 'The word for an underground train system.', '지하철을 타세요.', 'Silakan naik kereta bawah tanah.', 'Take the subway.', 29, 3),
  ('l2a-4', 'l2-around-town', 'sentence', '역이 어디예요?', 'yeogi eodiyeyo', 'Stasiunnya di mana?', 'Where is the station?', '어디예요 mengalir sebagai eo-di-ye-yo.', 'Let 어디예요 flow as eo-di-ye-yo.', 'Gunakan tempat + 이/가 어디예요? untuk menanyakan lokasi.', 'Use place + 이/가 어디예요? to ask for a location.', '화장실이 어디예요?', 'Toiletnya di mana?', 'Where is the restroom?', NULL, 4);
