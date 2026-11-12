import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { progressService } from '../services/storage'
import { DICTIONARY_MODULES } from '../data/dictionaryData'

// ============================================================
// DATA 6 PULAU PEMBELAJARAN BISINDO (MULAI DARI LEVEL 1)
// Setiap pulau memiliki layer gambar terpisah agar dapat
// memberikan efek blur halus saat terpotong batas layar scroll
// ============================================================
const ISLAND_UNITS = [
  {
    id: 1,
    section: 'BAGIAN 1, LEVEL 1',
    unitLabel: 'Level 1',
    islandName: 'Pulau Abjad Dasar',
    title: 'Mengenal Abjad Jari BISINDO (A–Z)',
    subtitle: 'Fondasi ejaan jari dua tangan & isyarat huruf dasar',
    xpReward: 25,
    gemReward: 15,
    dayNodePos: { x: 19.26, y: 76.62 },
    sunsetNodePos: { x: 27.34, y: 80.62 },
    dayMascotPos: { x: 31.2, y: 77.4 },
    sunsetMascotPos: { x: 17.8, y: 80.2 },
    dayLayerBox: {
      src: '/assets/island-day-1.png',
      left: 3.4,
      top: 66.23,
      width: 46.38,
      height: 26.31,
    },
    sunsetLayerBox: {
      src: '/assets/island-autumn-1.png',
      left: 5.64,
      top: 70.23,
      width: 48.4,
      height: 27.85,
    },
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
    section: 'BAGIAN 1, LEVEL 2',
    unitLabel: 'Level 2',
    islandName: 'Pulau Lembah Sungai',
    title: 'Salam, Sapaan & Perkenalan Diri',
    subtitle: 'Menyapa teman baru dan memperkenalkan nama dengan sopan',
    xpReward: 30,
    gemReward: 20,
    dayNodePos: { x: 75.21, y: 64.46 },
    sunsetNodePos: { x: 72.77, y: 65.46 },
    dayMascotPos: { x: 62.5, y: 64.8 },
    sunsetMascotPos: { x: 62.2, y: 65.6 },
    dayLayerBox: {
      src: '/assets/island-day-2.png',
      left: 46.49,
      top: 57.08,
      width: 48.19,
      height: 21.54,
    },
    sunsetLayerBox: {
      src: '/assets/island-autumn-2.png',
      left: 44.36,
      top: 56.62,
      width: 50.53,
      height: 25.23,
    },
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
    section: 'BAGIAN 1, LEVEL 3',
    unitLabel: 'Level 3',
    islandName: 'Pulau Kincir Angin',
    title: 'Angka, Waktu & Anggota Keluarga',
    subtitle: 'Menghitung angka dasar serta mengenal isyarat keluarga',
    xpReward: 35,
    gemReward: 25,
    dayNodePos: { x: 25.64, y: 49.54 },
    sunsetNodePos: { x: 25.0, y: 49.62 },
    dayMascotPos: { x: 18.8, y: 50.4 },
    sunsetMascotPos: { x: 16.5, y: 49.4 },
    dayLayerBox: {
      src: '/assets/island-day-3.png',
      left: 16.28,
      top: 40.38,
      width: 38.09,
      height: 22.23,
    },
    sunsetLayerBox: {
      src: '/assets/island-autumn-3.png',
      left: 3.94,
      top: 40.0,
      width: 51.6,
      height: 25.85,
    },
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
    section: 'BAGIAN 1, LEVEL 4',
    unitLabel: 'Level 4',
    islandName: 'Pulau Pohon Rindang',
    title: 'Ekspresi Wajah & Perasaan Harian',
    subtitle: 'Memadukan mimik wajah (non-manual) dengan gerakan tangan',
    xpReward: 40,
    gemReward: 30,
    dayNodePos: { x: 79.68, y: 38.08 },
    sunsetNodePos: { x: 75.53, y: 37.31 },
    dayMascotPos: { x: 67.2, y: 38.6 },
    sunsetMascotPos: { x: 63.8, y: 37.8 },
    dayLayerBox: {
      src: '/assets/island-day-4.png',
      left: 50.74,
      top: 28.0,
      width: 46.91,
      height: 24.77,
    },
    sunsetLayerBox: {
      src: '/assets/island-autumn-4.png',
      left: 50.43,
      top: 30.38,
      width: 44.57,
      height: 21.54,
    },
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
    section: 'BAGIAN 2, LEVEL 5',
    unitLabel: 'Level 5',
    islandName: 'Pulau Bukit Cemara',
    title: 'Aktivitas Sekolah, Kampus & Pekerjaan',
    subtitle: 'Kosakata lingkungan pendidikan, diskusi, dan kolaborasi inklusif',
    xpReward: 45,
    gemReward: 35,
    dayNodePos: { x: 34.26, y: 24.54 },
    sunsetNodePos: { x: 33.19, y: 24.31 },
    dayMascotPos: { x: 24.2, y: 24.8 },
    sunsetMascotPos: { x: 23.2, y: 24.6 },
    dayLayerBox: {
      src: '/assets/island-day-5.png',
      left: 17.02,
      top: 14.85,
      width: 43.09,
      height: 22.46,
    },
    sunsetLayerBox: {
      src: '/assets/island-autumn-5.png',
      left: 14.79,
      top: 12.92,
      width: 45.0,
      height: 22.46,
    },
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
    section: 'BAGIAN 2, LEVEL 6',
    unitLabel: 'Level 6',
    islandName: 'Pulau Puncak Nusantara',
    title: 'Percakapan Lancar & Budaya Tuli Indonesia',
    subtitle: 'Etika komunikasi publik, cerita berurutan, dan ekspresi mahir',
    xpReward: 60,
    gemReward: 50,
    dayNodePos: { x: 81.28, y: 13.46 },
    sunsetNodePos: { x: 77.45, y: 11.92 },
    dayMascotPos: { x: 69.2, y: 14.0 },
    sunsetMascotPos: { x: 66.2, y: 12.4 },
    dayLayerBox: {
      src: '/assets/island-day-6.png',
      left: 57.34,
      top: 2.54,
      width: 41.06,
      height: 24.85,
    },
    sunsetLayerBox: {
      src: '/assets/island-autumn-6.png',
      left: 57.02,
      top: 5.77,
      width: 41.17,
      height: 20.38,
    },
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

const DAYS_STREAK = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

const AVATAR_PRESETS = [
  { id: 'orangutan', label: 'Doora', src: '/assets/avatar-orangutan.png' },
  { id: 'tiger', label: 'Rimba', src: '/assets/avatar-tiger.png' },
  { id: 'komodo', label: 'Modo', src: '/assets/avatar-komodo.png' },
]

// Helper: Resize foto yang di-upload user menjadi 240x240 JPEG agar ringan & cepat disimpan
function resizeImageFileToDataUrl(file, maxSize = 240) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = maxSize
        canvas.height = maxSize
        const ctx = canvas.getContext('2d')
        const minSide = Math.min(img.width, img.height)
        const sx = (img.width - minSide) / 2
        const sy = (img.height - minSide) / 2
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

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

const IconKamus = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-6 h-6 shrink-0 transition-colors ${
      active ? 'text-[#E02424]' : 'text-[#B3B3B3]'
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 6h10" />
    <path d="M6 10h10" />
    <path d="M6 14h6" />
  </svg>
)

const IconLeaderboard = ({ active }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-6 h-6 shrink-0 transition-colors ${
      active ? 'text-[#E02424]' : 'text-[#B3B3B3]'
    }`}
    fill="currentColor"
  >
    <path d="M12 2a1 1 0 0 1 1 1v1h3a2 2 0 0 1 2 2v2a4 4 0 0 1-3.17 3.92A6 6 0 0 1 13 16.92V19h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.08A6 6 0 0 1 9.17 11.92A4 4 0 0 1 6 8V6a2 2 0 0 1 2-2h3V3a1 1 0 0 1 1-1Zm-4 4H8v2a2 2 0 0 0 2 2h.2a6.04 6.04 0 0 1-.2-2V6Zm8 2V6h-.2v2c0 .69-.07 1.36-.2 2H16a2 2 0 0 0 2-2Z" />
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
// SCENERY FULL-SCREEN DUA MODE (LANGIT CERAH & LANGIT SENJA)
// ============================================================
// ============================================================
// KARAKTER PEKERJA KONSTRUKSI ANIMATIF (HELM KUNING & ROMPI ORANYE)
// Bergaya kartun imut, proporsional, dan bergerak aktif
// ============================================================
// 1. Pekerja Martil / Mengetuk Kayu (Hammering Worker)
const ConstructionWorkerHammering = ({ x, y, flip = false }) => (
  <div
    style={{ left: x, top: y }}
    className={`absolute -translate-x-1/2 -translate-y-full w-9 sm:w-11 h-12 sm:h-14 pointer-events-none z-20 ${
      flip ? '-scale-x-100' : ''
    }`}
  >
    <svg viewBox="0 0 50 65" className="w-full h-full overflow-visible drop-shadow-sm">
      {/* Bayangan Kaki */}
      <ellipse cx="25" cy="62" rx="12" ry="3.5" fill="#000000" fillOpacity="0.22" />

      {/* Sepatu & Celana Biru Konstruksi */}
      <rect x="18" y="47" width="5.5" height="13" rx="2" fill="#2563EB" />
      <rect x="26.5" y="47" width="5.5" height="13" rx="2" fill="#1D4ED8" />
      <ellipse cx="19.5" cy="60" rx="3.5" ry="2" fill="#334155" />
      <ellipse cx="28" cy="60" rx="3.5" ry="2" fill="#1E293B" />

      {/* Badan & Rompi Oranye Keselamatan Kerja */}
      <rect x="16" y="30" width="18" height="19" rx="4" fill="#EA580C" />
      {/* Strip Reflektif Neon */}
      <rect x="18" y="34" width="14" height="2.5" fill="#FEF08A" />
      <rect x="18" y="40" width="14" height="2.5" fill="#FEF08A" />

      {/* Kepala & Wajah Ramah */}
      <circle cx="25" cy="22" r="7.5" fill="#FED7AA" />
      <circle cx="27" cy="22" r="1.2" fill="#1E293B" />
      <path d="M 25 25 Q 27 27 28 25" stroke="#9A3412" strokeWidth="1" fill="none" />

      {/* Helm Proyek Kuning (Safety Hard Hat) */}
      <path d="M 17 19 Q 25 10 33 19 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
      <rect x="15" y="18" width="20" height="3" rx="1.5" fill="#EAB308" />

      {/* Lengan Mengayun Martil Halus */}
      <motion.g
        animate={{ rotate: [0, -32, 18, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '20px', originY: '33px' }}
      >
        <line x1="20" y1="33" x2="10" y2="39" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
        <circle cx="9" cy="39" r="2.5" fill="#FED7AA" />
        {/* Tangkai Martil & Kepala Martil */}
        <line x1="8" y1="42" x2="12" y2="28" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="8" y="27" width="8" height="4.5" rx="1" fill="#64748B" />
      </motion.g>

      {/* Percikan Partikel Ketukan */}
      <motion.circle
        cx="14"
        cy="28"
        r="1.8"
        fill="#FDE047"
        animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0], y: [0, -4] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  </div>
)

// 2. Pekerja Arsitek / Pengawas Membawa Peta Blueprint Gulung
const ConstructionWorkerBlueprint = ({ x, y, flip = false }) => (
  <div
    style={{ left: x, top: y }}
    className={`absolute -translate-x-1/2 -translate-y-full w-9 sm:w-11 h-12 sm:h-14 pointer-events-none z-20 ${
      flip ? '-scale-x-100' : ''
    }`}
  >
    <svg viewBox="0 0 50 65" className="w-full h-full overflow-visible drop-shadow-sm">
      <ellipse cx="25" cy="62" rx="12" ry="3.5" fill="#000000" fillOpacity="0.22" />

      {/* Celana & Sepatu */}
      <rect x="18" y="47" width="5.5" height="13" rx="2" fill="#334155" />
      <rect x="26.5" y="47" width="5.5" height="13" rx="2" fill="#1E293B" />
      <ellipse cx="19.5" cy="60" rx="3.5" ry="2" fill="#0F172A" />
      <ellipse cx="28" cy="60" rx="3.5" ry="2" fill="#0F172A" />

      {/* Kemeja & Rompi Hijau Pengawas */}
      <rect x="16" y="30" width="18" height="19" rx="4" fill="#059669" />
      <rect x="18" y="35" width="14" height="2.5" fill="#A7F3D0" />

      {/* Kepala & Kacamata Pelindung */}
      <circle cx="25" cy="22" r="7.5" fill="#FED7AA" />
      <rect x="23" y="20.5" width="6" height="3" rx="1.2" fill="#38BDF8" opacity="0.85" />

      {/* Helm Putih Insinyur/Pengawas */}
      <path d="M 17 19 Q 25 10 33 19 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
      <rect x="15" y="18" width="20" height="3" rx="1.5" fill="#E2E8F0" />

      {/* Lengan Membuka/Membaca Peta Blueprint (Kertas Gulung Biru) */}
      <motion.g
        animate={{ rotate: [-2, 4, -2], y: [0, -1, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <line x1="16" y1="36" x2="22" y2="42" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="33" y1="36" x2="28" y2="42" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
        {/* Lembar Peta Blueprint */}
        <polygon points="18,36 34,35 33,48 17,49" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.8" />
        <line x1="20" y1="40" x2="31" y2="39" stroke="#E0F2FE" strokeWidth="1" />
        <line x1="20" y1="44" x2="28" y2="43" stroke="#E0F2FE" strokeWidth="1" />
      </motion.g>
    </svg>
  </div>
)

// 3. Pekerja Mendorong Gerobak Sorong Material (Wheelbarrow Worker)
const ConstructionWorkerWheelbarrow = ({ x, y, flip = false }) => (
  <div
    style={{ left: x, top: y }}
    className={`absolute -translate-x-1/2 -translate-y-full w-14 sm:w-16 h-12 sm:h-14 pointer-events-none z-20 ${
      flip ? '-scale-x-100' : ''
    }`}
  >
    <svg viewBox="0 0 75 65" className="w-full h-full overflow-visible drop-shadow-sm">
      <ellipse cx="38" cy="62" rx="22" ry="4" fill="#000000" fillOpacity="0.22" />

      {/* Roda Gerobak */}
      <circle cx="16" cy="56" r="6" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
      <circle cx="16" cy="56" r="2" fill="#E2E8F0" />
      {/* Bak Gerobak Sorong Oranye Berisi Pasir/Batu */}
      <polygon points="11,46 36,44 32,54 18,55" fill="#EA580C" stroke="#C2410C" strokeWidth="1.2" />
      {/* Tumpukan Pasir/Batu */}
      <path d="M 14 45 Q 24 37 34 44 Z" fill="#D97706" />
      {/* Kaki Penyangga & Pegangan Gerobak */}
      <line x1="29" y1="52" x2="29" y2="60" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="48" x2="48" y2="41" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />

      {/* Pekerja Sedang Mendorong di Belakang Gerobak */}
      {/* Kaki Melangkah */}
      <line x1="52" y1="46" x2="48" y2="60" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="56" y1="46" x2="62" y2="60" stroke="#1D4ED8" strokeWidth="4.5" strokeLinecap="round" />

      {/* Badan Condong ke Depan */}
      <motion.g
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon points="46,30 58,29 55,47 46,47" fill="#EA580C" />
        <line x1="47" y1="36" x2="57" y2="35" stroke="#FEF08A" strokeWidth="2" />
        {/* Kepala & Helm */}
        <circle cx="53" cy="22" r="6.5" fill="#FED7AA" />
        <path d="M 46 20 Q 53 12 60 20 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
        <rect x="45" y="19" width="16" height="2.5" rx="1.2" fill="#EAB308" />
        {/* Tangan Memegang Handle */}
        <line x1="50" y1="34" x2="46" y2="41" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
      </motion.g>
    </svg>
  </div>
)

// ============================================================
// ELEMEN DEKORASI KONSTRUKSI TIAP PULAU BERBEDA SECARA TEMATIK
// ============================================================
const ConstructionSceneryOnIsland = ({ unitId, isBright }) => {
  // PULAU 3: Konstruksi Penggalian & Pemasangan Pipa/Batu Pondasi
  if (unitId === 3) {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {/* Pekerja Martil Memperbaiki Pondasi Kincir */}
        <ConstructionWorkerHammering x="62%" y="42%" flip={true} />
        {/* Kerucut Pengaman Rapi di Pinggir Jalan */}
        <div style={{ left: '76%', top: '48%' }} className="absolute -translate-x-1/2 -translate-y-full w-5 h-6">
          <svg viewBox="0 0 28 32" className="w-full h-full drop-shadow-xs">
            <ellipse cx="14" cy="28" rx="11" ry="3.5" fill="#000000" fillOpacity="0.22" />
            <polygon points="14,4 6,27 22,27" fill="#EA580C" />
            <polygon points="14,13 9,21 19,21" fill="#FFFFFF" />
          </svg>
        </div>
        {/* Tumpukan Balok Kayu Material */}
        <div style={{ left: '32%', top: '56%' }} className="absolute -translate-x-1/2 -translate-y-full w-8 h-5">
          <svg viewBox="0 0 36 22" className="w-full h-full drop-shadow-xs">
            <ellipse cx="18" cy="19" rx="14" ry="3" fill="#000000" fillOpacity="0.2" />
            <rect x="4" y="11" width="28" height="6" rx="1.5" fill="#B45309" stroke="#78350F" strokeWidth="0.8" />
            <rect x="7" y="5" width="22" height="6" rx="1.5" fill="#D97706" stroke="#92400E" strokeWidth="0.8" />
          </svg>
        </div>
      </div>
    )
  }

  // PULAU 4: Konstruksi Taman & Penghijauan (Pekerja Gerobak & Pembatas)
  if (unitId === 4) {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {/* Pekerja Mengangkut Material dengan Gerobak Sorong */}
        <ConstructionWorkerWheelbarrow x="38%" y="40%" flip={false} />
        {/* Papan Palang Garis Konstruksi Oranye-Kuning */}
        <motion.div
          animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ left: '68%', top: '46%' }}
          className="absolute -translate-x-1/2 -translate-y-full w-9 sm:w-11 h-6"
        >
          <svg viewBox="0 0 44 26" className="w-full h-full drop-shadow-xs">
            <ellipse cx="22" cy="24" rx="18" ry="2.5" fill="#000000" fillOpacity="0.18" />
            <line x1="8" y1="23" x2="8" y2="4" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="36" y1="23" x2="36" y2="4" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="4" y="6" width="36" height="10" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <line x1="10" y1="6" x2="16" y2="16" stroke="#FFFFFF" strokeWidth="2.2" />
            <line x1="20" y1="6" x2="26" y2="16" stroke="#FFFFFF" strokeWidth="2.2" />
            <line x1="30" y1="6" x2="36" y2="16" stroke="#FFFFFF" strokeWidth="2.2" />
          </svg>
        </motion.div>
      </div>
    )
  }

  // PULAU 5: Konstruksi Bangunan Gedung & Pemantauan (Insinyur Peta & Scaffolding Kecil)
  if (unitId === 5) {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {/* Arsitek Pengawas Membaca Blueprint */}
        <ConstructionWorkerBlueprint x="44%" y="42%" flip={false} />
        {/* Kerangka Scaffolding Rapi di Sisi Lereng Rumput */}
        <div style={{ left: '72%', top: '38%' }} className="absolute -translate-x-1/2 -translate-y-full w-9 sm:w-11 h-12">
          <svg viewBox="0 0 45 55" className="w-full h-full drop-shadow-xs">
            <ellipse cx="22" cy="52" rx="16" ry="3" fill="#000000" fillOpacity="0.18" />
            <rect x="8" y="10" width="3" height="42" rx="1" fill="#B45309" />
            <rect x="34" y="10" width="3" height="42" rx="1" fill="#B45309" />
            <line x1="8" y1="22" x2="37" y2="22" stroke="#D97706" strokeWidth="2" />
            <line x1="8" y1="36" x2="37" y2="36" stroke="#D97706" strokeWidth="2" />
            <line x1="10" y1="22" x2="35" y2="36" stroke="#92400E" strokeWidth="1.2" />
            <line x1="10" y1="36" x2="35" y2="22" stroke="#92400E" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
    )
  }

  // PULAU 6: Puncak Nusantara - Derek Katrol Angkat Batu & Pekerja Martil
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
      {/* Derek Katrol Kayu Tradisional yang Menancap Kokoh di Atas Tanah Puncak */}
      <div style={{ left: '38%', top: '32%' }} className="absolute -translate-x-1/2 -translate-y-full w-12 sm:w-14 h-16 sm:h-20">
        <svg viewBox="0 0 65 90" className="w-full h-full drop-shadow-sm">
          <ellipse cx="32" cy="86" rx="16" ry="3.5" fill="#000000" fillOpacity="0.22" />
          {/* Tripod Tiang Kayu */}
          <line x1="14" y1="84" x2="32" y2="18" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="84" x2="32" y2="18" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="85" x2="32" y2="18" stroke="#B45309" strokeWidth="2.5" />
          {/* Roda Katrol Logam Berputar */}
          <circle cx="32" cy="22" r="5" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
          {/* Tali & Beban Peti Kayu Terangkat Naik-Turun */}
          <motion.g
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <line x1="32" y1="26" x2="32" y2="52" stroke="#475569" strokeWidth="1.2" strokeDasharray="3 2" />
            <rect x="25" y="52" width="14" height="12" rx="1.5" fill="#D97706" stroke="#92400E" strokeWidth="1" />
            <line x1="25" y1="58" x2="39" y2="58" stroke="#78350F" strokeWidth="0.8" />
          </motion.g>
        </svg>
      </div>

      {/* Pekerja Martil Mengetuk di Dekat Derek */}
      <ConstructionWorkerHammering x="66%" y="42%" flip={false} />
    </div>
  )
}

// ============================================================
// KOMPONEN 1–2 AWAN TIPIS HALUS PADA PULAU COMING SOON (LEVEL 3-6)
// Hanya 1 atau 2 awan tipis melayang lembut di atas pulau, sehingga
// pulau tetap terlihat jelas dengan atmosfer estetis.
// ============================================================
const ComingSoonFloatingClouds = ({ skyMode }) => {
  const isBright = skyMode === 'bright'
  const backFill = isBright ? '#BAE6FD' : '#FED7AA'
  const frontFill = isBright ? '#FFFFFF' : '#FFEDD5'

  // Tepat 2 awan tipis halus (opacity lembut, pulau tetap terlihat jelas)
  const clouds = [
    {
      left: '12%',
      top: '22%',
      w: 86,
      h: 46,
      opacity: 0.62,
      duration: 5.4,
      delay: 0,
      dx: 6,
      dy: -3,
    },
    {
      left: '52%',
      top: '46%',
      w: 70,
      h: 38,
      opacity: 0.52,
      duration: 6.2,
      delay: 0.8,
      dx: -5,
      dy: 3,
    },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-visible">
      {clouds.map((c, i) => (
        <motion.div
          key={`subtle-cloud-${i}`}
          style={{
            position: 'absolute',
            left: c.left,
            top: c.top,
            width: `${c.w}px`,
            height: `${c.h}px`,
            opacity: c.opacity,
          }}
          animate={{
            x: [0, c.dx, 0],
            y: [0, c.dy, 0],
          }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: c.delay,
          }}
          className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.06)]"
        >
          <svg viewBox="0 0 100 56" className="w-full h-full overflow-visible">
            {/* Layer Awan Belakang */}
            <path
              d="M12 44 Q4 44 4 36 Q4 26 16 26 Q20 12 34 12 Q42 12 48 18 Q54 6 70 6 Q86 6 90 22 Q98 24 98 34 Q98 44 88 44 Z"
              fill={backFill}
              opacity="0.75"
            />
            {/* Layer Awan Depan */}
            <path
              d="M16 46 Q10 46 10 39 Q10 30 20 30 Q24 18 36 18 Q43 18 48 24 Q54 14 68 14 Q82 14 86 28 Q94 30 94 38 Q94 46 84 46 Z"
              fill={frontFill}
              opacity="0.88"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

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
      {isBright && (
        <>
          <div
            style={{
              background:
                'linear-gradient(162deg, rgba(255,255,255,0.34) 0%, rgba(186,230,253,0.16) 55%, rgba(255,255,255,0) 100%)',
              clipPath: 'polygon(19% 0%, 25% 0%, 46% 100%, 34% 100%)',
            }}
            className="absolute inset-0"
          />

          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 4, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/2 -translate-x-1/2 -top-14 w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center"
          >
            <svg viewBox="0 0 260 260" className="w-full h-full">
              <polygon
                points="130,10 205,38 242,110 218,188 148,232 68,215 20,148 38,65"
                fill="#FFFFFF"
                fillOpacity="0.28"
              />
              <polygon
                points="130,36 188,58 214,114 196,172 142,204 82,190 48,140 62,80"
                fill="#FFFFFF"
                fillOpacity="0.42"
              />
              <polygon
                points="130,64 170,78 188,118 175,156 138,176 96,166 74,132 85,92"
                fill="#FFFFFF"
                fillOpacity="0.65"
              />
              <circle cx="130" cy="120" r="30" fill="#FFFFFF" />
            </svg>
            <div className="absolute top-[74%] left-[32%] w-16 h-16 rotate-12 bg-[#7DD3FC]/35 backdrop-blur-[1px] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]" />
            <div className="absolute top-[96%] left-[22%] w-11 h-11 rotate-45 bg-[#38BDF8]/30 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]" />
          </motion.div>

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

      {!isBright && (
        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.75, 0.92, 0.75] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 -translate-x-1/2 top-8 w-56 h-56 rounded-full bg-gradient-to-b from-[#FFF7DF] to-[#FDBA74]/40 blur-md"
        />
      )}

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

      <AnimatedBirdFlock className="absolute left-[18%] top-[22%]" delay={0} duration={16} scale={0.95} />
      <AnimatedBirdFlock className="absolute right-[16%] top-[10%]" delay={1.2} duration={19} scale={0.9} />
      <AnimatedBirdFlock className="absolute right-[12%] top-[48%]" delay={2.4} duration={17} scale={0.88} />
      <AnimatedBirdFlock className="absolute left-[42%] bottom-[8%]" delay={0.8} duration={15} scale={0.82} />
    </div>
  )
}

// ============================================================
// ORNAMEN & ANIMASI MIKRO TIAP PULAU (KUPU-KUPU, DAUN JATUH,
// ALIRAN AIR + IKAN MELOMPAT DI SUNGAI, & KINCIR ANGIN PULAU 3)
// ============================================================
const AnimatedButterfly = ({
  left,
  top,
  colorPrimary = '#F472B6',
  colorSecondary = '#FDE047',
  delay = 0,
  duration = 5.2,
  dx = 14,
  dy = -10,
}) => (
  <motion.div
    style={{ left, top }}
    animate={{
      x: [0, dx, -dx * 0.45, dx * 0.6, 0],
      y: [0, dy, dy * 0.4, dy * 1.1, 0],
      rotate: [-10, 12, -6, 10, -10],
    }}
    transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
    className="absolute w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-20"
  >
    <motion.svg
      viewBox="0 0 32 32"
      className="w-full h-full overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
      animate={{ scaleX: [1, 0.28, 1, 0.32, 1] }}
      transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <path
        d="M15 16 C8 5, 1 8, 4 16 C1 22, 8 26, 15 18 Z"
        fill={colorPrimary}
        stroke="#FFFFFF"
        strokeWidth="1"
      />
      <path
        d="M17 16 C24 5, 31 8, 28 16 C31 22, 24 26, 17 18 Z"
        fill={colorPrimary}
        stroke="#FFFFFF"
        strokeWidth="1"
      />
      <circle cx="9" cy="13" r="2.2" fill={colorSecondary} />
      <circle cx="23" cy="13" r="2.2" fill={colorSecondary} />
      <rect x="15" y="10" width="2" height="12" rx="1" fill="#44403C" />
    </motion.svg>
  </motion.div>
)

const FallingLeavesGroup = ({ leaves, isBright }) => {
  const leafColor = isBright ? '#84CC16' : '#FB7185'
  const leafStroke = isBright ? '#4D7C0F' : '#BE123C'
  return (
    <>
      {leaves.map((leaf, idx) => (
        <motion.div
          key={`leaf-${idx}`}
          style={{ left: leaf.x, top: leaf.y }}
          animate={{
            y: [0, 18, 36, 52],
            x: [0, -9, 7, -4],
            rotate: [0, 48, -32, 65],
            opacity: [0, 0.95, 0.9, 0],
          }}
          transition={{
            duration: leaf.duration || 4.8,
            repeat: Infinity,
            delay: leaf.delay || idx * 1.3,
            ease: 'easeInOut',
          }}
          className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 pointer-events-none z-20"
        >
          <svg viewBox="0 0 20 20" className="w-full h-full drop-shadow-2xs">
            <path
              d="M17 3 C10 3, 4 7, 3 16 C11 15, 16 10, 17 3 Z"
              fill={idx % 2 === 0 ? leafColor : isBright ? '#A3E635' : '#F59E0B'}
              stroke={leafStroke}
              strokeWidth="1.2"
            />
            <path d="M3 16 Q10 10 16 4" stroke={leafStroke} strokeWidth="1" fill="none" />
          </svg>
        </motion.div>
      ))}
    </>
  )
}

const RiverStreamWithJumpingFish = ({ left, top, isBright }) => (
  <div
    style={{ left, top }}
    className="absolute -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 h-20 sm:h-24 pointer-events-none z-15"
  >
    {/* Animasi Garis Aliran Air Sungai Mengalir & Riak Air */}
    <svg viewBox="0 0 150 110" className="w-full h-full overflow-visible">
      <motion.path
        d="M 28 24 Q 58 46, 86 64 T 124 88"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="12 18"
        animate={{ strokeDashoffset: [60, 0] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: 'linear' }}
        opacity="0.88"
      />
      <motion.path
        d="M 18 36 Q 48 56, 78 74 T 112 94"
        fill="none"
        stroke={isBright ? '#E0F2FE' : '#FFFFFF'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="9 16"
        animate={{ strokeDashoffset: [50, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: 0.5 }}
        opacity="0.8"
      />
      <motion.path
        d="M 42 18 Q 70 38, 98 56 T 134 78"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="8 16"
        animate={{ strokeDashoffset: [48, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: 0.9 }}
        opacity="0.75"
      />

      {/* Riak Air Tempat Ikan Melompat & Mendarat */}
      <motion.ellipse
        cx="46"
        cy="44"
        rx="8"
        ry="3.8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        animate={{ scale: [0.4, 1.45, 1.8], opacity: [0, 0.9, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: 0.1 }}
      />
      <motion.ellipse
        cx="96"
        cy="72"
        rx="9"
        ry="4.2"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        animate={{ scale: [0.4, 1.5, 1.9], opacity: [0, 0.95, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: 1.35 }}
      />
    </svg>

    {/* Ikan Kecil Melompat Melengkung di Atas Aliran Sungai */}
    <motion.div
      animate={{
        x: [-18, 2, 22],
        y: [6, -18, 20],
        rotate: [-35, 12, 58],
        opacity: [0, 1, 1, 0],
        scale: [0.65, 1.05, 0.75],
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.45, 0.85, 1],
      }}
      className="absolute left-[31%] top-[34%] w-6 h-4 sm:w-7 sm:h-5"
    >
      <svg viewBox="0 0 36 22" className="w-full h-full drop-shadow-[0_3px_4px_rgba(0,0,0,0.22)]">
        <path
          d="M8 11 L1 4 L3 11 L1 18 Z"
          fill="#F97316"
          stroke="#FFFFFF"
          strokeWidth="1"
        />
        <path
          d="M7 11 C11 4, 24 4, 32 11 C24 18, 11 18, 7 11 Z"
          fill="#FB923C"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        <path d="M16 6 Q19 2 22 6" fill="#FDE047" />
        <circle cx="26.5" cy="9.5" r="1.6" fill="#1E293B" />
        <circle cx="27" cy="9" r="0.6" fill="#FFFFFF" />
      </svg>
    </motion.div>
  </div>
)

// Kincir Angin di Pulau ke-3: Dibuat menyentuh tanah rumput Pulau 3 dengan bayangan & rumput dasar yang menyatu
const GroundedWindmillOnIsland3 = ({ isBright }) => {
  const groundX = isBright ? '41.2%' : '33.8%'
  const groundY = isBright ? '51.2%' : '51.0%'
  const turfColor = isBright ? '#637431' : '#B20010'
  const turfHighlight = isBright ? '#95AE47' : '#EF6C74'

  return (
    <div
      style={{ left: groundX, top: groundY }}
      className="absolute -translate-x-1/2 -translate-y-full w-14 sm:w-[74px] h-20 sm:h-[104px] flex flex-col items-center pointer-events-none z-20"
    >
      {/* Menara Kincir Angin yang Menyentuh Tanah Pulau ke-3 */}
      <svg viewBox="0 0 110 145" className="w-full h-full overflow-visible">
        {/* Bayangan Elips Menyatu di Atas Tanah Pulau 3 */}
        <ellipse cx="55" cy="138" rx="28" ry="8" fill={turfColor} fillOpacity="0.65" />
        <ellipse cx="55" cy="137" rx="22" ry="5.5" fill="#000000" fillOpacity="0.22" />

        {/* Pondasi Batu Bawah yang Menapak Tanah */}
        <path
          d="M33 136 L77 136 L73 118 L37 118 Z"
          fill="#8C7A6B"
          stroke="#5C4D42"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M33 136 Q55 141 77 136" stroke="#4A3B31" strokeWidth="3" fill="none" />

        {/* Badan Menara Kayu/Bata Kincir */}
        <polygon
          points="37,120 73,120 64,54 46,54"
          fill="#F5EBE1"
          stroke="#6E473B"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Sisi Bayangan Menara untuk Efek 3D Isometrik */}
        <polygon points="56,120 73,120 64,54 55,54" fill="#E3D2C2" />

        {/* Sabuk Kayu Horizontal */}
        <line x1="41" y1="88" x2="69" y2="88" stroke="#7C4D3A" strokeWidth="3" />

        {/* Pintu Kayu Lengkung di Dasar Menara */}
        <path
          d="M48 136 L48 112 A7 7 0 0 1 62 112 L62 136 Z"
          fill="#6E3B2B"
          stroke="#4A251A"
          strokeWidth="2"
        />
        {/* Jendela Kecil Menara */}
        <rect
          x="50"
          y="69"
          width="10"
          height="11"
          rx="5"
          fill="#FEF08A"
          stroke="#6E3B2B"
          strokeWidth="2"
        />

        {/* Kubah Atap Kincir */}
        <path
          d="M41 56 Q55 30 69 56 Z"
          fill="#D9383A"
          stroke="#7F1D1D"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        {/* Rumput Kecil di Depan Pondasi agar Terlihat Tertanam Rapi di Tanah Pulau 3 */}
        <path
          d="M28 137 Q32 128 36 137 Q40 130 44 138 M66 138 Q70 129 74 137 Q78 130 82 137"
          stroke={turfHighlight}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Baling-Baling Kincir Angin Berputar Halus */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[11%] w-16 h-16 sm:w-[86px] sm:h-[86px] flex items-center justify-center"
      >
        <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible drop-shadow-xs">
          {/* 4 Bilah Baling-Baling Kayu Ber kisi-kisi */}
          {[0, 90, 180, 270].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 60 60)`}>
              <line
                x1="60"
                y1="60"
                x2="60"
                y2="6"
                stroke="#5C3424"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <polygon
                points="60,10 75,13 73,46 60,46"
                fill="#FFFDF7"
                stroke="#854D37"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line x1="60" y1="22" x2="74" y2="23" stroke="#C29B7F" strokeWidth="1.4" />
              <line x1="60" y1="34" x2="73" y2="35" stroke="#C29B7F" strokeWidth="1.4" />
            </g>
          ))}
          <circle cx="60" cy="60" r="7.5" fill="#D9383A" stroke="#FFFDF7" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="3" fill="#FEF08A" />
        </svg>
      </motion.div>
    </div>
  )
}

