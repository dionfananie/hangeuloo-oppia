# PRD — Hangeuloo Korean Learning & AI Interview App

## Brand

- **Brand name:** Hangeuloo
- **Tagline:** Learn Korean, one happy step at a time.
- **Positioning:** A cheerful, gamified Korean learning app for learners aged 10–40, combining vocabulary practice, listening exercises, sentence building, memory training, and AI interview simulations.
- **Brand personality:** Friendly, colorful, encouraging, playful, and approachable.

## 1. Ringkasan Produk

Hangeuloo adalah aplikasi belajar bahasa Korea yang membantu pengguna berlatih kosakata, menyusun kalimat, mengingat kata, berbicara, dan melakukan simulasi interview dengan AI.

Fokus awal:

1. Latihan interview bahasa Korea dengan AI.
2. Latihan kosakata berbasis matching game.
3. Menyusun kata menjadi kalimat yang benar.
4. Menguatkan ingatan kosakata dengan spaced repetition.

## 2. Masalah yang Ingin Diselesaikan

Pelajar bahasa Korea sering mengetahui arti kata secara pasif, tetapi kesulitan untuk:

- mengingat kata ketika berbicara;
- menyusun urutan kalimat Korea;
- membedakan tingkat formalitas;
- memahami pertanyaan interview;
- menjawab secara spontan;
- mengetahui apakah pengucapannya cukup dapat dipahami.

## 3. Target Pengguna

### Primary user

Pengguna usia **10–40 tahun**, dari pemula sampai menengah, yang ingin:

- belajar bahasa Korea untuk percakapan;
- mempersiapkan interview kerja, kampus, atau beasiswa;
- belajar dari Bahasa Indonesia atau Bahasa Inggris.

### Persona pengguna

**1. Young learner — 10–15 tahun**  
Belajar karena tertarik budaya Korea, musik, drama, atau game. Membutuhkan latihan singkat, visual yang menarik, gamification, audio, dan feedback yang sederhana.

**2. Student learner — 16–24 tahun**  
Belajar untuk sekolah, kuliah, TOPIK, travel, atau memahami konten Korea. Membutuhkan progression yang jelas, latihan listening, vocabulary, grammar, dan speaking.

**3. Adult learner — 25–40 tahun**  
Belajar untuk pekerjaan, interview, beasiswa, relasi, travel, atau pengembangan diri. Membutuhkan latihan yang efisien, simulasi interview AI, feedback praktis, dan progress yang mudah dipantau.

Semua persona membutuhkan latihan singkat 10–15 menit per hari, feedback yang jelas, dan pengalaman belajar yang terasa menyenangkan.

## 4. Tujuan Produk

### Product goals

- Membuat pengguna berlatih bahasa Korea secara aktif, bukan hanya membaca materi.
- Mengubah kesalahan menjadi feedback yang mudah dipahami.
- Membantu pengguna membangun kemampuan menjawab interview secara spontan.
- Meningkatkan retensi kosakata melalui pengulangan terjadwal.

### Non-goals untuk MVP

- Menggantikan guru bahasa Korea secara penuh.
- Menjamin skor TOPIK atau kelulusan interview.
- Menilai pronunciation secara klinis atau fonetik tingkat ahli.
- Menyediakan social network atau marketplace tutor.

## UX/UI Direction

### Design prompt

```text
Act as an elite UX/UI and interaction designer. Design the complete experience for my new web from first load to final CTA. Map every section, message, visual, interaction, animation, transition, and conversion purpose. Create a cohesive journey where storytelling, usability, and visual design work together.

Choose a colorful, cheerful, and happy color scheme. Use rounded border radius for elements such as cards, buttons, inputs, badges, and modals. Add box shadows with clear but soft depth so the interface feels friendly, tactile, and playful.
```

### Visual principles

