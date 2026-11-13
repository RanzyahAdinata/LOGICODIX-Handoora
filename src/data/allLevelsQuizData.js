// ============================================================
// DATA KUIS LEVEL 1 - 6 BERDASARKAN TEMA MODUL HANDOORA
// Setiap Level dibagi menjadi 3 Tahap (Stage 1, Stage 2, Stage 3)
// Mendukung tipe soal:
// - 'peragakan': Deteksi kamera real-time
// - 'pilih_isyarat': Memilih kartu visual isyarat yang tepat
// - 'tebak_huruf' / 'tebak_makna': Tebak huruf/kata dari kartu isyarat
// ============================================================

import { LEVEL1_STAGES } from './level1QuizData'

export const ALL_LEVEL_STAGES = {
  1: LEVEL1_STAGES,

  // ============================================================
  // LEVEL 2: SALAM, SAPAAN & PERKENALAN DIRI (BISINDO)
  // ============================================================
  2: [
    {
      stageId: 1,
      stageTitle: 'Tahap 1: Sapaan Hangat',
      stageSubtitle: 'Halo, Selamat Pagi, dan Selamat Malam',
      letterRange: 'Sapaan',
      xpReward: 20,
      gemReward: 15,
      questions: [
        {
          id: 'L2_S1_Q1',
          type: 'peragakan',
          targetLetter: 'Halo',
          targetPose: 'HALO',
          prompt: 'Peragakan isyarat "Halo / Hai" ke arah kamera!',
          hint: 'Buka telapak tangan tegak menghadap kamera lalu lambaikan tangan ke kiri dan kanan.',
          signImg: '/assets/signs/level2-halo.png',
          correctAnswer: 'Halo',
          explanation: 'Luar biasa! Telapak tangan terbuka melambai menghadap depan adalah isyarat sapaan "Halo / Hai" dalam BISINDO.',
        },
        {
          id: 'L2_S1_Q2',
          type: 'pilih_isyarat',
          targetLetter: 'Selamat Pagi',
          prompt: 'Manakah isyarat untuk mengucapkan "Selamat Pagi"?',
          hint: 'Kedua tangan terbuka ke atas menyambut terbitnya mentari fajar.',
          options: [
            { letter: 'Selamat Pagi', signImg: '/assets/signs/level2-selamat-pagi.png' },
            { letter: 'Selamat Malam', signImg: '/assets/signs/level2-selamat-malam.png' },
            { letter: 'Minta Maaf', signImg: '/assets/signs/level2-minta-maaf.png' },
            { letter: 'Sampai Jumpa', signImg: '/assets/signs/level2-sampai-jumpa.png' },
          ],
          correctIndex: 0,
          explanation: 'Tepat sekali! Isyarat Selamat Pagi ditandai dengan kedua tangan terbuka ke atas menyambut matahari.',
        },
        {
          id: 'L2_S1_Q3',
          type: 'tebak_huruf',
          targetLetter: 'Selamat Malam',
          prompt: 'Isyarat satu tangan melengkung turun melambangkan terbenamnya matahari bermakna...',
          hint: 'Sapaan saat malam tiba.',
          signImg: '/assets/signs/level2-selamat-malam.png',
          options: ['Selamat Malam', 'Selamat Pagi', 'Minta Maaf', 'Terima Kasih'],
          correctIndex: 0,
          explanation: 'Hebat! Tangan yang melengkung turun ke telapak lain melambangkan "Selamat Malam".',
        },
      ],
    },
    {
      stageId: 2,
      stageTitle: 'Tahap 2: Menunjuk Diri & Teman',
      stageSubtitle: 'Nama Saya dan Sapaan Akrab',
      letterRange: 'Pronomina',
      xpReward: 20,
      gemReward: 15,
      questions: [
        {
          id: 'L2_S2_Q1',
          type: 'peragakan',
          targetLetter: 'Nama Saya',
          targetPose: 'NAMA_SAYA',
          prompt: 'Peragakan isyarat "Nama Saya" di depan kamera!',
          hint: 'Kedua jari telunjuk menunjuk ke arah dada diri sendiri memperkenalkan nama.',
          signImg: '/assets/signs/level2-nama-saya.png',
          correctAnswer: 'Nama Saya',
          explanation: 'Tepat! Menunjuk diri sendiri dengan kedua telunjuk adalah perkenalan "Nama Saya".',
        },
        {
          id: 'L2_S2_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Sampai Jumpa',
          prompt: 'Gerakan kedua pergelangan tangan saling mengait dan berputar mengisyaratkan...',
          hint: 'Ucapan saat hendak berpisah.',
          signImg: '/assets/signs/level2-sampai-jumpa.png',
          options: ['Sampai Jumpa Lagi', 'Minta Maaf', 'Terima Kasih', 'Sama-sama'],
          correctIndex: 0,
          explanation: 'Benar! Mengaitkan kedua pergelangan tangan bermakna "Sampai Jumpa Lagi".',
        },
        {
          id: 'L2_S2_Q3',
          type: 'pilih_isyarat',
          targetLetter: 'Halo',
          prompt: 'Manakah isyarat resmi untuk menyapa "Halo / Hai"?',
          hint: 'Telapak tangan terbuka tegak melambai ke kiri dan kanan.',
          options: [
            { letter: 'Halo', signImg: '/assets/signs/level2-halo.png' },
            { letter: 'Terima Kasih', signImg: '/assets/signs/level2-terima-kasih.png' },
            { letter: 'Sama-sama', signImg: '/assets/signs/level2-sama-sama.png' },
            { letter: 'Minta Maaf', signImg: '/assets/signs/level2-minta-maaf.png' },
          ],
          correctIndex: 0,
          explanation: 'Luar biasa! Telapak tangan terbuka melambai adalah isyarat sapaan "Halo / Hai".',
        },
      ],
    },
    {
      stageId: 3,
      stageTitle: 'Tahap 3: Terima Kasih & Etika',
      stageSubtitle: 'Ungkapan Terima Kasih, Sama-sama & Maaf',
      letterRange: 'Etika',
      xpReward: 25,
      gemReward: 20,
      questions: [
        {
          id: 'L2_S3_Q1',
          type: 'peragakan',
          targetLetter: 'Terima Kasih',
          targetPose: 'TERIMA_KASIH',
          prompt: 'Peragakan isyarat "Terima Kasih" di depan kamera!',
          hint: 'Sentuhkan ujung jari-jari tangan di depan bibir/dagu lalu gerakkan turun ke depan.',
          signImg: '/assets/signs/level2-terima-kasih.png',
          correctAnswer: 'Terima Kasih',
          explanation: 'Bagus sekali! Gerakan ujung jari dari bibir ke arah depan adalah isyarat terima kasih.',
        },
        {
          id: 'L2_S3_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Minta Maaf',
          prompt: 'Gerakan satu tangan terbuka mendekat ke tangan berpose lingkaran melambangkan ungkapan...',
          hint: 'Penyesalan dan permohonan maaf.',
          signImg: '/assets/signs/level2-minta-maaf.png',
          options: ['Minta Maaf', 'Terima Kasih', 'Selamat Pagi', 'Halo'],
          correctIndex: 0,
          explanation: 'Tepat! Isyarat tangan terbuka menghampiri tangan berpose lingkaran adalah ungkapan "Minta Maaf" yang santun.',
        },
        {
          id: 'L2_S3_Q3',
          type: 'pilih_isyarat',
          targetLetter: 'Sama-sama',
          prompt: 'Setelah menerima ucapan terima kasih, balasan isyarat "Sama-sama" menggunakan bentuk...',
          hint: 'Pose tanduk (ibu jari dan kelingking terbuka) yang digerakkan ke samping kanan.',
          options: [
            { letter: 'Sama-sama', signImg: '/assets/signs/level2-sama-sama.png' },
            { letter: 'Minta Maaf', signImg: '/assets/signs/level2-minta-maaf.png' },
            { letter: 'Selamat Malam', signImg: '/assets/signs/level2-selamat-malam.png' },
            { letter: 'Nama Saya', signImg: '/assets/signs/level2-nama-saya.png' },
          ],
          correctIndex: 0,
          explanation: 'Tepat! Pose tanduk ibu jari dan kelingking yang digerakkan ke kanan melambangkan "Sama-sama".',
        },
      ],
    },
  ],

  // ============================================================
  // LEVEL 3: ANGKA, WAKTU & ANGGOTA KELUARGA
  // ============================================================
  3: [
    {
      stageId: 1,
      stageTitle: 'Tahap 1: Berhitung Angka 1 – 5',
      stageSubtitle: 'Fondasi bilangan jari BISINDO',
      letterRange: 'Angka 1–5',
      xpReward: 25,
      gemReward: 15,
      questions: [
        {
          id: 'L3_S1_Q1',
          type: 'peragakan',
          targetLetter: 'Angka 1',
          targetPose: 'ANGKA_1',
          prompt: 'Peragakan isyarat angka "1" di depan kamera!',
          hint: 'Angkat satu jari telunjuk tegak ke atas, jari lain mengepal.',
          signImg: '/assets/signs/D.png',
          correctAnswer: '1',
          explanation: 'Telunjuk tegak ke atas melambangkan angka 1.',
        },
        {
          id: 'L3_S1_Q2',
          type: 'peragakan',
          targetLetter: 'Angka 2',
          targetPose: 'ANGKA_2',
          prompt: 'Peragakan isyarat angka "2" (huruf V) di depan kamera!',
          hint: 'Bentuk huruf V dengan jari telunjuk dan jari tengah tegak ke atas.',
          signImg: '/assets/signs/V.png',
          correctAnswer: '2',
          explanation: 'Dua jari tegak (V) melambangkan angka 2.',
        },
        {
          id: 'L3_S1_Q3',
          type: 'tebak_huruf',
          targetLetter: 'Angka 5',
          prompt: 'Membuka kelima jari pada satu tangan menghadap ke depan menunjukkan angka...',
          hint: 'Seluruh jari satu tangan terbuka.',
          signImg: '/assets/signs/B.png',
          options: ['5', '10', '0', '3'],
          correctIndex: 0,
          explanation: 'Kelima jari terbuka penuh melambangkan angka 5.',
        },
      ],
    },
    {
      stageId: 2,
      stageTitle: 'Tahap 2: Anggota Keluarga',
      stageSubtitle: 'Ayah, Ibu, dan Saudara',
      letterRange: 'Keluarga',
      xpReward: 25,
      gemReward: 15,
      questions: [
        {
          id: 'L3_S2_Q1',
          type: 'pilih_isyarat',
          targetLetter: 'Ayah',
          prompt: 'Manakah isyarat yang biasa digunakan untuk "Ayah" dalam BISINDO?',
          hint: 'Sentuhan di area dagu/pipi melambangkan kumis atau garis pria.',
          options: [
            { letter: 'Ayah', signImg: '/assets/signs/A.png' },
            { letter: 'Anak', signImg: '/assets/signs/K.png' },
            { letter: 'Paman', signImg: '/assets/signs/P.png' },
            { letter: 'Nenek', signImg: '/assets/signs/N.png' },
          ],
          correctIndex: 0,
          explanation: 'Isyarat Ayah umumnya diletakkan di area dagu atau atas bibir.',
        },
        {
          id: 'L3_S2_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Ibu',
          prompt: 'Isyarat menyentuh pipi lembut atau anting di telinga melambangkan...',
          hint: 'Sosok perempuan yang melahirkan kita.',
          signImg: '/assets/signs/I.png',
          options: ['Ibu / Mama', 'Kakek', 'Teman', 'Guru'],
          correctIndex: 0,
          explanation: 'Sentuhan lembut di pipi dekat telinga merupakan isyarat "Ibu".',
        },
      ],
    },
    {
      stageId: 3,
      stageTitle: 'Tahap 3: Kasih Sayang Keluarga',
      stageSubtitle: 'Cinta, Rumah, dan Kebersamaan',
      letterRange: 'Rumah & Cinta',
      xpReward: 30,
      gemReward: 20,
      questions: [
        {
          id: 'L3_S3_Q1',
          type: 'peragakan',
          targetLetter: 'Sayang',
          targetPose: 'SAYANG',
          prompt: 'Peragakan isyarat "Sayang / Cinta" di depan kamera!',
          hint: 'Silangkan kedua tangan di depan dada sambil tersenyum hangat.',
          signImg: '/assets/signs/X.png',
          correctAnswer: 'Sayang',
          explanation: 'Menyilangkan tangan di dada melambangkan rasa cinta dan kehangatan.',
        },
        {
          id: 'L3_S3_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Rumah',
          prompt: 'Kedua telapak tangan dipertemukan ujung-ujungnya membentuk atap melambangkan...',
          hint: 'Tempat tinggal keluarga.',
          signImg: '/assets/signs/A.png',
          options: ['Rumah', 'Sekolah', 'Toko', 'Jalan'],
          correctIndex: 0,
          explanation: 'Bentuk atap segitiga melambangkan "Rumah" tempat berteduh.',
        },
      ],
    },
  ],

  // ============================================================
  // LEVEL 4: EKSPRESI WAJAH & PERASAAN HARIAN
  // ============================================================
  4: [
    {
      stageId: 1,
      stageTitle: 'Tahap 1: Emosi Positif',
      stageSubtitle: 'Senang, Bangga, dan Semangat',
      letterRange: 'Emosi Positif',
      xpReward: 30,
      gemReward: 20,
      questions: [
        {
          id: 'L4_S1_Q1',
          type: 'peragakan',
          targetLetter: 'Senang',
          targetPose: 'SENANG',
          prompt: 'Tunjukkan isyarat "Senang" dengan wajah tersenyum!',
          hint: 'Buka kedua tangan di depan dada dan sapukan ke atas sambil tersenyum lebar.',
          signImg: '/assets/signs/S.png',
          correctAnswer: 'Senang',
          explanation: 'Gerakan tangan menyapu ke atas dengan senyum ceria adalah isyarat "Senang".',
        },
        {
          id: 'L4_S1_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Ekspresi Non-Manual',
          prompt: 'Mengapa ekspresi wajah (non-manual) mutlak diperlukan dalam BISINDO?',
          hint: 'Ekspresi menentukan arti kata dan intonasi.',
          signImg: '/assets/signs/E.png',
          options: [
            'Menentukan nada bicara & makna kalimat',
            'Hanya hiasan tambahan',
            'Tidak berpengaruh apa-apa',
            'Supaya terlihat lelah',
          ],
          correctIndex: 0,
          explanation: 'Mimik wajah bertindak seperti intonasi suara dalam bahasa lisan.',
        },
      ],
    },
    {
      stageId: 2,
      stageTitle: 'Tahap 2: Menenangkan Perasaan',
      stageSubtitle: 'Sedih, Marah, dan Sabar',
      letterRange: 'Empati',
      xpReward: 30,
      gemReward: 20,
      questions: [
        {
          id: 'L4_S2_Q1',
          type: 'pilih_isyarat',
          targetLetter: 'Sabar',
          prompt: 'Manakah isyarat yang menunjukkan rasa "Sabar / Tenang"?',
          hint: 'Telapak tangan mengusap dada perlahan ke arah bawah.',
          options: [
            { letter: 'Sabar', signImg: '/assets/signs/S.png' },
            { letter: 'Cepat', signImg: '/assets/signs/C.png' },
            { letter: 'Teriak', signImg: '/assets/signs/T.png' },
            { letter: 'Takut', signImg: '/assets/signs/D.png' },
          ],
          correctIndex: 0,
          explanation: 'Mengusap dada ke bawah melambangkan menenangkan hati atau "Sabar".',
        },
      ],
    },
    {
      stageId: 3,
      stageTitle: 'Tahap 3: Permintaan Maaf & Simpati',
      stageSubtitle: 'Maaf, Permisi, dan Tolong',
      letterRange: 'Sopan Santun',
      xpReward: 35,
      gemReward: 25,
      questions: [
        {
          id: 'L4_S3_Q1',
          type: 'peragakan',
          targetLetter: 'Maaf',
          targetPose: 'MAAF',
          prompt: 'Peragakan isyarat "Maaf" dengan mimik tulus!',
          hint: 'Tangkupkan kedua tangan di depan dada atau usap melingkar di dada.',
          signImg: '/assets/signs/M.png',
          correctAnswer: 'Maaf',
          explanation: 'Kedua tangan menangkup di depan dada adalah isyarat tulus "Maaf / Permisi".',
        },
      ],
    },
  ],

  // ============================================================
  // LEVEL 5: AKTIVITAS SEKOLAH, KAMPUS & PEKERJAAN
  // ============================================================
  5: [
    {
      stageId: 1,
      stageTitle: 'Tahap 1: Belajar & Membaca',
      stageSubtitle: 'Buku, Membaca, dan Menulis',
      letterRange: 'Belajar',
      xpReward: 35,
      gemReward: 25,
      questions: [
        {
          id: 'L5_S1_Q1',
          type: 'peragakan',
          targetLetter: 'Buku',
          targetPose: 'BUKU',
          prompt: 'Peragakan isyarat "Membuka Buku" di depan kamera!',
          hint: 'Satukan kedua telapak tangan lalu buka perlahan seperti membuka buku.',
          signImg: '/assets/signs/B.png',
          correctAnswer: 'Buku',
          explanation: 'Membuka kedua telapak tangan melambangkan halaman buku yang terbuka.',
        },
        {
          id: 'L5_S1_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Menulis',
          prompt: 'Gerakan memegang pena imajiner lalu menggoreskannya di atas telapak tangan kiri artinya...',
          hint: 'Kegiatan mencatat.',
          signImg: '/assets/signs/M.png',
          options: ['Menulis / Catat', 'Memasak', 'Menyanyi', 'Melipat'],
          correctIndex: 0,
          explanation: 'Ujung jari kanan menggores telapak kiri melambangkan menulis di buku.',
        },
      ],
    },
    {
      stageId: 2,
      stageTitle: 'Tahap 2: Sekolah & Kampus',
      stageSubtitle: 'Tempat Belajar & Guru',
      letterRange: 'Pendidikan',
      xpReward: 35,
      gemReward: 25,
      questions: [
        {
          id: 'L5_S2_Q1',
          type: 'pilih_isyarat',
          targetLetter: 'Sekolah',
          prompt: 'Manakah isyarat yang menunjukkan "Sekolah / Kampus"?',
          hint: 'Mengetukkan kedua telapak tangan secara berhadapan.',
          options: [
            { letter: 'Sekolah', signImg: '/assets/signs/S.png' },
            { letter: 'Pasar', signImg: '/assets/signs/P.png' },
            { letter: 'Stasiun', signImg: '/assets/signs/T.png' },
            { letter: 'Bioskop', signImg: '/assets/signs/B.png' },
          ],
          correctIndex: 0,
          explanation: 'Tepukan dua telapak tangan berhadapan melambangkan lonceng sekolah / institusi.',
        },
      ],
    },
    {
      stageId: 3,
      stageTitle: 'Tahap 3: Diskusi & Kolaborasi',
      stageSubtitle: 'Mengerti, Tanya, dan Bekerja Bersama',
      letterRange: 'Kolaborasi',
      xpReward: 40,
      gemReward: 30,
      questions: [
        {
          id: 'L5_S3_Q1',
          type: 'peragakan',
          targetLetter: 'Mengerti',
          targetPose: 'PAHAM',
          prompt: 'Peragakan isyarat "Mengerti / Paham" di samping kepala!',
          hint: 'Buka jari telunjuk di dekat pelipis sambil mengangguk mantap.',
          signImg: '/assets/signs/I.png',
          correctAnswer: 'Mengerti',
          explanation: 'Jentikan di pelipis menandakan ide atau pemahaman yang terang di pikiran.',
        },
      ],
    },
  ],

  // ============================================================
  // LEVEL 6: PERCAKAPAN LANCAR & BUDAYA TULI INDONESIA
  // ============================================================
  6: [
    {
      stageId: 1,
      stageTitle: 'Tahap 1: I Love You (ILY) BISINDO',
      stageSubtitle: 'Simbol Universal Kasih Sayang Tuli',
      letterRange: 'Simbol ILY',
      xpReward: 40,
      gemReward: 30,
      questions: [
        {
          id: 'L6_S1_Q1',
          type: 'peragakan',
          targetLetter: 'ILY',
          targetPose: 'ILY',
          prompt: 'Peragakan isyarat "I Love You" (Jari Jempol, Telunjuk & Kelingking)!',
          hint: 'Buka ibu jari, telunjuk, dan kelingking secara bersamaan menghadap ke depan.',
          signImg: '/assets/signs/Y.png',
          correctAnswer: 'ILY',
          explanation: 'Kombinasi jari I, L, dan Y membentuk simbol cinta universal dalam komunitas Tuli.',
        },
        {
          id: 'L6_S1_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Tepuk Tangan Tuli',
          prompt: 'Cara memberikan tepuk tangan atau apresiasi dalam budaya Tuli adalah...',
          hint: 'Kedua tangan diangkat setinggi bahu.',
          signImg: '/assets/signs/W.png',
          options: [
            'Mengangkat kedua tangan & memutar telapak tangan ceria',
            'Memukul meja sekeras mungkin',
            'Berteriak histeris',
            'Menutup kedua telinga',
          ],
          correctIndex: 0,
          explanation: 'Tepuk tangan visual dilakukan dengan mengangkat dan menggoyangkan kedua telapak tangan.',
        },
      ],
    },
    {
      stageId: 2,
      stageTitle: 'Tahap 2: Berbagi Cerita & Bahasa Isyarat',
      stageSubtitle: 'Ekspresi Cerita Berkelanjutan',
      letterRange: 'Bercerita',
      xpReward: 45,
      gemReward: 35,
      questions: [
        {
          id: 'L6_S2_Q1',
          type: 'pilih_isyarat',
          targetLetter: 'Bahasa Isyarat',
          prompt: 'Manakah gerakan yang menunjukkan "Bahasa Isyarat Indonesia"?',
          hint: 'Kedua tangan berputar bergantian di depan dada seperti menari.',
          options: [
            { letter: 'Bahasa Isyarat', signImg: '/assets/signs/B.png' },
            { letter: 'Bicara Lisan', signImg: '/assets/signs/L.png' },
            { letter: 'Mendengar', signImg: '/assets/signs/D.png' },
            { letter: 'Menulis', signImg: '/assets/signs/M.png' },
          ],
          correctIndex: 0,
          explanation: 'Gerakan kedua tangan berputar luwes melambangkan aliran bahasa isyarat yang indah.',
        },
      ],
    },
    {
      stageId: 3,
      stageTitle: 'Tahap 3: Master BISINDO Nusantara',
      stageSubtitle: 'Kelulusan & Pengakuan Kecakapan Isyarat',
      letterRange: 'Wisuda Isyarat',
      xpReward: 50,
      gemReward: 40,
      questions: [
        {
          id: 'L6_S3_Q1',
          type: 'peragakan',
          targetLetter: 'Tepuk Tangan',
          targetPose: 'TEPUK_TANGAN',
          prompt: 'Peragakan isyarat "Tepuk Tangan Tuli" selebrasi kelulusanmu!',
          hint: 'Angkat kedua tangan setinggi bahu lalu putar telapak tangan dengan ceria.',
          signImg: '/assets/signs/B.png',
          correctAnswer: 'Tepuk Tangan',
          explanation: 'Hebat sekali! Kamu telah resmi menyelesaikan seluruh perjalanan pulau BISINDO!',
        },
      ],
    },
  ],
}

export function getLevelStages(levelId) {
  const lvl = parseInt(levelId, 10)
  return ALL_LEVEL_STAGES[lvl] || ALL_LEVEL_STAGES[1]
}