const IslandOrnamentForUnit = ({ unitId, skyMode }) => {
  const isBright = skyMode === 'bright'

  if (unitId === 1) {
    return (
      <>
        <AnimatedButterfly
          left={isBright ? '12.5%' : '14.2%'}
          top={isBright ? '74.5%' : '76.5%'}
          colorPrimary={isBright ? '#F472B6' : '#FBBF24'}
          colorSecondary="#FFFFFF"
          delay={0}
        />
        <FallingLeavesGroup
          isBright={isBright}
          leaves={[
            { x: isBright ? '33.5%' : '36.8%', y: isBright ? '70.5%' : '74.0%', delay: 0.2 },
            { x: isBright ? '38.2%' : '40.5%', y: isBright ? '72.0%' : '75.5%', delay: 2.1 },
          ]}
        />
      </>
    )
  }

  if (unitId === 2) {
    return (
      <>
        {/* Di Langit Cerah (LEVEL), Sungai berada di Pulau 2 */}
        {isBright && <RiverStreamWithJumpingFish left="74.6%" top="64.6%" isBright={true} />}
        <AnimatedButterfly
          left={isBright ? '56.5%' : '82.5%'}
          top={isBright ? '61.2%' : '62.0%'}
          colorPrimary="#38BDF8"
          colorSecondary="#FEF08A"
          delay={1.1}
        />
        {!isBright && (
          <FallingLeavesGroup
            isBright={false}
            leaves={[
              { x: '61.5%', y: '60.2%', delay: 0.6 },
              { x: '64.2%', y: '62.0%', delay: 2.4 },
            ]}
          />
        )}
      </>
    )
  }

  if (unitId === 3) {
    return (
      <>
        {/* Kincir Angin di Pulau ke-3 yang Menyentuh Tanah */}
        <GroundedWindmillOnIsland3 isBright={isBright} />
        <FallingLeavesGroup
          isBright={isBright}
          leaves={[
            { x: isBright ? '35.5%' : '19.5%', y: isBright ? '44.5%' : '44.8%', delay: 0.4 },
            { x: isBright ? '41.5%' : '39.5%', y: isBright ? '43.2%' : '44.2%', delay: 1.9 },
            { x: isBright ? '32.0%' : '43.5%', y: isBright ? '46.2%' : '45.8%', delay: 3.3 },
          ]}
        />
      </>
    )
  }

  if (unitId === 4) {
    return (
      <>
        {/* Di Langit Senja (LEVEL AUTUMN), Sungai berada di Pulau 4 */}
        {!isBright && <RiverStreamWithJumpingFish left="75.2%" top="37.5%" isBright={false} />}
        {isBright && (
          <FallingLeavesGroup
            isBright={true}
            leaves={[
              { x: '70.5%', y: '32.5%', delay: 0.7 },
              { x: '73.8%', y: '34.0%', delay: 2.6 },
            ]}
          />
        )}
        <AnimatedButterfly
          left={isBright ? '88.2%' : '86.5%'}
          top={isBright ? '35.5%' : '34.8%'}
          colorPrimary="#A78BFA"
          colorSecondary="#FDE047"
          delay={0.8}
        />
      </>
    )
  }

  if (unitId === 5) {
    return (
      <>
        <FallingLeavesGroup
          isBright={isBright}
          leaves={[
            { x: isBright ? '41.2%' : '41.5%', y: isBright ? '19.2%' : '18.5%', delay: 0.3 },
            { x: isBright ? '44.5%' : '44.8%', y: isBright ? '20.8%' : '20.2%', delay: 2.2 },
          ]}
        />
        <AnimatedButterfly
          left="23.5%"
          top="21.8%"
          colorPrimary="#FB7185"
          colorSecondary="#FEF08A"
          delay={1.5}
        />
      </>
    )
  }

  if (unitId === 6) {
    return (
      <>
        {isBright && (
          <FallingLeavesGroup
            isBright={true}
            leaves={[
              { x: '68.5%', y: '7.8%', delay: 0.5 },
              { x: '74.2%', y: '9.2%', delay: 2.1 },
            ]}
          />
        )}
        <AnimatedButterfly
          left="87.5%"
          top="10.2%"
          colorPrimary="#FBBF24"
          colorSecondary="#FFFFFF"
          delay={0.4}
        />
      </>
    )
  }

  return null
}