- Colorful, cheerful, and welcoming visual language.
- Rounded cards, buttons, inputs, badges, dialogs, and game elements.
- Soft layered shadows to create depth and hierarchy.
- Clear Hangul typography with readable Latin fallback.
- Visual rewards such as stars, hearts, streak flames, progress bars, and celebratory states.

### Experience journey

1. **First load** — communicate that Korean practice is fun, short, and actionable.
2. **Onboarding** — ask learning goal, current level, preferred language, and daily target.
3. **First success** — guide the user through one simple Hangul or vocabulary exercise immediately.
4. **Learning home** — show today’s mission, review queue, level progress, streak, and a prominent “Start learning” CTA.
5. **Game interaction** — provide instant feedback, combo states, and a clear next action.
6. **AI interview** — show scenario, difficulty, microphone state, transcript, feedback, and retry CTA.
7. **Progress feedback** — celebrate completion while showing the next improvement area.
8. **Conversion CTA** — invite the user to continue daily practice or start another interview.

### Interaction and motion principles

- Use subtle entrance transitions for cards and exercises.
- Animate correct answers with positive color, scale, and celebratory micro-feedback.
- Explain incorrect answers gently without punitive effects.
- Animate XP, streak, and level progress changes.
- Show recording state with a waveform or pulsing microphone indicator.
- Include loading, processing, empty, success, and error states.
- Respect reduced-motion preferences.

### Primary CTA hierarchy

- Primary: **Start today’s practice**.
- Secondary: **Practice vocabulary** and **Try AI interview**.
- Supporting: **Review mistakes**, **Continue lesson**, and **Listen again**.

The next best action should be obvious while users can still switch between vocabulary, sentence games, memory review, and AI interview.

## Pricing Page

Pricing menggunakan model langganan bulanan dalam Rupiah. Angka dan kuota berikut adalah rancangan awal untuk validasi, bukan harga final.

### Pricing tiers

| Fitur | Free | Learner — Rp24.000/bulan | Pro Interview — Rp49.000/bulan |
|---|---:|---:|---:|
| Vocabulary dan sentence games | Basic daily limit | Full P0 access | Full P0 access |
| Memory review | Limit harian | Spaced repetition penuh | Spaced repetition penuh |
| STT Korea | Basic engine / limited quota | Better accuracy, larger quota | Highest available quality, priority quota |
| TTS Korea | Basic voice | More natural voice | Premium/natural voice options |
| AI interview | 1 sesi pendek per minggu | Sesi lebih panjang dan lebih sering | Sesi paling panjang dan kuota tertinggi |
| Interview feedback | Basic correction | Grammar, vocabulary, fluency | Detailed coaching, retry, and history |
| Audio playback | Limited | Included | Included |
| Progress tracking | Basic | Full progress history | Full progress history and advanced insights |
| Ads | May be shown | No ads | No ads |
| Future levels | Preview only | Coming Soon access | Coming Soon access |

### Suggested limits for initial validation

- **Free**: 5 menit STT per bulan, 20.000 karakter TTS per bulan, dan 1 AI interview pendek per minggu.
- **Learner — Rp24.000/bulan**: 60 menit STT per bulan, 150.000 karakter TTS per bulan, dan maksimal 10 AI interview per bulan dengan durasi sampai 5 menit per sesi.
- **Pro Interview — Rp49.000/bulan**: 180 menit STT per bulan, 500.000 karakter TTS per bulan, dan maksimal 30 AI interview per bulan dengan durasi sampai 15 menit per sesi.

Kuota harus ditampilkan transparan di halaman pricing agar pengguna memahami batas pemakaian voice dan AI. Sistem perlu menampilkan pemakaian berjalan, notifikasi ketika kuota hampir habis, serta opsi upgrade.

### Pricing page structure

1. Headline: **Practice Korean with the right amount of AI support.**
2. Toggle harga bulanan dan tahunan bila paket tahunan tersedia.
3. Tiga pricing cards dengan tier Pro Interview sebagai recommended plan.
4. Perbandingan fitur dan kuota secara ringkas.
5. FAQ mengenai kuota STT, TTS, interview, pembatalan, dan penggunaan audio.
6. CTA Free: **Start learning free**.
7. CTA Learner: **Practice more**.
8. CTA Pro: **Master your interview**.

