import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { progressService } from '../services/storage'

// ============================================================
// DATA 6 PULAU PEMBELAJARAN BISINDO (TERMASUK 2 PULAU TERKUNCI DI ATAS)
// Koordinat dikalibrasi presisi pada kanvas 6 pulau (1445 x 2020)
// ============================================================
const ISLAND_UNITS = [
  {
    id: 1,
    section: 'BAGIAN 1, UNIT 1',
    unitLabel: 'Unit 1',
    islandName: 'Pulau Abjad Dasar',
    title: 'Mengenal Abjad Jari BISINDO (A–Z)',
    subtitle: 'Fondasi ejaan jari dua tangan & isyarat huruf dasar',
    xpReward: 25,
    gemReward: 15,
    nodePos: { x: 26.0, y: 83.2 },
    mascotPos: { x: 15.8, y: 80.5 },
    guide: [
      {
        sign: '👐',
        word: 'Abjad A',
        desc: 'Kedua telapak tangan membentuk segitiga rapat di depan dada (sesuai papan tanda Pulau 1).',
      },
      {
        sign: '✋',
        word: 'Halo',
        desc: 'Angkat telapak tangan kanan terbuka di samping kepala lalu goyangkan lembut.',
      },
      {
        sign: '🤲',
        word: 'Terima Kasih',
        desc: 'Sentuhkan ujung jari di depan bibir lalu gerakkan maju ke arah lawan bicara.',
      },
    ],
    questions: [
      {
        prompt: 'Bagaimana bentuk isyarat huruf "A" pada papan petunjuk Pulau 1 dalam BISINDO?',
        emoji: '👐',
        options: [
          'Kedua tangan dipertemukan membentuk puncak segitiga seperti huruf A',
          'Menutup mata dengan satu tangan',
          'Melipat kedua tangan di belakang punggung',
          'Mengacungkan jari kelingking saja',
        ],
        correctIndex: 0,
        explanation:
          'Tepat sekali! Dalam BISINDO, abjad jari A dibentuk dengan mempertemukan kedua tangan menyerupai bentuk huruf A.',
      },
      {
        prompt: 'Gerakan mengangkat telapak tangan terbuka lalu melambaikannya ke kanan-kiri berarti...',
        emoji: '👋',
        options: ['Halo / Menyapa', 'Sedang lapar', 'Meminta maaf', 'Selamat tidur'],
        correctIndex: 0,
        explanation: 'Benar! Lambaian tangan terbuka adalah sapaan "Halo" universal dalam BISINDO.',
      },
      {
        prompt: 'Isyarat menyentuh bibir dengan ujung jari lalu menggerakkannya maju memiliki arti...',
        emoji: '🤲',
        options: ['Terima Kasih', 'Sampai Jumpa', 'Perkenalkan', 'Siapa Namamu'],
        correctIndex: 0,
        explanation: 'Hebat! Gerakan dari bibir ke arah depan melambangkan ungkapan "Terima Kasih".',
      },
    ],
  },
  {
    id: 2,
    section: 'BAGIAN 1, UNIT 2',
    unitLabel: 'Unit 2',
    islandName: 'Pulau Lembah Sungai',
    title: 'Salam, Sapaan & Perkenalan Diri',
    subtitle: 'Menyapa teman baru dan memperkenalkan nama dengan sopan',
    xpReward: 30,
    gemReward: 20,
    nodePos: { x: 66.5, y: 70.5 },
    mascotPos: { x: 83.5, y: 68.0 },
    guide: [
      {
        sign: '👉',
        word: 'Saya / Aku',
        desc: 'Arahkan jari telunjuk menunjuk lembut ke bagian tengah dada sendiri.',
      },
      {
        sign: '🫵',
        word: 'Kamu / Anda',
        desc: 'Arahkan telunjuk atau telapak tangan terbuka ke arah lawan bicara.',
      },
      {
        sign: '🏷️',
        word: 'Nama',
        desc: 'Tempelkan jari telunjuk dan jari tengah kedua tangan menyilang seperti tanda pengenal.',
      },
    ],
    questions: [
      {
        prompt: 'Untuk menunjuk diri sendiri ("Saya") dalam BISINDO, gerakan yang tepat adalah...',
        emoji: '👉',
        options: [
          'Menunjuk ke arah dada sendiri dengan jari telunjuk',
          'Menunjuk ke atas langit',
          'Menepuk bahu teman',
          'Menggelengkan kepala',
        ],
        correctIndex: 0,
        explanation: 'Betul! Menunjuk dada sendiri secara jelas berarti "Saya" atau "Aku".',
      },
      {
        prompt: 'Saat baru berkenalan dengan teman Tuli, hal pertama yang sopan dilakukan adalah...',
        emoji: '🤝',
        options: [
          'Melakukan kontak mata, tersenyum, dan mengeja nama panggilan dengan jelas',
          'Berbicara sambil membelakangi lawan bicara',
          'Menutup mulut dengan tangan',
          'Memalingkan wajah ke arah lain',
        ],
        correctIndex: 0,
        explanation:
          'Sangat tepat! Kontak mata dan visibilitas wajah/tangan adalah kunci utama komunikasi BISINDO.',
      },
    ],
  },
  {
    id: 3,
    section: 'BAGIAN 1, UNIT 3',
    unitLabel: 'Unit 3',
    islandName: 'Pulau Pohon Rindang',
    title: 'Angka, Waktu & Anggota Keluarga',
    subtitle: 'Menghitung angka dasar serta mengenal isyarat keluarga',
    xpReward: 35,
    gemReward: 25,
    nodePos: { x: 31.0, y: 56.2 },
    mascotPos: { x: 20.0, y: 53.5 },
    guide: [
      {
        sign: '☝️',
        word: 'Angka 1 – 5',
        desc: 'Gunakan jari satu tangan mulai dari telunjuk (1) hingga kelima jari terbuka (5).',
      },
      {
        sign: '👨‍👩‍👧',
        word: 'Keluarga',
        desc: 'Kedua tangan membentuk lingkaran kebersamaan di depan dada.',
      },
      {
        sign: '❤️',
        word: 'Sayang / Cinta',
        desc: 'Silangkan kedua telapak tangan di depan dada sambil tersenyum hangat.',
      },
    ],
    questions: [
      {
        prompt: 'Bagaimana cara mengisyaratkan angka "5" dalam bahasa isyarat dasar?',
        emoji: '🖐️',
        options: [
          'Membuka kelima jari pada satu tangan menghadap ke depan',
          'Mengepalkan seluruh jari tangan',
          'Menurunkan kedua tangan ke bawah',
          'Hanya mengangkat ibu jari',
        ],
        correctIndex: 0,
        explanation: 'Tepat! Kelima jari terbuka pada satu tangan melambangkan angka 5.',
      },
      {
        prompt: 'Gerakan menyilangkan kedua telapak tangan di depan dada melambangkan...',
        emoji: '❤️',
        options: ['Sayang / Cinta', 'Sedang marah', 'Berlari cepat', 'Menanyakan jam'],
        correctIndex: 0,
        explanation: 'Luar biasa! Menyilangkan kedua tangan di dada berarti "Sayang" atau "Cinta".',
      },
    ],
  },
  {
    id: 4,
    section: 'BAGIAN 1, UNIT 4',
    unitLabel: 'Unit 4',
    islandName: 'Pulau Kincir Angin',
    title: 'Ekspresi Wajah & Perasaan Harian',
    subtitle: 'Memadukan mimik wajah (non-manual) dengan gerakan tangan',
    xpReward: 40,
    gemReward: 30,
    nodePos: { x: 73.5, y: 43.5 },
    mascotPos: { x: 61.5, y: 41.2 },
    guide: [
      {
        sign: '😊',
        word: 'Senang / Bahagia',
        desc: 'Kedua tangan menyapu dada ke arah atas disertai ekspresi wajah ceria.',
      },
      {
        sign: '😢',
        word: 'Sedih',
        desc: 'Jari-jari turun di depan wajah diikuti mimik wajah murung.',
      },
      {
        sign: '🙏',
        word: 'Maaf / Permisi',
        desc: 'Tangkupkan kedua tangan di depan dada atau usap dada melingkar.',
      },
    ],
    questions: [
      {
        prompt: 'Mengapa ekspresi wajah sangat penting saat berkomunikasi dengan BISINDO?',
        emoji: '😊',
        options: [
          'Karena ekspresi wajah adalah bagian tata bahasa & penentu makna kalimat',
          'Hanya sebagai hiasan saja',
          'Agar terlihat lucu di kamera',
          'Tidak memiliki fungsi apa pun',
        ],
        correctIndex: 0,
        explanation:
          'Sangat tepat! Dalam BISINDO, mimik wajah (komponen non-manual) menentukan intonasi, kalimat tanya, dan emosi.',
      },
    ],
  },
  {
    id: 5,
    section: 'BAGIAN 2, UNIT 5',
    unitLabel: 'Unit 5',
    islandName: 'Pulau Kristal Sakura',
    title: 'Aktivitas Sekolah, Kampus & Pekerjaan',
    subtitle: 'Kosakata lingkungan pendidikan, diskusi, dan kolaborasi inklusif',
    xpReward: 45,
    gemReward: 35,
    nodePos: { x: 31.5, y: 21.8 },
    mascotPos: { x: 20.5, y: 19.5 },
    guide: [
      {
        sign: '📚',
        word: 'Belajar / Membaca',
        desc: 'Buka kedua telapak tangan seperti membuka halaman buku di depan dada.',
      },
      {
        sign: '🏫',
        word: 'Sekolah / Kampus',
        desc: 'Ketukkan kedua telapak tangan dua kali secara berhadapan.',
      },
      {
        sign: '💡',
        word: 'Mengerti / Paham',
        desc: 'Jentikkan atau buka jari telunjuk di dekat pelipis sambil mengangguk.',
      },
    ],
    questions: [
      {
        prompt: 'Gerakan membuka kedua telapak tangan seperti membuka buku melambangkan...',
        emoji: '📖',
        options: [
          'Membaca / Buku / Belajar',
          'Berolahraga lari',
          'Memasak di dapur',
          'Mengendarai sepeda',
        ],
        correctIndex: 0,
        explanation:
          'Benar! Gerakan ikonik membuka kedua telapak tangan melambangkan aktivitas membaca atau buku.',
      },
    ],
  },
  {
    id: 6,
    section: 'BAGIAN 2, UNIT 6',
    unitLabel: 'Unit 6',
    islandName: 'Pulau Istana Bintang',
    title: 'Percakapan Lancar & Budaya Tuli Indonesia',
    subtitle: 'Etika komunikasi publik, cerita berurutan, dan ekspresi mahir',
    xpReward: 60,
    gemReward: 50,
    nodePos: { x: 73.5, y: 8.8 },
    mascotPos: { x: 61.5, y: 6.8 },
    guide: [
      {
        sign: '🤟',
        word: 'Aku Cinta Kamu (ILY)',
        desc: 'Rentangkan ibu jari, telunjuk, dan kelingking secara bersamaan.',
      },
      {
        sign: '👏',
        word: 'Tepuk Tangan Tuli',
        desc: 'Angkat kedua tangan setinggi bahu lalu putar pergelangan tangan dengan ceria.',
      },
    ],
    questions: [
      {
        prompt: 'Bagaimana cara memberikan apresiasi ("Tepuk Tangan") dalam budaya Tuli?',
        emoji: '🙌',
        options: [
          'Mengangkat kedua tangan ke atas dan menggoyangkan/memutar telapak tangan',
          'Berbisik pelan',
          'Menutup telinga',
          'Mematikan lampu ruangan',
        ],
        correctIndex: 0,
        explanation:
          'Luar biasa! Mengangkat dan menggoyangkan kedua tangan adalah tepuk tangan visual yang meriah dalam budaya Tuli.',
      },
    ],
  },
]

