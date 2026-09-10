# PRD — Hangeuloo Lessons

## 1. Ringkasan

**Hangeuloo Lessons** adalah bagian pembelajaran terstruktur sebelum user masuk ke latihan vocabulary game, sentence game, listening practice, atau AI interview.

Lessons memperkenalkan huruf, suku kata, kata, dan kalimat Korea secara bertahap. Setiap materi ditampilkan dengan ukuran besar, audio yang dapat diputar, cara membaca, arti, dan contoh penggunaan.

Prinsip utama:

> Learn first, practice next.

## 2. Tujuan Produk

- Membantu user memahami materi sebelum mengerjakan practice.
- Membuat user mengenali bentuk Hangul dan cara pengucapannya.
- Menghubungkan tulisan Korea, suara, romanization, dan arti.
- Menyediakan learning path sesuai level user.
- Membuka practice setelah user menyelesaikan materi yang relevan.

## 3. Target User

Hangeuloo Lessons ditujukan untuk user usia 10–40 tahun:

- pemula yang belum mengenal Hangul;
- user yang sudah bisa membaca Hangul tetapi belum memahami kalimat;
- user yang membutuhkan fondasi sebelum latihan speaking dan interview.

## 4. Scope P0

P0 mencakup:

- Level 0 — Hangul Starter;
- Level 1 — First Korean;
- Level 2 — Daily Korean;
- materi huruf, suku kata, kata, dan kalimat sederhana;
- audio pronunciation;
- cara membaca atau romanization;
- terjemahan Bahasa Indonesia;
- progress lesson;
- unlock practice berdasarkan lesson.

Level 3–6 belum termasuk scope P0 dan ditampilkan sebagai **Coming Soon**.

## 5. Struktur Level

### Level 0 — Hangul Starter

Tujuan: user dapat mengenali dan membaca dasar Hangul.

Materi:

- basic vowels: ㅏ, ㅑ, ㅓ, ㅕ, ㅗ, ㅛ, ㅜ, ㅠ, ㅡ, ㅣ;
- basic consonants: ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ;
- kombinasi consonant + vowel;
- syllable block;
- batchim pengenalan;
- kata sangat sederhana;
- pronunciation dasar.

Contoh materi:

```text
ㅎ

[▶ Play]

히읗

hieut

Konsonan Korea yang dibaca “h”.
```

### Level 1 — First Korean

Tujuan: user dapat memahami ungkapan dan kalimat dasar.

Materi:

- salam;
- perkenalan diri;
- 저는 ...입니다;
- 저는 ... 좋아해요;
- 은/는;
- 이/가;
- 을/를;
- 있어요 / 없어요;
- angka dan waktu dasar;
- kata benda sehari-hari.

Contoh materi:

```text
안녕하세요

[▶ Play]

annyeonghaseyo

Halo

Ungkapan sopan untuk menyapa seseorang.
```

### Level 2 — Daily Korean

Tujuan: user dapat memahami percakapan pendek sehari-hari.

Materi:

- past tense;
- future tense;
- negation;
- alasan dengan -아서/어서;
- permintaan dan ajakan;
- aktivitas rutin;
- tempat dan arah;
- restoran, toko, dan transportasi;
- kalimat pendek untuk listening dan speaking.

Contoh materi:

```text
저는 학교에 갑니다.

[▶ Play]

jeoneun hakgyoe gamnida

Saya pergi ke sekolah.

Pola: subject + place + 에 + verb.
```

## 6. User Flow

```text
User memilih level
        ↓
User memilih lesson
        ↓
User membaca materi
        ↓
User memutar audio
        ↓
User membuka penjelasan jika diperlukan
        ↓
User menandai materi selesai
        ↓
Practice terkait terbuka
```

### Flow detail

1. User membuka halaman **Lessons**.
2. Sistem menampilkan level aktif berdasarkan placement atau pilihan user.
3. User melihat daftar lesson yang tersedia.
4. User membuka lesson pertama yang belum selesai.
5. Sistem menampilkan satu materi per halaman atau card.
6. User dapat memutar audio berulang kali.
7. User menekan **Next** untuk melanjutkan.
8. Setelah semua materi selesai, sistem menampilkan completion state.
9. Sistem menawarkan CTA **Practice this lesson**.

## 7. Halaman dan Komponen

### A. Lessons Home

Menampilkan:

- greeting personal;
- current level;
- progress level;
- lesson yang sedang berjalan;
- lesson yang sudah selesai;
- lesson yang terkunci;
- CTA **Continue lesson**;
- label Coming Soon untuk level 3–6.

### B. Level Overview

Menampilkan:

- nama level;
- deskripsi kemampuan;
- daftar unit atau lesson;
- jumlah materi;
- estimated learning time;
- progress tiap lesson;
- practice yang tersedia setelah lesson selesai.

### C. Lesson Detail

Setiap halaman materi memiliki:

- teks Korea dengan font besar;
- tombol play/pause audio;
- tombol replay;
- pengaturan kecepatan 0.75x, 1x, dan 1.25x;
- cara membaca atau romanization;
- terjemahan Bahasa Indonesia;
- catatan pronunciation;
- contoh penggunaan;
- progress indicator;
- tombol Back dan Next;
- CTA practice pada akhir lesson.

