PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  picture TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learning_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  guide_language TEXT NOT NULL CHECK (guide_language IN ('id', 'en')),
  goal TEXT NOT NULL CHECK (goal IN ('conversation', 'job', 'topik', 'travel')),
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
  interests TEXT NOT NULL DEFAULT '[]',
  daily_target INTEGER NOT NULL CHECK (daily_target IN (5, 10, 15, 20)),
  onboarding_completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vocabulary_items (
  id INTEGER PRIMARY KEY,
  korean TEXT NOT NULL,
  romanization TEXT NOT NULL,
  meaning_id TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
  topic TEXT NOT NULL,
  formality TEXT NOT NULL DEFAULT 'neutral',
  example_ko TEXT NOT NULL,
  example_id TEXT NOT NULL,
  example_en TEXT NOT NULL
);

CREATE TABLE sentence_exercises (
  id INTEGER PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
  prompt_id TEXT NOT NULL,
  prompt_en TEXT NOT NULL,
  tokens TEXT NOT NULL,
  answer TEXT NOT NULL,
  grammar_note_id TEXT NOT NULL,
  grammar_note_en TEXT NOT NULL
);

CREATE TABLE listening_exercises (
  id INTEGER PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 2),
  mode TEXT NOT NULL CHECK (mode IN ('dictation', 'fill_blank')),
  audio_text TEXT NOT NULL,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  translation_id TEXT NOT NULL,
  translation_en TEXT NOT NULL,
  note TEXT NOT NULL
);

CREATE TABLE user_vocabulary_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id INTEGER NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
  memory_state TEXT NOT NULL DEFAULT 'new' CHECK (memory_state IN ('new', 'learning', 'review_soon', 'mastered')),
  interval_index INTEGER NOT NULL DEFAULT 0 CHECK (interval_index BETWEEN 0 AND 4),
  due_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, vocabulary_id)
);

CREATE TABLE game_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('vocabulary', 'sentence', 'listening', 'review')),
  level INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  activities_completed INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

CREATE INDEX idx_vocabulary_level ON vocabulary_items(level);
CREATE INDEX idx_vocab_progress_due ON user_vocabulary_progress(user_id, due_at);
CREATE INDEX idx_sessions_user_date ON game_sessions(user_id, completed_at);