// Koordinat 15 batu pijakan melayang (Stepping Stones) penghubung Pulau 1 -> 6
const STEPPING_STONES = [
  // Pulau 1 -> Pulau 2
  { fromUnit: 1, toUnit: 2, x: 44.5, y: 80.2, delay: 0 },
  { fromUnit: 1, toUnit: 2, x: 50.2, y: 78.2, delay: 0.2 },
  { fromUnit: 1, toUnit: 2, x: 56.2, y: 76.0, delay: 0.4 },
  // Pulau 2 -> Pulau 3
  { fromUnit: 2, toUnit: 3, x: 61.4, y: 66.3, delay: 0.1 },
  { fromUnit: 2, toUnit: 3, x: 54.0, y: 64.3, delay: 0.3 },
  { fromUnit: 2, toUnit: 3, x: 48.5, y: 62.2, delay: 0.5 },
  { fromUnit: 2, toUnit: 3, x: 42.6, y: 59.8, delay: 0.7 },
  // Pulau 3 -> Pulau 4
  { fromUnit: 3, toUnit: 4, x: 49.2, y: 52.3, delay: 0.15 },
  { fromUnit: 3, toUnit: 4, x: 54.8, y: 50.1, delay: 0.35 },
  { fromUnit: 3, toUnit: 4, x: 60.6, y: 47.9, delay: 0.55 },
  // Pulau 4 -> Pulau 5
  { fromUnit: 4, toUnit: 5, x: 60.5, y: 36.0, delay: 0.1 },
  { fromUnit: 4, toUnit: 5, x: 54.5, y: 31.8, delay: 0.3 },
  { fromUnit: 4, toUnit: 5, x: 49.5, y: 29.5, delay: 0.5 },
  // Pulau 5 -> Pulau 6
  { fromUnit: 5, toUnit: 6, x: 49.0, y: 17.2, delay: 0.2 },
  { fromUnit: 5, toUnit: 6, x: 54.6, y: 15.1, delay: 0.4 },
  { fromUnit: 5, toUnit: 6, x: 60.5, y: 12.6, delay: 0.6 },
]

const DAYS_STREAK = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

// ============================================================
// IKON SVG SIDEBAR & STREAK (Sesuai Desain UI 4)
// ============================================================
const IconBeranda = ({ active }) => (
  <svg
    viewBox="0 0 28 28"
    className={`w-6 h-6 shrink-0 transition-colors ${
      active ? 'text-[#E02424]' : 'text-[#B3B3B3]'
    }`}
    fill="currentColor"
  >
    <path d="M13.12 3.24a1.4 1.4 0 0 1 1.76 0l10.2 8.35c.68.56.28 1.66-.6 1.66H22.5v9.25A2.25 2.25 0 0 1 20.25 24.75h-4.5v-6.25a1.75 1.75 0 0 0-3.5 0v6.25h-4.5A2.25 2.25 0 0 1 5.5 22.5v-9.25H3.52c-.88 0-1.28-1.1-.6-1.66l10.2-8.35Z" />
  </svg>
)

const IconProfil = ({ active }) => (
  <svg
    viewBox="0 0 28 28"
    className={`w-6 h-6 shrink-0 transition-colors ${
      active ? 'text-[#E02424]' : 'text-[#B3B3B3]'
    }`}
    fill="currentColor"
  >
    <circle cx="14" cy="9.5" r="4.5" />
    <path d="M6 21.5c0-3.6 3.58-6 8-6s8 2.4 8 6v1.25A1.25 1.25 0 0 1 20.75 24H7.25A1.25 1.25 0 0 1 6 22.75V21.5Z" />
  </svg>
)

const IconLainnya = ({ active }) => (
  <svg
    viewBox="0 0 28 28"
    className={`w-6 h-6 shrink-0 transition-colors ${
      active ? 'text-[#E02424]' : 'text-[#B3B3B3]'
    }`}
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 25c6.075 0 11-4.925 11-11S20.075 3 14 3 3 7.925 3 14s4.925 11 11 11Zm-4.5-9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm4.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm4.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
    />
  </svg>
)

const IconFlame = ({ className = 'w-6 h-6', color = '#E02424', innerColor = '#FFFFFF' }) => (
  <svg viewBox="0 0 28 32" className={className} fill="none">
    <path
      d="M15.4 1.6C15.1 4.9 13.1 7.6 10.6 9.8C7.8 12.2 5 15.1 5 19.6C5 25.3 9.5 30 15.2 30C20.9 30 25.2 25.3 25.2 19.4C25.2 13.7 21.3 8.8 16.5 2.1C16.1 1.5 15.5 1.1 15.4 1.6Z"
      fill={color}
    />
    <path
      d="M9.6 8.3C8.5 10.4 6.5 12.8 6.5 16.5C6.5 17.5 6.7 18.4 7 19.2C5.7 17.5 5 15.3 5.4 12.9C5.8 10.6 7.4 8.9 9.1 7.9C9.5 7.7 9.8 7.9 9.6 8.3Z"
      fill={color}
    />
    <path
      d="M15.3 15.8C14.7 17.5 13.3 18.8 12.1 20.3C11.1 21.5 10.7 23 11.2 24.6C11.8 26.5 13.5 27.6 15.4 27.6C17.7 27.6 19.5 25.7 19.5 23.2C19.5 20.4 17.5 18.1 15.8 15.8C15.6 15.5 15.4 15.5 15.3 15.8Z"
      fill={innerColor}
    />
  </svg>
)