// ============================================================
// TOMBOL NODE LEVEL 3D OVAL ISOMETRIK (SESUAI ASSET LEVEL.PNG & LEVEL AUTUMN.PNG)
// ============================================================
const IsometricLevelNodeButton = ({
  unit,
  isCompleted,
  isUnlocked,
  isCurrentActiveNode,
  skyMode,
  onClick,
  onDoubleClick,
}) => {
  const isBright = skyMode === 'bright'
  // Palet warna persis seperti oval node di LEVEL.png & LEVEL (AUTUMN).png
  const palette = isCompleted
    ? {
        topGradStart: '#6EE7B7',
        topGradEnd: '#10B981',
        sideGradStart: '#059669',
        sideGradEnd: '#047857',
        rimStroke: '#A7F3D0',
        innerShadow: '#047857',
      }
    : isUnlocked
    ? {
        topGradStart: '#FFE033',
        topGradEnd: '#F59E0B',
        sideGradStart: '#D97706',
        sideGradEnd: '#B45309',
        rimStroke: '#FEF08A',
        innerShadow: '#B45309',
      }
    : {
        topGradStart: '#C7BDB0',
        topGradEnd: '#8E8375',
        sideGradStart: '#6E6459',
        sideGradEnd: '#524940',
        rimStroke: '#DFD7CC',
        innerShadow: '#6E6459',
      }

  const gradTopId = `node-top-${unit.id}-${skyMode}`
  const gradSideId = `node-side-${unit.id}-${skyMode}`

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.94, y: 2 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className="relative w-14 h-10 sm:w-[72px] sm:h-[50px] flex items-center justify-center cursor-pointer focus:outline-none bg-transparent border-0 p-0"
    >
      <svg viewBox="0 0 92 64" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={gradTopId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.topGradStart} />
            <stop offset="100%" stopColor={palette.topGradEnd} />
          </linearGradient>
          <linearGradient id={gradSideId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.sideGradStart} />
            <stop offset="100%" stopColor={palette.sideGradEnd} />
          </linearGradient>
        </defs>

        {/* Bayangan Dasar Oval di Tanah/Sungai (Sesuai Asset) */}
        <ellipse
          cx="46"
          cy="38"
          rx="42"
          ry="23"
          fill={isBright ? 'rgba(45, 55, 25, 0.34)' : '#99000E'}
          fillOpacity={isBright ? '1' : '0.85'}
        />

        {/* Dinding Samping Silinder 3D Isometrik */}
        <path
          d="M 8 27 L 8 36 A 38 20 0 0 0 84 36 L 84 27 Z"
          fill={`url(#${gradSideId})`}
        />

        {/* Permukaan Atas Elips Isometrik */}
        <ellipse
          cx="46"
          cy="26"
          rx="38"
          ry="20"
          fill={`url(#${gradTopId})`}
          stroke={palette.rimStroke}
          strokeWidth="1.2"
        />

        {/* Kilau Lengkung Halus di Tepi Atas */}
        <path
          d="M 16 19 A 32 15 0 0 1 76 19"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Ikon di Atas Tombol Oval (Sesuai Perspektif Isometrik Asset) */}
        {isCompleted ? (
          <g>
            <path
              d="M 33 25 L 42 33 L 60 17"
              fill="none"
              stroke={palette.innerShadow}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.45"
              transform="translate(-1, -1.5)"
            />
            <path
              d="M 33 25 L 42 33 L 60 17"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : isUnlocked ? (
          /* Tanda Seru (!) Isometrik Miring Persis Seperti Pulau 1 di LEVEL.png */
          <g>
            {/* Bayangan Dalam (Embossed Effect) */}
            <path
              d="M 39 13 C 38 11, 43 9, 45 12 L 50 24 C 51 26, 47 27, 45 25 Z"
              fill={palette.innerShadow}
              opacity="0.55"
              transform="translate(-1.4, -1.4)"
            />
            <ellipse
              cx="50.5"
              cy="31.5"
              rx="3.8"
              ry="2.8"
              fill={palette.innerShadow}
              opacity="0.55"
            />
            {/* Batang & Titik Tanda Seru Putih */}
            <path
              d="M 39 13 C 38 11, 43 9, 45 12 L 50 24 C 51 26, 47 27, 45 25 Z"
              fill="#FFFFFF"
            />
            <ellipse cx="51.5" cy="32.5" rx="3.6" ry="2.6" fill="#FFFFFF" />
          </g>
        ) : (
          /* Ikon Gembok Putih (🔒) Persis Seperti Pulau Terkunci di LEVEL.png */
          <g>
            {/* Bayangan Dalam Gembok */}
            <path
              d="M 39 21 V 16 A 7 6.5 0 0 1 53 16 V 21"
              fill="none"
              stroke={palette.innerShadow}
              strokeWidth="3.6"
              strokeLinecap="round"
              transform="translate(0, -1.2)"
              opacity="0.55"
            />
            <ellipse
              cx="46"
              cy="26.5"
              rx="10.5"
              ry="8.5"
              fill={palette.innerShadow}
              opacity="0.45"
            />
            {/* Gagang & Badan Gembok Putih */}
            <path
              d="M 39 21 V 16 A 7 6.5 0 0 1 53 16 V 21"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <ellipse cx="46" cy="27.5" rx="10.5" ry="8.5" fill="#FFFFFF" />
            {/* Lubang Kunci di Tengah Gembok */}
            <circle cx="46" cy="26.2" r="2.1" fill="#786E62" />
            <polygon points="44.5,26.8 47.5,26.8 46.8,31.5 45.2,31.5" fill="#786E62" />
          </g>
        )}
      </svg>
    </motion.button>
  )
}