INSERT INTO vocabulary_items (id, korean, romanization, meaning_id, meaning_en, level, topic, formality, example_ko, example_id, example_en) VALUES
  (1, '안녕하세요', 'annyeonghaseyo', 'halo', 'hello', 0, 'greetings', 'polite', '안녕하세요!', 'Halo!', 'Hello!'),
  (2, '감사합니다', 'gamsahamnida', 'terima kasih', 'thank you', 0, 'greetings', 'formal', '정말 감사합니다.', 'Terima kasih banyak.', 'Thank you very much.'),
  (3, '네', 'ne', 'ya', 'yes', 0, 'basics', 'neutral', '네, 맞아요.', 'Ya, benar.', 'Yes, that is right.'),
  (4, '아니요', 'aniyo', 'tidak', 'no', 0, 'basics', 'polite', '아니요, 괜찮아요.', 'Tidak, tidak apa-apa.', 'No, it is okay.'),
  (5, '사람', 'saram', 'orang', 'person', 0, 'people', 'neutral', '사람이 있어요.', 'Ada seseorang.', 'There is a person.'),
  (6, '친구', 'chingu', 'teman', 'friend', 0, 'people', 'neutral', '제 친구예요.', 'Dia teman saya.', 'This is my friend.'),
  (7, '물', 'mul', 'air', 'water', 0, 'food', 'neutral', '물을 마셔요.', 'Saya minum air.', 'I drink water.'),
  (8, '밥', 'bap', 'nasi atau makanan', 'rice or meal', 0, 'food', 'neutral', '밥을 먹어요.', 'Saya makan.', 'I eat a meal.'),
  (9, '집', 'jip', 'rumah', 'home', 0, 'places', 'neutral', '집에 가요.', 'Saya pulang.', 'I go home.'),
  (10, '학교', 'hakgyo', 'sekolah', 'school', 0, 'places', 'neutral', '학교에 가요.', 'Saya pergi ke sekolah.', 'I go to school.'),
  (11, '하나', 'hana', 'satu', 'one', 0, 'numbers', 'neutral', '사과 하나 주세요.', 'Tolong satu apel.', 'One apple, please.'),
  (12, '오늘', 'oneul', 'hari ini', 'today', 0, 'time', 'neutral', '오늘 만나요.', 'Mari bertemu hari ini.', 'Let us meet today.'),
  (13, '학생', 'haksaeng', 'pelajar', 'student', 1, 'people', 'neutral', '저는 학생입니다.', 'Saya seorang pelajar.', 'I am a student.'),
  (14, '선생님', 'seonsaengnim', 'guru', 'teacher', 1, 'people', 'honorific', '선생님이 친절해요.', 'Gurunya baik.', 'The teacher is kind.'),
  (15, '가족', 'gajok', 'keluarga', 'family', 1, 'people', 'neutral', '가족이 네 명이에요.', 'Keluarga saya empat orang.', 'There are four people in my family.'),
  (16, '좋아하다', 'joahada', 'menyukai', 'to like', 1, 'activities', 'neutral', '저는 음악을 좋아해요.', 'Saya suka musik.', 'I like music.'),
  (17, '공부하다', 'gongbuhada', 'belajar', 'to study', 1, 'activities', 'neutral', '한국어를 공부해요.', 'Saya belajar bahasa Korea.', 'I study Korean.'),
  (18, '먹다', 'meokda', 'makan', 'to eat', 1, 'food', 'neutral', '김밥을 먹어요.', 'Saya makan gimbap.', 'I eat gimbap.'),
  (19, '마시다', 'masida', 'minum', 'to drink', 1, 'food', 'neutral', '커피를 마셔요.', 'Saya minum kopi.', 'I drink coffee.'),
  (20, '어디', 'eodi', 'di mana', 'where', 1, 'questions', 'neutral', '어디에 가요?', 'Pergi ke mana?', 'Where are you going?'),
  (21, '얼마', 'eolma', 'berapa harga', 'how much', 1, 'shopping', 'neutral', '이거 얼마예요?', 'Ini berapa harganya?', 'How much is this?'),
  (22, '시간', 'sigan', 'waktu', 'time', 1, 'time', 'neutral', '시간이 있어요.', 'Saya punya waktu.', 'I have time.'),
  (23, '왼쪽', 'oenjjok', 'kiri', 'left', 1, 'directions', 'neutral', '왼쪽으로 가세요.', 'Silakan ke kiri.', 'Please go left.'),
  (24, '오른쪽', 'oreunjjok', 'kanan', 'right', 1, 'directions', 'neutral', '오른쪽에 있어요.', 'Ada di sebelah kanan.', 'It is on the right.'),
  (25, '어제', 'eoje', 'kemarin', 'yesterday', 2, 'time', 'neutral', '어제 영화를 봤어요.', 'Kemarin saya menonton film.', 'I watched a movie yesterday.'),
  (26, '내일', 'naeil', 'besok', 'tomorrow', 2, 'time', 'neutral', '내일 일할 거예요.', 'Besok saya akan bekerja.', 'I will work tomorrow.'),
  (27, '여행', 'yeohaeng', 'perjalanan', 'travel', 2, 'travel', 'neutral', '부산으로 여행을 갔어요.', 'Saya bepergian ke Busan.', 'I traveled to Busan.'),
  (28, '식당', 'sikdang', 'restoran', 'restaurant', 2, 'places', 'neutral', '식당에서 만나요.', 'Mari bertemu di restoran.', 'Let us meet at the restaurant.'),
  (29, '지하철', 'jihacheol', 'kereta bawah tanah', 'subway', 2, 'transport', 'neutral', '지하철을 타세요.', 'Naiklah kereta bawah tanah.', 'Take the subway.'),
  (30, '주문하다', 'jumunhada', 'memesan', 'to order', 2, 'food', 'neutral', '비빔밥을 주문했어요.', 'Saya memesan bibimbap.', 'I ordered bibimbap.'),
  (31, '바쁘다', 'bappeuda', 'sibuk', 'busy', 2, 'daily-life', 'neutral', '오늘은 조금 바빠요.', 'Hari ini saya agak sibuk.', 'I am a little busy today.'),
  (32, '재미있다', 'jaemiitda', 'menyenangkan', 'interesting or fun', 2, 'feelings', 'neutral', '수업이 재미있었어요.', 'Kelasnya menyenangkan.', 'The class was fun.'),
  (33, '필요하다', 'piryohada', 'membutuhkan', 'to need', 2, 'daily-life', 'neutral', '도움이 필요해요.', 'Saya butuh bantuan.', 'I need help.'),
  (34, '같이', 'gachi', 'bersama', 'together', 2, 'activities', 'neutral', '같이 점심을 먹어요.', 'Mari makan siang bersama.', 'Let us eat lunch together.'),
  (35, '왜', 'wae', 'mengapa', 'why', 2, 'questions', 'neutral', '왜 한국어를 공부해요?', 'Mengapa belajar bahasa Korea?', 'Why do you study Korean?'),
  (36, '그래서', 'geuraeseo', 'jadi atau karena itu', 'so or therefore', 2, 'connectors', 'neutral', '비가 왔어요. 그래서 집에 있었어요.', 'Hujan turun. Jadi saya di rumah.', 'It rained, so I stayed home.');

