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
      stageSubtitle: 'Halo, Selamat Pagi, dan Apa Kabar',
      letterRange: 'Sapaan',
      xpReward: 20,
      gemReward: 15,
      questions: [
        {
          id: 'L2_S1_Q1',
          type: 'peragakan',
          targetLetter: 'Halo',
          targetPose: 'HALO',
          prompt: 'Peragakan isyarat "Halo" ke arah kamera!',
          hint: 'Angkat satu telapak tangan terbuka di samping kepala dan lambaikan lembut.',
          signImg: '/assets/signs/B.png',
          correctAnswer: 'Halo',
          explanation: 'Lambaian telapak tangan terbuka di samping kepala adalah sapaan "Halo" ramah dalam BISINDO.',
        },
        {
          id: 'L2_S1_Q2',
          type: 'pilih_isyarat',
          targetLetter: 'Selamat Pagi',
          prompt: 'Manakah isyarat untuk mengawali sapaan hari baru?',
          hint: 'Gerakan tangan menyambut fajar dengan telapak terbuka ke atas.',
          options: [
            { letter: 'Halo / Pagi', signImg: '/assets/signs/A.png' },
            { letter: 'Tidur', signImg: '/assets/signs/E.png' },
            { letter: 'Makan', signImg: '/assets/signs/O.png' },
            { letter: 'Pergi', signImg: '/assets/signs/Z.png' },
          ],
          correctIndex: 0,
          explanation: 'Tepat sekali! Isyarat menyapa dilakukan dengan tangan terbuka menyambut lawan bicara.',
        },
        {
          id: 'L2_S1_Q3',
          type: 'tebak_huruf',
          targetLetter: 'Apa Kabar',
          prompt: 'Gerakan membuka kedua tangan di depan dada dengan ekspresi tersenyum bertanya artinya...',
          hint: 'Menanyakan kondisi atau kabar teman.',
          signImg: '/assets/signs/C.png',
          options: ['Apa Kabar?', 'Siapa Kamu?', 'Sudah Makan?', 'Mau ke Mana?'],
          correctIndex: 0,
          explanation: 'Hebat! Kedua tangan terbuka disertai mimik ramah menanyakan "Apa Kabar?".',
        },
      ],
    },
    {
      stageId: 2,
      stageTitle: 'Tahap 2: Menunjuk Diri & Teman',
      stageSubtitle: 'Saya, Kamu, dan Panggilan',
      letterRange: 'Pronomina',
      xpReward: 20,
      gemReward: 15,
      questions: [
        {
          id: 'L2_S2_Q1',
          type: 'peragakan',
          targetLetter: 'Saya',
          targetPose: 'SAYA',
          prompt: 'Peragakan isyarat "Saya / Aku" di depan kamera!',
          hint: 'Arahkan jari telunjuk satu tangan menunjuk lembut ke bagian tengah dadamu.',
          signImg: '/assets/signs/D.png',
          correctAnswer: 'Saya',
          explanation: 'Tepat! Menunjuk ke bagian tengah dada sendiri adalah kata ganti "Saya / Aku".',
        },
        {
          id: 'L2_S2_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Kamu',
          prompt: 'Mengarahkan telunjuk atau telapak tangan terbuka lurus ke arah lawan bicara berarti...',
          hint: 'Kata ganti orang kedua.',
          signImg: '/assets/signs/I.png',
          options: ['Kamu / Anda', 'Mereka', 'Di sana', 'Bukan'],
          correctIndex: 0,
          explanation: 'Benar! Menunjuk langsung ke arah lawan bicara bermakna "Kamu / Anda".',
        },
        {
          id: 'L2_S2_Q3',
          type: 'pilih_isyarat',
          targetLetter: 'Nama',
          prompt: 'Manakah isyarat untuk menanyakan atau menyebut "Nama"?',
          hint: 'Dua jari telunjuk dan tengah saling mengetuk menyilang.',
          options: [
            { letter: 'Nama', signImg: '/assets/signs/N.png' },
            { letter: 'Alamat', signImg: '/assets/signs/A.png' },
            { letter: 'Umur', signImg: '/assets/signs/U.png' },
            { letter: 'Keluarga', signImg: '/assets/signs/K.png' },
          ],
          correctIndex: 0,
          explanation: 'Luar biasa! Dua jari saling menyilang melambangkan kartu identitas nama.',
        },
      ],
    },
    {
      stageId: 3,
      stageTitle: 'Tahap 3: Terima Kasih & Etika',
      stageSubtitle: 'Ungkapan Terima Kasih & Sopan Santun Tuli',
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
          hint: 'Sentuhkan ujung jari tangan kanan di depan bibir lalu gerakkan maju ke depan.',
          signImg: '/assets/signs/B.png',
          correctAnswer: 'Terima Kasih',
          explanation: 'Bagus sekali! Gerakan ujung jari dari bibir ke arah depan adalah isyarat terima kasih.',
        },
        {
          id: 'L2_S3_Q2',
          type: 'tebak_huruf',
          targetLetter: 'Kontak Mata',
          prompt: 'Dalam budaya Tuli, saat berkomunikasi kita harus senantiasa menjaga...',
          hint: 'Mata dan ekspresi wajah.',
          signImg: '/assets/signs/O.png',
          options: ['Kontak Mata & Wajah', 'Melihat ke Bawah', 'Menutup Telinga', 'Mematikan Lampu'],
          correctIndex: 0,
          explanation: 'Kontak mata adalah tanda hormat dan penerimaan utama dalam budaya Tuli.',
        },
        {
          id: 'L2_S3_Q3',
          type: 'pilih_isyarat',
          targetLetter: 'Sama-sama',
          prompt: 'Setelah menerima ucapan terima kasih, balasan isyarat "Sama-sama" menggunakan bentuk...',
          hint: 'Kedua tangan terbuka ke depan secara ramah.',
          options: [
            { letter: 'Sama-sama', signImg: '/assets/signs/S.png' },
            { letter: 'Tidak Mau', signImg: '/assets/signs/T.png' },
            { letter: 'Pergi', signImg: '/assets/signs/P.png' },
            { letter: 'Berhenti', signImg: '/assets/signs/B.png' },
          ],
          correctIndex: 0,
          explanation: 'Tepat! Respon terbuka melambangkan ketulusan "Sama-sama".',
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