### Product rules

- Free user tetap dapat mencoba core learning loop tanpa memasukkan kartu pembayaran.
- Jika kuota STT habis, user masih dapat mengetik jawaban interview.
- Jika kuota TTS habis, user masih dapat membaca teks atau menggunakan browser speech fallback bila tersedia.
- Jika kuota interview habis, user tetap dapat mengakses vocabulary, grammar, listening, dan memory review.
- Jangan menghapus history latihan ketika user downgrade.
- Tampilkan kualitas voice sebagai “Basic”, “Enhanced”, dan “Premium” setelah diuji dengan benchmark nyata.

## 5. Fitur Utama

### Learning Levels

Level pembelajaran mengikuti urutan kemampuan praktis. Pemetaan ke TOPIK hanya sebagai referensi, bukan ekuivalensi resmi.

#### P0 — Level 0: Hangul Starter

Fokus:

- membaca Hangul;
- konsonan, vokal, dan batchim;
- pronunciation dasar;
- angka Korea dan Sino-Korea;
- salam dan ekspresi dasar.

Target:

> User dapat membaca kata sederhana dan memperkenalkan diri secara sangat singkat.

#### P0 — Level 1: First Korean

Fokus:

- pola `저는 ...입니다`;
- pola `저는 ... 좋아해요`;
- partikel 은/는, 이/가, 을/를;
- 있어요 / 없어요;
- angka, waktu, harga, tempat, dan arah;
- kalimat sopan bentuk `-요`.

Target:

> User dapat membuat kalimat sederhana untuk kebutuhan sehari-hari.

#### P0 — Level 2: Daily Korean

Fokus:

- past tense dan future tense;
- negation;
- alasan dengan `-아서/어서`;
- permintaan dan ajakan;
- pengalaman dan aktivitas rutin;
- listening pendek;
- percakapan di toko, restoran, dan transportasi.

Target:

> User dapat melakukan percakapan singkat dengan bantuan konteks.

#### Coming Soon — Level 3: Conversation Builder

Fokus pada kalimat gabungan, opini, alasan, honorific dasar, dan percakapan terbuka.

#### Coming Soon — Level 4: Interview Korean

Fokus pada interview kerja, presentasi pendek, diskusi, idiom umum, dan kalimat kompleks.

#### Coming Soon — Level 5: Professional Korean

Fokus pada bahasa bisnis, laporan, berita kompleks, vocabulary profesional, dan komunikasi formal.

#### Coming Soon — Level 6: Advanced Korean

Fokus pada argumentasi kompleks, tulisan akademik, idiom, nuansa sosial, dan komunikasi tingkat lanjut.

### Level Availability untuk MVP

Pada development awal, hanya Level 0, Level 1, dan Level 2 yang aktif. Level 3 sampai Level 6 ditampilkan sebagai **Coming Soon** dan belum menjadi bagian dari kurikulum aktif, scoring, atau progression utama.

Setiap level P0 memiliki empat jalur latihan:

- Vocabulary;
- Grammar;
- Listening;
- Speaking.

AI interview pada P0 dibatasi sesuai level:

- Level 0: membaca dan mengulang frasa pendek;
- Level 1: menjawab dengan satu kalimat sederhana;
- Level 2: menjawab dua sampai tiga kalimat dalam konteks sehari-hari.

### A. Onboarding dan placement

User memilih:

- bahasa pengantar: Bahasa Indonesia atau Inggris;
- tujuan belajar: percakapan, interview kerja, TOPIK, travel;
- level awal: pemula, dasar, menengah;
- topik yang diminati;
- target latihan harian.

Placement awal dapat berupa 10–15 soal kosakata, grammar, dan listening sederhana.

### B. AI Korean Interview

#### User flow