// ============================================================
// KOMPONEN UTAMA DASHBOARD / BERANDA (/belajar)
// ============================================================
const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, logout, updateProfile, updatePassword } = useAuth()
  const mapScrollRef = useRef(null)
  const mapStageRef = useRef(null)
  const fileInputRef = useRef(null)

  const [activeMenu, setActiveMenu] = useState('beranda')

  const [progress, setProgress] = useState(() =>
    progressService.getProgress(user?.id)
  )

  const [selectedUnitId, setSelectedUnitId] = useState(1)
  const [hoveredUnitId, setHoveredUnitId] = useState(null)
  const [clickedTooltipUnitId, setClickedTooltipUnitId] = useState(null)

  const [mapZoom, setMapZoom] = useState(1)
  const [skyMode, setSkyMode] = useState('bright')
  const [showStreakPopover, setShowStreakPopover] = useState(false)

  // Submenu tab untuk menu LAINNYA: 'pengaturan' | 'bantuan' | 'faq'
  const [lainnyaTab, setLainnyaTab] = useState('pengaturan')

  // Search & Filter state untuk menu KAMUS
  const [dictionarySearch, setDictionarySearch] = useState('')
  const [selectedDictModuleId, setSelectedDictModuleId] = useState(1)

  // Status sticker untuk LEADERBOARD
  const [userLeaderboardStatus, setUserLeaderboardStatus] = useState('🔥')

  // Real-time Leaderboard dari Supabase Profiles
  const [supabaseLeaderboard, setSupabaseLeaderboard] = useState([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false)

  const fetchRealLeaderboard = useCallback(async () => {
    setIsLoadingLeaderboard(true)
    try {
      const data = await progressService.getLeaderboard(10)
      setSupabaseLeaderboard(data || [])
    } catch (e) {
      console.warn('Gagal memuat leaderboard:', e)
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }, [])

  useEffect(() => {
    if (activeMenu === 'leaderboard') {
      fetchRealLeaderboard()
    }
  }, [activeMenu, fetchRealLeaderboard])

  // Form Ubah Password di menu PROFIL
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Settings preferences (Audio, Notifikasi, Mode Langit)
  const [settingsPref, setSettingsPref] = useState(() => {
    try {
      const saved = localStorage.getItem('handoora_user_settings')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      soundEffects: true,
      hapticFeedback: true,
      notifications: true,
      skyTheme: 'bright',
    }
  })

  // State Blur per Pulau saat pulau benar-benar terpotong batas tepi atas/bawah layar scroll
  const [islandBlurs, setIslandBlurs] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  })

  // Modal Sesi Lanjut/Ulang Kuis & Kuis Interaktif
  const [levelSessionModalUnit, setLevelSessionModalUnit] = useState(null)
  const [savedSessionData, setSavedSessionData] = useState(null)
  const [guideUnit, setGuideUnit] = useState(null)

  // Form Profil Pengguna + Ganti Foto Profil
  const [profileForm, setProfileForm] = useState({
    nama: user?.nama || 'Sobat Handoora',
    umur: user?.umur || 20,
    avatar_url: user?.avatar_url || '/assets/avatar-orangutan.png',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  useEffect(() => {
    if (user?.id) {
      setProfileForm({
        nama: user.nama || 'Sobat Handoora',
        umur: user.umur || 20,
        avatar_url: user.avatar_url || '/assets/avatar-orangutan.png',
      })

      progressService.syncFromSupabase(user.id).then((remote) => {
        if (remote) {
          setProgress(remote)
        }
      })
    }
  }, [user])

  // Tentukan SATU node level yang sedang ter-unlock saat ini (mulai dari Level 1)
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

  // Hitung secara proporsional tingkat blur pulau HANYA ketika pulau benar-benar terpotong di tepi layar
  // sehingga tidak mengganggu jarak pandang mata di area tengah layar
  const updateIslandScrollBlurs = useCallback(() => {
    const scrollEl = mapScrollRef.current
    const stageEl = mapStageRef.current
    if (!scrollEl || !stageEl) return

    const viewRect = scrollEl.getBoundingClientRect()
    const stageRect = stageEl.getBoundingClientRect()

    // Zona tepi sangat tipis & proporsional (14px dari batas atas/bawah container scroll)
    const topSafeEdge = viewRect.top + 14
    const bottomSafeEdge = viewRect.bottom - 14
    const fadeZone = 50

    const nextBlurs = {}
    for (const unit of ISLAND_UNITS) {
      // Tidak memberikan blur pada pulau teratas (Level 5 & 6) di bagian atas agar pulau utuh menembus sampai batas atas
      const box = skyMode === 'bright' ? unit.dayLayerBox : unit.sunsetLayerBox
      const islTop = stageRect.top + (box.top / 100) * stageRect.height
      const islBottom =
        stageRect.top + ((box.top + box.height) / 100) * stageRect.height

      let cutRatio = 0
      if (unit.id < 5 && islTop < topSafeEdge) {
        cutRatio = Math.max(cutRatio, Math.min(1, (topSafeEdge - islTop) / fadeZone))
      }
      if (islBottom > bottomSafeEdge) {
        cutRatio = Math.max(cutRatio, Math.min(1, (islBottom - bottomSafeEdge) / fadeZone))
      }

      nextBlurs[unit.id] = +(cutRatio * 2.2).toFixed(2)
    }
    setIslandBlurs(nextBlurs)
  }, [skyMode])

  useEffect(() => {
    if (activeMenu === 'beranda' && mapScrollRef.current) {
      const el = mapScrollRef.current
      const targetUnit =
        ISLAND_UNITS.find((u) => u.id === currentActiveUnitId) || ISLAND_UNITS[0]
      const nodePos =
        skyMode === 'bright' ? targetUnit.dayNodePos : targetUnit.sunsetNodePos
      const targetY = (nodePos.y / 100) * el.scrollHeight
      el.scrollTo({
        top: Math.max(0, targetY - el.clientHeight * 0.54),
        behavior: 'smooth',
      })
      setTimeout(updateIslandScrollBlurs, 120)
      setTimeout(updateIslandScrollBlurs, 450)
    }
  }, [activeMenu, currentActiveUnitId, skyMode, updateIslandScrollBlurs])

  useEffect(() => {
    window.addEventListener('resize', updateIslandScrollBlurs)
    return () => window.removeEventListener('resize', updateIslandScrollBlurs)
  }, [updateIslandScrollBlurs])

  const selectedUnit =
    ISLAND_UNITS.find((u) => u.id === selectedUnitId) ||
    ISLAND_UNITS.find((u) => u.id === currentActiveUnitId) ||
    ISLAND_UNITS[0]

  // Mascot berdiri pada pulau level saat ini (atau pulau yang sedang dipilih jika sudah terbuka)
  const mascotUnit =
    progress.unlockedIslands.includes(selectedUnit.id) || selectedUnit.id === 1
      ? selectedUnit
      : ISLAND_UNITS.find((u) => u.id === currentActiveUnitId) || ISLAND_UNITS[0]

  const activeMascotPos =
    skyMode === 'bright' ? mascotUnit.dayMascotPos : mascotUnit.sunsetMascotPos

  const scrollToIsland = (unit) => {
    setSelectedUnitId(unit.id)
    setClickedTooltipUnitId(unit.id)
    if (mapScrollRef.current) {
      const el = mapScrollRef.current
      const nodePos = skyMode === 'bright' ? unit.dayNodePos : unit.sunsetNodePos
      const targetY = (nodePos.y / 100) * el.scrollHeight
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

  const checkSavedQuizSession = (unitId) => {
    const userId = user?.id || 'guest'
    for (let s = 1; s <= 3; s++) {
      const key = `handoora_session_progress_${userId}_L${unitId}_S${s}`
      const raw = localStorage.getItem(key)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          if (parsed?.remainingQuestionIds?.length > 0) {
            return { stageId: s, ...parsed }
          }
        } catch {
          // ignore
        }
      }
    }
    return null
  }

  const startQuiz = (unit) => {
    // Selama masa pengembangan, Level 3-6 dibuat Coming Soon
    if (unit.id >= 3) {
      toast('🚧 Level ini sedang dalam tahap pengembangan (Coming Soon)! Nantikan update terbarunya.', {
        icon: '✨',
        duration: 3500,
      })
      return
    }

    const isUnlocked = progress.unlockedIslands.includes(unit.id) || unit.id === 1
    if (!isUnlocked) {
      toast.error(
        `Selesaikan Level ${unit.id - 1} terlebih dahulu untuk membuka ${unit.unitLabel}! 🔒`
      )
      return
    }
    setClickedTooltipUnitId(null)
    setHoveredUnitId(null)

    // Cek apakah ada riwayat sesi kuis yang belum selesai untuk level ini
    const session = checkSavedQuizSession(unit.id)
    if (session) {
      setSavedSessionData(session)
      setLevelSessionModalUnit(unit)
      return
    }

    // Jika belum ada sesi tertunda, langsung buka QuizPage level tersebut
    navigate(`/quiz/${unit.id}/1`)
  }

  const handleResumeSavedSession = () => {
    if (!levelSessionModalUnit || !savedSessionData) return
    const stage = savedSessionData.stageId || 1
    const uId = levelSessionModalUnit.id
    setLevelSessionModalUnit(null)
    setSavedSessionData(null)
    navigate(`/quiz/${uId}/${stage}`)
  }

  const handleRestartQuizFromBeginning = () => {
    if (!levelSessionModalUnit) return
    const uId = levelSessionModalUnit.id
    const userId = user?.id || 'guest'
    // Bersihkan sesi tersimpan untuk level ini
    for (let s = 1; s <= 3; s++) {
      localStorage.removeItem(`handoora_session_progress_${userId}_L${uId}_S${s}`)
    }
    setLevelSessionModalUnit(null)
    setSavedSessionData(null)
    navigate(`/quiz/${uId}/1`)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Pilih file gambar (JPG, PNG, atau WEBP)')
      return
    }
    try {
      const dataUrl = await resizeImageFileToDataUrl(file, 240)
      setProfileForm((p) => ({ ...p, avatar_url: dataUrl }))
      toast.success('Foto profil dipilih! Klik Simpan Perubahan untuk menerapkan.')
    } catch {
      toast.error('Gagal memuat gambar, silakan coba foto lain.')
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      await updateProfile({
        nama: profileForm.nama.trim() || 'Sobat Handoora',
        umur: parseInt(profileForm.umur, 10) || 20,
        avatar_url: profileForm.avatar_url,
      })
      toast.success('Informasi profil berhasil diperbarui! ✨')
    } catch {
      toast.error('Gagal memperbarui profil, silakan coba lagi.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok!')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await updatePassword(passwordForm.newPassword)
      toast.success('Password akun Handoora berhasil diubah! 🔐')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah password.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleToggleSetting = (key) => {
    setSettingsPref((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      localStorage.setItem('handoora_user_settings', JSON.stringify(updated))
      if (key === 'skyTheme') {
        setSkyMode(updated.skyTheme ? 'bright' : 'sunset')
      }
      return updated
    })
    toast.success('Pengaturan berhasil diperbarui!')
  }

  const handleLogout = async () => {
    toast.success('Berhasil keluar dari akun')
    await logout()
  }

  const activeStreakDays = Math.min(7, Math.max(1, progress.streak % 8 || 1))
  const currentAvatar =
    profileForm.avatar_url || user?.avatar_url || '/assets/avatar-orangutan.png'

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

            {/* Menu Navigasi Utama: BERANDA, PROFIL, KAMUS, LEADERBOARD, LAINNYA */}
            <nav className="space-y-2">
              {[
                { id: 'beranda', label: 'BERANDA', Icon: IconBeranda },
                { id: 'profil', label: 'PROFIL', Icon: IconProfil },
                { id: 'kamus', label: 'KAMUS', Icon: IconKamus },
                { id: 'leaderboard', label: 'LEADERBOARD', Icon: IconLeaderboard },
                { id: 'lainnya', label: 'LAINNYA', Icon: IconLainnya },
              ].map(({ id, label, Icon }) => {
                const isActive = activeMenu === id
                return (
                  <motion.button
                    key={id}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveMenu(id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-[18px] font-extrabold text-[12.5px] tracking-wider uppercase transition-all cursor-pointer ${
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
              <img
                src={currentAvatar}
                alt={user?.nama || 'Profil'}
                className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[#EB2B36] bg-[#FFF1F2]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#333333] truncate">
                  {user?.nama || 'Sobat Handoora'}
                </p>
                <p className="text-[11px] font-bold text-[#E02424] truncate">
                  Level {currentActiveUnitId} • {progress.completedIslands.length}/{ISLAND_UNITS.length} Selesai
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
        {/* HEADER MOBILE (< lg) — HANYA LOGO & API STREAK               */}
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

          <button
            onClick={() => setShowStreakPopover((v) => !v)}
            className="px-3.5 py-1.5 rounded-xl bg-[#F8EFEF] border border-[#F5D0D0] flex items-center gap-1.5 cursor-pointer"
          >
            <IconFlame className="w-4 h-5" />
            <span className="text-xs font-black text-[#E02424]">{progress.streak}</span>
          </button>
        </header>

        {/* ============================================================ */}
        {/* 2. AREA UTAMA (BERANDA MAP / PROFIL / LAINNYA)               */}
        {/* ============================================================ */}
        <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          {/* ========================================================== */}
          {/* VIEW A: BERANDA (PETA 6 PULAU DENGAN SCROLL MENTOK KE ATAS)*/}
          {/* ========================================================== */}
          {activeMenu === 'beranda' && (
            <div className="relative flex-1 h-full w-full overflow-hidden">
              {/* FLOATING TOP BAR: Banner Level Aktif + API STREAK di Kanan Atas */}
              {/* Absolute overlay di atas scrollable map agar pulau dapat scroll tembus mentok ke tepi paling atas */}
              <div className="absolute top-0 left-0 right-0 z-40 px-4 sm:px-7 pt-3 sm:pt-5 pb-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
                <motion.div
                  key={selectedUnit.id}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="pointer-events-auto w-fit max-w-sm sm:max-w-md bg-gradient-to-r from-[#EB2B36] to-[#D91E2A] border-2 border-[#FCA5A5]/70 border-b-[5px] border-b-[#991B1B] rounded-2xl px-4 py-2 sm:py-2.5 shadow-[0_12px_28px_rgba(185,28,28,0.32)]"
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
                    <h2 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                      {selectedUnit.title}
                    </h2>
                    <p className="text-[11px] font-bold text-white/85 line-clamp-1 mt-0.5 leading-snug">
                      {selectedUnit.subtitle}
                    </p>
                  </div>
                </motion.div>

                {/* Kanan Atas: HANYA Api Streak (Sesuai Web - Beranda.png & Web - Beranda-1.png) */}
                <div className="pointer-events-auto relative flex items-center justify-end self-end md:self-auto">
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

                  {/* POPOVER "X hari beruntun" (Sesuai Desain Web - Beranda-1.png) */}
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
              {/* SCROLLABLE 6-ISLAND STAGE DENGAN AKSES PENUH HINGGA PALING ATAS */}
              {/* Menggunakan absolute inset-0 agar pulau teratas dapat scroll bebas nembus batas atas */}
              {/* ========================================================== */}
              <div
                ref={mapScrollRef}
                onScroll={updateIslandScrollBlurs}
                onClick={() => {
                  if (showStreakPopover) setShowStreakPopover(false)
                  if (clickedTooltipUnitId !== null) setClickedTooltipUnitId(null)
                }}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden px-3 sm:px-8 pt-20 sm:pt-24 pb-28 scroll-smooth"
              >
                <motion.div
                  ref={mapStageRef}
                  animate={{ scale: mapZoom, y: [0, -4, 0] }}
                  transition={{
                    scale: { type: 'spring', stiffness: 260, damping: 24 },
                    y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="relative w-full max-w-[740px] aspect-[940/1300] mx-auto select-none mt-2"
                >
                  {/* 1. RENDER TIAP PULAU SESUAI MODE LANGIT (CERAH: LEVEL.PNG / SENJA: LEVEL AUTUMN.PNG) */}
                  {ISLAND_UNITS.map((unit) => {
                    const box =
                      skyMode === 'bright' ? unit.dayLayerBox : unit.sunsetLayerBox
                    const blurVal = islandBlurs[unit.id] || 0
                    const opacityVal = Math.max(0.78, 1 - blurVal * 0.05)
                    const isComingSoon = unit.id >= 3

                    // Filter blur tepi scroll + filter abu-abu cerah/soft jika pulau masih tahap konstruksi (coming soon)
                    const filterParts = []
                    if (isComingSoon) {
                      filterParts.push('grayscale(100%) brightness(118%) contrast(88%)')
                    }
                    if (blurVal > 0.12) {
                      filterParts.push(`blur(${blurVal}px)`)
                    }
                    const combinedFilter = filterParts.length > 0 ? filterParts.join(' ') : 'none'

                    return (
                      <div
                        key={`island-layer-${unit.id}-${skyMode}`}
                        style={{
                          filter: combinedFilter,
                          opacity: opacityVal,
                        }}
                        className="absolute inset-0 pointer-events-none transition-[filter,opacity] duration-500 ease-out"
                      >
                        <img
                          src={box.src}
                          alt={unit.islandName}
                          style={{
                            left: `${box.left}%`,
                            top: `${box.top}%`,
                            width: `${box.width}%`,
                            height: `${box.height}%`,
                          }}
                          className="absolute object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-[filter] duration-500"
                          draggable={false}
                        />
                        <IslandOrnamentForUnit unitId={unit.id} skyMode={skyMode} />

                        {/* ANIMASI PULAU SEDANG TAHAP KONSTRUKSI (LEVEL 3 - 6) */}
                        {unit.id >= 3 && (
                          <div
                            style={{
                              left: `${box.left}%`,
                              top: `${box.top}%`,
                              width: `${box.width}%`,
                              height: `${box.height}%`,
                            }}
                            className="absolute pointer-events-none z-15 overflow-visible"
                          >
                            <ComingSoonFloatingClouds skyMode={skyMode} />
                            <ConstructionSceneryOnIsland unitId={unit.id} isBright={skyMode === 'bright'} />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* 2. MASCOT ORANG UTAN HD (SESUAI LANDING PAGE) DI PULAU LEVEL AKTIF */}
                  <motion.div
                    layout
                    initial={false}
                    animate={{
                      left: `${activeMascotPos.x}%`,
                      top: `${activeMascotPos.y}%`,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 170,
                      damping: 20,
                    }}
                    style={{
                      filter:
                        (islandBlurs[mascotUnit.id] || 0) > 0.15
                          ? `blur(${islandBlurs[mascotUnit.id]}px)`
                          : 'none',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      startQuiz(mascotUnit)
                    }}
                    className="absolute -translate-x-1/2 -translate-y-[84%] z-25 cursor-pointer group transition-[filter] duration-200"
                  >
                    {/* Bayangan Elips di Rumput Bawah Kaki Maskot */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-3.5 sm:h-4 rounded-full bg-black/28 blur-[2px]" />

                    {/* Karakter Maskot Orang Utan HD (Dari Landing Page) */}
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
                      className="w-16 sm:w-24 md:w-28 h-auto object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.34)]"
                      draggable={false}
                    />
                  </motion.div>

                  {/* 3. NODE LEVEL 3D OVAL ISOMETRIK PADA 6 PULAU + KETERANGAN LEVEL SAAT HOVER/KLIK */}
                  {ISLAND_UNITS.map((unit) => {
                    const isCompleted = progress.completedIslands.includes(unit.id)
                    const isUnlocked =
                      progress.unlockedIslands.includes(unit.id) || unit.id === 1
                    const isCurrentActiveNode = unit.id === currentActiveUnitId
                    const isTooltipVisible =
                      hoveredUnitId === unit.id || clickedTooltipUnitId === unit.id
                    const nodeBlur = islandBlurs[unit.id] || 0
                    const nodePos =
                      skyMode === 'bright' ? unit.dayNodePos : unit.sunsetNodePos

                    return (
                      <div
                        key={unit.id}
                        style={{
                          left: `${nodePos.x}%`,
                          top: `${nodePos.y}%`,
                          filter:
                            !isTooltipVisible && nodeBlur > 0.15
                              ? `blur(${nodeBlur * 0.85}px)`
                              : 'none',
                        }}
                        onMouseEnter={() => setHoveredUnitId(unit.id)}
                        onMouseLeave={() =>
                          setHoveredUnitId((prev) => (prev === unit.id ? null : prev))
                        }
                        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-[filter] duration-200 ${
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
                              className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-52 sm:w-60 z-[90]"
                            >
                              <div className="bg-white/98 backdrop-blur-md border-2 border-[#EB2B36] rounded-2xl p-3.5 text-center shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0F0] text-[10px] font-black text-[#E02424] uppercase tracking-wider">
                                    {unit.unitLabel} • {unit.islandName}
                                  </span>
                                </div>

                                <p className="text-xs sm:text-[13px] font-extrabold text-[#2B2B2B] leading-snug mb-3">
                                  {unit.title}
                                </p>

                                {unit.id >= 3 ? (
                                  <div className="w-full py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span>Sedang Tahap Konstruksi</span>
                                  </div>
                                ) : isUnlocked ? (
                                  <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      startQuiz(unit)
                                    }}
                                    className="w-full py-2 px-4 rounded-xl bg-gradient-to-b from-[#FF4754] to-[#E02424] border-b-4 border-b-[#991B1B] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                                  >
                                    <span>
                                      {checkSavedQuizSession(unit.id)
                                        ? 'LANJUTKAN KUIS'
                                        : isCompleted
                                        ? 'LATIH LAGI'
                                        : 'MULAI BELAJAR'}
                                    </span>
                                    <span className="text-[10px]">▶</span>
                                  </motion.button>
                                ) : (
                                  <div className="w-full py-2 px-3 rounded-xl bg-[#F0ECE6] border-b-3 border-b-[#C9C0B5] text-[#78716C] font-extrabold text-[11px] uppercase tracking-wider text-center">
                                    🔒 SELESAIKAN LEVEL {unit.id - 1}
                                  </div>
                                )}
                              </div>

                              <div className="w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-[#EB2B36] rotate-45 mx-auto -mt-2" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* ANIMASI BLUR SPREAD HANYA PADA NODE LEVEL YANG SEDANG TER-UNLOCK SAAT INI */}
                        {isCurrentActiveNode && (
                          <>
                            <motion.div
                              animate={{
                                scale: [1.05, 1.5, 1.05],
                                opacity: [0.6, 0.16, 0.6],
                              }}
                              transition={{
                                duration: 2.6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className="absolute -inset-3 sm:-inset-4 rounded-full bg-[#FBBF24] blur-lg pointer-events-none"
                            />
                            <motion.div
                              animate={{
                                scale: [1, 1.22, 1],
                                opacity: [0.5, 0.18, 0.5],
                              }}
                              transition={{
                                duration: 2.6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className="absolute -inset-1.5 rounded-full bg-[#FDE047] blur-md pointer-events-none"
                            />
                          </>
                        )}

                        {/* TOMBOL NODE LEVEL 3D OVAL ISOMETRIK (SESUAI ASSET LEVEL.PNG & LEVEL AUTUMN.PNG) */}
                        <IsometricLevelNodeButton
                          unit={unit}
                          isCompleted={isCompleted}
                          isUnlocked={isUnlocked}
                          isCurrentActiveNode={isCurrentActiveNode}
                          skyMode={skyMode}
                          onClick={(e) => handleNodeClick(e, unit)}
                          onDoubleClick={() => isUnlocked && startQuiz(unit)}
                        />
                      </div>
                    )
                  })}
                </motion.div>
              </div>

              {/* ========================================================== */}
              {/* FLOATING BOTTOM CONTROLS: Navigasi Level, Mode Langit & Zoom */}
              {/* Desain Modern, Bersih & Profesional Sesuai Standar EdTech  */}
              {/* ========================================================== */}
              <div className="pointer-events-none fixed lg:absolute bottom-16 lg:bottom-5 left-0 right-0 z-40 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3">
                {/* Segmen Kiri: Quick Jump Peta Level (Pill Modern) */}
                <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
                  <span className="hidden sm:inline-block px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gray-500 border-r border-gray-200 mr-1.5">
                    Level
                  </span>

                  <div className="flex items-center gap-1">
                    {ISLAND_UNITS.map((u) => {
                      const unlocked = progress.unlockedIslands.includes(u.id) || u.id === 1
                      const isCurrent = u.id === currentActiveUnitId
                      const active = selectedUnit.id === u.id
                      const isSoon = u.id >= 3

                      return (
                        <button
                          key={u.id}
                          onClick={() => scrollToIsland(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                            active
                              ? 'bg-[#E02424] text-white shadow-xs'
                              : isCurrent
                              ? 'bg-[#FFF0F0] text-[#E02424]'
                              : isSoon
                              ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              : unlocked
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <span>{u.id}</span>
                          {isSoon ? (
                            <span className="text-[9px] text-gray-400 font-bold">•</span>
                          ) : !unlocked ? (
                            <svg className="w-2.5 h-2.5 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Segmen Kanan: Segmented Switch Mode Langit + Zoom Controls */}
                <div className="pointer-events-auto flex items-center gap-2.5 ml-auto">
                  {/* Segmented Control Mode Langit Bersih Tanpa Emoticon Besar */}
                  <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 p-1 rounded-2xl flex items-center shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
                    <button
                      onClick={() => setSkyMode('bright')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        skyMode === 'bright'
                          ? 'bg-[#0A84EC] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-300" />
                      <span>Siang</span>
                    </button>
                    <button
                      onClick={() => setSkyMode('sunset')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        skyMode === 'sunset'
                          ? 'bg-[#E15814] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Senja</span>
                    </button>
                  </div>

                  {/* Kontrol Zoom Minimalis & Ergonomis */}
                  <div className="flex items-center bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl overflow-hidden p-1 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
                    <button
                      onClick={() => setMapZoom((z) => Math.min(1.2, +(z + 0.08).toFixed(2)))}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black text-gray-700 hover:bg-gray-100 hover:text-[#E02424] cursor-pointer transition"
                      title="Perbesar Peta"
                    >
                      +
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-0.5" />
                    <button
                      onClick={() => setMapZoom((z) => Math.max(0.84, +(z - 0.08).toFixed(2)))}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black text-gray-700 hover:bg-gray-100 hover:text-[#E02424] cursor-pointer transition"
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
          {/* VIEW B: PROFIL PENGGUNA (DENGAN FITUR GANTI FOTO PROFIL)   */}
          {/* ========================================================== */}
          {activeMenu === 'profil' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24">
              <div className="max-w-3xl mx-auto w-full">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[0_16px_44px_rgba(0,0,0,0.10)]"
                >
                  {/* Header Foto Profil & Informasi Akun */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#EEEEEE]">
                    <div className="relative group shrink-0">
                      <img
                        src={currentAvatar}
                        alt={user?.nama || 'Foto Profil'}
                        className="w-24 h-24 rounded-3xl object-cover border-2 border-gray-200 shadow-sm bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 bg-[#E02424] hover:bg-[#C91A1A] text-white text-[11px] font-black px-2.5 py-1 rounded-xl border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-105 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Ubah</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="text-center sm:text-left flex-1">
                      <h1 className="text-2xl font-black text-gray-900">
                        {user?.nama || 'Sobat Handoora'}
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500 font-bold mt-0.5">
                        {user?.email || 'sobat@handoora.id'} • {user?.umur || 20} Tahun
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                        <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-black text-[#E02424] flex items-center gap-1.5">
                          <IconFlame className="w-3.5 h-3.5" color="#E02424" />
                          <span>{progress.streak} Hari Beruntun</span>
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-black text-emerald-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{progress.completedIslands.length} dari {ISLAND_UNITS.length} Level Selesai</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pilihan Foto Profil / Avatar */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-extrabold text-[#333333]">
                        Pilih Foto Profil
                      </h2>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-extrabold text-[#E02424] hover:underline cursor-pointer"
                      >
                        + Unggah Foto dari Perangkat
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {AVATAR_PRESETS.map((av) => {
                        const isSelected = profileForm.avatar_url === av.src
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() =>
                              setProfileForm((p) => ({ ...p, avatar_url: av.src }))
                            }
                            className={`flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#FFF0F0] border-[#E02424] shadow-2xs'
                                : 'bg-[#FAFAFA] border-[#E6E6E6] hover:border-[#CCCCCC]'
                            }`}
                          >
                            <img
                              src={av.src}
                              alt={av.label}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                            <span className="text-xs font-extrabold text-[#333333]">
                              {av.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Form Perbarui Informasi Profil */}
                  <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-[#EEEEEE]">
                    <h2 className="text-base font-extrabold text-[#333333]">
                      Perbarui Informasi Profil
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
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                    </Button>
                  </form>

                  {/* Form Set & Ubah Password Akun Handoora */}
                  <form onSubmit={handleUpdatePassword} className="space-y-4 pt-5 border-t border-[#EEEEEE]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-extrabold text-[#333333]">
                          Keamanan & Password Akun
                        </h2>
                        <p className="text-xs text-gray-500 font-bold">
                          Atur atau ubah password baru untuk akun Handoora kamu.
                        </p>
                      </div>
                      <span className="text-lg">🔐</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-[#666666] mb-1.5">
                          Password Baru
                        </label>
                        <Input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                          }
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-[#666666] mb-1.5">
                          Konfirmasi Password Baru
                        </label>
                        <Input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                          }
                          placeholder="Ketik ulang password baru"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isUpdatingPassword}
                      className="bg-[#2B2B2B] hover:bg-[#111111]"
                    >
                      {isUpdatingPassword ? 'MENYIMPAN...' : 'PERBARUI PASSWORD'}
                    </Button>
                  </form>
                </motion.div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW C: KAMUS LENGKAP BAHASA ISYARAT BISINDO               */}
          {/* ========================================================== */}
          {activeMenu === 'kamus' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-28">
              <div className="max-w-5xl mx-auto w-full space-y-6">
                {/* Header Banner Kamus */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="space-y-2 text-center md:text-left">
                    <span className="px-3 py-1 rounded-full bg-[#FFF0F0] text-xs font-black text-[#E02424] uppercase tracking-wider">
                      📖 Ensiklopedia Visual BISINDO
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#2B2B2B] tracking-tight">
                      Kamus Bentuk Tangan BISINDO
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-bold max-w-xl">
                      Kumpulan seluruh gestur dan ejaan bahasa isyarat dari Level 1 hingga Level 6.
                      Pelajari detail bentuk jari, makna, dan praktikkan langsung ke kamera!
                    </p>
                  </div>

                  {/* Input Pencarian Kata / Huruf */}
                  <div className="w-full md:w-72">
                    <div className="relative">
                      <input
                        type="text"
                        value={dictionarySearch}
                        onChange={(e) => setDictionarySearch(e.target.value)}
                        placeholder="Cari huruf atau isyarat..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F7F7F7] border-2 border-[#EAEAEA] focus:border-[#E02424] text-xs font-bold text-gray-800 placeholder-gray-400 outline-none transition"
                      />
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        🔍
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Tabs Modul Level 1 - 6 Tanpa Emoticon / Emoji */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {DICTIONARY_MODULES.map((mod) => {
                    const isSelected = selectedDictModuleId === mod.id && !dictionarySearch
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          setSelectedDictModuleId(mod.id)
                          setDictionarySearch('')
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 flex items-center gap-2 transition cursor-pointer border-2 relative ${
                          isSelected
                            ? 'bg-[#E02424] text-white border-[#E02424] shadow-md shadow-red-200'
                            : 'bg-white/90 text-gray-600 border-[#EAEAEA] hover:border-gray-300'
                        }`}
                      >
                        <span>{mod.badge}</span>
                        {mod.isComingSoon && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 ml-1">
                            Soon
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Banner Coming Soon Khusus Modul 3 - 6 */}
                {!dictionarySearch && selectedDictModuleId >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl p-6 sm:p-7 text-center shadow-xs"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-wider mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Tahap Pengembangan</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-800">
                      Materi Modul {selectedDictModuleId} Sedang Disiapkan
                    </h3>
                    <p className="text-xs font-bold text-gray-500 max-w-lg mx-auto mt-1.5 leading-relaxed">
                      Koleksi gestur tangan interaktif untuk modul ini akan segera dirilis. Kamu dapat melihat daftar kosakata di bawah sebagai referensi awal pembelajaran.
                    </p>
                  </motion.div>
                )}

                {/* Grid Kartu Isyarat Tangan HD */}
                {(() => {
                  let activeEntries = []
                  if (dictionarySearch.trim()) {
                    const q = dictionarySearch.toLowerCase().trim()
                    DICTIONARY_MODULES.forEach((mod) => {
                      mod.entries.forEach((en) => {
                        if (
                          en.letter.toLowerCase().includes(q) ||
                          en.word.toLowerCase().includes(q) ||
                          en.desc.toLowerCase().includes(q)
                        ) {
                          activeEntries.push({ ...en, moduleBadge: mod.badge })
                        }
                      })
                    })
                  } else {
                    const curMod =
                      DICTIONARY_MODULES.find((m) => m.id === selectedDictModuleId) ||
                      DICTIONARY_MODULES[0]
                    activeEntries = curMod.entries.map((en) => ({ ...en, moduleBadge: curMod.badge }))
                  }

                  if (activeEntries.length === 0) {
                    return (
                      <div className="bg-white/90 rounded-3xl p-12 text-center border-2 border-[#EBEBEB]">
                        <p className="text-4xl mb-3">🔍</p>
                        <h3 className="text-base font-black text-gray-700">Tidak ada isyarat ditemukan</h3>
                        <p className="text-xs text-gray-400 font-bold mt-1">
                          Coba gunakan kata kunci pencarian lain.
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {activeEntries.map((item, idx) => {
                        const isSecretComingSoon = !dictionarySearch && selectedDictModuleId >= 3

                        return (
                          <motion.div
                            key={`${item.letter}-${idx}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            whileHover={{ y: -4 }}
                            className="bg-white/95 backdrop-blur-sm border-2 border-[#EBEBEB] hover:border-[#E02424] rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                                  {item.moduleBadge || item.category}
                                </span>
                                <span className="text-xs font-black text-gray-400 group-hover:text-[#E02424] transition">
                                  BISINDO
                                </span>
                              </div>

                              {/* Gambar Isyarat HD Utuh Persegi Simetris (atau Tampilan Misteri Coming Soon) */}
                              <div className="w-full aspect-square rounded-2xl bg-[#FFF6F6] p-3 flex items-center justify-center border border-rose-100 mb-3 shadow-inner group-hover:bg-[#FFF0F0] transition relative overflow-hidden">
                                {isSecretComingSoon ? (
                                  /* UI Rahasia & Estetik untuk Isyarat Coming Soon */
                                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex flex-col items-center justify-center p-3 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-amber-200 shadow-sm flex items-center justify-center text-xl mb-1 text-amber-600">
                                      🔒
                                    </div>
                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                                      Dirahasiakan
                                    </span>
                                    <span className="text-[9px] font-bold text-amber-600/80 mt-0.5">
                                      Segera Hadir
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    src={item.signImg}
                                    alt={item.word}
                                    className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                                  />
                                )}
                              </div>

                              <h3 className="text-base font-black text-[#2B2B2B] text-center mb-1">
                                {item.word}
                              </h3>
                              <p className="text-[11px] font-bold text-gray-500 text-center leading-relaxed line-clamp-3">
                                {isSecretComingSoon
                                  ? 'Bentuk gestur tangan dan video interaktif untuk materi ini akan segera dirilis.'
                                  : item.desc}
                              </p>
                            </div>

                            {isSecretComingSoon ? (
                              <div className="mt-3 w-full py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-wider text-center">
                                SEGERA DIBUKA
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  navigate(`/training/${item.letter}`)
                                }}
                                className="mt-3 w-full py-2 rounded-xl bg-gray-50 hover:bg-[#E02424] text-gray-700 hover:text-white text-[11px] font-black uppercase tracking-wider transition cursor-pointer border border-gray-200 hover:border-[#E02424] flex items-center justify-center gap-1.5"
                              >
                                <span>Latih Isyarat</span>
                                <span className="text-[10px]">▶</span>
                              </button>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW D: LEADERBOARD AKTUAL PENGGUNA (SESUAI MOBBIN DUOLINGO) */}
          {/* ========================================================== */}
          {activeMenu === 'leaderboard' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-28">
              <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Kolom Kiri & Tengah: Peringkat 10 Besar */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Banner Liga Duolingo Style */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-3xl p-6 text-center shadow-sm"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-12 h-14 rounded-2xl bg-gradient-to-b from-[#E59866] to-[#BA4A00] flex items-center justify-center text-white text-2xl shadow-md border-2 border-[#F5B041]">
                        🪶
                      </div>
                      <div className="w-9 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 text-lg border border-gray-200">
                        🛡️
                      </div>
                      <div className="w-9 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 text-lg border border-gray-200">
                        🛡️
                      </div>
                      <div className="w-9 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 text-lg border border-gray-200">
                        🛡️
                      </div>
                    </div>
                    <h2 className="text-xl font-black text-[#2B2B2B]">Liga Perunggu Handoora</h2>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">
                      Top 10 pembelajar bahasa isyarat teraktif minggu ini
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-extrabold text-[11px] border border-amber-200">
                      ⏱️ 6 Hari Tersisa
                    </span>
                  </motion.div>

                  {/* Daftar Top 10 Pengguna */}
                  <div className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-3xl p-3 sm:p-5 shadow-sm divide-y divide-gray-100">
                    {(() => {
                      if (isLoadingLeaderboard) {
                        return (
                          <div className="py-12 text-center text-gray-400 font-bold text-xs flex flex-col items-center gap-2">
                            <span className="animate-spin text-2xl">⏳</span>
                            <span>Memuat peringkat aktual dari database Supabase...</span>
                          </div>
                        )
                      }

                      // Susun list dari data Supabase profiles apa adanya
                      const userMap = new Map()

                      // Masukkan data pengguna dari database Supabase
                      if (Array.isArray(supabaseLeaderboard) && supabaseLeaderboard.length > 0) {
                        supabaseLeaderboard.forEach((p) => {
                          userMap.set(p.id, {
                            id: p.id,
                            name: p.nama || (p.email ? p.email.split('@')[0] : 'Sobat Handoora'),
                            xp: Number(p.xp) || 0,
                            level: Number(p.current_unit) || 1,
                            avatar: p.avatar_url || '/assets/avatar-orangutan.png',
                            status: p.id === user?.id ? userLeaderboardStatus : '✨',
                            isMe: p.id === user?.id,
                          })
                        })
                      }

                      // Jika user yang sedang login belum tersimpan di state Supabase profiles,
                      // masukkan data profil lokal user agar tetap tampil akurat apa adanya
                      if (user?.id) {
                        const existing = userMap.get(user.id)
                        const currentXp = Number(progress.xp) || (existing?.xp ?? 0)
                        userMap.set(user.id, {
                          id: user.id,
                          name: `${user.nama || 'Sobat Handoora'} (Kamu)`,
                          xp: currentXp,
                          level: currentActiveUnitId,
                          avatar: currentAvatar,
                          status: userLeaderboardStatus,
                          isMe: true,
                        })
                      } else if (userMap.size === 0) {
                        // Jika mode tamu / belum login sama sekali dan database kosong
                        userMap.set('guest', {
                          id: 'guest',
                          name: 'Kamu (Tamu Belajar)',
                          xp: Number(progress.xp) || 0,
                          level: currentActiveUnitId,
                          avatar: currentAvatar,
                          status: userLeaderboardStatus,
                          isMe: true,
                        })
                      }

                      // Urutkan murni berdasarkan XP terbanyak (Descending)
                      const sortedList = Array.from(userMap.values())
                        .sort((a, b) => b.xp - a.xp)
                        .slice(0, 10)

                      return sortedList.map((entry, idx) => {
                        const rank = idx + 1
                        const isMe = entry.isMe
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`flex items-center justify-between py-3 px-3 sm:px-4 rounded-2xl transition ${
                              isMe ? 'bg-[#FFF0F0] border-2 border-[#E02424] shadow-xs' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              {/* Nomor Rank Icon */}
                              <div className="w-8 text-center shrink-0">
                                {rank === 1 ? (
                                  <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs mx-auto">
                                    1
                                  </span>
                                ) : rank === 2 ? (
                                  <span className="w-7 h-7 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center shadow-xs mx-auto">
                                    2
                                  </span>
                                ) : rank === 3 ? (
                                  <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs mx-auto">
                                    3
                                  </span>
                                ) : (
                                  <span className="text-sm font-extrabold text-gray-500">
                                    {rank}
                                  </span>
                                )}
                              </div>

                              {/* Avatar & Online Dot */}
                              <div className="relative shrink-0">
                                <img
                                  src={entry.avatar}
                                  alt={entry.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                              </div>

                              {/* Nama Pengguna & Status Emoji */}
                              <div className="min-w-0 flex items-center gap-2">
                                <span className={`text-xs sm:text-sm font-black truncate ${isMe ? 'text-[#E02424]' : 'text-gray-800'}`}>
                                  {entry.name}
                                </span>
                                {entry.status && (
                                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full border border-gray-200">
                                    {entry.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Skor XP Duolingo Style */}
                            <div className="shrink-0 text-right">
                              <span className="text-xs sm:text-sm font-black text-gray-600">
                                {entry.xp} XP
                              </span>
                            </div>
                          </motion.div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Kolom Kanan: Set Your Status Widget (Sesuai Referensi Mobbin Duolingo) */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-3xl p-5 shadow-sm"
                  >
                    <h3 className="text-sm font-black text-[#2B2B2B] mb-3">Pasang Status Kamu</h3>

                    {/* Preview Avatar with Speech Bubble */}
                    <div className="flex flex-col items-center justify-center py-4 relative">
                      <div className="relative">
                        <img
                          src={currentAvatar}
                          alt="Avatar Status"
                          className="w-16 h-16 rounded-full object-cover border-3 border-[#E02424] shadow-md"
                        />
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center text-sm">
                          {userLeaderboardStatus}
                        </div>
                      </div>
                    </div>

                    {/* Grid Pilihan Stiker Status */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                      {['😎', '🎉', '💪', '👀', '🍿', '🔥', '🦜', '💯', '💩', '🏆', '💰', '🐱'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setUserLeaderboardStatus(emoji)
                            toast.success(`Status diubah jadi ${emoji}`)
                          }}
                          className={`p-2.5 rounded-2xl text-lg flex items-center justify-center transition cursor-pointer border ${
                            userLeaderboardStatus === emoji
                              ? 'bg-[#FFF0F0] border-[#E02424] scale-105 shadow-xs'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* VIEW E: LAINNYA (PENGATURAN, PUSAT BANTUAN, DAN FAQ)        */}
          {/* ========================================================== */}
          {activeMenu === 'lainnya' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-28">
              <div className="max-w-4xl mx-auto w-full space-y-6">
                {/* Header Tab Submenu: Pengaturan | Pusat Bantuan | FAQ */}
                <div className="flex items-center gap-2 p-1.5 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xs">
                  {[
                    { id: 'pengaturan', label: 'Pengaturan' },
                    { id: 'bantuan', label: 'Pusat Bantuan' },
                    { id: 'faq', label: 'FAQ & Tanya Jawab' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setLainnyaTab(tab.id)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                        lainnyaTab === tab.id
                          ? 'bg-[#E02424] text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: PENGATURAN APLIKASI & SUARA */}
                {lainnyaTab === 'pengaturan' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-3xl p-6 shadow-sm space-y-5">
                      <h3 className="text-base font-black text-[#2B2B2B]">
                        Preferensi Pembelajaran & Efek
                      </h3>

                      <div className="divide-y divide-gray-100">
                        <div className="py-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-gray-800">Efek Suara Kuis</p>
                            <p className="text-xs text-gray-400 font-bold">Mainkan audio bel & sinyal saat jawaban benar/salah</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSetting('soundEffects')}
                            className={`w-12 h-7 rounded-full p-1 transition cursor-pointer ${
                              settingsPref.soundEffects ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settingsPref.soundEffects ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        <div className="py-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-gray-800">Umpan Balik Kamera Real-time</p>
                            <p className="text-xs text-gray-400 font-bold">Animasi border hijau & merah saat mendeteksi gestur tangan</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSetting('hapticFeedback')}
                            className={`w-12 h-7 rounded-full p-1 transition cursor-pointer ${
                              settingsPref.hapticFeedback ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settingsPref.hapticFeedback ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        <div className="py-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-gray-800">Notifikasi Pengingat Belajar</p>
                            <p className="text-xs text-gray-400 font-bold">Ingatkan latihan harian agar streak tidak padam</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSetting('notifications')}
                            className={`w-12 h-7 rounded-full p-1 transition cursor-pointer ${
                              settingsPref.notifications ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settingsPref.notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        <div className="py-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-gray-800">Tema Langit Pulau</p>
                            <p className="text-xs text-gray-400 font-bold">Beralih antara Langit Cerah (Siang) atau Senja (Autumn)</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newMode = skyMode === 'bright' ? 'sunset' : 'bright'
                              setSkyMode(newMode)
                              handleToggleSetting('skyTheme')
                            }}
                            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-black text-gray-700 transition cursor-pointer border border-gray-200"
                          >
                            {skyMode === 'bright' ? 'Langit Siang' : 'Langit Senja'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Reset Progres Pembelajaran */}
                    <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-black text-gray-900">Reset Progres Belajar</h3>
                        <p className="text-xs text-gray-500 font-bold mt-0.5">
                          Ulangi seluruh modul dari Level 1 dan kosongkan riwayat kuis tersimpan.
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const reset = progressService.resetProgress(user?.id)
                          setProgress(reset)
                          setSelectedUnitId(1)
                          if (user?.id) {
                            await progressService.saveProgressToSupabase(user.id, reset)
                          }
                          toast.success('Progres pembelajaran direset kembali ke Level 1')
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-black text-rose-600 border border-rose-200 cursor-pointer transition"
                      >
                        Reset ke Level 1
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: PUSAT BANTUAN */}
                {lainnyaTab === 'bantuan' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Pusat Bantuan & Dukungan Handoora</h2>
                      <p className="text-xs sm:text-sm text-gray-500 font-bold mt-1">
                        Butuh bantuan seputar penggunaan kamera, navigasi kuis, atau akun belajar? Kami siap membantu!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-black text-gray-800">Panduan Kamera Real-time</h4>
                        <p className="text-xs text-gray-600 font-bold leading-relaxed">
                          Pastikan ruangan memiliki pencahayaan cukup dan tanganmu berada di dalam bingkai retikel kamera agar deteksi AI berjalan optimal.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-black text-gray-800">Hubungi Tim Handoora</h4>
                        <p className="text-xs text-gray-600 font-bold leading-relaxed">
                          Kirim saran dan masukan melalui email halo@handoora.id atau komunitas BISINDO Discord Handoora Indonesia.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: FREQUENTLY ASKED QUESTIONS (FAQ) */}
                {lainnyaTab === 'faq' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-md border-2 border-[#EBEBEB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
                  >
                    <div>
                      <h2 className="text-xl font-black text-[#2B2B2B]">Frequently Asked Questions (FAQ)</h2>
                      <p className="text-xs sm:text-sm text-gray-500 font-bold mt-1">
                        Pertanyaan umum yang sering ditanyakan oleh teman-teman pembelajar BISINDO.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {[
                        {
                          q: 'Apa itu bahasa isyarat BISINDO yang diajarkan di Handoora?',
                          a: 'BISINDO (Bahasa Isyarat Indonesia) adalah bahasa isyarat alami yang hidup, berkembang, dan digunakan oleh komunitas Teman Tuli di Indonesia dengan kekayaan tata bahasa visual dan budaya lokal.',
                        },
                        {
                          q: 'Apakah saya wajib menyalakan kamera saat belajar?',
                          a: 'Kamera digunakan pada tipe soal peragaan isyarat langsung. Jika saat ini kamu belum memungkinkan menyalakan kamera, kamu bisa klik tombol "LOMPATI" untuk mendahulukan soal kuis pilihan dan tebak isyarat.',
                        },
                        {
                          q: 'Bagaimana cara membuka kunci Level berikutnya?',
                          a: 'Selesaikan 3 tahap kuis pada level yang sedang aktif. Setiap selesai menuntaskan 3 tahap kuis, pulau level berikutnya akan terbuka secara otomatis!',
                        },
                        {
                          q: 'Bagaimana sistem penilaian dan XP di Leaderboard?',
                          a: 'Setiap jawaban kuis yang tepat memberikan perolehan XP. Semakin banyak kamu berlatih dan menjaga streak harian, posisimu di Liga Handoora akan semakin meroket ke 10 besar!',
                        },
                      ].map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5"
                        >
                          <h4 className="text-sm font-black text-[#2B2B2B] flex items-center gap-2">
                            <span className="text-[#E02424]">Q:</span> {faq.q}
                          </h4>
                          <p className="text-xs text-gray-600 font-bold leading-relaxed pl-5">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ============================================================ */}
        {/* BOTTOM NAVIGATION BAR MOBILE (< lg)                          */}
        {/* ============================================================ */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E8E8] px-2 py-2 flex justify-around items-center">
          {[
            { id: 'beranda', label: 'BERANDA', Icon: IconBeranda },
            { id: 'profil', label: 'PROFIL', Icon: IconProfil },
            { id: 'kamus', label: 'KAMUS', Icon: IconKamus },
            { id: 'leaderboard', label: 'PERINGKAT', Icon: IconLeaderboard },
            { id: 'lainnya', label: 'LAINNYA', Icon: IconLainnya },
          ].map(({ id, label, Icon }) => {
            const isActive = activeMenu === id
            return (
              <button
                key={id}
                onClick={() => setActiveMenu(id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-[9px] font-extrabold tracking-wider uppercase cursor-pointer transition-all ${
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
        {/* MODAL PILIHAN LANJUTKAN / ULANG SESI KUIS LEVEL               */}
        {/* ============================================================ */}
        <AnimatePresence>
          {levelSessionModalUnit && savedSessionData && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.92, y: 16, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 16, opacity: 0 }}
                className="w-full max-w-md bg-white border-2 border-[#EBEBEB] rounded-[32px] p-6 sm:p-7 shadow-2xl text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  ⏱️
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-[#FFF0F0] text-[11px] font-black text-[#E02424] uppercase tracking-wider">
                    {levelSessionModalUnit.unitLabel} • Tahap {savedSessionData.stageId}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#2B2B2B] mt-2">
                    Lanjutkan Belajar?
                  </h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">
                    Kamu memiliki riwayat kuis pada level ini yang belum selesai ({savedSessionData.remainingQuestionIds?.length} soal tersisa).
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleResumeSavedSession}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-b from-[#FF4754] to-[#E02424] border-b-4 border-b-[#991B1B] text-white font-extrabold text-sm uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    LANJUTKAN PROGRES SEBELUMNYA ▶
                  </motion.button>

                  <button
                    onClick={handleRestartQuizFromBeginning}
                    className="w-full py-2.5 px-4 rounded-2xl border-2 border-gray-200 hover:bg-gray-50 text-gray-600 font-extrabold text-xs uppercase tracking-wider cursor-pointer transition"
                  >
                    🔄 ULANGI KUIS DARI AWAL
                  </button>

                  <button
                    onClick={() => {
                      setLevelSessionModalUnit(null)
                      setSavedSessionData(null)
                    }}
                    className="text-xs text-gray-400 hover:text-gray-700 font-bold py-1 transition"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default DashboardPage