INSERT INTO sentence_exercises (id, level, prompt_id, prompt_en, tokens, answer, grammar_note_id, grammar_note_en) VALUES
  (1, 0, 'Saya seorang pelajar.', 'I am a student.', '["학생입니다","저는"]', '저는 학생입니다', '은/는 menandai topik kalimat. 입니다 adalah akhiran formal untuk “adalah”.', '은/는 marks the sentence topic. 입니다 is the formal ending for “to be”.'),
  (2, 0, 'Saya minum air.', 'I drink water.', '["마셔요","물을","저는"]', '저는 물을 마셔요', '을/를 menandai objek dari kata kerja.', '을/를 marks the object of the verb.'),
  (3, 1, 'Saya suka musik.', 'I like music.', '["음악을","좋아해요","저는"]', '저는 음악을 좋아해요', 'Objek diletakkan sebelum kata kerja 좋아해요.', 'The object comes before the verb 좋아해요.'),
  (4, 1, 'Teman saya ada di sekolah.', 'My friend is at school.', '["있어요","학교에","친구가"]', '친구가 학교에 있어요', '에 menandai lokasi keberadaan, dan 이/가 menandai subjek.', '에 marks a location, while 이/가 marks the subject.'),
  (5, 1, 'Saya pergi ke rumah hari ini.', 'I go home today.', '["집에","오늘","가요","저는"]', '저는 오늘 집에 가요', 'Keterangan waktu biasanya muncul sebelum tempat.', 'Time expressions usually come before the place.'),
  (6, 2, 'Saya pergi ke sekolah kemarin.', 'I went to school yesterday.', '["학교에","어제","갔어요","저는"]', '저는 어제 학교에 갔어요', '-았어요/-었어요 menunjukkan bentuk lampau yang sopan.', '-았어요/-었어요 marks the polite past tense.'),
  (7, 2, 'Saya akan belajar bahasa Korea besok.', 'I will study Korean tomorrow.', '["공부할 거예요","내일","한국어를","저는"]', '저는 내일 한국어를 공부할 거예요', '-(으)ㄹ 거예요 menunjukkan rencana atau masa depan.', '-(으)ㄹ 거예요 expresses a plan or the future.'),
  (8, 2, 'Karena hujan, saya berada di rumah.', 'Because it rained, I stayed home.', '["집에 있었어요","비가 와서"]', '비가 와서 집에 있었어요', '-아서/어서 menghubungkan alasan dengan hasil.', '-아서/어서 connects a reason to its result.'),
  (9, 2, 'Mari makan siang bersama.', 'Let us eat lunch together.', '["같이","점심을","먹어요"]', '같이 점심을 먹어요', '같이 berarti “bersama” dan biasanya berada sebelum objek atau kata kerja.', '같이 means “together” and usually comes before the object or verb.');

INSERT INTO listening_exercises (id, level, mode, audio_text, prompt, answer, translation_id, translation_en, note) VALUES
  (1, 0, 'dictation', '안녕하세요', '들은 표현을 한글로 입력하세요.', '안녕하세요', 'Halo.', 'Hello.', 'Sapaan sopan yang paling umum.'),
  (2, 0, 'fill_blank', '물을 마셔요', '물을 ____.', '마셔요', 'Saya minum air.', 'I drink water.', '마셔요 adalah bentuk sopan dari 마시다.'),
  (3, 1, 'dictation', '저는 학생입니다', '들은 문장을 한글로 입력하세요.', '저는 학생입니다', 'Saya seorang pelajar.', 'I am a student.', '입니다 adalah akhiran formal.'),
  (4, 1, 'fill_blank', '학교에 가요', '학교에 ____.', '가요', 'Saya pergi ke sekolah.', 'I go to school.', '에 menandai tujuan.'),
  (5, 2, 'dictation', '어제 친구를 만났어요', '들은 문장을 한글로 입력하세요.', '어제 친구를 만났어요', 'Kemarin saya bertemu teman.', 'I met a friend yesterday.', '-았어요 menunjukkan bentuk lampau.'),
  (6, 2, 'fill_blank', '내일 한국어를 공부할 거예요', '내일 한국어를 ____.', '공부할 거예요', 'Besok saya akan belajar bahasa Korea.', 'I will study Korean tomorrow.', '-(으)ㄹ 거예요 menunjukkan masa depan.');