### D. Completion State

Setelah lesson selesai, tampilkan:

- animasi perayaan sederhana;
- jumlah materi yang dipelajari;
- XP yang didapat;
- vocabulary yang ditambahkan ke review;
- CTA **Practice now**;
- CTA **Continue next lesson**.

## 8. Content Types

### Character card

Untuk huruf Hangul.

Fields:

- character;
- character name;
- pronunciation;
- romanization;
- audio;
- description;
- example syllables;
- difficulty;
- level.

### Word card

Untuk vocabulary.

Fields:

- Korean word;
- romanization;
- Indonesian meaning;
- audio;
- part of speech;
- example sentence;
- related image, optional;
- level.

### Sentence card

Untuk pola kalimat.

Fields:

- Korean sentence;
- romanization;
- translation;
- audio;
- grammar pattern;
- explanation;
- vocabulary breakdown;
- level.

## 9. Audio Requirements

- Audio tersedia untuk setiap huruf, kata, dan kalimat.
- User dapat memutar audio tanpa meninggalkan halaman.
- Audio memiliki loading state.
- Jika audio gagal, tampilkan tombol retry dan cara membaca dalam teks.
- Audio dapat diputar berulang kali.
- Kecepatan audio dapat diubah.
- Audio tidak autoplay secara agresif.
- Audio yang sudah sering dipakai dapat di-cache.

## 10. Progress dan Unlocking

Progress disimpan per user dan per lesson.

Status lesson:

- Locked;
- Available;
- In progress;
- Completed.

Default unlocking:

- lesson pertama tersedia setelah onboarding;
- lesson berikutnya terbuka setelah lesson sebelumnya selesai;
- practice terkait terbuka setelah lesson selesai;
- user dapat mengulang lesson yang sudah selesai;
- user tidak kehilangan progress ketika berpindah device.

## 11. Gamification

- XP ketika menyelesaikan materi;
- badge untuk menyelesaikan unit;
- progress bar level;
- streak belajar;
- celebration ringan setelah completion;
- daily learning goal;
- vocabulary dari lesson otomatis masuk review queue.

Gamification tidak boleh mengganggu proses membaca, mendengarkan, dan memahami materi.

## 12. UX/UI Direction

- Gunakan gaya colorful, cheerful, dan happy sesuai brand Hangeuloo.
- Tampilkan huruf Korea dengan ukuran besar dan kontras tinggi.
- Gunakan card putih dengan rounded corner dan soft box-shadow.
- Gunakan tombol audio yang mudah ditemukan.
- Gunakan satu fokus utama per layar: karakter, kata, atau kalimat.
- Jangan memenuhi layar dengan terlalu banyak penjelasan sekaligus.
- Gunakan animasi lembut untuk audio playing, completion, dan unlock.
- Sediakan reduced-motion behavior.
- Pastikan desain nyaman digunakan oleh user usia 10 tahun maupun user dewasa.

## 13. Data Model Awal

```text
lessons
- id
- level
- title
- description
- order
- estimated_minutes
- status

lesson_items
- id
- lesson_id
- type: character | word | sentence
- korean_text
- romanization
- translation
- explanation
- audio_url
- order

user_lesson_progress
- user_id
- lesson_id
- status
- current_item_id
- completed_at
- last_accessed_at

practice_unlocks
- user_id
- lesson_id
- practice_type
- unlocked_at
```

## 14. Analytics

Track:

- lesson opened;
- item viewed;
- audio played;
- audio replayed;
- playback speed changed;
- translation revealed;
- lesson completed;
- practice CTA clicked;
- lesson abandoned;
- audio error;
- time spent per item.

## 15. Non-functional Requirements

- Initial lesson content dapat tampil cepat di mobile.
- Audio tidak boleh memblokir tampilan teks.
- Semua item memiliki loading, error, dan retry state.
- Audio player dapat diakses dengan keyboard.
- Teks Hangul memiliki ukuran minimum yang nyaman dibaca.
- Data progress tersimpan secara konsisten.
- Lesson dapat di-cache untuk membuka kembali materi yang sudah pernah dilihat.

## 16. MVP Definition of Done

- User dapat membuka halaman Lessons.
- User dapat melihat Level 0, Level 1, dan Level 2.
- User dapat membuka lesson sesuai urutan.
- Setiap huruf, kata, dan kalimat memiliki teks Korea besar.
- Setiap item memiliki audio, cara membaca, dan terjemahan.
- User dapat play, pause, replay, dan mengubah speed audio.
- Progress lesson tersimpan.
- Lesson selesai dapat membuka practice terkait.
- Level 3–6 tampil sebagai Coming Soon.
- Error audio memiliki retry dan fallback teks.
- Completion state menampilkan XP dan CTA practice.

## 17. Future Scope

- handwriting practice;
- stroke order animation;
- pronunciation recording;
- AI explanation;
- adaptive lesson difficulty;
- native speaker audio variants;
- Level 3–6 content;
- downloadable offline lessons;
- teacher or parent progress view.