1. User memilih skenario interview.
2. AI mengajukan pertanyaan dalam bahasa Korea melalui suara dan teks.
3. User menjawab melalui mikrofon atau mengetik.
4. Sistem melakukan speech-to-text.
5. AI menganalisis isi jawaban, grammar, vocabulary, fluency, dan relevansi.
6. AI memberikan feedback dalam bahasa pengguna.
7. User dapat mengulang jawaban atau melanjutkan pertanyaan berikutnya.

#### Skenario awal

- Self introduction / 자기소개
- Job interview
- University interview
- Scholarship interview
- Daily conversation
- Travel situation

#### Feedback yang ditampilkan

- transkrip jawaban user;
- koreksi kalimat;
- versi jawaban yang lebih natural;
- kosakata atau grammar yang perlu dipelajari;
- skor isi jawaban;
- skor grammar;
- skor kelancaran;
- pronunciation indicator dengan label “perlu diperbaiki” secara hati-hati;
- satu atau dua saran konkret untuk percobaan berikutnya.

#### Prinsip penting

Jangan hanya memberi skor. AI harus menjelaskan kesalahan dan memberikan versi yang bisa ditiru.

### C. Matching Vocabulary Game

User mencocokkan:

- kata Korea dengan arti Indonesia;
- kata Korea dengan gambar;
- kata Korea dengan audio;
- kata Korea dengan romanization;
- kata Korea formal dengan situasi penggunaannya.

Gameplay:

- 10 pasangan per ronde;
- timer opsional;
- combo;
- streak;
- XP;
- bonus untuk jawaban tanpa hint.

### D. Word-to-Sentence Game

User menyusun kata-kata acak menjadi kalimat Korea yang benar.

Contoh:

```text
저는 / 학생입니다
→ 저는 학생입니다.
```

Level bertahap:

1. kalimat pola sederhana;
2. partikel 은/는, 이/가, 을/를;
3. pola waktu dan tempat;
4. bentuk sopan 합니다/해요;
5. kalimat lampau dan masa depan;
6. connective sentences;
7. jawaban interview.

Feedback harus menunjukkan:

- posisi kata yang benar;
- fungsi partikel;
- pola grammar;
- terjemahan natural.

### E. Memory Vocabulary / Spaced Repetition

Setiap kata memiliki status memori:

- New;
- Learning;
- Review soon;
- Mastered.

Jenis latihan:

- recall arti dari kata Korea;
- recall kata Korea dari arti;
- listening recall;
- typing recall;
- contoh kalimat;
- pilihan tingkat keyakinan.

Algoritme MVP dapat memakai interval sederhana: 1 hari, 3 hari, 7 hari, 14 hari, 30 hari. Setelah data terkumpul, algoritme dapat dikembangkan menjadi FSRS atau pendekatan serupa.

### F. Listening Practice

User mendengarkan audio bahasa Korea lalu menjawab latihan listening. Fitur ini membantu pengguna menghubungkan bunyi, Hangul, arti, dan konteks kalimat.

#### Mode latihan

**1. Dictation mode**

User mendengarkan audio pendek lalu mengetik kalimat atau frasa Korea yang didengar.

```text
Audio: 저는 학생입니다.
User mengetik: 저는 학생입니다.
```

Sistem memeriksa kesamaan kata, partikel, spelling Hangul, kata yang tertukar atau hilang, dan penggunaan spasi secara wajar.

**2. Fill-in-the-blank mode**

User mendengarkan audio dan melengkapi kata yang hilang dari kalimat.

```text
Audio: 저는 학교에 갑니다.
Prompt: 저는 학교에 ____.
Jawaban: 갑니다
```

#### Level kesulitan

- Level 0: kata dan frasa sangat pendek dengan audio lambat.
- Level 1: kalimat sehari-hari dengan pilihan kata atau romanization opsional.
- Level 2: kalimat lebih panjang, audio natural, dan lebih sedikit hint.

#### Kontrol audio

