import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { progressService, recordDailyLessonCompletion } from '../services/storage'
import { getLevelStages } from '../data/allLevelsQuizData'
import { analyzeHandGesture } from '../utils/gestureDetector'
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
  const currentStages = getLevelStages(levelId)
  const currentStage = currentStages.find((s) => s.stageId === currentStageId) || currentStages[0]

  // Queue-based questions (mendukung mistake recovery & smart skipping)
  const [queue, setQueue] = useState([])
  const [totalOriginal, setTotalOriginal] = useState(0)
  const [correctIds, setCorrectIds] = useState(new Set())
  const [wrongCount, setWrongCount] = useState(0)
  const [isRetryingWrong, setIsRetryingWrong] = useState(false)

  // Question interaction state
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Kamera & Real-time Vision Gesture Recognition State
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
  const [visionFeedback, setVisionFeedback] = useState('Posisikan tanganmu di dalam bingkai kamera')
  const [visionStatus, setVisionStatus] = useState('idle') // 'idle' | 'detecting' | 'success' | 'wrong'
  const [handHoldProgress, setHandHoldProgress] = useState(0) // 0 - 100% hold timer untuk akurasi

  const videoRef = useRef(null)
  const hiddenCanvasRef = useRef(null)
  const detectionLoopRef = useRef(null)
  const holdCountRef = useRef(0)

  // Quiz completion / Result Page state
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)
  const [resultStats, setResultStats] = useState({
    accuracy: 100,
    xpEarned: 20,
    streak: 1,
    correctTotal: 0,
    totalQuestions: 0,
  })

  // Modal confirm exit
  const [showExitModal, setShowExitModal] = useState(false)

  // Inisialisasi antrean soal setiap kali level atau stage berganti
  useEffect(() => {
    const stages = getLevelStages(levelId)
    const stage = stages.find((s) => s.stageId === currentStageId) || stages[0]

    // Cek apakah ada saved in-progress session untuk stage ini
    const savedProgressKey = `handoora_session_progress_${user?.id || 'guest'}_L${levelId}_S${currentStageId}`
    const savedData = localStorage.getItem(savedProgressKey)
    let initialQueue = [...stage.questions]

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (Array.isArray(parsed.remainingQuestionIds) && parsed.remainingQuestionIds.length > 0) {
          const map = new Map(stage.questions.map((q) => [q.id, q]))
          const restoredQueue = parsed.remainingQuestionIds.map((id) => map.get(id)).filter(Boolean)
          if (restoredQueue.length > 0) {
            initialQueue = restoredQueue
            setCorrectIds(new Set(parsed.solvedQuestionIds || []))
          }
        }
      } catch (e) {
        console.warn('Gagal membaca sesi tersimpan:', e)
      }
    } else {
      setCorrectIds(new Set())
    }

    setQueue(initialQueue)
    setTotalOriginal(stage.questions.length)
    setWrongCount(0)
    setIsRetryingWrong(false)
    setSelectedIndex(null)
    setIsAnswerChecked(false)
    setIsCorrect(false)
    setIsQuizCompleted(false)
    setVisionStatus('idle')
    setVisionFeedback('Posisikan tanganmu di dalam bingkai kamera')
    setHandHoldProgress(0)
    holdCountRef.current = 0
  }, [levelId, currentStageId, user?.id])

  // Simpan state progress saat antrean berubah
  useEffect(() => {
    if (!currentStage || isQuizCompleted) return
    const savedProgressKey = `handoora_session_progress_${user?.id || 'guest'}_L${levelId}_S${currentStageId}`
    if (queue.length > 0 && queue.length < totalOriginal) {
      localStorage.setItem(
        savedProgressKey,
        JSON.stringify({
          levelId,
          stageId: currentStageId,
          remainingQuestionIds: queue.map((q) => q.id),
          solvedQuestionIds: Array.from(correctIds),
          updatedAt: Date.now(),
        })
      )
    } else if (isQuizCompleted || queue.length === 0) {
      localStorage.removeItem(savedProgressKey)
    }
  }, [queue, correctIds, isQuizCompleted, currentStage, levelId, currentStageId, user?.id, totalOriginal])

  // Current question adalah item pertama di antrean
  const currentQuestion = queue.length > 0 ? queue[0] : null

  // Progress Bar calculation
  const progressPercent =
    totalOriginal > 0 ? Math.min(100, Math.round((correctIds.size / totalOriginal) * 100)) : 0

  // -------------------------------------------------------------
  // REAL-TIME WEBCAM & HAND GESTURE DETECTION LOOP
  // -------------------------------------------------------------
  const streamRef = useRef(null)

  const stopCameraStream = () => {
    stopDetectionLoop()
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop())
      } catch (e) {
        // ignore
      }
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const startCameraStream = async () => {
    stopCameraStream()
    setVisionStatus('detecting')
    setVisionFeedback('Membuka kamera & mendeteksi isyarat tangan...')
    setHandHoldProgress(0)
    holdCountRef.current = 0

    const constraintsList = [
      { video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false },
      { video: { facingMode: 'user' }, audio: false },
      { video: true, audio: false },
    ]

    let stream = null
    for (const constraints of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (stream) break
      } catch (err) {
        // coba fallback berikutnya
      }
    }

    if (!stream) {
      setCameraActive(false)
      setCameraPermissionDenied(true)
      setVisionStatus('idle')
      setVisionFeedback('Kamera tidak aktif. Klik "Aktifkan Kamera" atau "LOMPATI" di bawah.')
      return
    }

    streamRef.current = stream
    setCameraActive(true)
    setCameraPermissionDenied(false)

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      try {
        await videoRef.current.play()
      } catch (err) {
        console.warn('Autoplay video error, will play on metadata:', err)
      }
    }

    startDetectionLoop()
  }

  useEffect(() => {
    if (!currentQuestion) return

    if (currentQuestion.type === 'peragakan') {
      startCameraStream()
    } else {
      stopCameraStream()
      setVisionStatus('idle')
    }

    return () => {
      stopCameraStream()
    }
  }, [currentQuestion?.id])

  const stopDetectionLoop = () => {
    if (detectionLoopRef.current) {
      clearInterval(detectionLoopRef.current)
      detectionLoopRef.current = null
    }
  }

  const startDetectionLoop = () => {
    stopDetectionLoop()
    holdCountRef.current = 0

    detectionLoopRef.current = setInterval(() => {
      if (!videoRef.current || !hiddenCanvasRef.current || isAnswerChecked) return

      const video = videoRef.current
      const canvas = hiddenCanvasRef.current
      if (video.readyState < 2) return

      const analysis = analyzeHandGesture(video, canvas, currentQuestion?.targetLetter)

      if (analysis.detected) {
        // Tangan cocok! Tingkatkan hold count agar pengguna menahan posisi stabil selama ~1 detik
        holdCountRef.current += 1
        const pct = Math.min(100, Math.round((holdCountRef.current / 4) * 100))
        setHandHoldProgress(pct)
        setVisionStatus('detecting')
        setVisionFeedback(`Bagus! Tahan posisimu... (${pct}%)`)

        if (holdCountRef.current >= 4) {
          // BERHASIL 100%! Berikan border hijau sukses dan kunci jawaban benar
          stopDetectionLoop()
          setVisionStatus('success')
          setVisionFeedback('Luar biasa! Isyarat tangan terdeteksi benar!')
          setIsCorrect(true)
          setIsAnswerChecked(true)
        }
      } else {
        // Jika tangan hilang atau salah pose
        if (holdCountRef.current > 0) {
          holdCountRef.current = Math.max(0, holdCountRef.current - 1)
          setHandHoldProgress(Math.round((holdCountRef.current / 4) * 100))
        }
        if (analysis.handPresent) {
          setVisionStatus('wrong')
          setVisionFeedback(analysis.feedback || 'Gerakan belum tepat, sesuaikan posisi tanganmu')
        } else {
          setVisionStatus('detecting')
          setVisionFeedback('Posisikan tanganmu ke depan kamera')
        }
      }
    }, 280) // Cek setiap ~280ms untuk performa mulus 60fps
  }

  // Handle pilih opsi jawaban kartu
  const handleSelectOption = (idx) => {
    if (isAnswerChecked) return
    setSelectedIndex(idx)
  }

  // Handle Periksa / CEK untuk soal pilihan kartu & tebak huruf
  const handleCheckAnswer = () => {
    if (!currentQuestion || isAnswerChecked) return
    if (selectedIndex === null) return

    const correct = selectedIndex === currentQuestion.correctIndex
    setIsCorrect(correct)
    setIsAnswerChecked(true)
  }

  // Handle LOMPATI (Skip)
  // Aturan baru: Melompati soal TIDAK dianggap salah! Soal hanya dipindahkan ke akhir antrean
  // Khusus untuk soal kamera (jika user belum siap open cam), soal kamera dipindah ke belakang
  // sehingga soal pilihan/tebak didahulukan.
  const handleSkipQuestion = () => {
    if (!currentQuestion || isAnswerChecked) return

    const remainingQueue = queue.slice(1)
    // Pindahkan soal yang dilewati ke antrean paling belakang tanpa menambah wrongCount
    setQueue([...remainingQueue, currentQuestion])

    // Reset interaction state
    setSelectedIndex(null)
    setIsAnswerChecked(false)
    setIsCorrect(false)
    setVisionStatus('idle')
    setHandHoldProgress(0)
    holdCountRef.current = 0
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
      // JAWABAN SALAH:
      // Masukkan soal ini kembali ke antrean paling akhir (Mistake Recovery)
      setWrongCount((prev) => prev + 1)
      setIsRetryingWrong(true)
      setQueue([...remainingQueue, currentQuestion])
    }

    // Reset interaction state untuk soal berikutnya
    setSelectedIndex(null)
    setIsAnswerChecked(false)
    setIsCorrect(false)
    setVisionStatus('idle')
    setHandHoldProgress(0)
    holdCountRef.current = 0
  }

  // Simpan progres ke local storage / Supabase saat kuis selesai
  const finishQuizSession = async (finalCorrectCount) => {
    setIsQuizCompleted(true)

    // Trigger selebrasi confetti mewah
    triggerLuxuryConfetti()

    // Hapus sesi saved in-progress karena kuis sudah selesai tuntas
    const savedProgressKey = `handoora_session_progress_${user?.id || 'guest'}_L${levelId}_S${currentStageId}`
    localStorage.removeItem(savedProgressKey)

    // Setiap kali user menyelesaikan tahapan atau menyelesaikan ulang level ini,
    // berikan reward XP (stage.xpReward = 20 XP; jika menuntaskan Tahap 3, dapat bonus level completion +30 XP)
    const baseStageXp = currentStage?.xpReward || 20
    const levelBonusXp = currentStageId === 3 ? 30 : 0
    const earnedXp = baseStageXp + levelBonusXp
    const accuracy =
      totalOriginal > 0 ? Math.round((totalOriginal / (totalOriginal + wrongCount)) * 100) : 100

    const userId = user?.id || 'guest'
    let finalStreak = 1

    try {
      const currentProgress = progressService.getProgress(userId)
      const newXp = (Number(currentProgress?.xp) || 0) + earnedXp

      // Update streak harian real-time (hanya bertambah maks 1 per hari, api menyala)
      const streakProgress = recordDailyLessonCompletion(currentProgress)
      finalStreak = streakProgress.streak

      // Simpan stage completion flag
      const stageKey = `handoora_stage_done_${userId}_L${levelId}_S${currentStageId}`
      localStorage.setItem(stageKey, 'true')

      // Jika ini Tahap 3 (tahap akhir level), unlock level berikutnya jika belum
      let unlocked = Array.isArray(currentProgress?.unlockedIslands)
        ? [...currentProgress.unlockedIslands]
        : [1]
      let completed = Array.isArray(currentProgress?.completedIslands)
        ? [...currentProgress.completedIslands]
        : []

      if (currentStageId === 3) {
        if (!completed.includes(levelId)) completed.push(levelId)
        const nextLevel = levelId + 1
        if (nextLevel <= 6 && !unlocked.includes(nextLevel)) {
          unlocked.push(nextLevel)
        }
      }

      const updatedProgress = {
        ...streakProgress,
        xp: newXp,
        unlockedIslands: unlocked,
        completedIslands: completed,
      }

      // Simpan ke local cache & Supabase
      localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(updatedProgress))
      if (user?.id) {
        await progressService.saveProgressToSupabase(user.id, updatedProgress)
      }
    } catch (err) {
      console.warn('Gagal menyimpan progres kuis otomatis:', err)
    }

    setResultStats({
      accuracy,
      xpEarned: earnedXp,
      streak: finalStreak,
      correctTotal: finalCorrectCount,
      totalQuestions: totalOriginal,
    })
  }

  // Navigasi ke tahap berikutnya atau kembali ke pulau beranda
  const handleProceedNextStage = () => {
    if (currentStageId < 3) {
      const nextStage = currentStageId + 1
      setCurrentStageId(nextStage)
      navigate(`/quiz/${levelId}/${nextStage}`, { replace: true })
    } else {
      // Selesai seluruh tahapan level ini, kembali ke beranda dengan pulau baru terbuka
      navigate('/belajar')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-nunito flex flex-col justify-between select-none">
      {/* Hidden offscreen canvas untuk analisis frame video */}
      <canvas ref={hiddenCanvasRef} width={240} height={180} className="hidden" />

      {/* ========================================================= */}
      {/* 1. TOP HEADER (Progress, Stage, Close Button) */}
      {/* ========================================================= */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between gap-4 sm:gap-6">
        {/* Tombol Keluar (✕) */}
        <button
          onClick={() => setShowExitModal(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100/80 transition cursor-pointer shrink-0 border border-transparent hover:border-gray-200"
          title="Keluar dari Kuis"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Dynamic Animated Progress Bar */}
        <div className="flex-1 max-w-md">
          <div className="w-full h-3 sm:h-3.5 bg-gray-200/80 rounded-full overflow-hidden p-0.5 shadow-inner relative">
            <motion.div
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#FF5C5C] to-[#E02424] rounded-full relative"
            >
              <div className="absolute inset-x-1 top-0.5 h-0.5 bg-white/40 rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Badge Level & Tahap Modern & Clean */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-gray-200/90 text-gray-700 font-extrabold text-xs flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <span className="w-2 h-2 rounded-full bg-[#E02424]" />
            <span className="tracking-wide">Level {levelId}</span>
            <span className="text-gray-300 font-normal">|</span>
            <span className="text-gray-500 font-bold">Tahap {currentStageId}/3</span>
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
            {/* Maskot Doora Selebrasi Berdiri Ramah */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-4 flex items-center justify-center">
              {/* Efek Lingkaran Cahaya Selebrasi Lembut di Belakang Maskot */}
              <div className="absolute inset-2 -z-10 rounded-full bg-gradient-to-tr from-[#FFE58F]/40 via-[#FFB8B8]/35 to-[#FFF0F0]/60 blur-xl scale-95" />
              <div className="absolute inset-6 -z-10 rounded-full bg-gradient-to-b from-[#FFF5F5] to-[#FFEBEB] border-2 border-[#FFD6D6]/60 shadow-[0_8px_24px_rgba(224,36,36,0.08)]" />

              {/* Partikel Cahaya Selebrasi Halus */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-2 right-4 text-amber-400 select-none pointer-events-none"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-4 left-4 text-rose-400 select-none pointer-events-none"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.div>

              {/* Karakter Maskot Doora HD dengan Animasi Mengapung Halus */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full flex items-center justify-center p-2"
              >
                <img
                  src="/assets/mascot-standing.png"
                  alt="Maskot Doora Handoora"
                  className="w-full h-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.18)]"
                  draggable={false}
                />
              </motion.div>
            </div>

            {/* Judul Besar Hasil */}
            <h1 className="text-3xl sm:text-4xl font-black text-[#E02424] tracking-tight mb-2">
              Pelajaran selesai!
            </h1>
            <p className="text-gray-500 font-bold text-sm sm:text-base mb-6">
              {currentStageId === 3
                ? `Luar biasa! Kamu telah menguasai seluruh materi pada Level ${levelId}!`
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
              className="w-full py-4 text-base font-extrabold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              onClick={handleProceedNextStage}
            >
              <span>
                {currentStageId < 3 ? `LANJUT KE TAHAP ${currentStageId + 1}` : `SELESAIKAN LEVEL ${levelId}`}
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
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
                  <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Yuk ulangi soal yang tadi terlewat agar semakin lancar!</span>
                </motion.div>
              )}

              {/* Teks Instruksi Soal */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 text-center mb-6 tracking-tight">
                {currentQuestion.prompt}
              </h2>

              {/* ----------------------------------------------------- */}
              {/* TIPE 1: 'peragakan' (Kamera Preview Otomatis + AI Feedback) */}
              {/* ----------------------------------------------------- */}
              {currentQuestion.type === 'peragakan' && (
                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                  {/* Kartu Kiri: Kamera Live Viewfinder Clean */}
                  <div
                    className={`relative aspect-4/3 sm:aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center p-4 transition-all duration-300 border-2 ${
                      visionStatus === 'success'
                        ? 'border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.4)] ring-4 ring-emerald-400/20'
                        : visionStatus === 'wrong'
                        ? 'border-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-4 ring-rose-400/20'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Video element selalu di-mount agar ref langsung tersedia dan siap streaming */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={(e) => {
                        e.target.play().catch(() => {})
                      }}
                      className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                        cameraActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                      }`}
                    />

                    {!cameraActive && (
                      <div className="flex flex-col items-center text-center p-5 text-slate-300 z-20">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-3 text-slate-300 shadow-inner">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="font-black text-sm mb-1 text-white">
                          {cameraPermissionDenied ? 'Izin Kamera Belum Aktif' : 'Menyiapkan Kamera...'}
                        </p>
                        <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed font-medium">
                          {cameraPermissionDenied
                            ? 'Izinkan akses kamera di browsermu agar Handoora dapat mengevaluasi bentuk tanganmu.'
                            : 'Posisikan tanganmu di dalam area pandang kamera sesuai isyarat.'}
                        </p>
                        <button
                          type="button"
                          onClick={startCameraStream}
                          className="px-4 py-2.5 rounded-xl bg-[#E02424] hover:bg-[#c91d1d] text-white text-xs font-black shadow-sm hover:shadow transition cursor-pointer flex items-center gap-2"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Aktifkan Kamera</span>
                        </button>
                      </div>
                    )}

                    {/* Sudut Retikel Kamera Minimalis */}
                    <div
                      className={`absolute top-3.5 left-3.5 w-5 h-5 border-t-2 border-l-2 rounded-tl-md pointer-events-none transition-colors ${
                        visionStatus === 'success' ? 'border-emerald-400' : 'border-white/50'
                      }`}
                    />
                    <div
                      className={`absolute top-3.5 right-3.5 w-5 h-5 border-t-2 border-r-2 rounded-tr-md pointer-events-none transition-colors ${
                        visionStatus === 'success' ? 'border-emerald-400' : 'border-white/50'
                      }`}
                    />
                    <div
                      className={`absolute bottom-3.5 left-3.5 w-5 h-5 border-b-2 border-l-2 rounded-bl-md pointer-events-none transition-colors ${
                        visionStatus === 'success' ? 'border-emerald-400' : 'border-white/50'
                      }`}
                    />
                    <div
                      className={`absolute bottom-3.5 right-3.5 w-5 h-5 border-b-2 border-r-2 rounded-br-md pointer-events-none transition-colors ${
                        visionStatus === 'success' ? 'border-emerald-400' : 'border-white/50'
                      }`}
                    />

                    {/* Hold Progress Bar di bagian atas frame kamera */}
                    {handHoldProgress > 0 && visionStatus !== 'success' && (
                      <div className="absolute top-3 inset-x-12 h-1.5 bg-black/50 rounded-full overflow-hidden p-0.5">
                        <motion.div
                          animate={{ width: `${handHoldProgress}%` }}
                          className="h-full bg-emerald-400 rounded-full"
                        />
                      </div>
                    )}

                    {/* Badge Sinyal Deteksi Real-Time di Bawah Kamera */}
                    <div
                      className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full text-white text-[11px] font-bold border flex items-center gap-2 shadow-lg backdrop-blur-md max-w-[90%] text-center transition-all ${
                        visionStatus === 'success'
                          ? 'bg-emerald-600/95 border-emerald-400/50'
                          : visionStatus === 'wrong'
                          ? 'bg-rose-600/95 border-rose-400/50'
                          : 'bg-black/80 border-white/15'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          visionStatus === 'success'
                            ? 'bg-emerald-300'
                            : visionStatus === 'wrong'
                            ? 'bg-rose-300 animate-pulse'
                            : 'bg-amber-400 animate-pulse'
                        }`}
                      />
                      <span className="truncate">{visionFeedback}</span>
                    </div>
                  </div>

                  {/* Kartu Kanan: Target Isyarat & Gambar Referensi HD Clean Modern */}
                  <div className="relative aspect-4/3 sm:aspect-square flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-3xl p-5 sm:p-6 text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between border border-gray-200/90 hover:border-gray-300 transition">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <span className="text-[10px] font-black tracking-wider uppercase bg-rose-50 border border-rose-100 text-[#E02424] px-2.5 py-1 rounded-md">
                          Target BISINDO
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-gray-900">{currentQuestion.targetLetter}</span>
                      </div>

                      {/* Gambar Isyarat HD Utuh */}
                      <div className="w-full flex-1 flex items-center justify-center my-3">
                        <div className="w-36 h-36 sm:w-44 sm:h-44 bg-gray-50/80 rounded-2xl p-3 border border-gray-100 flex items-center justify-center">
                          <img
                            src={currentQuestion.signImg}
                            alt={`Isyarat ${currentQuestion.targetLetter}`}
                            className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 text-center font-medium leading-relaxed bg-gray-50/60 rounded-xl py-2 px-3 border border-gray-100">
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
                        whileHover={!isAnswerChecked ? { y: -4 } : {}}
                        whileTap={!isAnswerChecked ? { scale: 0.98 } : {}}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerChecked}
                        className={`relative aspect-3/4 rounded-3xl p-3.5 flex flex-col items-center justify-between transition cursor-pointer border-2 shadow-xs ${
                          isSelected
                            ? 'bg-rose-50/70 border-[#E02424] text-[#E02424] shadow-sm ring-2 ring-[#E02424]/20'
                            : 'bg-white hover:bg-gray-50/80 border-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="w-full flex justify-between items-center">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                              isSelected ? 'bg-[#E02424] text-white' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </div>

                        <div
                          className={`w-full flex-1 mx-auto my-2 rounded-2xl flex items-center justify-center p-2.5 transition ${
                            isSelected ? 'bg-white border border-rose-100 shadow-xs' : 'bg-gray-50/70'
                          }`}
                        >
                          <img
                            src={opt.signImg}
                            alt={`Opsi ${idx + 1}`}
                            className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                          />
                        </div>

                        <div className="text-[11px] font-extrabold uppercase tracking-wider">
                          {isSelected ? 'Terpilih' : opt.letter || 'Pilih'}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* ----------------------------------------------------- */}
              {/* TIPE 3: 'tebak_huruf' / Pilihan Kata */}
              {/* ----------------------------------------------------- */}
              {currentQuestion.type === 'tebak_huruf' && (
                <div className="w-full max-w-xl flex flex-col items-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-3xl border border-gray-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.04)] p-4 flex items-center justify-center mb-6 relative">
                    <img
                      src={currentQuestion.signImg}
                      alt="Tebak Isyarat"
                      className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                    />
                    <div className="absolute top-3 right-3 text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                      BISINDO
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((optionText, idx) => {
                      const isSelected = selectedIndex === idx
                      return (
                        <motion.button
                          key={idx}
                          whileHover={!isAnswerChecked ? { y: -2 } : {}}
                          whileTap={!isAnswerChecked ? { scale: 0.98 } : {}}
                          onClick={() => handleSelectOption(idx)}
                          disabled={isAnswerChecked}
                          className={`py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base border-2 transition cursor-pointer shadow-xs text-center ${
                            isSelected
                              ? 'bg-rose-50 border-[#E02424] text-[#E02424] shadow-sm'
                              : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {optionText}
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
      {/* 3. BOTTOM FOOTER BAR */}
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
                        {currentQuestion?.type === 'peragakan'
                          ? 'Gerakan tanganmu terdeteksi sempurna oleh kamera!'
                          : 'Jawabanmu tepat sekali! Pertahankan fokusmu.'}
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
                        {currentQuestion?.explanation ||
                          'Jangan berkecil hati, soal ini akan diulang di akhir kuis.'}
                      </p>
                    </div>
                  </motion.div>
                )
              ) : (
                /* Tombol LOMPATI di sisi kiri */
                <button
                  onClick={handleSkipQuestion}
                  className="px-5 py-2.5 rounded-2xl border-2 border-gray-300 hover:bg-gray-100 text-gray-500 font-extrabold text-sm uppercase tracking-wider transition cursor-pointer"
                >
                  LOMPATI
                </button>
              )}
            </div>

            {/* Tombol Aksi Utama: Untuk peragakan otomatis deteksi, saat benar muncul LANJUTKAN */}
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
              ) : currentQuestion?.type === 'peragakan' ? (
                /* Pada tipe peragakan, kamera mendeteksi otomatis */
                <div className="px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Mendeteksi Gerakan Kamera...</span>
                </div>
              ) : (
                /* Soal pilihan kartu / tebak huruf: pakai tombol CEK */
                <motion.button
                  whileHover={selectedIndex !== null ? { scale: 1.02 } : {}}
                  whileTap={selectedIndex !== null ? { scale: 0.98 } : {}}
                  onClick={handleCheckAnswer}
                  disabled={selectedIndex === null}
                  className={`w-full sm:w-44 py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-sm transition ${
                    selectedIndex !== null
                      ? 'bg-[#E02424] hover:bg-[#c91d1d] cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-80'
                  }`}
                >
                  CEK
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
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-200">
                <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Ingin istirahat dulu?</h3>
              <p className="text-sm text-gray-500 font-bold mb-6">
                Progres soalanmu tersimpan otomatis. Kamu bisa melanjutkannya kapan saja!
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
                  SIMPAN & KELUAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
