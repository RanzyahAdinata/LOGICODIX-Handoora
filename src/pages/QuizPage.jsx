import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { progressService } from '../services/storage'
import { LEVEL1_STAGES } from '../data/level1QuizData'
import Button from '../components/ui/Button'

// Pure lightweight CSS / DOM Confetti Effect
function triggerLuxuryConfetti() {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.inset = '0'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '9999'
  container.style.overflow = 'hidden'
  document.body.appendChild(container)

  const colors = ['#FF4754', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6']
  const pieces = 70

  for (let i = 0; i < pieces; i++) {
    const el = document.createElement('div')
    const size = Math.random() * 8 + 6
    const left = Math.random() * 100
    const color = colors[Math.floor(Math.random() * colors.length)]
    const duration = Math.random() * 2 + 1.8
    const delay = Math.random() * 0.4

    el.style.position = 'absolute'
    el.style.left = `${left}%`
    el.style.top = '-20px'
    el.style.width = `${size}px`
    el.style.height = `${size * 1.4}px`
    el.style.backgroundColor = color
    el.style.borderRadius = '3px'
    el.style.opacity = '1'
    el.style.transform = `rotate(${Math.random() * 360}deg)`
    el.style.transition = `transform ${duration}s cubic-bezier(0.25, 1, 0.5, 1), top ${duration}s cubic-bezier(0.25, 1, 0.5, 1), opacity ${duration}s ease-in`
    el.style.transitionDelay = `${delay}s`

    container.appendChild(el)

    setTimeout(() => {
      el.style.top = `${Math.random() * 40 + 70}%`
      el.style.transform = `rotate(${Math.random() * 1080 - 540}deg) translateX(${Math.random() * 120 - 60}px)`
      el.style.opacity = '0'
    }, 20)
  }

  setTimeout(() => {
    container.remove()
  }, 4000)
}

export default function QuizPage() {
  const { levelId: paramLevelId, stageId: paramStageId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const levelId = parseInt(paramLevelId || '1', 10)
  const initialStageId = parseInt(paramStageId || '1', 10)

  // Stage state
  const [currentStageId, setCurrentStageId] = useState(initialStageId)
  const currentStage = LEVEL1_STAGES.find((s) => s.stageId === currentStageId) || LEVEL1_STAGES[0]

  // Queue-based questions (mendukung mistake recovery)
  // Ketika user salah / lompat, soal tersebut dimasukkan ke antrean akhir
  const [queue, setQueue] = useState([])
  const [totalOriginal, setTotalOriginal] = useState(0)
  const [correctIds, setCorrectIds] = useState(new Set())
  const [wrongCount, setWrongCount] = useState(0)
  const [isRetryingWrong, setIsRetryingWrong] = useState(false)

  // Question interaction state
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedSuccess, setDetectedSuccess] = useState(false)
  const videoRef = useRef(null)

  // Quiz completion / Result Page state
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)
  const [resultStats, setResultStats] = useState({
    accuracy: 100,
    xpEarned: 15,
    streak: 1,
    correctTotal: 0,
    totalQuestions: 0,
  })

  // Modal confirm exit
  const [showExitModal, setShowExitModal] = useState(false)

  // Inisialisasi antrean setiap kali stage berganti
  useEffect(() => {
    const stage = LEVEL1_STAGES.find((s) => s.stageId === currentStageId) || LEVEL1_STAGES[0]
    const initialQueue = [...stage.questions]
    setQueue(initialQueue)
    setTotalOriginal(initialQueue.length)
    setCorrectIds(new Set())
    setWrongCount(0)
    setIsRetryingWrong(false)
    setSelectedIndex(null)
    setIsAnswerChecked(false)
    setIsCorrect(false)
    setIsQuizCompleted(false)
    setCameraActive(false)
    setIsDetecting(false)
    setDetectedSuccess(false)
  }, [currentStageId])

  // Current question adalah item pertama di antrean
  const currentQuestion = queue.length > 0 ? queue[0] : null

  // Progress Bar calculation: rasio jawaban benar unik terhadap total soal asli
  const progressPercent = totalOriginal > 0 ? Math.min(100, Math.round((correctIds.size / totalOriginal) * 100)) : 0

  // Aktifkan simulasi / stream kamera untuk tipe 'peragakan'
  useEffect(() => {
    if (!currentQuestion) return

    if (currentQuestion.type === 'peragakan') {
      let stream = null
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((s) => {
          stream = s
          if (videoRef.current) {
            videoRef.current.srcObject = s
          }
          setCameraActive(true)
        })
        .catch(() => {
          // Fallback tanpa izin webcam (tetap sediakan simulator AI sensor)
          setCameraActive(false)
        })

      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    } else {
      setCameraActive(false)
    }
  }, [currentQuestion?.id])

  // Handle pilih opsi jawaban
  const handleSelectOption = (idx) => {
    if (isAnswerChecked) return
    setSelectedIndex(idx)
  }

  // Handle Periksa / CEK
  const handleCheckAnswer = () => {
    if (!currentQuestion || isAnswerChecked) return

    if (currentQuestion.type === 'peragakan') {
      // Pada tipe peragakan, simulasi AI hand gesture recognition
      setIsDetecting(true)
      setTimeout(() => {
        setIsDetecting(false)
        setDetectedSuccess(true)
        setIsCorrect(true)
        setIsAnswerChecked(true)
      }, 750)
      return
    }

    if (selectedIndex === null) return
    const correct = selectedIndex === currentQuestion.correctIndex
    setIsCorrect(correct)
    setIsAnswerChecked(true)
  }

  // Handle LOMPATI (Skip)
  const handleSkipQuestion = () => {
    if (!currentQuestion || isAnswerChecked) return
    // Lompat diperlakukan seperti jawaban salah sehingga akan diulang di akhir
    setIsCorrect(false)
    setIsAnswerChecked(true)
    setSelectedIndex(null)
  }

  // Handle Lanjutkan (Next button di bottom banner)
  const handleNext = async () => {
    if (!currentQuestion) return

    const remainingQueue = queue.slice(1)

    if (isCorrect) {
      // Tandai soal ini sudah berhasil dijawab benar
      const nextCorrectIds = new Set(correctIds)
      nextCorrectIds.add(currentQuestion.id)
      setCorrectIds(nextCorrectIds)

      if (remainingQueue.length === 0) {
        // SEMUA SOAL SELESAI! Tampilkan Result Page
        await finishQuizSession(nextCorrectIds.size)
        return
      }

      setQueue(remainingQueue)
    } else {
      // JAWABAN SALAH / DI-LOMPATI:
      // Masukkan soal ini kembali ke antrean paling akhir (Mistake Recovery)
      setWrongCount((prev) => prev + 1)
      setIsRetryingWrong(true)
      setQueue([...remainingQueue, currentQuestion])
    }

    // Reset interaction state untuk soal berikutnya
    setSelectedIndex(null)
    setIsAnswerChecked(false)
    setIsCorrect(false)
    setDetectedSuccess(false)
    setIsDetecting(false)
  }

  // Simpan progres ke local storage / Supabase saat kuis selesai
  const finishQuizSession = async (finalCorrectCount) => {
    setIsQuizCompleted(true)

    // Trigger selebrasi confetti mewah
    triggerLuxuryConfetti()

    const earnedXp = currentStage.xpReward || 15
    const accuracy = totalOriginal > 0 ? Math.round((totalOriginal / (totalOriginal + wrongCount)) * 100) : 100

    setResultStats({
      accuracy,
      xpEarned: earnedXp,
      streak: 1,
      correctTotal: finalCorrectCount,
      totalQuestions: totalOriginal,
    })

    if (user?.id) {
      try {
        const currentProgress = await progressService.getProgress(user.id)
        const newXp = (currentProgress?.xp || 0) + earnedXp

        // Simpan stage completion di localStorage
        const stageKey = `handoora_stage_done_${user.id}_L${levelId}_S${currentStageId}`
        localStorage.setItem(stageKey, 'true')

        // Jika ini Tahap 3 (tahap terakhir Level 1), buka Level 2
        let unlocked = currentProgress?.unlockedIslands || [1]
        let completed = currentProgress?.completedIslands || []

        if (currentStageId === 3 && levelId === 1) {
          if (!completed.includes(1)) completed = [...completed, 1]
          if (!unlocked.includes(2)) unlocked = [...unlocked, 2]
        }

        const updatedProgress = {
          ...currentProgress,
          xp: newXp,
          streak: Math.max(1, currentProgress?.streak || 1),
          unlockedIslands: unlocked,
          completedIslands: completed,
        }

        await progressService.saveProgressToSupabase(user.id, updatedProgress)
      } catch (err) {
        console.warn('Gagal menyimpan progres kuis otomatis:', err)
      }
    }
  }

  // Navigasi ke tahap berikutnya atau kembali ke pulau beranda
  const handleProceedNextStage = () => {
    if (currentStageId < 3) {
      const nextStage = currentStageId + 1
      setCurrentStageId(nextStage)
      navigate(`/quiz/${levelId}/${nextStage}`, { replace: true })
    } else {
      // Selesai seluruh Level 1, kembali ke beranda dengan pulau baru terbuka
      navigate('/belajar')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-nunito flex flex-col justify-between select-none">
      {/* ========================================================= */}
      {/* 1. TOP HEADER (Progress, Stage, Close Button) */}
      {/* ========================================================= */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-4">
        {/* Tombol Keluar (✕) */}
        <button
          onClick={() => setShowExitModal(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
          title="Keluar dari Kuis"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Dynamic Animated Progress Bar */}
        <div className="flex-1 max-w-md">
          <div className="w-full h-4 sm:h-4.5 bg-gray-200 rounded-full overflow-hidden p-0.5 shadow-inner relative">
            <motion.div
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#FF6B6B] via-[#FF4754] to-[#E02424] rounded-full relative shadow-[0_0_8px_rgba(224,36,36,0.4)]"
            >
              {/* Highlight kilap di bagian atas bar */}
              <div className="absolute inset-x-1 top-0.5 h-1 bg-white/40 rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Badge Tahap & Streak */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs flex items-center gap-1.5 shadow-xs">
            <span>🔥</span>
            <span>Tahap {currentStageId}/3</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. BODY CONTENT (Result Page OR Active Question) */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center items-center">
        {isQuizCompleted ? (
          /* ========================================================= */
          /* RESULT PAGE CELEBRATION (Sesuai Web - Result page.png) */
          /* ========================================================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 text-center shadow-xl border border-gray-100 flex flex-col items-center"
          >
            {/* Maskot Orangutan Handoora berdiri ramah */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-4">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src="/assets/mascot-standing.png"
                  alt="Maskot Handoora"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </motion.div>
              {/* Glow selebrasi */}
              <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-[#FFED4A]/20 via-[#FF4754]/15 to-transparent blur-2xl" />
            </div>

            {/* Judul Besar Hasil */}
            <h1 className="text-3xl sm:text-4xl font-black text-[#E02424] tracking-tight mb-2">
              Pelajaran selesai!
            </h1>
            <p className="text-gray-500 font-bold text-sm sm:text-base mb-6">
              {currentStageId === 3
                ? 'Luar biasa! Kamu telah menguasai seluruh alfabet BISINDO A–Z!'
                : `Hebat sekali! Kamu berhasil menuntaskan ${currentStage.stageTitle}.`}
            </p>

            {/* Kotak Ringkasan XP & Akurasi */}
            <div className="grid grid-cols-3 gap-3 w-full mb-8">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center">
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider mb-1">Total XP</span>
                <span className="text-2xl font-black text-amber-600">+{resultStats.xpEarned}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-1">Akurasi</span>
                <span className="text-2xl font-black text-emerald-600">{resultStats.accuracy}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col items-center">
                <span className="text-xs font-black text-[#E02424] uppercase tracking-wider mb-1">Tuntas</span>
                <span className="text-2xl font-black text-[#E02424]">{resultStats.correctTotal} Soal</span>
              </div>
            </div>

            {/* Tombol Lanjut ke Tahap Selanjutnya */}
            <Button
              variant="primary"
              size="lg"
              className="w-full py-4 text-base font-extrabold uppercase tracking-wider shadow-lg"
              onClick={handleProceedNextStage}
            >
              {currentStageId < 3 ? `LANJUT KE TAHAP ${currentStageId + 1} ▶` : 'SELESAIKAN LEVEL 1 🏆'}
            </Button>
          </motion.div>
        ) : (
          /* ========================================================= */
          /* QUESTION CARD (Tergantung Tipe Soal) */
          /* ========================================================= */
          currentQuestion && (
            <div className="w-full flex flex-col items-center">
              {/* Notifikasi Pengulangan Soal yang Pernah Salah (Mistake Recovery) */}
              {isRetryingWrong && queue.length <= wrongCount && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <span>🔄</span>
                  <span>Yuk ulangi soal yang tadi terlewat agar semakin lancar!</span>
                </motion.div>
              )}

              {/* Teks Instruksi Soal */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 text-center mb-6 tracking-tight">
                {currentQuestion.prompt}
              </h2>

              {/* ----------------------------------------------------- */}
              {/* TIPE 1: 'peragakan' (Kamera Preview + Kartu Huruf Merah) */}
              {/* ----------------------------------------------------- */}
              {currentQuestion.type === 'peragakan' && (
                <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                  {/* Kartu Kiri: Kamera / Simulator Gesture AI */}
                  <div className="relative aspect-4/3 sm:aspect-square bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-700/60 shadow-lg flex flex-col items-center justify-center p-4">
                    {cameraActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-center p-4 text-slate-300">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3 text-2xl">
                          📷
                        </div>
                        <p className="font-extrabold text-sm mb-1 text-white">Pratinjau Isyarat Kamera</p>
                        <p className="text-xs text-slate-400">
                          Arahkan tanganmu ke depan kamera sesuai contoh isyarat.
                        </p>
                      </div>
                    )}

                    {/* Corner Reticle Accents (Sesuai Desain Web - Quiz.png) */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-white/80 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-white/80 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-6 h-4 border-b-4 border-l-4 border-white/80 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-6 h-4 border-b-4 border-r-4 border-white/80 rounded-br-lg pointer-events-none" />

                    {/* Sensor Scanning Overlay saat Mendeteksi */}
                    {isDetecting && (
                      <motion.div
                        animate={{ y: [-60, 60, -60] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-[#FF4754] to-transparent shadow-[0_0_12px_#FF4754]"
                      />
                    )}

                    {/* Badge Deteksi Real-Time */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1.5 shadow-md">
                      <span className={`w-2 h-2 rounded-full ${detectedSuccess ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'}`} />
                      <span>{detectedSuccess ? 'Isyarat Terdeteksi Sempurna!' : isDetecting ? 'Memindai Tangan...' : 'Siap Mengenali Gerakan'}</span>
                    </div>
                  </div>

                  {/* Kartu Kanan: Kartu Stack Merah & Contoh Isyarat BISINDO */}
                  <div className="relative aspect-4/3 sm:aspect-square flex items-center justify-center p-2">
                    {/* Shadow Stack Card Merah di Belakang */}
                    <div className="absolute inset-4 bg-[#B91C1C] rounded-3xl transform rotate-3 shadow-md" />
                    <div className="absolute inset-4 bg-[#DC2626] rounded-3xl transform -rotate-2 shadow-md" />

                    {/* Kartu Depan Merah Utama */}
                    <div className="relative w-full h-full bg-gradient-to-br from-[#FF4754] via-[#E02424] to-[#B91C1C] rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between border-2 border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-full">
                          BISINDO
                        </span>
                        <span className="text-3xl font-black">{currentQuestion.targetLetter}</span>
                      </div>

                      {/* Gambar Isyarat Asli BISINDO */}
                      <div className="w-full flex-1 flex items-center justify-center my-2">
                        <div className="w-36 h-36 sm:w-44 sm:h-44 bg-white/95 rounded-2xl p-3 shadow-inner flex items-center justify-center">
                          <img
                            src={currentQuestion.signImg}
                            alt={`Isyarat ${currentQuestion.targetLetter}`}
                            className="max-h-full max-w-full object-contain filter drop-shadow"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-white/90 text-center font-bold">
                        {currentQuestion.hint}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------- */}
              {/* TIPE 2: 'pilih_isyarat' (Grid 4 Kartu Isyarat Merah) */}
              {/* ----------------------------------------------------- */}
              {currentQuestion.type === 'pilih_isyarat' && (
                <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedIndex === idx
                    return (
                      <motion.button
                        key={idx}
                        whileHover={!isAnswerChecked ? { y: -4, scale: 1.02 } : {}}
                        whileTap={!isAnswerChecked ? { scale: 0.96 } : {}}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerChecked}
                        className={`relative aspect-3/4 rounded-3xl p-3 flex flex-col items-center justify-between transition cursor-pointer border-3 shadow-md ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#FF4754] to-[#E02424] border-[#991B1B] text-white shadow-lg ring-4 ring-[#FF4754]/30'
                            : 'bg-white hover:bg-rose-50/40 border-gray-200 text-gray-800'
                        }`}
                      >
                        {/* Header kartu huruf */}
                        <div className="w-full flex justify-between items-center">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                              isSelected ? 'bg-white text-[#E02424]' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </div>

                        {/* Gambar isyarat tangan BISINDO */}
                        <div
                          className={`w-full flex-1 mx-auto my-2 rounded-2xl flex items-center justify-center p-2 ${
                            isSelected ? 'bg-white/95' : 'bg-gray-50'
                          }`}
                        >
                          <img
                            src={opt.signImg}
                            alt={`Opsi ${idx + 1}`}
                            className="max-h-full max-w-full object-contain drop-shadow"
                          />
                        </div>

                        {/* Indikator terpilih */}
                        <div className="text-[11px] font-extrabold uppercase tracking-wider">
                          {isSelected ? 'Terpilih' : 'Pilih'}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* ----------------------------------------------------- */}
              {/* TIPE 3: 'tebak_huruf' (Gambar Isyarat + Pilihan Tombol Huruf) */}
              {/* ----------------------------------------------------- */}
              {currentQuestion.type === 'tebak_huruf' && (
                <div className="w-full max-w-xl flex flex-col items-center">
                  {/* Display Isyarat Tangan Utama */}
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-3xl border-3 border-gray-200 shadow-lg p-4 flex items-center justify-center mb-6 relative">
                    <img
                      src={currentQuestion.signImg}
                      alt="Tebak Isyarat"
                      className="max-h-full max-w-full object-contain drop-shadow"
                    />
                    <div className="absolute top-2 right-2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      BISINDO
                    </div>
                  </div>

                  {/* 4 Pilihan Tombol Huruf */}
                  <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {currentQuestion.options.map((letter, idx) => {
                      const isSelected = selectedIndex === idx
                      return (
                        <motion.button
                          key={idx}
                          whileHover={!isAnswerChecked ? { scale: 1.03 } : {}}
                          whileTap={!isAnswerChecked ? { scale: 0.95 } : {}}
                          onClick={() => handleSelectOption(idx)}
                          disabled={isAnswerChecked}
                          className={`py-4 rounded-2xl font-black text-2xl sm:text-3xl border-b-4 transition cursor-pointer shadow-md ${
                            isSelected
                              ? 'bg-[#E02424] text-white border-[#991B1B] shadow-lg'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {letter}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. BOTTOM FOOTER BAR (DUOLINGO STYLE DRAWER / BUTTONS) */}
      {/* ========================================================= */}
      {!isQuizCompleted && (
        <footer
          className={`w-full transition-colors duration-300 border-t-2 ${
            isAnswerChecked
              ? isCorrect
                ? 'bg-[#D7FFB8] border-[#A8E677]'
                : 'bg-[#FFDFE0] border-[#FFA8AC]'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Pesan Banner saat Jawaban Telah Diperiksa */}
            <div className="flex-1 w-full flex items-center gap-3">
              {isAnswerChecked ? (
                isCorrect ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#58CC02] flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-[#58A700]">Luar biasa!</h4>
                      <p className="text-xs font-bold text-[#458500]">
                        Jawabanmu tepat sekali! Pertahankan fokusmu.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#EA2B2B] flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
                      ✕
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-[#EA2B2B]">Kurang tepat</h4>
                      <p className="text-xs font-bold text-[#BA1616]">
                        {currentQuestion?.type === 'pilih_isyarat'
                          ? `Jawaban yang benar adalah Opsi ke-${currentQuestion.correctIndex + 1}. Soal ini akan diulang di akhir kuis.`
                          : currentQuestion?.type === 'tebak_huruf'
                          ? `Jawaban yang benar adalah huruf "${currentQuestion.options[currentQuestion.correctIndex]}". Soal ini akan diulang di akhir kuis.`
                          : 'Jangan berkecil hati, soal ini akan diulang di akhir kuis.'}
                      </p>
                    </div>
                  </motion.div>
                )
              ) : (
                /* Tombol LOMPATI di sisi kiri saat belum diperiksa */
                <button
                  onClick={handleSkipQuestion}
                  className="px-5 py-2.5 rounded-2xl border-2 border-gray-300 hover:bg-gray-100 text-gray-500 font-extrabold text-sm uppercase tracking-wider transition cursor-pointer"
                >
                  LOMPATI
                </button>
              )}
            </div>

            {/* Tombol Aksi Utama (PERIKSA / LANJUTKAN) */}
            <div className="w-full sm:w-auto shrink-0">
              {isAnswerChecked ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleNext}
                  className={`w-full sm:w-44 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-md cursor-pointer transition border-b-4 ${
                    isCorrect
                      ? 'bg-[#58CC02] border-[#46A302] hover:bg-[#61E002]'
                      : 'bg-[#FF4B4B] border-[#D62828] hover:bg-[#FF5C5C]'
                  }`}
                >
                  LANJUTKAN
                </motion.button>
              ) : (
                <motion.button
                  whileHover={
                    selectedIndex !== null || currentQuestion?.type === 'peragakan' ? { scale: 1.03 } : {}
                  }
                  whileTap={
                    selectedIndex !== null || currentQuestion?.type === 'peragakan' ? { scale: 0.96 } : {}
                  }
                  onClick={handleCheckAnswer}
                  disabled={selectedIndex === null && currentQuestion?.type !== 'peragakan'}
                  className={`w-full sm:w-44 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-md transition border-b-4 ${
                    selectedIndex !== null || currentQuestion?.type === 'peragakan'
                      ? 'bg-gradient-to-b from-[#FF4754] to-[#E02424] border-[#991B1B] hover:brightness-105 cursor-pointer'
                      : 'bg-gray-300 border-gray-400 text-gray-100 cursor-not-allowed opacity-70'
                  }`}
                >
                  {isDetecting ? 'MEMINDAI...' : 'CEK'}
                </motion.button>
              )}
            </div>
          </div>
        </footer>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL KONFIRMASI KELUAR */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center border border-gray-100"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto mb-4 border border-rose-200">
                ✋
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Ingin berhenti sekarang?</h3>
              <p className="text-sm text-gray-500 font-bold mb-6">
                Progres kuis pada sesi ini tidak akan tersimpan jika kamu keluar di tengah jalan.
              </p>
              <div className="flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full py-3"
                  onClick={() => setShowExitModal(false)}
                >
                  LANJUTKAN BELAJAR
                </Button>
                <button
                  onClick={() => navigate('/belajar')}
                  className="w-full py-2.5 rounded-2xl text-gray-400 hover:text-gray-700 font-extrabold text-sm transition"
                >
                  KELUAR DARI KUIS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