- play dan pause;
- replay;
- kecepatan 0.75x, 1x, dan 1.25x;
- tampilkan Hangul setelah jawaban dikirim;
- tampilkan terjemahan setelah user meminta bantuan.

#### Feedback

- highlight kata yang benar, salah, atau hilang;
- tampilkan jawaban lengkap;
- jelaskan vocabulary atau grammar penting;
- simpan kata yang salah ke memory review;
- berikan skor listening berdasarkan tingkat bantuan yang digunakan.

### G. Progress dan Gamification

- XP harian;
- streak;
- level;
- badges;
- daily mission;
- weekly goal;
- progress per topik;
- vocabulary mastery;
- jumlah interview selesai;
- improvement dari percobaan pertama ke percobaan berikutnya.

Gamification harus memberi motivasi belajar, bukan mendorong user mengejar skor dengan menebak.

## 6. Voice Engine Korea

### Kebutuhan STT

- Korean locale `ko-KR`;
- streaming atau near-real-time transcription;
- punctuation;
- partial transcript untuk UI live;
- confidence bila tersedia;
- toleransi terhadap aksen pelajar;
- deteksi silence dan end-of-speech.

### Kebutuhan TTS

- suara Korea natural;
- kontrol speed;
- audio playback per kalimat;
- SSML atau kontrol jeda bila tersedia;
- suara laki-laki dan perempuan;
- caching audio untuk mengurangi biaya.

### Kandidat vendor

1. **Google Cloud Speech-to-Text + Cloud Text-to-Speech** — kandidat utama untuk POC; dokumentasi resmi mencantumkan `ko-KR` untuk STT dan banyak voice Korea untuk TTS.
2. **Azure Speech** — kandidat kuat bila pronunciation assessment menjadi fitur penting; dukungan bahasa berbeda menurut fitur, sehingga harus diuji khusus untuk Korean pronunciation assessment.
3. **Deepgram** — alternatif STT dengan dukungan Korean; cocok untuk menguji transcription latency dan streaming.
4. **Amazon Transcribe + Polly** — alternatif enterprise; Polly mendukung Korean TTS, tetapi fitur STT dan fitur bahasa spesifik perlu divalidasi untuk use case interview.

### Rekomendasi MVP

Mulai dengan:

```text
Browser microphone
        ↓
STT ko-KR
        ↓
Transcript + audio metadata
        ↓
LLM feedback engine
        ↓
TTS ko-KR
```

Untuk fase pertama, gunakan STT sebagai indikator isi dan kelancaran. Jangan menyebut hasilnya sebagai pronunciation score yang presisi sebelum dilakukan benchmark dengan native speaker.

## 7. AI Feedback Architecture

Input ke AI:

- pertanyaan interview;
- jawaban user hasil transkripsi;
- target level;
- rubric penilaian;
- vocabulary dan grammar yang sedang dipelajari;
- durasi jawaban;
- optional: pronunciation metrics dari voice engine.

Output terstruktur:

```json
{
  "overallScore": 72,
  "fluencyScore": 68,
  "grammarScore": 75,
  "contentScore": 78,
  "correctedAnswer": "...",
  "naturalAnswer": "...",
  "mistakes": [],
  "recommendedWords": [],
  "nextPractice": "..."
}
```

LLM harus diwajibkan mengeluarkan JSON yang divalidasi schema agar UI tidak bergantung pada parsing teks bebas.

## 8. MVP Scope

### Must-have

- login atau anonymous session;
- onboarding singkat;
- Level 0, Level 1, dan Level 2 sebagai kurikulum P0;
- Level 3–6 ditampilkan sebagai Coming Soon;
- 300–500 kosakata dasar;
- matching game;
- word-to-sentence game;
- listening practice dengan dictation dan fill-in-the-blank;
- spaced repetition sederhana;
- 3 skenario AI interview;
- rekam suara;
- Korean STT;
- Korean TTS;
- feedback setelah interview;
- progress harian;
- basic XP dan streak.

