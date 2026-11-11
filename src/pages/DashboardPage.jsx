import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { progressService } from '../services/storage'

// ============================================
// Data Kepulauan Pembelajaran BISINDO Handoora
// ============================================
const ISLAND_UNITS = [
  {
    id: 1,
    section: 'BAGIAN 1, UNIT 1',
    unitLabel: 'Unit 1',
    title: 'Mengenal Abjad & Sapaan BISINDO',
    theme: 'meadow',
    xpReward: 20,
    position: { x: 33, y: 40 },
    guide: [
      { sign: '✊', word: 'Huruf A', desc: 'Kepalkan tangan dengan ibu jari rapat di samping jari telunjuk.' },
      { sign: '✋', word: 'Halo / Hai', desc: 'Angkat telapak tangan terbuka dan goyangkan ke kiri-kanan dengan senyum.' },
      { sign: '🤲', word: 'Terima Kasih', desc: 'Sentuh ujung dagu dengan jari-jari lalu gerakkan telapak tangan ke arah lawan bicara.' },
    ],
    questions: [
      {
        prompt: 'Bagaimana gerakan isyarat untuk menyapa "Halo" dalam BISINDO?',
        emoji: '👋',
        options: [
          'Melambaikan telapak tangan terbuka ke kiri dan kanan',
          'Melipat kedua tangan di dada',
          'Menunjuk ke arah bawah',
          'Menepuk pundak sendiri',
        ],
        correctIndex: 0,
        explanation: 'Tepat! Lambaian tangan terbuka disertai kontak mata adalah sapaan dasar dalam BISINDO.',
      },
      {
        prompt: 'Gerakan menyentuh dagu/bibir lalu membuka tangan ke depan berarti...',
        emoji: '🤲',
        options: ['Selamat Malam', 'Terima Kasih', 'Sampai Jumpa', 'Perkenalkan'],
        correctIndex: 1,
        explanation: 'Benar sekali! Itu adalah isyarat BISINDO untuk mengucapkan "Terima Kasih".',
      },
    ],
  },
  {
    id: 2,
    section: 'BAGIAN 1, UNIT 2',
    unitLabel: 'Unit 2',
    title: 'Menggunakan Ekspresi Waktu',
    theme: 'snow',
    xpReward: 30,
    position: { x: 64, y: 24 },
    guide: [
      { sign: '☝️', word: 'Besok', desc: 'Ibu jari mengarah ke depan melewati pipi.' },
      { sign: '👍', word: 'Kemarin', desc: 'Ibu jari mengarah ke belakang melewati bahu.' },
      { sign: '🙌', word: 'Sekarang / Hari Ini', desc: 'Kedua telapak tangan terbuka menghadap atas diturunkan perlahan di depan tubuh.' },
    ],
    questions: [
      {
        prompt: 'Dalam BISINDO, arah gerakan tangan ke belakang bahu melambangkan waktu...',
        emoji: '⏳',
        options: ['Masa Depan / Besok', 'Masa Lalu / Kemarin', 'Pagi Hari', 'Sekarang'],
        correctIndex: 1,
        explanation: 'Hebat! Dalam tata ruang bahasa isyarat, arah belakang bahu menunjukkan masa lampau (kemarin/tadi).',
      },
    ],
  },
  {
    id: 3,
    section: 'BAGIAN 1, UNIT 3',
    unitLabel: 'Unit 3',
    title: 'Keluarga & Kata Ganti Orang',
    theme: 'desert',
    xpReward: 35,
    position: { x: 70, y: 55 },
    guide: [
      { sign: '👈', word: 'Saya / Aku', desc: 'Jari telunjuk menunjuk ke arah dada sendiri.' },
      { sign: '👉', word: 'Kamu / Anda', desc: 'Jari telunjuk atau telapak tangan mengarah ke lawan bicara.' },
    ],
    questions: [
      {
        prompt: 'Bagaimana cara mengisyaratkan kata ganti "Saya" dalam BISINDO?',
        emoji: '🙋',
        options: [
          'Menunjuk dada sendiri dengan jari telunjuk',
          'Mengangkat kedua jempol',
          'Menunjuk ke atas langit',
          'Memutar pergelangan tangan',
        ],
        correctIndex: 0,
        explanation: 'Tepat! Menunjuk ke arah dada sendiri berarti "Saya/Aku".',
      },
    ],
  },
  {
    id: 4,
    section: 'BAGIAN 1, UNIT 4',
    unitLabel: 'Unit 4',
    title: 'Ekspresi Wajah & Perasaan',
    theme: 'ruins',
    xpReward: 40,
    position: { x: 52, y: 78 },
    guide: [
      { sign: '😊', word: 'Senang / Bahagia', desc: 'Kedua tangan menyapu dada ke arah atas disertai ekspresi wajah ceria.' },
      { sign: '😢', word: 'Sedih', desc: 'Jari-jari turun di depan wajah dengan mimik wajah murung.' },
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
        explanation: 'Sangat tepat! Dalam BISINDO, mimik wajah (komponen non-manual) menentukan intonasi, tanya, dan emosi.',
      },
    ],
  },
  {
    id: 5,
    section: 'BAGIAN 1, UNIT 5',
    unitLabel: 'Unit 5',
    title: 'Percakapan Sehari-hari di Tempat Umum',
    theme: 'lighthouse',
    xpReward: 50,
    position: { x: 22, y: 80 },
    guide: [
      { sign: '🤝', word: 'Salam Kenal', desc: 'Jabat tangan isyarat diikuti ejaan jari nama panggilan.' },
    ],
    questions: [
      {
        prompt: 'Saat ingin memanggil teman Tuli dari kejauhan, cara yang sopan adalah...',
        emoji: '✨',
        options: [
          'Melambaikan tangan dalam jangkauan pandangannya atau mengetuk meja pelan',
          'Berteriak sekeras mungkin',
          'Melempar benda ke arahnya',
          'Menarik bajunya secara tiba-tiba dari belakang',
        ],
        correctIndex: 0,
        explanation: 'Benar! Isyarat visual seperti lambaian tangan atau tepukan lembut di bahu adalah etika budaya Tuli yang sopan.',
      },
    ],
  },
]

