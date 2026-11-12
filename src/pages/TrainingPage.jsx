import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeHandGesture } from '../utils/gestureDetector'
import Button from '../components/ui/Button'
import { DICTIONARY_MODULES } from '../data/dictionaryData'

const TrainingPage = () => {
  const { letterParam } = useParams()
  const navigate = useNavigate()

  // Ambil semua entri kamus yang tersedia (Modul 1 & 2 yang aktif)
  const allAvailableSigns = DICTIONARY_MODULES.flatMap((m) =>
    m.entries.map((e) => ({ ...e, moduleBadge: m.badge }))
  )

  const initialLetter = (letterParam || 'A').toUpperCase()
  const foundSign =
    allAvailableSigns.find(
      (s) => s.letter.toUpperCase() === initialLetter || s.word.toUpperCase() === initialLetter
    ) || allAvailableSigns[0]

  const [currentSign, setCurrentSign] = useState(foundSign)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
  const [visionStatus, setVisionStatus] = useState('idle') // 'idle' | 'detecting' | 'success' | 'wrong'
  const [visionFeedback, setVisionFeedback] = useState('Posisikan tanganmu di dalam bingkai kamera')
  const [holdProgress, setHoldProgress] = useState(0)

  const videoRef = useRef(null)
  const hiddenCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const detectionLoopRef = useRef(null)
  const holdCountRef = useRef(0)

  // Buka kamera pengguna
  const startCamera = async () => {
    stopCamera()
    setVisionStatus('detecting')
    setVisionFeedback('Membuka kamera & menyiapkan deteksi isyarat...')
    setHoldProgress(0)
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
      } catch (e) {
        // coba constraints berikutnya
      }
    }

    if (!stream) {
      setCameraActive(false)
      setCameraPermissionDenied(true)
      setVisionStatus('idle')
      setVisionFeedback('Kamera tidak aktif. Izinkan akses kamera browser untuk berlatih.')
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
        console.warn('Autoplay video:', err)
      }
    }

    startDetection()
  }

  const stopCamera = () => {
    if (detectionLoopRef.current) {
      clearInterval(detectionLoopRef.current)
      detectionLoopRef.current = null
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop())
      } catch {}
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const startDetection = () => {
    if (detectionLoopRef.current) clearInterval(detectionLoopRef.current)
    holdCountRef.current = 0

    detectionLoopRef.current = setInterval(() => {
      if (!videoRef.current || !hiddenCanvasRef.current) return
      const video = videoRef.current
      const canvas = hiddenCanvasRef.current
      if (video.readyState < 2) return

      const analysis = analyzeHandGesture(video, canvas, currentSign.letter)

      if (analysis.detected) {
        holdCountRef.current += 1
        const pct = Math.min(100, Math.round((holdCountRef.current / 4) * 100))
        setHoldProgress(pct)
        setVisionFeedback('Bagus! Pertahankan posisi tanganmu...')

        if (holdCountRef.current >= 4) {
          setVisionStatus('success')
          setVisionFeedback('Luar biasa! Isyaratmu berhasil terdeteksi sempurna!')
        }
      } else if (analysis.handPresent) {
        holdCountRef.current = Math.max(0, holdCountRef.current - 1)
        setHoldProgress(0)
        setVisionStatus('wrong')
        setVisionFeedback(analysis.feedback || 'Sesuaikan bentuk jarimu sesuai gambar referensi')
      } else {
        holdCountRef.current = 0
        setHoldProgress(0)
        setVisionStatus('detecting')
        setVisionFeedback('Posisikan tanganmu di dalam bingkai kamera')
      }
    }, 280)
  }

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [currentSign.letter])

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col justify-between select-none">
      <canvas ref={hiddenCanvasRef} width={240} height={180} className="hidden" />

      {/* Header Halaman Latihan */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/belajar')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
        >
          <span>←</span>
          <span>Kembali ke Kamus</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#E02424] font-black text-xs uppercase tracking-wider">
            Mode Latihan Bebas BISINDO
          </span>
        </div>
      </header>

      {/* Konten Utama: 2 Kolom (Kamera Live + Kartu Panduan Isyarat) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
            Latih Isyarat "{currentSign.word}"
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-500 mt-1 max-w-lg mx-auto">
            Peragakan bentuk tanganmu di depan kamera. AI Handoora akan mendeteksi kesesuaian gerakan secara langsung.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto w-full">
          {/* Kolom Kiri: Kamera Live View */}
          <div className="flex flex-col">
            <div
              className={`relative w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-lg flex flex-col items-center justify-center p-4 transition-all duration-300 border-3 ${
                visionStatus === 'success'
                  ? 'border-emerald-500 ring-4 ring-emerald-400/40 shadow-emerald-500/20'
                  : visionStatus === 'wrong'
                  ? 'border-rose-500 ring-4 ring-rose-400/30 shadow-rose-500/20'
                  : 'border-slate-800'
              }`}
            >
              {/* Video element selalu di-mount agar ref langsung tersedia dan siap streaming */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => e.target.play().catch(() => {})}
                className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                  cameraActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                }`}
              />

              {!cameraActive && (
                <div className="flex flex-col items-center text-center p-6 text-slate-300 z-20">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-3 shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-black text-sm mb-1 text-white">
                    {cameraPermissionDenied ? 'Izin Kamera Belum Aktif' : 'Menyiapkan Kamera...'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mb-4 font-bold leading-relaxed">
                    Aktifkan kamera pada browsermu agar AI dapat membaca isyarat tanganmu.
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4754] to-[#E02424] text-white text-xs font-black shadow-md cursor-pointer hover:scale-102 transition"
                  >
                    Buka Kamera
                  </button>
                </div>
              )}

              {/* Sudut Retikel Kamera */}
              <div className={`absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 rounded-tl-xl pointer-events-none transition-colors ${visionStatus === 'success' ? 'border-emerald-400' : 'border-white/60'}`} />
              <div className={`absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 rounded-tr-xl pointer-events-none transition-colors ${visionStatus === 'success' ? 'border-emerald-400' : 'border-white/60'}`} />
              <div className={`absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 rounded-bl-xl pointer-events-none transition-colors ${visionStatus === 'success' ? 'border-emerald-400' : 'border-white/60'}`} />
              <div className={`absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 rounded-br-xl pointer-events-none transition-colors ${visionStatus === 'success' ? 'border-emerald-400' : 'border-white/60'}`} />

              {/* Hold progress bar */}
              {holdProgress > 0 && visionStatus !== 'success' && (
                <div className="absolute top-4 inset-x-12 h-2 bg-black/40 rounded-full overflow-hidden p-0.5">
                  <div style={{ width: `${holdProgress}%` }} className="h-full bg-emerald-400 rounded-full transition-all duration-150" />
                </div>
              )}

              {/* Badge Status Deteksi */}
              <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white text-xs font-bold border flex items-center gap-2 shadow-lg backdrop-blur-md max-w-[90%] text-center transition-all ${
                  visionStatus === 'success'
                    ? 'bg-emerald-600/95 border-emerald-300'
                    : visionStatus === 'wrong'
                    ? 'bg-rose-600/95 border-rose-300'
                    : 'bg-black/80 border-white/20'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    visionStatus === 'success'
                      ? 'bg-emerald-300 ring-2 ring-emerald-100'
                      : visionStatus === 'wrong'
                      ? 'bg-rose-300 animate-pulse'
                      : 'bg-amber-400 animate-ping'
                  }`}
                />
                <span className="truncate">{visionFeedback}</span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Panduan Gambar Isyarat HD & Deskripsi */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  {currentSign.moduleBadge || 'BISINDO'}
                </span>
                <span className="text-2xl font-black text-gray-800">{currentSign.letter}</span>
              </div>

              <div className="w-full aspect-square max-w-[220px] mx-auto rounded-2xl bg-[#FFF6F6] p-4 flex items-center justify-center border border-rose-100 mb-4 shadow-inner">
                <img
                  src={currentSign.signImg}
                  alt={currentSign.word}
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>

              <h2 className="text-xl font-black text-gray-800 text-center mb-1.5">
                {currentSign.word}
              </h2>
              <p className="text-xs font-bold text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                {currentSign.desc}
              </p>
            </div>

            {/* Pilihan Cepat Huruf Lain untuk Dilatih */}
            <div className="pt-5 mt-5 border-t border-gray-100">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-2.5 text-center">
                Pilih Isyarat Lain:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-center flex-wrap">
                {allAvailableSigns.slice(0, 10).map((s) => (
                  <button
                    key={s.letter}
                    onClick={() => {
                      setCurrentSign(s)
                      setVisionStatus('detecting')
                      setVisionFeedback('Posisikan tanganmu di dalam bingkai kamera')
                      setHoldProgress(0)
                      holdCountRef.current = 0
                    }}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer border ${
                      currentSign.letter === s.letter
                        ? 'bg-[#E02424] text-white border-[#E02424] shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {s.letter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TrainingPage