### Should-have

- hint;
- playback jawaban user;
- transcript dengan highlight kesalahan;
- level difficulty;
- custom interview topic;
- offline cache untuk vocabulary game.

### Later

- Aktivasi kurikulum Level 3–6;
- pronunciation assessment fonem-per-fonem;
- live conversation dua arah;
- native-speaker review;
- TOPIK-specific curriculum;
- leaderboard;
- mobile app native;
- teacher dashboard.

## 9. Non-functional Requirements

- feedback interview muncul maksimal 10–15 detik setelah user selesai berbicara;
- audio tidak hilang ketika request gagal;
- request dapat diulang dengan idempotency key;
- API key voice dan LLM tidak pernah dikirim ke browser;
- audio dan transcript memiliki retention policy;
- user dapat menghapus rekaman suara;
- aplikasi tetap usable tanpa audio untuk latihan typing;
- UI mobile-first;
- aksesibilitas: keyboard support, captions, replay, adjustable speed.

## 10. Data Model Awal

Entitas utama:

- `users`;
- `learning_profiles`;
- `vocabulary_items`;
- `user_vocabulary_progress`;
- `sentence_exercises`;
- `listening_exercises`;
- `game_sessions`;
- `interview_scenarios`;
- `interview_sessions`;
- `interview_turns`;
- `audio_recordings`;
- `ai_feedback`;
- `daily_progress`.

## 11. Metrics

### Activation

- user menyelesaikan onboarding;
- user menyelesaikan latihan pertama;
- user mencoba microphone;
- user menyelesaikan satu interview.

### Engagement

- latihan per minggu;
- interview selesai per minggu;
- vocabulary review completion rate;
- streak retention;
- audio replay rate.

### Learning quality

- improvement score pada interview berulang;
- recall rate vocabulary;
- error recurrence rate;
- completion rate untuk sentence game;
- user-rated feedback helpfulness.

## 12. Risiko dan Eksperimen Awal

### Risiko 1: STT salah menangkap ucapan pelajar

Eksperimen: kumpulkan 30–50 rekaman pendek dari beberapa level pengguna dan bandingkan transkrip vendor dengan penilaian manual.

### Risiko 2: AI memberi feedback yang tidak konsisten

Eksperimen: gunakan rubric dan JSON schema, lalu evaluasi 100 jawaban dengan checklist grammar, relevansi, naturalness, dan tone.

### Risiko 3: Pronunciation score dianggap tidak adil

Eksperimen: tampilkan feedback sebagai “speech clarity indicators” terlebih dahulu, bukan skor absolut, lalu validasi dengan native speaker.

### Risiko 4: Gamification mengalahkan tujuan belajar

Eksperimen: ukur recall 24 jam setelah game, bukan hanya jumlah ronde atau XP.

## 13. Definition of Done MVP

- User dapat mendaftar dan memilih level.
- User dapat menyelesaikan matching game dan sentence game.
- Kata yang salah masuk ke review queue.
- User dapat melakukan minimal satu interview berbasis suara.
- Pertanyaan AI dapat diputar dalam bahasa Korea.
- Jawaban user ditranskripsi dan disimpan.
- Feedback tampil dalam format terstruktur dan mudah dipahami.
- Error STT, TTS, dan LLM memiliki fallback UI.
- User dapat melihat progress dan menghapus audio recording.
- Minimal 20 skenario interview dan 300 vocabulary items tersedia.

## 14. Rekomendasi Tahap Pengembangan

### Phase 1 — Learning core

Vocabulary, matching, sentence ordering, review queue, XP, dan progress.

### Phase 2 — Voice POC

Microphone, Korean STT, Korean TTS, playback, dan latency/cost benchmark.

### Phase 3 — AI interview

Scenario engine, conversation state, rubric, structured feedback, dan history.

### Phase 4 — Quality and retention

Pronunciation experiment, adaptive difficulty, spaced repetition improvement, analytics, dan subscription limits.