// ============================================================
// SCENERY FULL-SCREEN DUA MODE:
// 1. LANGIT CERAH (Anime Blue Sky + Hexagonal Sun Lens Flare sesuai referensi baru)
// 2. LANGIT SENJA (Golden Peach Sunset + Terracotta Clouds sesuai LEVEL.png)
// ============================================================
const AnimatedBirdFlock = ({ className, delay = 0, duration = 18, scale = 1 }) => (
  <motion.div
    className={`pointer-events-none select-none ${className}`}
    initial={{ x: -30, y: 0 }}
    animate={{
      x: [-30, 50, -30],
      y: [0, -10, 2, -6, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    style={{ scale }}
  >
    <svg width="110" height="54" viewBox="0 0 110 54" fill="none">
      <motion.path
        d="M18 24 C28 11, 40 12, 48 24 C56 12, 68 11, 78 24 C67 18, 56 19, 48 28 C40 19, 29 18, 18 24 Z"
        fill="#FFFFFF"
        animate={{ scaleY: [1, 0.7, 1], y: [0, 2, 0] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut', delay }}
      />
      <motion.path
        d="M58 38 C65 29, 73 30, 79 38 C85 30, 93 29, 100 38 C92 34, 85 35, 79 41 C73 35, 66 34, 58 38 Z"
        fill="#FFFFFF"
        fillOpacity="0.92"
        animate={{ scaleY: [1, 0.68, 1], y: [0, -2, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.35 }}
      />
      <motion.path
        d="M8 40 C13 34, 19 34, 23 40 C27 34, 33 34, 38 40 C32 37, 27 38, 23 42 C19 38, 14 37, 8 40 Z"
        fill="#FFFFFF"
        fillOpacity="0.85"
        animate={{ scaleY: [1, 0.75, 1] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 }}
      />
    </svg>
  </motion.div>
)

const FullScreenSkyScenery = ({ skyMode }) => {
  const isBright = skyMode === 'bright'

  // Palet Awan berdasarkan Mode Langit
  // Langit Cerah: Putih bersih (#FFFFFF) + Bayangan Biru Muda (#BBE0FC) sesuai referensi gambar baru
  // Langit Senja: Peach Muda (#FED8AC) + Coral Terracotta (#F3A174) sesuai LEVEL.png
  const cloudBack = isBright ? '#C4E4FD' : '#FED8AC'
  const cloudFront = isBright ? '#FFFFFF' : '#F3A174'

  return (
    <div
      className={`fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none select-none z-0 transition-colors duration-700 ${
        isBright
          ? 'bg-gradient-to-b from-[#0A84EC] via-[#22A3F5] to-[#7AD5FF]'
          : 'bg-gradient-to-b from-[#FFE3B0] via-[#FCD496] to-[#F8BA80]'
      }`}
    >
      {/* ========================================================== */}
      {/* ELEMEN KHUSUS LANGIT CERAH (Sesuai Gambar Referensi Baru)   */}
      {/* ========================================================== */}
      {isBright && (
        <>
          {/* 1. Sinar Cahaya Diagonal (Sunbeam Ray) dari Atas ke Bawah */}
          <div
            style={{
              background:
                'linear-gradient(162deg, rgba(255,255,255,0.34) 0%, rgba(186,230,253,0.16) 55%, rgba(255,255,255,0) 100%)',
              clipPath: 'polygon(19% 0%, 25% 0%, 46% 100%, 34% 100%)',
            }}
            className="absolute inset-0"
          />

          {/* 2. Hexagonal Sun Lens Flare di Tengah Atas (Persis Gambar Referensi) */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 4, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/2 -translate-x-1/2 -top-14 w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center"
          >
            <svg viewBox="0 0 260 260" className="w-full h-full">
              {/* Segi Delapan / Hexagon Luar */}
              <polygon
                points="130,10 205,38 242,110 218,188 148,232 68,215 20,148 38,65"
                fill="#FFFFFF"
                fillOpacity="0.28"
              />
              {/* Hexagon Tengah */}
              <polygon
                points="130,36 188,58 214,114 196,172 142,204 82,190 48,140 62,80"
                fill="#FFFFFF"
                fillOpacity="0.42"
              />
              {/* Hexagon Dalam */}
              <polygon
                points="130,64 170,78 188,118 175,156 138,176 96,166 74,132 85,92"
                fill="#FFFFFF"
                fillOpacity="0.65"
              />
              {/* Inti Matahari Putih Bersinar */}
              <circle cx="130" cy="120" r="30" fill="#FFFFFF" />
            </svg>

            {/* Pantulan Hexagon Biru Muda (Lens Flare Bokéh) */}
            <div className="absolute top-[74%] left-[32%] w-16 h-16 rotate-12 bg-[#7DD3FC]/35 backdrop-blur-[1px] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]" />
            <div className="absolute top-[96%] left-[22%] w-11 h-11 rotate-45 bg-[#38BDF8]/30 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]" />
          </motion.div>

          {/* 3. Garis Contrail / Angin Diagonal di Langit Biru (Sesuai Referensi) */}
          <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full opacity-75">
            <line
              x1="280"
              y1="280"
              x2="470"
              y2="345"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="1090"
              y1="265"
              x2="920"
              y2="375"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="1140"
              y1="280"
              x2="1030"
              y2="348"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* 4. Kelopak Sakura Pink Melayang di Sisi Kanan (Sesuai Gambar Referensi) */}
          {[
            { right: '18%', top: '26%', delay: 0 },
            { right: '14%', top: '31%', delay: 0.8 },
            { right: '22%', top: '35%', delay: 1.6 },
            { right: '11%', top: '23%', delay: 2.2 },
            { right: '16%', top: '40%', delay: 3.0 },
            { right: '25%', top: '29%', delay: 1.2 },
          ].map((petal, i) => (
            <motion.div
              key={`petal-${i}`}
              style={{ right: petal.right, top: petal.top }}
              animate={{
                x: [0, -28, -55],
                y: [0, 18, 42],
                rotate: [0, 120, 240],
                opacity: [0, 0.95, 0],
              }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                delay: petal.delay,
                ease: 'easeInOut',
              }}
              className="absolute w-2.5 h-3.5 rounded-full bg-[#FDA4AF] shadow-[0_0_6px_rgba(253,164,175,0.8)]"
            />
          ))}
        </>
      )}

      {/* ========================================================== */}
      {/* ELEMEN KHUSUS LANGIT SENJA (Matahari Senja Hangat)          */}
      {/* ========================================================== */}
      {!isBright && (
        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.75, 0.92, 0.75] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 -translate-x-1/2 top-8 w-56 h-56 rounded-full bg-gradient-to-b from-[#FFF7DF] to-[#FDBA74]/40 blur-md"
        />
      )}

      {/* ========================================================== */}
      {/* ALIRAN ANGIN / UDARA BERGERAK (WIND RIBBONS)               */}
      {/* ========================================================== */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-55"
      >
        <motion.path
          d="M -100 190 Q 280 130, 660 200 T 1480 160"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="130 290"
          animate={{ strokeDashoffset: [840, -840] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M -80 460 Q 380 400, 760 470 T 1520 420"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="100 320"
          animate={{ strokeDashoffset: [760, -760] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'linear', delay: 2 }}
        />
        <motion.path
          d="M 100 720 Q 520 660, 940 730 T 1560 680"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="110 310"
          animate={{ strokeDashoffset: [800, -800] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: 4 }}
        />
      </svg>

      {/* ========================================================== */}
      {/* AWAN CUMULUS BERLAPIS KIRI, KANAN, DAN HORIZON BAWAH       */}
      {/* ========================================================== */}
      {/* Awan Kiri Atas */}
      <motion.div
        animate={{ x: [-14, 16, -14], y: [0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-10 top-[6%] w-[42%] max-w-[540px]"
      >
        <svg viewBox="0 0 460 180" className="w-full h-auto">
          <path
            d="M0 165 L0 45 Q28 20 58 48 Q88 32 112 68 Q145 55 170 92 Q210 75 245 112 Q285 98 318 132 Q355 118 390 148 Q425 138 455 165 Z"
            fill={cloudBack}
          />
          <path
            d="M0 165 L0 72 Q35 55 68 84 Q102 68 135 102 Q178 88 210 124 Q252 110 285 142 Q325 130 355 152 Q388 142 420 165 Z"
            fill={cloudFront}
          />
        </svg>
      </motion.div>

      {/* Awan Kanan Atas */}
      <motion.div
        animate={{ x: [14, -16, 14], y: [0, 5, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -right-10 top-[12%] w-[44%] max-w-[560px]"
      >
        <svg viewBox="0 0 520 230" className="w-full h-auto">
          <path
            d="M520 215 L520 35 Q475 18 440 58 Q402 42 368 85 Q325 68 288 112 Q242 98 205 142 Q158 128 120 168 Q72 158 25 215 Z"
            fill={cloudBack}
          />
          <path
            d="M520 215 L520 78 Q480 62 442 98 Q398 84 362 125 Q318 112 280 152 Q232 138 195 175 Q148 165 95 215 Z"
            fill={cloudFront}
          />
        </svg>
      </motion.div>

      {/* Awan Kiri Tengah */}
      <motion.div
        animate={{ x: [-16, 14, -16] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute -left-12 top-[38%] w-[38%] max-w-[480px]"
      >
        <svg viewBox="0 0 440 200" className="w-full h-auto">
          <path
            d="M0 185 L0 32 Q42 18 78 62 Q122 48 158 96 Q205 82 242 128 Q288 115 325 155 Q368 145 415 185 Z"
            fill={cloudBack}
          />
          <path
            d="M0 185 L0 72 Q45 58 84 98 Q128 84 168 128 Q215 116 255 155 Q302 145 352 185 Z"
            fill={cloudFront}
          />
        </svg>
      </motion.div>

      {/* Awan Horizon Bawah Kiri & Kanan */}
      <motion.div
        animate={{ x: [-10, 14, -10], y: [0, 4, 0] }}
        transition={{ duration: 10.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-12 -bottom-4 w-[58%] max-w-[780px]"
      >
        <svg viewBox="0 0 680 240" className="w-full h-auto">
          <path
            d="M0 240 L0 48 Q48 28 92 78 Q145 62 195 112 Q255 95 305 145 Q365 128 418 175 Q475 162 532 202 Q595 192 660 240 Z"
            fill={cloudBack}
          />
          <path
            d="M0 240 L0 95 Q55 78 105 125 Q162 108 215 155 Q278 142 332 185 Q395 172 455 212 Q515 202 585 240 Z"
            fill={cloudFront}
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ x: [12, -12, 12], y: [0, 5, 0] }}
        transition={{ duration: 11.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute -right-12 -bottom-4 w-[56%] max-w-[750px]"
      >
        <svg viewBox="0 0 650 250" className="w-full h-auto">
          <path
            d="M650 250 L650 42 Q598 25 552 75 Q495 58 442 112 Q382 95 328 148 Q268 132 212 182 Q148 168 85 212 Q35 205 0 250 Z"
            fill={cloudBack}
          />
          <path
            d="M650 250 L650 92 Q595 75 545 122 Q488 108 432 158 Q372 142 315 192 Q252 178 188 222 Q125 212 65 250 Z"
            fill={cloudFront}
          />
        </svg>
      </motion.div>

      {/* Kawanan Burung Terbang */}
      <AnimatedBirdFlock className="absolute left-[18%] top-[22%]" delay={0} duration={16} scale={0.95} />
      <AnimatedBirdFlock className="absolute right-[16%] top-[10%]" delay={1.2} duration={19} scale={0.9} />
      <AnimatedBirdFlock className="absolute right-[12%] top-[48%]" delay={2.4} duration={17} scale={0.88} />
      <AnimatedBirdFlock className="absolute left-[42%] bottom-[8%]" delay={0.8} duration={15} scale={0.82} />
    </div>
  )
}

// ============================================================
// LANDMARK KREATIF & INTERAKTIF DI TIAP PULAU (PULAU 1 – 6)
// ============================================================
const IslandCreativeLandmarks = () => (
  <div className="absolute inset-0 pointer-events-none select-none z-10">
    {/* PULAU 1 (Bawah Kiri): Kupu-kupu & Bunga Berkilau di Dekat Papan A */}
    <motion.div
      style={{ left: '11.5%', top: '76.5%' }}
      animate={{ x: [0, 12, -4, 0], y: [0, -10, -4, 0], rotate: [-8, 10, -8] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute text-base sm:text-xl drop-shadow-xs"
    >
      🦋
    </motion.div>

    {/* PULAU 2 (Bawah Kanan): Riak Air Sungai Berkilau & Bunga Teratai */}
    {[
      { x: '73%', y: '69.0%', delay: 0 },
      { x: '75.5%', y: '71.4%', delay: 0.7 },
      { x: '78%', y: '73.5%', delay: 1.4 },
    ].map((w, idx) => (
      <motion.div
        key={`water-${idx}`}
        style={{ left: w.x, top: w.y }}
        animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.25, 0.85], x: [0, 4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: w.delay }}
        className="absolute w-3.5 h-1.5 rounded-full bg-white/95 shadow-[0_0_8px_#FFFFFF]"
      />
    ))}

    {/* PULAU 3 (Tengah Kiri): Daun Gugur & Lentera Hangat di Pohon Rindang */}
    {[
      { x: '36%', y: '46%', delay: 0 },
      { x: '42%', y: '47.5%', delay: 1.8 },
      { x: '32%', y: '49%', delay: 3.2 },
    ].map((leaf, idx) => (
      <motion.div
        key={`leaf-${idx}`}
        style={{ left: leaf.x, top: leaf.y }}
        animate={{
          y: [0, 28, 52],
          x: [0, -10, 6],
          rotate: [0, 45, -25],
          opacity: [0, 0.95, 0],
        }}
        transition={{ duration: 5.2, repeat: Infinity, delay: leaf.delay, ease: 'easeInOut' }}
        className="absolute text-xs sm:text-sm"
      >
        🍃
      </motion.div>
    ))}

    {/* PULAU 4 (Tengah Kanan): Kincir Angin Handoora yang Baling-Balingnya Berputar */}
    <div
      style={{ left: '84.5%', top: '36.8%' }}
      className="absolute -translate-x-1/2 -translate-y-full w-14 sm:w-20 h-20 sm:h-28 flex flex-col items-center"
    >
      <svg viewBox="0 0 100 130" className="w-full h-full overflow-visible drop-shadow-md">
        {/* Menara Kayu/Batu Kincir */}
        <polygon points="36,125 64,125 56,52 44,52" fill="#9E5847" stroke="#6E382C" strokeWidth="3" />
        <polygon points="41,52 59,52 50,36" fill="#EB2B36" stroke="#991B1B" strokeWidth="2.5" />
        <rect x="45" y="95" width="10" height="30" rx="5" fill="#5C2D23" />
      </svg>
      {/* Baling-Baling Kincir Berputar */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[22%] w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <g stroke="#7C2D12" strokeWidth="2">
            <polygon points="50,50 43,6 57,6" fill="#FFFBEB" />
            <polygon points="50,50 94,43 94,57" fill="#FCA5A5" />
            <polygon points="50,50 57,94 43,94" fill="#FFFBEB" />
            <polygon points="50,50 6,57 6,43" fill="#FCA5A5" />
          </g>
          <circle cx="50" cy="50" r="7" fill="#EB2B36" stroke="#FFFFFF" strokeWidth="2.5" />
        </svg>
      </motion.div>
    </div>

    {/* PULAU 5 (Atas Kiri - Locked Planet Level): Kristal Prisma & Sakura Berkilau */}
    <motion.div
      style={{ left: '43.5%', top: '18.2%' }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -translate-x-1/2 -translate-y-full w-14 sm:w-20 h-16 sm:h-24"
    >
      <svg viewBox="0 0 110 120" className="w-full h-full drop-shadow-[0_8px_16px_rgba(236,72,153,0.4)]">
        {/* Kristal Kiri */}
        <polygon points="28,105 14,62 28,38 42,62" fill="#F472B6" stroke="#FFFFFF" strokeWidth="2" />
        <polygon points="28,105 28,38 42,62" fill="#EC4899" />
        {/* Kristal Utama Tengah */}
        <polygon points="55,108 36,48 55,12 74,48" fill="#A78BFA" stroke="#FFFFFF" strokeWidth="2.5" />
        <polygon points="55,108 55,12 74,48" fill="#7C3AED" />
        {/* Kristal Kanan */}
        <polygon points="82,105 68,64 82,42 96,64" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
        <polygon points="82,105 82,42 96,64" fill="#0284C7" />
        <circle cx="55" cy="26" r="4" fill="#FFFFFF" />
      </svg>
    </motion.div>

    {/* PULAU 6 (Puncak Kanan Atas - Locked Final Level): Monumen Istana Bintang & Mahkota Emas */}
    <motion.div
      style={{ left: '84.5%', top: '6.2%' }}
      animate={{ y: [0, -5, 0], scale: [1, 1.03, 1] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -translate-x-1/2 -translate-y-full w-16 sm:w-22 h-16 sm:h-22"
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_10px_20px_rgba(245,158,11,0.5)]">
        {/* Pilar Kuil Puncak */}
        <rect x="22" y="96" width="76" height="14" rx="5" fill="#FDE68A" stroke="#B45309" strokeWidth="2.5" />
        <rect x="30" y="54" width="12" height="42" rx="3" fill="#FFFBEB" stroke="#D97706" strokeWidth="2.5" />
        <rect x="78" y="54" width="12" height="42" rx="3" fill="#FFFBEB" stroke="#D97706" strokeWidth="2.5" />
        <path d="M20 56 L60 26 L100 56 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
        {/* Bintang Mahkota Puncak */}
        <polygon
          points="60,4 66,18 81,18 69,27 73,41 60,33 47,41 51,27 39,18 54,18"
          fill="#FEF08A"
          stroke="#D97706"
          strokeWidth="2.5"
        />
      </svg>
    </motion.div>
  </div>
)

// ============================================================
// KOMPONEN UTAMA DASHBOARD / BERANDA (/belajar)
// ============================================================
const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, logout, updateProfile, completeGoogleOnboarding } = useAuth()
  const mapScrollRef = useRef(null)

  // Navigasi Sidebar sesuai Web - Beranda.png: 'beranda' | 'profil' | 'lainnya'
  const [activeMenu, setActiveMenu] = useState('beranda')

  // State Progres Pengguna (Tersinkronisasi dengan Database Supabase)
  const [progress, setProgress] = useState(() =>
    progressService.getProgress(user?.id)
  )

  // Pulau yang sedang dipilih untuk banner atas & posisi mascot
  const [selectedUnitId, setSelectedUnitId] = useState(1)

  // Keterangan Level (Popover) HANYA muncul saat node di-hover atau di-klik!
  const [hoveredUnitId, setHoveredUnitId] = useState(null)
  const [clickedTooltipUnitId, setClickedTooltipUnitId] = useState(null)

  const [mapZoom, setMapZoom] = useState(1)
  // Mode Langit: 'bright' (Langit Cerah sesuai referensi baru) | 'sunset' (Langit Senja LEVEL.png)
  const [skyMode, setSkyMode] = useState('bright')

  // Popover "10 hari beruntun" sesuai Web - Beranda-1.png
  const [showStreakPopover, setShowStreakPopover] = useState(false)

  // Modal Buku Panduan & Kuis Interaktif
  const [guideUnit, setGuideUnit] = useState(null)
  const [quizUnit, setQuizUnit] = useState(null)
  const [quizStep, setQuizStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false)

  // Form Profil Pengguna
  const [profileForm, setProfileForm] = useState({
    nama: user?.nama || 'Sobat Handoora',
    umur: user?.umur || 20,
  })

  // Modal Onboarding Google OAuth
  const [showGoogleOnboarding, setShowGoogleOnboarding] = useState(false)
  const [onboardingForm, setOnboardingForm] = useState({
    nama: user?.nama || '',
    umur: user?.umur || '',
    password: '',
  })
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false)

  useEffect(() => {
    if (user?.id) {
      setProfileForm({
        nama: user.nama || 'Sobat Handoora',
        umur: user.umur || 20,
      })

      if (user.auth_provider === 'google' && (user.umur === null || user.umur === undefined)) {
        setOnboardingForm({
          nama: user.nama || '',
          umur: '',
          password: '',
        })
        setShowGoogleOnboarding(true)
      }

      progressService.syncFromSupabase(user.id).then((remote) => {
        if (remote) {
          setProgress(remote)
        }
      })
    }
  }, [user])

  // Tentukan SATU node level yang sedang aktif saat ini (unlocked tertinggi yang belum selesai, atau pulau tertinggi yang terbuka)
  const unlockedIds = ISLAND_UNITS.filter(
    (u) => progress.unlockedIslands.includes(u.id) || u.id === 1
  ).map((u) => u.id)
  const uncompletedUnlockedIds = unlockedIds.filter(
    (id) => !progress.completedIslands.includes(id)
  )
  const currentActiveUnitId =
    uncompletedUnlockedIds.length > 0
      ? Math.min(...uncompletedUnlockedIds)
      : Math.max(1, ...unlockedIds)

  // Scroll otomatis ke pulau aktif bawah saat pertama kali halaman Beranda dibuka
  useEffect(() => {
    if (activeMenu === 'beranda' && mapScrollRef.current) {
      const el = mapScrollRef.current
      const targetUnit =
        ISLAND_UNITS.find((u) => u.id === currentActiveUnitId) || ISLAND_UNITS[0]
      const targetY = (targetUnit.nodePos.y / 100) * el.scrollHeight
      el.scrollTo({
        top: Math.max(0, targetY - el.clientHeight * 0.55),
        behavior: 'smooth',
      })
    }
  }, [activeMenu, currentActiveUnitId])

  const selectedUnit =
    ISLAND_UNITS.find((u) => u.id === selectedUnitId) ||
    ISLAND_UNITS.find((u) => u.id === currentActiveUnitId) ||
    ISLAND_UNITS[0]

  // Mascot berdiri di pulau aktif saat ini (atau pulau yang sedang dipilih jika sudah terbuka)
  const mascotUnit =
    progress.unlockedIslands.includes(selectedUnit.id) || selectedUnit.id === 1
      ? selectedUnit
      : ISLAND_UNITS.find((u) => u.id === currentActiveUnitId) || ISLAND_UNITS[0]

  const scrollToIsland = (unit) => {
    setSelectedUnitId(unit.id)
    setClickedTooltipUnitId(unit.id)
    if (mapScrollRef.current) {
      const el = mapScrollRef.current
      const targetY = (unit.nodePos.y / 100) * el.scrollHeight
      el.scrollTo({
        top: Math.max(0, targetY - el.clientHeight * 0.52),
        behavior: 'smooth',
      })
    }
  }

  const handleNodeClick = (e, unit) => {
    e.stopPropagation()
    setSelectedUnitId(unit.id)
    setClickedTooltipUnitId((prev) => (prev === unit.id ? null : unit.id))
  }

  const startQuiz = (unit) => {
    const isUnlocked = progress.unlockedIslands.includes(unit.id) || unit.id === 1
    if (!isUnlocked) {
      toast.error(
        `Selesaikan Pulau ${unit.id - 1} terlebih dahulu untuk membuka ${unit.unitLabel}! 🔒`
      )
      return
    }
    setClickedTooltipUnitId(null)
    setHoveredUnitId(null)
    setQuizUnit(unit)
    setQuizStep(0)
    setSelectedOption(null)
    setIsAnswerChecked(false)
    setIsAnswerCorrect(false)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null || !quizUnit) return
    const currentQ = quizUnit.questions[quizStep]
    const correct = selectedOption === currentQ.correctIndex
    setIsAnswerCorrect(correct)
    setIsAnswerChecked(true)

    if (!correct) {
      const updated = {
        ...progress,
        hearts: Math.max(1, progress.hearts - 1),
      }
      setProgress(updated)
      if (user?.id) {
        progressService.saveProgressToSupabase(user.id, updated)
      }
    }
  }

  const handleNextQuestion = async () => {
    if (!quizUnit) return
    if (quizStep + 1 < quizUnit.questions.length) {
      setQuizStep((s) => s + 1)
      setSelectedOption(null)
      setIsAnswerChecked(false)
      setIsAnswerCorrect(false)
    } else {
      const nextIslandId = Math.min(ISLAND_UNITS.length, quizUnit.id + 1)
      const completedIslands = Array.from(
        new Set([...progress.completedIslands, quizUnit.id])
      )
      const unlockedIslands = Array.from(
        new Set([...progress.unlockedIslands, quizUnit.id, nextIslandId])
      )

      const updated = {
        ...progress,
        xp: progress.xp + quizUnit.xpReward,
        gems: progress.gems + (quizUnit.gemReward || 15),
        completedIslands,
        unlockedIslands,
        dailyQuests: {
          ...progress.dailyQuests,
          xpEarnedToday: (progress.dailyQuests?.xpEarnedToday || 0) + quizUnit.xpReward,
          highScoreLessons: (progress.dailyQuests?.highScoreLessons || 0) + 1,
        },
      }
      setProgress(updated)
      setQuizUnit(null)
      setSelectedUnitId(nextIslandId)

      if (user?.id) {
        await progressService.saveProgressToSupabase(user.id, updated)
      }
      toast.success(
        `Selamat! ${quizUnit.unitLabel} selesai! +${quizUnit.xpReward} XP disimpan ke Supabase! 🎉`
      )
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await updateProfile({
      nama: profileForm.nama,
      umur: parseInt(profileForm.umur, 10) || 20,
    })
    toast.success('Profil berhasil diperbarui di Supabase! ✨')
  }

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault()
    const parsedAge = parseInt(onboardingForm.umur, 10)
    if (!parsedAge || parsedAge < 4 || parsedAge > 100) {
      toast.error('Masukkan umur yang valid (4 - 100 tahun)')
      return
    }
    if (onboardingForm.password && onboardingForm.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setIsSavingOnboarding(true)
    try {
      await completeGoogleOnboarding({
        nama: onboardingForm.nama.trim() || user?.nama || 'Sobat Handoora',
        umur: parsedAge,
        password: onboardingForm.password,
      })
      setShowGoogleOnboarding(false)
      toast.success('Data profil & keamanan akun berhasil disimpan ke Supabase! 🎉')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan profil ke Supabase')
    } finally {
      setIsSavingOnboarding(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar dari akun')
    navigate('/')
  }

  const activeStreakDays = Math.min(7, Math.max(1, progress.streak % 8 || 1))

  return (
    <PageTransition>
      <div className="relative h-screen w-screen overflow-hidden font-sans text-[#333333] flex flex-col lg:flex-row select-none">
        {/* ============================================================ */}
        {/* FULL-SCREEN SCENERY BACKGROUND (LANGIT CERAH / LANGIT SENJA) */}
        {/* ============================================================ */}
        <FullScreenSkyScenery skyMode={skyMode} />

        {/* ============================================================ */}
        {/* 1. LEFT FLOATING SIDEBAR (Sesuai Desain Web - Beranda.png)   */}
        {/* ============================================================ */}
        <aside className="hidden lg:flex flex-col justify-between w-[258px] xl:w-[272px] shrink-0 m-4 mr-0 bg-[#F7F7F7]/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-[34px] px-5 py-7 shadow-[0_14px_38px_rgba(0,0,0,0.08)] z-30">
          <div>
            {/* Brand Logo Handoora */}
            <div
              onClick={() => setActiveMenu('beranda')}
              className="px-3 mb-9 cursor-pointer inline-flex items-center group"
            >
              <img
                src="/assets/logo-full.png"
                alt="Handoora"
                className="h-6 w-auto object-contain group-hover:scale-103 transition-transform"
                draggable={false}
              />
            </div>

            {/* 3 Menu Utama Sesuai Web - Beranda.png: BERANDA, PROFIL, LAINNYA */}
            <nav className="space-y-3">
              {[
                { id: 'beranda', label: 'BERANDA', Icon: IconBeranda },
                { id: 'profil', label: 'PROFIL', Icon: IconProfil },
                { id: 'lainnya', label: 'LAINNYA', Icon: IconLainnya },
              ].map(({ id, label, Icon }) => {
                const isActive = activeMenu === id
                return (
                  <motion.button
                    key={id}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveMenu(id)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[20px] font-extrabold text-[13px] tracking-wider uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F8EFEF] text-[#E02424] border-2 border-[#E02424] shadow-[0_4px_14px_rgba(224,36,36,0.10)]'
                        : 'bg-transparent text-[#B3B3B3] hover:bg-[#EFEFEF]/70 hover:text-[#7A7A7A] border-2 border-transparent'
                    }`}
                  >
                    <Icon active={isActive} />
                    <span>{label}</span>
                  </motion.button>
                )
              })}
            </nav>
          </div>

          {/* Kartu Ringkas Profil Pengguna di Bawah Sidebar */}
          <div className="space-y-3 pt-5 border-t border-[#E8E8E8]">
            <div
              onClick={() => setActiveMenu('profil')}
              className="bg-white border-2 border-[#ECECEC] hover:border-[#FCA5A5] rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-all shadow-2xs"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nama}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[#EB2B36]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EB2B36] to-[#B91C1C] flex items-center justify-center font-extrabold text-sm text-white shrink-0 shadow-xs">
                  {(user?.nama || 'S')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#333333] truncate">
                  {user?.nama || 'Sobat Handoora'}
                </p>
                <p className="text-[11px] font-bold text-[#E02424] truncate">
                  ⭐ {progress.xp} XP • 🏝️ {progress.completedIslands.length}/{ISLAND_UNITS.length} Pulau
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FFF0F0] text-[#888888] hover:text-[#E02424] border border-[#E6E6E6] hover:border-[#FCA5A5] text-xs font-extrabold tracking-wider uppercase transition-colors cursor-pointer"
            >
              KELUAR AKUN
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* HEADER MOBILE (< lg)                                         */}
        {/* ============================================================ */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-white/60 px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div
            onClick={() => setActiveMenu('beranda')}
            className="flex items-center cursor-pointer"
          >
            <img
              src="/assets/logo-full.png"
              alt="Handoora"
              className="h-5 w-auto object-contain"
              draggable={false}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-xl bg-[#FFF6E5] border border-[#FDE0A6] text-[11px] font-extrabold text-[#D97706] flex items-center gap-1">
              ⭐ {progress.xp}
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-[#EEF8FF] border border-[#BAE6FD] text-[11px] font-extrabold text-[#0284C7] flex items-center gap-1">
              💎 {progress.gems}
            </div>
            <button
              onClick={() => setShowStreakPopover((v) => !v)}
              className="px-3 py-1 rounded-xl bg-[#F8EFEF] border border-[#F5D0D0] flex items-center gap-1.5 cursor-pointer"
            >
              <IconFlame className="w-4 h-4" />
              <span className="text-xs font-black text-[#E02424]">{progress.streak}</span>
            </button>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. AREA UTAMA (BERANDA MAP / PROFIL / LAINNYA)               */}
        {/* ============================================================ */}
        <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          {/* ========================================================== */}
          {/* VIEW A: BERANDA (SCROLLABLE 6-ISLAND MAP DI ATAS SCENERY)  */}
          {/* ========================================================== */}
          {activeMenu === 'beranda' && (
            <div className="relative flex-1 flex flex-col h-full overflow-hidden">
              {/* FLOATING TOP BAR: Banner Unit Aktif + Tombol Streak UI 4 */}
              <div className="relative z-40 px-4 sm:px-7 pt-3 sm:pt-5 pb-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
                {/* Banner Unit Aktif */}
                <motion.div
                  key={selectedUnit.id}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="pointer-events-auto flex-1 max-w-xl bg-gradient-to-r from-[#EB2B36] to-[#D91E2A] border-2 border-[#FCA5A5]/70 border-b-[5px] border-b-[#991B1B] rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-[0_12px_28px_rgba(185,28,28,0.32)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase text-[#FFE4E6]">
                        ← {selectedUnit.section}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold text-white">
                        {selectedUnit.islandName}
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white truncate mt-0.5">
                      {selectedUnit.title}
                    </h2>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setGuideUnit(selectedUnit)}
                    className="shrink-0 bg-white/15 hover:bg-white/25 border-2 border-white/40 border-b-4 border-b-[#7F1D1D]/50 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider cursor-pointer transition-all"
                  >
                    <span className="text-base">📖</span>
                    <span className="hidden sm:inline">BUKU PANDUAN</span>
                  </motion.button>
                </motion.div>

                {/* Status Bar Kanan Atas + Tombol Streak & Popover "10 hari beruntun" */}
                <div className="pointer-events-auto relative flex items-center justify-end gap-2.5 self-end md:self-auto">
                  <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-white/80 shadow-sm">
                    <span className="text-sm">⭐</span>
                    <span className="text-xs font-black text-[#D97706]">{progress.xp} XP</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-white/80 shadow-sm">
                    <span className="text-sm">💎</span>
                    <span className="text-xs font-black text-[#0284C7]">{progress.gems}</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-white/80 shadow-sm">
                    <span className="text-sm">❤️</span>
                    <span className="text-xs font-black text-[#E02424]">{progress.hearts}</span>
                  </div>

                  {/* Tombol Streak Utama (Sesuai Web - Beranda.png & Web - Beranda-1.png) */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowStreakPopover((v) => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
                      showStreakPopover
                        ? 'bg-[#F7EFEF] border-[#E02424]/40'
                        : 'bg-white/95 hover:bg-[#F7EFEF] border-white/80'
                    }`}
                  >
                    <IconFlame className="w-5 h-6" />
                    <span className="text-base font-black text-[#E02424]">
                      {progress.streak}
                    </span>
                  </motion.button>

                  {/* POPOVER "10 hari beruntun" (Sesuai Desain Web - Beranda-1.png) */}
                  <AnimatePresence>
                    {showStreakPopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-[calc(100%+14px)] w-[300px] sm:w-[340px] bg-[#FAFAFA] border-2 border-[#E6E6E6] rounded-[28px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-50"
                      >
                        <div className="absolute -top-3 right-6 w-5 h-5 bg-[#FAFAFA] border-l-2 border-t-2 border-[#E6E6E6] rotate-45" />

                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#D91E2A]">
                            {progress.streak} hari beruntun
                          </h3>
                          <button
                            onClick={() => setShowStreakPopover(false)}
                            className="text-xs font-extrabold text-[#AAAAAA] hover:text-[#666666] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center">
                          {DAYS_STREAK.map((dayLetter, idx) => {
                            const isDayActive = idx < activeStreakDays
                            return (
                              <div key={idx} className="flex flex-col items-center gap-1.5">
                                <span
                                  className={`text-xs font-extrabold ${
                                    isDayActive ? 'text-[#D91E2A]' : 'text-[#DCDCDC]'
                                  }`}
                                >
                                  {dayLetter}
                                </span>
                                <motion.div
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: idx * 0.04 }}
                                  className={`w-8 h-9 sm:w-9 sm:h-10 rounded-xl flex items-center justify-center shadow-2xs ${
                                    isDayActive
                                      ? 'bg-[#D91E2A] shadow-[0_3px_10px_rgba(217,30,42,0.3)]'
                                      : 'bg-[#EBEBEB]'
                                  }`}
                                >
                                  <IconFlame
                                    className="w-4 h-5"
                                    color="#FFFFFF"
                                    innerColor={isDayActive ? '#D91E2A' : '#EBEBEB'}
                                  />
                                </motion.div>
                              </div>
                            )
                          })}
                        </div>

                        <p className="text-[11px] font-bold text-[#888888] mt-4 leading-relaxed">
                          Selesaikan minimal 1 pelajaran BISINDO setiap hari untuk menjaga api beruntunmu tetap menyala! 🔥
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ========================================================== */}
              {/* SCROLLABLE 6-ISLAND STAGE (DENGAN PADDING ATAS & BAWAH LEGA) */}
              {/* ========================================================== */}
              <div
                ref={mapScrollRef}
                onClick={() => {
                  if (showStreakPopover) setShowStreakPopover(false)
                  if (clickedTooltipUnitId !== null) setClickedTooltipUnitId(null)
                }}
                className="relative flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-8 pt-44 pb-36 scroll-smooth"
              >
                <motion.div
                  animate={{ scale: mapZoom, y: [0, -5, 0] }}
                  transition={{
                    scale: { type: 'spring', stiffness: 260, damping: 24 },
                    y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="relative w-full max-w-[760px] aspect-[1445/2020] mx-auto select-none"
                >
                  {/* 1. Gambar Utama 6 Pulau & Jembatan Batu Melayang */}
                  <img
                    src="/assets/islands-map.png"
                    alt="Peta 6 Pulau Pembelajaran Handoora"
                    className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_32px_rgba(0,0,0,0.22)]"
                    draggable={false}
                  />

                  {/* 2. Landmark Kreatif & Animasi Alam di Tiap Pulau (Pulau 1 - 6) */}
                  <IslandCreativeLandmarks />

                  {/* 3. Indikator Cahaya pada 16 Batu Pijakan (Stepping Stones) */}
                  {STEPPING_STONES.map((stone, idx) => {
                    const isPathUnlocked =
                      progress.unlockedIslands.includes(stone.toUnit) ||
                      progress.completedIslands.includes(stone.fromUnit)
                    return (
                      <div
                        key={`stone-${idx}`}
                        style={{ left: `${stone.x}%`, top: `${stone.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                      >
                        <div
                          className={`w-2.5 h-2 sm:w-3.5 sm:h-2.5 rounded-full border transition-all ${
                            isPathUnlocked
                              ? 'bg-[#FFE066] border-white shadow-[0_0_8px_rgba(255,224,102,0.85)]'
                              : 'bg-[#D6C7B2]/75 border-white/50'
                          }`}
                        />
                      </div>
                    )
                  })}

                  {/* 4. MASCOT DOORA BERDIRI DI PULAU AKTIF (TIDAK TERTUTUP POPOVER) */}
                  <motion.div
                    layout
                    initial={false}
                    animate={{
                      left: `${mascotUnit.mascotPos.x}%`,
                      top: `${mascotUnit.mascotPos.y}%`,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 170,
                      damping: 20,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      startQuiz(mascotUnit)
                    }}
                    className="absolute -translate-x-1/2 -translate-y-[82%] z-20 cursor-pointer group"
                  >
                    {/* Bayangan Elips di Rumput Bawah Kaki Maskot */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-3 sm:h-4 rounded-full bg-black/25 blur-[2px]" />

                    {/* Karakter Maskot Doora (Group 13.png) */}
                    <motion.img
                      src="/assets/mascot-standing.png"
                      alt="Maskot Doora"
                      animate={{
                        y: [0, -7, 0],
                        rotate: [-1.5, 1.5, -1.5],
                      }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      whileHover={{ scale: 1.08 }}
                      className="w-14 sm:w-20 md:w-24 h-auto object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.3)]"
                      draggable={false}
                    />
                  </motion.div>

                  {/* 5. NODE LEVEL 3D PADA 6 PULAU + KETERANGAN LEVEL HANYA SAAT HOVER/KLIK */}
                  {ISLAND_UNITS.map((unit) => {
                    const isCompleted = progress.completedIslands.includes(unit.id)
                    const isUnlocked =
                      progress.unlockedIslands.includes(unit.id) || unit.id === 1
                    // HANYA menyala pada node level yang ter-unlock saat ini (level yang sudah terlewati tidak menyala!)
                    const isCurrentActiveNode = unit.id === currentActiveUnitId
                    const isTooltipVisible =
                      hoveredUnitId === unit.id || clickedTooltipUnitId === unit.id

                    return (
                      <div
                        key={unit.id}
                        style={{
                          left: `${unit.nodePos.x}%`,
                          top: `${unit.nodePos.y}%`,
                        }}
                        onMouseEnter={() => setHoveredUnitId(unit.id)}
                        onMouseLeave={() =>
                          setHoveredUnitId((prev) => (prev === unit.id ? null : prev))
                        }
                        className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                          isTooltipVisible ? 'z-[80]' : 'z-30'
                        }`}
                      >
                        {/* POPOVER KETERANGAN LEVEL: HANYA MUNCUL SAAT HOVER ATAU KLIK */}
                        <AnimatePresence>
                          {isTooltipVisible && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.92 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.92 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-[calc(100%+18px)] left-1/2 -translate-x-1/2 w-52 sm:w-60 z-[90]"
                            >
                              <div className="bg-white/98 backdrop-blur-md border-2 border-[#EB2B36] rounded-2xl p-3.5 text-center shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                  <span className="px-2 py-0.5 rounded-full bg-[#FFF0F0] text-[10px] font-black text-[#E02424] uppercase tracking-wider">
                                    {unit.unitLabel} • {unit.islandName}
                                  </span>
                                </div>

                                <p className="text-xs sm:text-[13px] font-extrabold text-[#2B2B2B] leading-snug mb-1">
                                  {unit.title}
                                </p>

                                <p className="text-[11px] font-bold text-[#D97706] mb-2.5">
                                  Hadiah: +{unit.xpReward} XP • +{unit.gemReward} 💎
                                </p>

                                {isUnlocked ? (
                                  <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      startQuiz(unit)
                                    }}
                                    className="w-full py-2 px-4 rounded-xl bg-gradient-to-b from-[#FF4754] to-[#E02424] border-b-4 border-b-[#991B1B] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                                  >
                                    <span>{isCompleted ? 'LATIH LAGI' : 'MULAI BELAJAR'}</span>
                                    <span className="text-[10px]">▶</span>
                                  </motion.button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setGuideUnit(unit)
                                    }}
                                    className="w-full py-2 px-3 rounded-xl bg-[#F0ECE6] border-b-3 border-b-[#C9C0B5] text-[#78716C] font-extrabold text-[11px] uppercase tracking-wider cursor-pointer"
                                  >
                                    🔒 LIHAT PANDUAN UNIT
                                  </button>
                                )}
                              </div>

                              {/* Panah Bawah Popover */}
                              <div className="w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-[#EB2B36] rotate-45 mx-auto -mt-2" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* ANIMASI BLUR SPREAD HANYA PADA NODE LEVEL YANG SEDANG TER-UNLOCK SAAT INI */}
                        {isCurrentActiveNode && (
                          <>
                            <motion.div
                              animate={{
                                scale: [1.05, 1.55, 1.05],
                                opacity: [0.65, 0.18, 0.65],
                              }}
                              transition={{
                                duration: 2.6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className="absolute -inset-4 sm:-inset-5 rounded-full bg-[#FF3B47] blur-xl pointer-events-none"
                            />
                            <motion.div
                              animate={{
                                scale: [1, 1.22, 1],
                                opacity: [0.55, 0.2, 0.55],
                              }}
                              transition={{
                                duration: 2.6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className="absolute -inset-2 rounded-full bg-[#FDA4AF] blur-md pointer-events-none"
                            />
                          </>
                        )}

                        {/* TOMBOL NODE LEVEL 3D ISOMETRIK */}
                        <motion.button
                          whileHover={{ scale: 1.08, y: -2 }}
                          whileTap={{ scale: 0.94, y: 2 }}
                          onClick={(e) => handleNodeClick(e, unit)}
                          onDoubleClick={() => isUnlocked && startQuiz(unit)}
                          className={`relative w-12 h-11 sm:w-16 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                            isCurrentActiveNode
                              ? 'bg-gradient-to-b from-[#FF4D58] to-[#E02424] border-white border-b-[6px] border-b-[#88131A] shadow-[0_0_28px_rgba(235,43,54,0.65)]'
                              : isCompleted
                              ? 'bg-gradient-to-b from-[#FBBF24] to-[#D97706] border-[#FEF08A] border-b-[6px] border-b-[#92400E] shadow-[0_6px_14px_rgba(0,0,0,0.22)]'
                              : isUnlocked
                              ? 'bg-gradient-to-b from-[#FF4D58] to-[#E02424] border-[#FECDD3] border-b-[6px] border-b-[#88131A] shadow-[0_6px_14px_rgba(0,0,0,0.22)]'
                              : 'bg-gradient-to-b from-[#8C827A] to-[#6B625B] border-[#D6CFC7] border-b-[6px] border-b-[#47403B] shadow-[0_6px_14px_rgba(0,0,0,0.28)]'
                          }`}
                        >
                          {/* Kilau Highlight Atas Node */}
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-7 sm:w-9 h-2 rounded-full bg-white/30 pointer-events-none" />

                          {isCompleted ? (
                            <span className="text-lg sm:text-2xl text-white drop-shadow-xs">
                              ✓
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-lg sm:text-2xl text-white drop-shadow-xs">
                              ★
                            </span>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              className="w-5 h-5 sm:w-6 sm:h-6 text-[#EAE4DC]"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 3a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V7a4 4 0 0 0-4-4Zm2 7V7a2 2 0 1 0-4 0v3h4Z"
                              />
                            </svg>
                          )}
                        </motion.button>
                      </div>
                    )
                  })}
                </motion.div>
              </div>

              {/* ========================================================== */}
              {/* FLOATING BOTTOM CONTROLS: Quick Jump 6 Pulau + Mode Langit */}
              {/* ========================================================== */}
              <div className="pointer-events-none fixed lg:absolute bottom-16 lg:bottom-4 left-0 right-0 z-40 px-4 sm:px-7 flex flex-wrap items-center justify-between gap-3">
                {/* Kiri Bawah: Navigasi Cepat Pulau 1 - 6 */}
                <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                  <div className="hidden sm:flex bg-white/92 backdrop-blur-md border-2 border-white/80 px-3.5 py-2 rounded-full items-center gap-2 shadow-md">
                    <span className="text-[#E02424] text-sm">📍</span>
                    <span className="text-xs font-extrabold text-[#333333]">
                      6 Pulau BISINDO
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white/92 backdrop-blur-md border-2 border-white/80 p-1 rounded-full shadow-md">
                    {ISLAND_UNITS.map((u) => {
                      const unlocked =
                        progress.unlockedIslands.includes(u.id) || u.id === 1
                      const isCurrent = u.id === currentActiveUnitId
                      const active = selectedUnit.id === u.id
                      return (
                        <button
                          key={u.id}
                          onClick={() => scrollToIsland(u)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#E02424] text-white shadow-2xs'
                              : isCurrent
                              ? 'bg-[#FFF0F0] text-[#E02424]'
                              : unlocked
                              ? 'text-[#444444] hover:bg-[#FFF0F0]'
                              : 'text-[#999999] hover:bg-[#F5F5F5]'
                          }`}
                        >
                          {unlocked ? `Pulau ${u.id}` : `🔒 ${u.id}`}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Kanan Bawah: Pilihan 2 Mode Langit (Langit Cerah & Langit Senja) + Zoom */}
                <div className="pointer-events-auto flex items-center gap-2.5 ml-auto">
                  <div className="bg-white/92 backdrop-blur-md border-2 border-white/80 p-1 rounded-2xl flex items-center gap-1 shadow-md">
                    <button
                      onClick={() => setSkyMode('bright')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        skyMode === 'bright'
                          ? 'bg-[#0D92F4] text-white shadow-2xs'
                          : 'text-[#666666] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <span>☀️</span>
                      <span className="hidden sm:inline">Langit Cerah</span>
                    </button>
                    <button
                      onClick={() => setSkyMode('sunset')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        skyMode === 'sunset'
                          ? 'bg-[#EA580C] text-white shadow-2xs'
                          : 'text-[#666666] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <span>🌅</span>
                      <span className="hidden sm:inline">Langit Senja</span>
                    </button>
                  </div>

                  <div className="flex flex-col bg-white/95 backdrop-blur-md border-2 border-white/80 rounded-xl overflow-hidden shadow-md">
                    <button
                      onClick={() =>
                        setMapZoom((z) => Math.min(1.2, +(z + 0.08).toFixed(2)))
                      }
                      className="w-8 h-8 flex items-center justify-center text-base font-black text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E02424] border-b border-[#EDEDED] cursor-pointer transition-colors"
                      title="Perbesar Peta"
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        setMapZoom((z) => Math.max(0.84, +(z - 0.08).toFixed(2)))
                      }
                      className="w-8 h-8 flex items-center justify-center text-base font-black text-[#333333] hover:bg-[#FFF0F0] hover:text-[#E02424] cursor-pointer transition-colors"
                      title="Perkecil Peta"
                    >
                      −
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW B: PROFIL PENGGUNA                                    */}
          {/* ========================================================== */}
          {activeMenu === 'profil' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24">
              <div className="max-w-3xl mx-auto w-full">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_16px_44px_rgba(0,0,0,0.10)]"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-[#EEEEEE]">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nama}
                        className="w-20 h-20 rounded-3xl object-cover border-3 border-[#EB2B36] shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#EB2B36] to-[#B91C1C] flex items-center justify-center text-3xl font-black text-white shadow-md">
                        {(user?.nama || 'S')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="text-center sm:text-left">
                      <h1 className="text-2xl font-extrabold text-[#2B2B2B]">
                        {user?.nama || 'Sobat Handoora'}
                      </h1>
                      <p className="text-xs sm:text-sm text-[#777777] font-bold mt-0.5">
                        {user?.email || 'sobat@handoora.id'} • Umur {user?.umur || 20} Tahun
                      </p>
                      <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#FFF0F0] border border-[#FECDD3] text-[11px] font-extrabold text-[#E02424]">
                        Metode Login: {(user?.auth_provider || 'email').toUpperCase()} • Tersimpan di Supabase 🤟
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-[#FFF9EB] border-2 border-[#FDE68A] rounded-2xl p-4">
                      <p className="text-xs text-[#92400E] font-bold">Total XP</p>
                      <p className="text-xl font-extrabold text-[#D97706] mt-1">
                        ⭐ {progress.xp}
                      </p>
                    </div>
                    <div className="bg-[#FFF1F2] border-2 border-[#FECDD3] rounded-2xl p-4">
                      <p className="text-xs text-[#9F1239] font-bold">Hari Beruntun</p>
                      <p className="text-xl font-extrabold text-[#E02424] mt-1">
                        🔥 {progress.streak} Hari
                      </p>
                    </div>
                    <div className="bg-[#ECFDF5] border-2 border-[#A7F3D0] rounded-2xl p-4">
                      <p className="text-xs text-[#065F46] font-bold">Pulau Selesai</p>
                      <p className="text-xl font-extrabold text-[#059669] mt-1">
                        🏝️ {progress.completedIslands.length} / {ISLAND_UNITS.length}
                      </p>
                    </div>
                    <div className="bg-[#F0F9FF] border-2 border-[#BAE6FD] rounded-2xl p-4">
                      <p className="text-xs text-[#075985] font-bold">Permata</p>
                      <p className="text-xl font-extrabold text-[#0284C7] mt-1">
                        💎 {progress.gems}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                    <h2 className="text-base font-extrabold text-[#333333]">
                      Perbarui Informasi Profil (Database Supabase)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-[#666666] mb-1.5">
                          Nama Lengkap
                        </label>
                        <Input
                          value={profileForm.nama}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, nama: e.target.value }))
                          }
                          placeholder="Nama Lengkap"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-[#666666] mb-1.5">
                          Umur
                        </label>
                        <Input
                          type="number"
                          value={profileForm.umur}
                          onChange={(e) =>
                            setProfileForm((p) => ({ ...p, umur: e.target.value }))
                          }
                          placeholder="Umur"
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="primary" size="md">
                      SIMPAN KE SUPABASE
                    </Button>
                  </form>
                </motion.div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW C: LAINNYA (MISI HARIAN, PAPAN SKOR & PENGATURAN)     */}
          {/* ========================================================== */}
          {activeMenu === 'lainnya' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24">
              <div className="max-w-4xl mx-auto w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-[28px] p-6 shadow-md space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-extrabold text-[#2B2B2B]">
                        🎯 Misi Harian BISINDO
                      </h2>
                      <span className="px-2.5 py-1 rounded-full bg-[#FFF0F0] text-[11px] font-extrabold text-[#E02424]">
                        Aktif Hari Ini
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-extrabold text-[#444444] mb-1.5">
                          <span>⚡ Dapatkan 50 XP Belajar</span>
                          <span className="text-[#E02424]">
                            {Math.min(50, progress.dailyQuests?.xpEarnedToday || 25)} / 50 XP
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-[#F2F2F2] rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                ((progress.dailyQuests?.xpEarnedToday || 25) / 50) * 100
                              )}%`,
                            }}
                            className="h-full bg-gradient-to-r from-[#FF4D58] to-[#E02424] rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-extrabold text-[#444444] mb-1.5">
                          <span>🏝️ Selesaikan Pulau Pembelajaran</span>
                          <span className="text-[#D97706]">
                            {progress.completedIslands.length} / {ISLAND_UNITS.length} Pulau
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-[#F2F2F2] rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                (progress.completedIslands.length / ISLAND_UNITS.length) * 100
                              )}%`,
                            }}
                            className="h-full bg-gradient-to-r from-[#FBBF24] to-[#D97706] rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-[28px] p-6 shadow-md space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-extrabold text-[#2B2B2B]">
                        🏆 Papan Skor Sobat Handoora
                      </h2>
                      <span className="text-xs font-extrabold text-[#D97706]">
                        Liga Berlian
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { name: user?.nama || 'Kamu (Sobat Handoora)', xp: progress.xp, isMe: true },
                        { name: 'Alya Putri', xp: 145, isMe: false },
                        { name: 'Bima Pratama', xp: 120, isMe: false },
                      ]
                        .sort((a, b) => b.xp - a.xp)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border ${
                              item.isMe
                                ? 'bg-[#FFF5F5] border-[#FECDD3]'
                                : 'bg-[#FAFAFA] border-[#EEEEEE]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-[#E02424]">
                                #{idx + 1}
                              </span>
                              <span className="text-xs font-extrabold text-[#333333]">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-xs font-black text-[#D97706]">
                              ⭐ {item.xp} XP
                            </span>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-[28px] p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-base font-extrabold text-[#2B2B2B]">
                      ⚙️ Pengaturan Progres & Sesi Akun
                    </h3>
                    <p className="text-xs font-bold text-[#777777] mt-1">
                      Seluruh progres 6 pulau, XP, dan rentetan hari otomatis tersinkronisasi ke tabel <code className="text-[#E02424]">public.profiles</code> di Supabase.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={async () => {
                        const reset = progressService.resetProgress(user?.id)
                        setProgress(reset)
                        setSelectedUnitId(1)
                        if (user?.id) {
                          await progressService.saveProgressToSupabase(user.id, reset)
                        }
                        toast.success('Progres pembelajaran direset ke Pulau 1')
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#F5F5F5] hover:bg-[#EAEAEA] text-xs font-extrabold text-[#555555] cursor-pointer transition-colors"
                    >
                      ULANGI DARI PULAU 1
                    </button>

                    <Button variant="primary" size="md" onClick={handleLogout}>
                      KELUAR DARI AKUN
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </main>

        {/* ============================================================ */}
        {/* BOTTOM NAVIGATION BAR MOBILE (< lg)                          */}
        {/* ============================================================ */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E8E8] px-4 py-2 flex justify-around items-center">
          {[
            { id: 'beranda', label: 'BERANDA', Icon: IconBeranda },
            { id: 'profil', label: 'PROFIL', Icon: IconProfil },
            { id: 'lainnya', label: 'LAINNYA', Icon: IconLainnya },
          ].map(({ id, label, Icon }) => {
            const isActive = activeMenu === id
            return (
              <button
                key={id}
                onClick={() => setActiveMenu(id)}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl text-[10px] font-extrabold tracking-wider uppercase cursor-pointer transition-all ${
                  isActive
                    ? 'text-[#E02424] bg-[#FFF0F0]'
                    : 'text-[#999999]'
                }`}
              >
                <Icon active={isActive} />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* ============================================================ */}
        {/* MODAL 1: BUKU PANDUAN BISINDO                                */}
        {/* ============================================================ */}
        <AnimatePresence>
          {guideUnit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGuideUnit(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.92, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 16 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white border-2 border-[#EBEBEB] rounded-[32px] p-6 sm:p-7 shadow-2xl space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full bg-[#FFF0F0] text-[11px] font-black text-[#E02424] uppercase tracking-wider">
                      📖 Buku Panduan • {guideUnit.unitLabel}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#2B2B2B] mt-2">
                      {guideUnit.title}
                    </h3>
                    <p className="text-xs font-bold text-[#777777] mt-0.5">
                      {guideUnit.subtitle}
                    </p>
                  </div>
                  <button
                    onClick={() => setGuideUnit(null)}
                    className="w-9 h-9 rounded-full bg-[#F4F4F4] hover:bg-[#EAEAEA] text-[#555555] font-extrabold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {guideUnit.guide.map((g, i) => (
                    <div
                      key={i}
                      className="bg-[#FFFBF4] border-2 border-[#F5E1B8] rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#F3D299] flex items-center justify-center text-3xl shrink-0 shadow-2xs">
                        {g.sign}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#2B2B2B]">
                          Isyarat: “{g.word}”
                        </p>
                        <p className="text-xs text-[#666666] font-semibold mt-0.5 leading-relaxed">
                          {g.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setGuideUnit(null)}
                  >
                    TUTUP
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      const u = guideUnit
                      setGuideUnit(null)
                      startQuiz(u)
                    }}
                  >
                    MULAI LATIHAN ▶
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* MODAL 2: KUIS PELAJARAN BISINDO INTERAKTIF                   */}
        {/* ============================================================ */}
        <AnimatePresence>
          {quizUnit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
                className="w-full max-w-xl bg-white border-2 border-[#EBEBEB] rounded-[34px] p-6 sm:p-8 shadow-2xl space-y-6"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuizUnit(null)}
                    className="text-[#999999] hover:text-[#333333] font-black text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                  <div className="flex-1 h-3.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <motion.div
                      animate={{
                        width: `${((quizStep + 1) / quizUnit.questions.length) * 100}%`,
                      }}
                      className="h-full bg-gradient-to-r from-[#FF4D58] to-[#E02424] rounded-full"
                    />
                  </div>
                  <span className="text-sm font-black text-[#E02424]">
                    ❤️ {progress.hearts}
                  </span>
                </div>

                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FFF5E5] text-[11px] font-black text-[#D97706] uppercase tracking-wider">
                    {quizUnit.islandName} • Soal {quizStep + 1} dari {quizUnit.questions.length}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#2B2B2B] leading-snug">
                    {quizUnit.questions[quizStep].prompt}
                  </h3>

                  <div className="w-24 h-24 mx-auto rounded-3xl bg-[#FFF9EC] border-2 border-[#F5E0B5] flex items-center justify-center text-5xl shadow-inner">
                    {quizUnit.questions[quizStep].emoji}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {quizUnit.questions[quizStep].options.map((opt, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrectOpt =
                      idx === quizUnit.questions[quizStep].correctIndex

                    let styleClass =
                      'bg-[#FAFAFA] border-[#E5E5E5] text-[#333333] hover:border-[#EB2B36]/50'
                    if (isAnswerChecked) {
                      if (isCorrectOpt) {
                        styleClass =
                          'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                      } else if (isSelected) {
                        styleClass =
                          'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                      }
                    } else if (isSelected) {
                      styleClass =
                        'bg-[#FFF0F0] border-[#E02424] text-[#E02424] shadow-xs'
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswerChecked}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-3 ${styleClass}`}
                      >
                        <span className="w-7 h-7 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center text-xs font-extrabold text-[#555555] shrink-0">
                          {idx + 1}
                        </span>
                        <span>{opt}</span>
                      </button>
                    )
                  })}
                </div>

                {isAnswerChecked && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border-2 text-xs font-bold leading-relaxed ${
                      isAnswerCorrect
                        ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#065F46]'
                        : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                    }`}
                  >
                    <p className="font-extrabold text-sm mb-1">
                      {isAnswerCorrect
                        ? '🎉 Luar Biasa! Jawabanmu Tepat!'
                        : '💡 Kurang Tepat, Yuk Ingat Kembali:'}
                    </p>
                    {quizUnit.questions[quizStep].explanation}
                  </motion.div>
                )}

                <div className="flex justify-end">
                  {!isAnswerChecked ? (
                    <Button
                      variant="primary"
                      size="md"
                      disabled={selectedOption === null}
                      onClick={handleCheckAnswer}
                    >
                      PERIKSA JAWABAN
                    </Button>
                  ) : (
                    <Button variant="primary" size="md" onClick={handleNextQuestion}>
                      {quizStep + 1 < quizUnit.questions.length
                        ? 'SOAL BERIKUTNYA ▶'
                        : `SELESAIKAN & AMBIL +${quizUnit.xpReward} XP 🎉`}
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* MODAL 3: LENGKAPI PROFIL GOOGLE OAUTH (UMUR & PASSWORD HASH) */}
        {/* ============================================================ */}
        <AnimatePresence>
          {showGoogleOnboarding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
                className="w-full max-w-md bg-white border-2 border-[#EBEBEB] rounded-[32px] p-6 sm:p-7 shadow-2xl space-y-5"
              >
                <div className="flex items-center gap-3.5">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.nama}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-[#EB2B36]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#EB2B36] flex items-center justify-center text-xl font-black text-white">
                      G
                    </div>
                  )}
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-extrabold text-[#059669] uppercase">
                      Akun Google Terhubung
                    </span>
                    <h3 className="text-lg font-extrabold text-[#2B2B2B] mt-0.5">
                      Lengkapi Profil Handoora
                    </h3>
                    <p className="text-xs text-[#777777] font-bold">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#555555] mb-1.5">
                      Nama Lengkap (dari Akun Google)
                    </label>
                    <Input
                      type="text"
                      value={onboardingForm.nama}
                      onChange={(e) =>
                        setOnboardingForm((p) => ({ ...p, nama: e.target.value }))
                      }
                      placeholder="Nama Lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#555555] mb-1.5">
                      Umur Pengguna (Wajib)
                    </label>
                    <Input
                      type="number"
                      value={onboardingForm.umur}
                      onChange={(e) =>
                        setOnboardingForm((p) => ({ ...p, umur: e.target.value }))
                      }
                      placeholder="Contoh: 20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#555555] mb-1.5">
                      Buat Password Aplikasi (Di-hash PBKDF2-SHA256 ke Supabase)
                    </label>
                    <Input
                      type="password"
                      value={onboardingForm.password}
                      onChange={(e) =>
                        setOnboardingForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="Minimal 6 karakter"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => setShowGoogleOnboarding(false)}
                    >
                      NANTI SAJA
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSavingOnboarding}
                    >
                      {isSavingOnboarding ? 'MENYIMPAN...' : 'SIMPAN KE SUPABASE'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default DashboardPage