// ============================================
// Ilustrasi Pulau 3D Isometrik (SVG Custom Handoora)
// ============================================
const IsometricIsland = ({ unit, isUnlocked, isCompleted, isSelected, onSelect }) => {
  return (
    <motion.div
      style={{
        left: `${unit.position.x}%`,
        top: `${unit.position.y}%`,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 select-none"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: unit.id * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="absolute bottom-[88%] left-1/2 -translate-x-1/2 mb-3 z-30 w-48 sm:w-52"
          >
            <div className="bg-[#450A0A]/90 backdrop-blur-md border-2 border-[#FCA5A5]/60 rounded-2xl p-3.5 text-center shadow-[0_12px_30px_rgba(185,28,28,0.45)]">
              <p className="text-[11px] font-extrabold text-[#FCA5A5] uppercase tracking-wider">
                {unit.unitLabel}
              </p>
              <p className="text-xs sm:text-[13px] font-extrabold text-white leading-snug mt-0.5 mb-2.5">
                {unit.title}
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(unit, true)
                }}
                className="w-full py-2 px-4 rounded-full bg-gradient-to-r from-[#EB2B36] to-[#FF5A5F] text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_4px_0_#991B1B] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isUnlocked ? 'Mulai' : 'Terkunci'}</span>
                <span className="text-[10px]">▶</span>
              </motion.button>
            </div>
            <div className="w-4 h-4 bg-[#450A0A]/90 border-r-2 border-b-2 border-[#FCA5A5]/60 rotate-45 mx-auto -mt-2" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 3.2 + unit.id * 0.3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.05 }}
        onClick={() => onSelect(unit, false)}
        className="relative cursor-pointer group"
      >
        <div
          className={`absolute -inset-3 rounded-[50%] blur-md transition-opacity duration-300 ${
            isSelected
              ? 'bg-red-400/50 opacity-100'
              : isUnlocked
                ? 'bg-sky-300/40 opacity-80 group-hover:opacity-100'
                : 'bg-sky-400/20 opacity-60'
          }`}
        />

        {unit.theme === 'meadow' && (
          <div className="relative w-44 sm:w-56 md:w-64 h-36 sm:h-44">
            <svg viewBox="0 0 260 190" className="w-full h-full drop-shadow-[0_12px_16px_rgba(0,0,0,0.28)]">
              <ellipse cx="130" cy="138" rx="116" ry="44" fill="#7DD3FC" fillOpacity="0.45" />
              <path d="M24 120 Q20 155 70 168 Q130 180 195 166 Q236 155 236 120 L225 104 L35 104 Z" fill="#A87B51" />
              <path d="M35 118 Q70 155 130 164 Q190 158 225 118 L225 104 L35 104 Z" fill="#C69C6D" />
              <ellipse cx="130" cy="106" rx="98" ry="38" fill="#84CC16" />
              <ellipse cx="130" cy="102" rx="90" ry="33" fill="#A3E635" />
              <path d="M90 105 Q125 120 165 135" stroke="#FDE68A" strokeWidth="14" strokeLinecap="round" fill="none" />
              <g transform="translate(52, 46)">
                <rect x="8" y="28" width="44" height="30" rx="4" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
                <polygon points="0,30 30,6 60,30" fill="#EB2B36" stroke="#991B1B" strokeWidth="2" />
                <rect x="24" y="40" width="12" height="18" rx="2" fill="#92400E" />
                <rect x="13" y="36" width="8" height="8" rx="1" fill="#38BDF8" />
                <rect x="39" y="36" width="8" height="8" rx="1" fill="#38BDF8" />
              </g>
              <g transform="translate(36, 78)">
                <polygon points="10,0 0,22 20,22" fill="#15803D" />
                <polygon points="10,6 2,26 18,26" fill="#16A34A" />
              </g>
              <g transform="translate(192, 68)">
                <polygon points="12,0 0,24 24,24" fill="#15803D" />
                <polygon points="12,7 2,28 22,28" fill="#22C55E" />
              </g>
              <g transform="translate(148, 128)">
                <rect x="0" y="0" width="38" height="14" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
                <line x1="8" y1="0" x2="8" y2="14" stroke="#78350F" strokeWidth="2" />
                <line x1="19" y1="0" x2="19" y2="14" stroke="#78350F" strokeWidth="2" />
                <line x1="30" y1="0" x2="30" y2="14" stroke="#78350F" strokeWidth="2" />
              </g>
            </svg>

            <motion.img
              src="/assets/mascot-group.png"
              alt="Handoora Mascot"
              animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 left-5 sm:left-7 w-16 sm:w-20 h-auto object-contain drop-shadow-md pointer-events-none"
            />

            <div className="absolute top-[42%] left-[58%] -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-11 sm:w-14 sm:h-12 rounded-full bg-[#EB2B36] border-2 border-white border-b-[5px] border-b-[#991B1B] shadow-[0_0_20px_rgba(235,43,54,0.8)] flex items-center justify-center text-white text-lg sm:text-xl">
                ★
              </div>
            </div>
          </div>
        )}

        {unit.theme === 'snow' && (
          <div className="relative w-40 sm:w-52 md:w-56 h-32 sm:h-40">
            <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-[0_12px_16px_rgba(0,0,0,0.28)]">
              <ellipse cx="120" cy="132" rx="105" ry="38" fill="#BAE6FD" fillOpacity="0.45" />
              <path d="M26 115 Q30 150 120 160 Q210 150 214 115 L204 98 L36 98 Z" fill="#64748B" />
              <ellipse cx="120" cy="100" rx="88" ry="34" fill="#E2E8F0" />
              <ellipse cx="120" cy="96" rx="80" ry="29" fill="#F8FAFC" />
              <polygon points="85,85 120,24 158,85" fill="#94A3B8" />
              <polygon points="120,24 102,55 112,50 120,58 128,48 138,55" fill="#FFFFFF" />
              <polygon points="125,90 156,38 188,90" fill="#CBD5E1" />
              <polygon points="156,38 143,62 156,56 169,62" fill="#FFFFFF" />
              <polygon points="58,64 46,92 70,92" fill="#0F766E" />
              <polygon points="184,72 174,96 194,96" fill="#0F766E" />
            </svg>
            <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-11 h-10 sm:w-13 sm:h-11 rounded-full border-2 border-b-[5px] flex items-center justify-center text-base sm:text-lg shadow-md ${
                  isUnlocked
                    ? 'bg-[#EB2B36] border-white border-b-[#991B1B] text-white'
                    : 'bg-[#64748B] border-[#94A3B8] border-b-[#475569] text-slate-200'
                }`}
              >
                {isCompleted ? '★' : isUnlocked ? '▶' : '🔒'}
              </div>
            </div>
          </div>
        )}

        {unit.theme === 'desert' && (
          <div className="relative w-40 sm:w-52 md:w-56 h-32 sm:h-40">
            <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-[0_12px_16px_rgba(0,0,0,0.28)]">
              <ellipse cx="120" cy="132" rx="104" ry="38" fill="#7DD3FC" fillOpacity="0.4" />
              <path d="M26 114 Q35 150 120 158 Q205 150 214 114 L204 96 L36 96 Z" fill="#B45309" />
              <ellipse cx="120" cy="98" rx="88" ry="34" fill="#FBBF24" />
              <ellipse cx="120" cy="94" rx="80" ry="29" fill="#FDE68A" />
              <polygon points="88,78 118,32 148,78" fill="#D97706" />
              <polygon points="118,32 148,78 164,70 134,28" fill="#F59E0B" />
              <rect x="54" y="68" width="5" height="24" rx="2" fill="#92400E" />
              <ellipse cx="56" cy="66" rx="14" ry="6" fill="#16A34A" />
              <rect x="180" y="72" width="5" height="22" rx="2" fill="#92400E" />
              <ellipse cx="182" cy="70" rx="13" ry="5" fill="#16A34A" />
            </svg>
            <div className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-11 h-10 sm:w-13 sm:h-11 rounded-full border-2 border-b-[5px] flex items-center justify-center text-base sm:text-lg shadow-md ${
                  isUnlocked
                    ? 'bg-[#EB2B36] border-white border-b-[#991B1B] text-white'
                    : 'bg-[#64748B] border-[#94A3B8] border-b-[#475569] text-slate-200'
                }`}
              >
                {isCompleted ? '★' : isUnlocked ? '▶' : '🔒'}
              </div>
            </div>
          </div>
        )}

        {unit.theme === 'ruins' && (
          <div className="relative w-40 sm:w-52 md:w-56 h-32 sm:h-40">
            <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-[0_12px_16px_rgba(0,0,0,0.28)]">
              <ellipse cx="120" cy="132" rx="104" ry="38" fill="#7DD3FC" fillOpacity="0.4" />
              <path d="M28 114 Q40 150 120 158 Q200 150 212 114 L200 96 L40 96 Z" fill="#78716C" />
              <ellipse cx="120" cy="98" rx="86" ry="33" fill="#4ADE80" />
              <ellipse cx="120" cy="94" rx="76" ry="28" fill="#86EFAC" />
              <rect x="88" y="48" width="8" height="34" rx="2" fill="#E7E5E4" />
              <rect x="108" y="48" width="8" height="34" rx="2" fill="#E7E5E4" />
              <rect x="128" y="54" width="8" height="28" rx="2" fill="#E7E5E4" />
              <rect x="84" y="44" width="38" height="6" rx="2" fill="#D6D3D1" />
              <circle cx="64" cy="82" r="14" fill="#15803D" />
              <circle cx="172" cy="84" r="15" fill="#16A34A" />
            </svg>
            <div className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-11 h-10 sm:w-13 sm:h-11 rounded-full border-2 border-b-[5px] flex items-center justify-center text-base sm:text-lg shadow-md ${
                  isUnlocked
                    ? 'bg-[#EB2B36] border-white border-b-[#991B1B] text-white'
                    : 'bg-[#64748B] border-[#94A3B8] border-b-[#475569] text-slate-200'
                }`}
              >
                {isCompleted ? '★' : isUnlocked ? '▶' : '🔒'}
              </div>
            </div>
          </div>
        )}

        {unit.theme === 'lighthouse' && (
          <div className="relative w-36 sm:w-48 h-28 sm:h-36">
            <svg viewBox="0 0 220 170" className="w-full h-full drop-shadow-[0_12px_16px_rgba(0,0,0,0.28)]">
              <ellipse cx="110" cy="126" rx="92" ry="34" fill="#7DD3FC" fillOpacity="0.4" />
              <path d="M26 110 Q40 144 110 150 Q180 144 194 110 L184 94 L36 94 Z" fill="#78716C" />
              <ellipse cx="110" cy="96" rx="76" ry="28" fill="#84CC16" />
              <polygon points="58,88 64,28 78,28 84,88" fill="#FFFFFF" />
              <polygon points="60,72 62,54 80,54 82,72" fill="#EB2B36" />
              <polygon points="63,42 64,28 78,28 79,42" fill="#EB2B36" />
              <circle cx="71" cy="22" r="8" fill="#FEF08A" />
              <polygon points="60,22 71,10 82,22" fill="#991B1B" />
            </svg>
            <div className="absolute top-[56%] left-[56%] -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-11 h-10 sm:w-12 sm:h-11 rounded-full border-2 border-b-[5px] flex items-center justify-center text-base shadow-md ${
                  isUnlocked
                    ? 'bg-[#EB2B36] border-white border-b-[#991B1B] text-white'
                    : 'bg-[#64748B] border-[#94A3B8] border-b-[#475569] text-slate-200'
                }`}
              >
                {isCompleted ? '★' : isUnlocked ? '▶' : '🔒'}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ============================================
// Komponen Utama Beranda Level Handoora
// ============================================
const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, completeGoogleProfile, updateProfile, logout } = useAuth()

  const [activeMenu, setActiveMenu] = useState('beranda')

  const [progress, setProgress] = useState({
    completedIslands: [1],
    unlockedIslands: [1, 2],
    xp: 120,
    streak: 1,
    gems: 500,
    hearts: 5,
    dailyQuests: { xpEarned: 20, highScoreLessons: 1 },
  })

  const [selectedUnit, setSelectedUnit] = useState(ISLAND_UNITS[0])
  const [mapZoom, setMapZoom] = useState(1)

  // Modal states
  const [quizUnit, setQuizUnit] = useState(null)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false)

  // Modal Lengkapi Profil untuk pengguna yang baru daftar via Google OAuth
  const [showGoogleCompleteModal, setShowGoogleCompleteModal] = useState(false)
  const [googleOnboardingForm, setGoogleOnboardingForm] = useState({
    nama: '',
    umur: '',
    password: '',
  })
  const [savingOnboarding, setSavingOnboarding] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    nama: user?.nama || 'Sobat Handoora',
    umur: user?.umur || 20,
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animEnabled, setAnimEnabled] = useState(true)

  // Sinkronisasi data profil & progres dari Supabase saat user aktif
  useEffect(() => {
    if (!user?.id) return

    setProfileForm({
      nama: user.nama || 'Sobat Handoora',
      umur: user.umur || 20,
    })

    // Jika user login via Google dan umur belum terisi di database Supabase, tampilkan modal lengkapi
    if (
      user.auth_provider === 'google' &&
      (user.umur === null || user.umur === undefined)
    ) {
      setGoogleOnboardingForm({
        nama: user.nama || '',
        umur: '',
        password: '',
      })
      setShowGoogleCompleteModal(true)
    }

    progressService.fetchProgressFromSupabase(user.id).then((dbProgress) => {
      if (dbProgress) {
        setProgress(dbProgress)
      }
    })
  }, [user])

  const handleSaveGoogleOnboarding = async (e) => {
    e.preventDefault()
    if (!googleOnboardingForm.umur || parseInt(googleOnboardingForm.umur, 10) < 3) {
      toast.error('Masukkan umur yang valid')
      return
    }
    if (googleOnboardingForm.password && googleOnboardingForm.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setSavingOnboarding(true)
    try {
      await completeGoogleProfile(googleOnboardingForm)
      setShowGoogleCompleteModal(false)
      toast.success('Data akun Google berhasil disimpan ke Database Supabase! 🎉')
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan profil')
    } finally {
      setSavingOnboarding(false)
    }
  }

  const handleSelectIsland = (unit, startImmediately = false) => {
    setSelectedUnit(unit)
    if (startImmediately) {
      const isUnlocked =
        progress.unlockedIslands.includes(unit.id) || unit.id === 1
      if (!isUnlocked) {
        toast('Selesaikan pulau sebelumnya terlebih dahulu untuk membuka unit ini! 🔒', {
          icon: '🏝️',
        })
        return
      }
      setQuizUnit(unit)
      setQuestionIdx(0)
      setSelectedOption(null)
      setIsAnswerChecked(false)
    }
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null || !quizUnit) return
    setIsAnswerChecked(true)

    const currentQ = quizUnit.questions[questionIdx]
    const isCorrect = selectedOption === currentQ.correctIndex

    if (isCorrect) {
      toast.success('Jawaban Benar! Gerakan BISINDO kamu tepat! 🤟')
    } else {
      toast.error('Kurang tepat, yuk simak penjelasannya!')
    }
  }

  const handleNextQuestion = async () => {
    if (!quizUnit) return
    if (questionIdx + 1 < quizUnit.questions.length) {
      setQuestionIdx((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerChecked(false)
    } else {
      const nextIslandId = Math.min(ISLAND_UNITS.length, quizUnit.id + 1)
      const newCompleted = Array.from(
        new Set([...progress.completedIslands, quizUnit.id])
      )
      const newUnlocked = Array.from(
        new Set([...progress.unlockedIslands, quizUnit.id, nextIslandId])
      )
      const updated = {
        ...progress,
        completedIslands: newCompleted,
        unlockedIslands: newUnlocked,
        xp: progress.xp + quizUnit.xpReward,
        gems: progress.gems + 25,
        dailyQuests: {
          xpEarned: Math.min(20, (progress.dailyQuests?.xpEarned || 0) + quizUnit.xpReward),
          highScoreLessons: 1,
        },
      }
      setProgress(updated)
      setQuizUnit(null)

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

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar dari akun')
    navigate('/')
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0D1B2A] text-white flex flex-col lg:flex-row overflow-x-hidden">
        {/* ============================================================ */}
        {/* 1. LEFT SIDEBAR (3 Menu: Beranda, Profil, Pengaturan)        */}
        {/* ============================================================ */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 bg-[#0F172A] border-r border-slate-800/80 px-4 py-6 justify-between z-30">
          <div>
            <div
              onClick={() => setActiveMenu('beranda')}
              className="flex items-center px-3 mb-8 cursor-pointer group"
            >
              <img
                src="/assets/logo-full.png"
                alt="Handoora"
                className="h-6 w-auto object-contain group-hover:scale-103 transition-transform"
              />
            </div>

            <nav className="space-y-2">
              {[
                { id: 'beranda', label: 'BERANDA', icon: '🏠' },
                { id: 'profil', label: 'PROFIL', icon: '👤' },
                { id: 'pengaturan', label: 'PENGATURAN', icon: '⚙️' },
              ].map((item) => {
                const isActive = activeMenu === item.id
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#EB2B36]/15 text-[#FF6B6B] border-2 border-[#EB2B36]/60 shadow-[0_0_20px_rgba(235,43,54,0.15)]'
                        : 'text-slate-300 hover:bg-slate-800/70 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                )
              })}
            </nav>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nama}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-red-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EB2B36] to-[#991B1B] flex items-center justify-center font-extrabold text-sm text-white shrink-0">
                  {(user?.nama || 'S')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-white truncate">
                  {user?.nama || 'Sobat Handoora'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'Tersinkronisasi Supabase'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* 2. CENTER CONTENT AREA (Beranda Map / Profil / Pengaturan)   */}
        {/* ============================================================ */}
        <main className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
          {/* Mobile Top Header */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-slate-800">
            <div className="flex items-center">
              <img src="/assets/logo-full.png" alt="Handoora" className="h-5 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-3 text-xs font-extrabold">
              <span className="flex items-center gap-1 text-amber-400">🔥 {progress.streak}</span>
              <span className="flex items-center gap-1 text-sky-400">💎 {progress.gems}</span>
              <span className="flex items-center gap-1 text-rose-400">❤️ {progress.hearts}</span>
            </div>
          </div>

          {/* VIEW A: BERANDA (ISLAND LEVEL MAP) */}
          {activeMenu === 'beranda' && (
            <div className="flex-1 flex flex-col xl:flex-row">
              <div className="relative flex-1 min-h-[560px] sm:min-h-[660px] lg:min-h-screen overflow-hidden bg-gradient-to-b from-[#0B2545] via-[#0267C1] to-[#0096C7] flex flex-col">
                <div className="relative z-30 px-4 sm:px-6 pt-4 sm:pt-5">
                  <motion.div
                    key={selectedUnit.id}
                    initial={{ y: -10, opacity: 0.9 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-2xl mx-auto bg-gradient-to-r from-[#EB2B36] to-[#D91E2A] border-2 border-[#FCA5A5]/40 border-b-[5px] border-b-[#991B1B] rounded-2xl px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-4 shadow-[0_10px_25px_rgba(0,0,0,0.28)]"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-100 uppercase tracking-wider">
                        <span>←</span>
                        <span>{selectedUnit.section}</span>
                      </div>
                      <h1 className="text-base sm:text-xl font-extrabold text-white font-display mt-0.5">
                        {selectedUnit.title}
                      </h1>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowGuideModal(true)}
                      className="shrink-0 bg-[#B91C1C]/70 hover:bg-[#991B1B] border-2 border-red-300/40 border-b-4 border-b-[#7F1D1D] px-3.5 sm:px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white cursor-pointer"
                    >
                      <span>📖</span>
                      <span className="hidden sm:inline">BUKU PANDUAN</span>
                    </motion.button>
                  </motion.div>
                </div>

                <motion.div
                  animate={{ x: [0, 25, 0] }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-28 left-8 w-28 h-12 bg-white/15 rounded-full blur-xs pointer-events-none"
                />
                <motion.div
                  animate={{ x: [0, -30, 0] }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-24 right-10 w-36 h-14 bg-white/15 rounded-full blur-xs pointer-events-none"
                />

                <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
                  <motion.div
                    animate={{ scale: mapZoom }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                    className="relative w-full max-w-[780px] h-[520px] sm:h-[600px] mx-auto"
                  >
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    >
                      <path
                        d="M 36 38 Q 50 31 62 25"
                        fill="none"
                        stroke="#E0F2FE"
                        strokeWidth="0.9"
                        strokeDasharray="1.8 1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 42 46 Q 55 51 67 54"
                        fill="none"
                        stroke="#E0F2FE"
                        strokeWidth="0.9"
                        strokeDasharray="1.8 1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 65 29 Q 68 42 70 50"
                        fill="none"
                        stroke="#E0F2FE"
                        strokeWidth="0.9"
                        strokeDasharray="1.8 1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 68 60 Q 61 70 54 76"
                        fill="none"
                        stroke="#E0F2FE"
                        strokeWidth="0.9"
                        strokeDasharray="1.8 1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 48 79 Q 36 80 26 80"
                        fill="none"
                        stroke="#E0F2FE"
                        strokeWidth="0.9"
                        strokeDasharray="1.8 1.8"
                        strokeLinecap="round"
                      />
                    </svg>

                    <motion.div
                      animate={{ y: [0, -4, 0], x: [0, 6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ left: '24%', top: '57%' }}
                      className="absolute z-10 text-2xl select-none pointer-events-none drop-shadow-md"
                    >
                      ⛵
                    </motion.div>

                    {ISLAND_UNITS.map((unit) => {
                      const isCompleted = progress.completedIslands.includes(unit.id)
                      const isUnlocked =
                        progress.unlockedIslands.includes(unit.id) || unit.id === 1
                      const isSelected = selectedUnit.id === unit.id

                      return (
                        <IsometricIsland
                          key={unit.id}
                          unit={unit}
                          isUnlocked={isUnlocked}
                          isCompleted={isCompleted}
                          isSelected={isSelected}
                          onSelect={handleSelectIsland}
                        />
                      )
                    })}
                  </motion.div>
                </div>

                <div className="relative z-30 px-5 pb-5 flex items-end justify-between pointer-events-none">
                  <div className="pointer-events-auto bg-[#0F172A]/80 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="text-red-400">📍</span>
                    <span className="text-xs font-extrabold text-white tracking-wide">
                      Peta Pembelajaran BISINDO
                    </span>
                  </div>

                  <div className="pointer-events-auto flex flex-col bg-[#0F172A]/85 backdrop-blur-md border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
                    <button
                      onClick={() => setMapZoom((z) => Math.min(1.25, +(z + 0.1).toFixed(2)))}
                      className="w-9 h-9 flex items-center justify-center text-lg font-extrabold text-white hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-700/80"
                      title="Perbesar Peta"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setMapZoom((z) => Math.max(0.8, +(z - 0.1).toFixed(2)))}
                      className="w-9 h-9 flex items-center justify-center text-lg font-extrabold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Perkecil Peta"
                    >
                      −
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. RIGHT GAMIFICATION PANEL */}
              <aside className="w-full xl:w-88 shrink-0 bg-[#0F172A] border-t xl:border-t-0 xl:border-l border-slate-800/90 p-5 sm:p-6 space-y-5 z-20">
                <div className="hidden lg:flex items-center justify-between px-2">
                  <div className="flex items-center gap-2" title="Bahasa Isyarat Indonesia (BISINDO)">
                    <img
                      src="/assets/flag-id.png"
                      alt="ID"
                      className="w-7 h-5 object-contain rounded-xs"
                    />
                    <span className="text-xs font-extrabold text-slate-300">BISINDO</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm">
                    <span>🔥</span>
                    <span>{progress.streak}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-400 font-extrabold text-sm">
                    <span>💎</span>
                    <span>{progress.gems}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-sm">
                    <span>❤️</span>
                    <span>{progress.hearts}</span>
                  </div>
                </div>

                <div className="bg-[#131F33] border-2 border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#EB2B36] via-[#F59E0B] to-[#EC4899] text-[10px] font-black uppercase tracking-wider text-white">
                        HANDOORA PLUS
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-2 font-display">
                        Coba Plus gratis
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Bebas iklan, latihan isyarat yang dipersonalisasi, dan Tantangan Legendaris tak terbatas!
                      </p>
                    </div>
                    <img
                      src="/assets/logo-icon.png"
                      alt="Handoora Plus"
                      className="w-12 h-12 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(235,43,54,0.5)]"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      toast.success('Fitur Handoora Plus aktif untuk demo Hackathon! 🚀')
                    }
                    className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-[#EB2B36] to-[#B91C1C] border-b-4 border-b-[#7F1D1D] text-xs font-extrabold uppercase tracking-wider text-white cursor-pointer"
                  >
                    MULAI SEBULAN GRATISKU
                  </motion.button>
                </div>

                <div className="bg-[#131F33] border-2 border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    PAPAN SKOR
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        Semangat terus belajar isyarat!
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Kamu meraih <span className="text-amber-400 font-bold">{progress.xp} XP</span> di Liga Garuda Merah minggu ini.
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-2xl shrink-0">
                      🛡️
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLeaderboardModal(true)}
                    className="mt-4 w-full py-2.5 rounded-xl border-2 border-slate-700 hover:border-slate-600 text-xs font-extrabold uppercase tracking-wider text-sky-400 transition-colors cursor-pointer"
                  >
                    KE PAPAN SKOR
                  </button>
                </div>

                <div className="bg-[#131F33] border-2 border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-white">Misi Harian</h3>
                    <button
                      onClick={() =>
                        toast('Semua misi harian ditampilkan di bawah ini! 🎯')
                      }
                      className="text-[11px] font-extrabold text-sky-400 hover:underline uppercase cursor-pointer"
                    >
                      LIHAT SEMUA
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚡</span>
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-white mb-1.5">
                          Dapatkan 20 XP
                        </p>
                        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden relative">
                          <div
                            style={{
                              width: `${Math.min(100, ((progress.dailyQuests?.xpEarned || 20) / 20) * 100)}%`,
                            }}
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-950">
                            {Math.min(20, progress.dailyQuests?.xpEarned || 20)} / 20
                          </span>
                        </div>
                      </div>
                      <span className="text-xl">🧰</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-white mb-1.5">
                          Raih skor 90% atau lebih dalam 1 pelajaran
                        </p>
                        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden relative">
                          <div
                            style={{
                              width: `${Math.min(100, (progress.completedIslands.length > 0 ? 1 : 0) * 100)}%`,
                            }}
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-950">
                            {progress.completedIslands.length > 0 ? 1 : 0} / 1
                          </span>
                        </div>
                      </div>
                      <span className="text-xl">🧰</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* VIEW B: PROFIL PENGGUNA */}
          {activeMenu === 'profil' && (
            <div className="flex-1 p-5 sm:p-8 max-w-3xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#131F33] border-2 border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-800">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.nama}
                      className="w-20 h-20 rounded-3xl object-cover border-2 border-[#EB2B36] shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#EB2B36] to-[#991B1B] flex items-center justify-center text-3xl font-black text-white shadow-lg">
                      {(user?.nama || 'S')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-extrabold text-white font-display">
                      {user?.nama || 'Sobat Handoora'}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-bold">
                      {user?.email || 'sobat@handoora.id'} • Umur {user?.umur || 20} Tahun
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-400/30 text-[11px] font-extrabold text-red-300">
                      Metode Login: {(user?.auth_provider || 'email').toUpperCase()} • Tersimpan di Supabase 🤟
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-bold">Total XP</p>
                    <p className="text-xl font-extrabold text-amber-400 mt-1">
                      ⭐ {progress.xp}
                    </p>
                  </div>
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-bold">Runtunan Hari</p>
                    <p className="text-xl font-extrabold text-orange-400 mt-1">
                      🔥 {progress.streak} Hari
                    </p>
                  </div>
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-bold">Pulau Selesai</p>
                    <p className="text-xl font-extrabold text-emerald-400 mt-1">
                      🏝️ {progress.completedIslands.length} / {ISLAND_UNITS.length}
                    </p>
                  </div>
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-bold">Permata</p>
                    <p className="text-xl font-extrabold text-sky-400 mt-1">
                      💎 {progress.gems}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                  <h2 className="text-base font-extrabold text-white">
                    Perbarui Informasi Profil (Database Supabase)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Nama Lengkap
                      </label>
                      <Input
                        value={profileForm.nama}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, nama: e.target.value }))
                        }
                        placeholder="Nama"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
          )}

          {/* VIEW C: PENGATURAN */}
          {activeMenu === 'pengaturan' && (
            <div className="flex-1 p-5 sm:p-8 max-w-3xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#131F33] border-2 border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h1 className="text-2xl font-extrabold text-white font-display">
                    Pengaturan Aplikasi
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 font-bold mt-1">
                    Atur preferensi belajar Bahasa Isyarat Indonesia dan akun Supabase Handoora kamu.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        Efek Suara & Umpan Balik
                      </p>
                      <p className="text-xs text-slate-400">
                        Aktifkan suara saat menjawab kuis isyarat
                      </p>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                        soundEnabled ? 'bg-[#EB2B36]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          soundEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        Animasi Peta Kepulauan 3D
                      </p>
                      <p className="text-xs text-slate-400">
                        Tampilkan animasi pulau terapung dan transisi halus
                      </p>
                    </div>
                    <button
                      onClick={() => setAnimEnabled(!animEnabled)}
                      className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                        animEnabled ? 'bg-[#EB2B36]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          animEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        Keamanan Autentikasi & Database Supabase
                      </p>
                      <p className="text-xs text-slate-400">
                        Enkripsi PBKDF2-SHA256 (100.000 iterasi) + Supabase Auth & PostgreSQL RLS
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Tersambung ✓
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate('/')}
                  >
                    ← KE LANDING PAGE
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleLogout}
                  >
                    KELUAR AKUN
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800 px-6 py-2 flex items-center justify-around">
          {[
            { id: 'beranda', label: 'Beranda', icon: '🏠' },
            { id: 'profil', label: 'Profil', icon: '👤' },
            { id: 'pengaturan', label: 'Pengaturan', icon: '⚙️' },
          ].map((item) => {
            const isActive = activeMenu === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl font-extrabold text-[11px] cursor-pointer ${
                  isActive ? 'text-[#EB2B36]' : 'text-slate-400'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* ============================================================ */}
        {/* MODAL LENGKAPI PROFIL AKUN GOOGLE REAL (UMUR & PASSWORD)     */}
        {/* ============================================================ */}
        <AnimatePresence>
          {showGoogleCompleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 16 }}
                className="bg-white text-[#4B5563] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl"
              >
                <span className="text-[11px] font-extrabold text-[#EB2B36] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">
                  Terhubung dengan Google ✓
                </span>
                <h3 className="text-xl font-bold text-[#666666] font-display mt-2">
                  Lengkapi Profil Handoora Kamu
                </h3>
                <p className="text-xs font-semibold text-gray-500 mt-1 mb-5">
                  Nama dan Email sudah otomatis diambil dari akun Google kamu (<b>{user?.email}</b>). Yuk lengkapi umur dan password aplikasi!
                </p>

                <form onSubmit={handleSaveGoogleOnboarding} className="flex flex-col gap-4">
                  <Input
                    label="Nama (dari Google)"
                    value={googleOnboardingForm.nama}
                    onChange={(e) =>
                      setGoogleOnboardingForm((p) => ({ ...p, nama: e.target.value }))
                    }
                    placeholder="Nama Lengkap"
                  />
                  <Input
                    label="Umur"
                    type="number"
                    min="3"
                    max="120"
                    value={googleOnboardingForm.umur}
                    onChange={(e) =>
                      setGoogleOnboardingForm((p) => ({ ...p, umur: e.target.value }))
                    }
                    placeholder="Masukkan umur kamu"
                  />
                  <Input
                    label="Buat Password Aplikasi (Agar bisa login via Email juga)"
                    type="password"
                    value={googleOnboardingForm.password}
                    onChange={(e) =>
                      setGoogleOnboardingForm((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Minimal 6 karakter"
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={savingOnboarding}
                    >
                      SIMPAN KE DATABASE SUPABASE
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL BUKU PANDUAN BISINDO */}
        <AnimatePresence>
          {showGuideModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 16 }}
                className="bg-[#131F33] border-2 border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-extrabold text-[#EB2B36] uppercase tracking-wider">
                      BUKU PANDUAN • {selectedUnit.unitLabel}
                    </span>
                    <h3 className="text-lg font-extrabold font-display">
                      {selectedUnit.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowGuideModal(false)}
                    className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 my-4">
                  {selectedUnit.guide.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-400/30 flex items-center justify-center text-2xl shrink-0">
                        {g.sign}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white">{g.word}</p>
                        <p className="text-xs text-slate-300 mt-0.5">{g.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowGuideModal(false)}
                >
                  MENGERTI
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL KUIS INTERAKTIF PULAU BISINDO */}
        <AnimatePresence>
          {quizUnit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white text-[#4B5563] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-[#EB2B36] uppercase tracking-wider">
                    {quizUnit.unitLabel} • Soal {questionIdx + 1}/{quizUnit.questions.length}
                  </span>
                  <button
                    onClick={() => setQuizUnit(null)}
                    className="text-gray-400 hover:text-gray-600 font-extrabold text-sm cursor-pointer"
                  >
                    ✕ Tutup
                  </button>
                </div>

                <div className="w-20 h-20 rounded-3xl bg-red-50 border-2 border-red-100 flex items-center justify-center text-4xl mx-auto my-4">
                  {quizUnit.questions[questionIdx].emoji}
                </div>

                <h3 className="text-center font-bold text-[#666666] text-base sm:text-lg mb-5 font-display">
                  {quizUnit.questions[questionIdx].prompt}
                </h3>

                <div className="space-y-2.5 mb-5">
                  {quizUnit.questions[questionIdx].options.map((opt, idx) => {
                    const isSelected = selectedOption === idx
                    const isCorrect =
                      idx === quizUnit.questions[questionIdx].correctIndex

                    let optionStyle =
                      'bg-[#F7F7F7] border-[#E9E9E9] text-[#666666] hover:border-red-300'
                    if (isSelected && !isAnswerChecked) {
                      optionStyle = 'bg-red-50 border-[#EB2B36] text-[#EB2B36]'
                    } else if (isAnswerChecked) {
                      if (isCorrect) {
                        optionStyle =
                          'bg-emerald-50 border-emerald-500 text-emerald-700'
                      } else if (isSelected) {
                        optionStyle = 'bg-red-50 border-red-500 text-red-700'
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isAnswerChecked}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {isAnswerChecked && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#666666]"
                  >
                    {quizUnit.questions[questionIdx].explanation}
                  </motion.div>
                )}

                {!isAnswerChecked ? (
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={selectedOption === null}
                    onClick={handleCheckAnswer}
                  >
                    PERIKSA JAWABAN
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleNextQuestion}
                  >
                    {questionIdx + 1 < quizUnit.questions.length
                      ? 'LANJUTKAN'
                      : 'SELESAIKAN UNIT 🎉'}
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL PAPAN SKOR */}
        <AnimatePresence>
          {showLeaderboardModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 16 }}
                className="bg-[#131F33] border-2 border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-extrabold font-display">
                    🏆 Papan Skor Liga Garuda
                  </h3>
                  <button
                    onClick={() => setShowLeaderboardModal(false)}
                    className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2.5 my-4">
                  {[
                    { rank: 1, name: 'Nadia Putri', xp: 320 },
                    { rank: 2, name: user?.nama || 'Sobat Handoora', xp: progress.xp, isMe: true },
                    { rank: 3, name: 'Rizky Pratama', xp: 115 },
                    { rank: 4, name: 'Siti Aisyah', xp: 90 },
                  ]
                    .sort((a, b) => b.xp - a.xp)
                    .map((item, idx) => (
                      <div
                        key={item.name}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${
                          item.isMe
                            ? 'bg-[#EB2B36]/20 border-[#EB2B36]'
                            : 'bg-[#0F172A] border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm w-6 text-amber-400">
                            #{idx + 1}
                          </span>
                          <span className="font-extrabold text-xs sm:text-sm">
                            {item.name} {item.isMe && '(Kamu)'}
                          </span>
                        </div>
                        <span className="font-extrabold text-xs text-amber-300">
                          {item.xp} XP
                        </span>
                      </div>
                    ))}
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowLeaderboardModal(false)}
                >
                  TUTUP
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default DashboardPage
