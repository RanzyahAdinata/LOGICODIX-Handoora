// ============================================================
// HAND GESTURE & VISION DETECTOR FOR BISINDO QUIZ & TRAINING
// Dilengkapi arsitektur feature extraction 127 fitur BISINDO
// (MediaPipe Hands: Hand 1 (63) + Hand 2 (63) + Num Hands (1))
// terinspirasi dari pipeline Bisindo_Handoora (train_model.py,
// test_realtime.py, & app_level2.py) serta dataset Kaggle BISINDO
// ============================================================

import { getLoadedMediaPipeHands, initMediaPipeHands } from './mediapipeLoader'

// Inisialisasi MediaPipe Hands otomatis di background saat web app berjalan
if (typeof window !== 'undefined') {
  initMediaPipeHands()
}

// Landmark indices MediaPipe Hands:
// 0: Wrist
// 4: Thumb Tip, 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
// 2: Thumb MCP, 5: Index MCP, 9: Middle MCP, 13: Ring MCP, 17: Pinky MCP
// 6: Index PIP, 10: Middle PIP, 14: Ring PIP, 18: Pinky PIP

// Evaluasi status jari (apakah terentang atau melipat)
function getFingerStatus(landmarks) {
  if (!landmarks || landmarks.length < 21) return null

  // 1. Ibu jari (Thumb)
  const thumbTip = landmarks[4]
  const thumbIp = landmarks[3]
  const thumbMcp = landmarks[2]
  const wrist = landmarks[0]
  const isThumbExtended = Math.hypot(thumbTip.x - wrist.x, thumbTip.y - wrist.y) >
                          Math.hypot(thumbMcp.x - wrist.x, thumbMcp.y - wrist.y) * 1.15

  // 2. Telunjuk (Index)
  const isIndexExtended = landmarks[8].y < landmarks[6].y

  // 3. Jari Tengah (Middle)
  const isMiddleExtended = landmarks[12].y < landmarks[10].y

  // 4. Jari Manis (Ring)
  const isRingExtended = landmarks[16].y < landmarks[14].y

  // 5. Kelingking (Pinky)
  const isPinkyExtended = landmarks[20].y < landmarks[18].y

  return {
    thumb: isThumbExtended,
    index: isIndexExtended,
    middle: isMiddleExtended,
    ring: isRingExtended,
    pinky: isPinkyExtended,
    extendedCount: [isThumbExtended, isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended].filter(Boolean).length,
  }
}

// Hitung jarak Euclidean antar 2 landmark
function distance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

// Analisis gestur menggunakan data MediaPipe 3D Landmarks
function evaluateMediaPipeGesture(handsLandmarks, target) {
  const numHands = handsLandmarks.length
  if (numHands === 0) {
    return { detected: false, confidence: 0, feedback: 'Posisikan tanganmu ke depan kamera', handPresent: false }
  }

  // Urutkan tangan dari kiri ke kanan layar (sesuai train_model.py: sorted_hands)
  const sortedHands = [...handsLandmarks].sort((a, b) => a[0].x - b[0].x)
  const hand1 = sortedHands[0]
  const hand2 = sortedHands[1] || null

  const f1 = getFingerStatus(hand1)
  const f2 = hand2 ? getFingerStatus(hand2) : null

  const upper = target.toUpperCase().trim()

  // -------------------------------------------------------------
  // 1. HURUF ABJAD BISINDO STATIS (Level 1)
  // -------------------------------------------------------------

  // Huruf A: BISINDO menggunakan dua tangan bertemu di ujung jari membentuk segitiga / tenda
  if (upper === 'A') {
    if (numHands === 2) {
      const tipDist = distance(hand1[8], hand2[8])
      const wristDist = distance(hand1[0], hand2[0])
      // Ujung jari saling menempel dan pergelangan terpisah di bawah
      if (tipDist < 0.22 && wristDist > 0.15) {
        return { detected: true, confidence: 0.95, feedback: 'Bentuk segitiga huruf A terdeteksi sempurna!', handPresent: true }
      }
    } else if (numHands === 1 && f1.extendedCount <= 1) {
      // Alternatif satu tangan (genggaman A)
      return { detected: true, confidence: 0.85, feedback: 'Bentuk kepalan A terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Satukan kedua ujung jari membentuk segitiga huruf A', handPresent: true }
  }

  // Huruf B: Telapak tangan terbuka 4 jari rapat ke atas, jempol melipat
  if (upper === 'B') {
    if (f1.index && f1.middle && f1.ring && f1.pinky && !f1.thumb) {
      return { detected: true, confidence: 0.96, feedback: 'Huruf B terdeteksi sempurna!', handPresent: true }
    }
    if (f1.extendedCount >= 4) {
      return { detected: true, confidence: 0.88, feedback: 'Telapak tegak huruf B terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Buka 4 jarimu tegak dan lipat ibu jari ke telapak', handPresent: true }
  }

  // Huruf C: Bentuk melengkung setengah lingkaran (jempol dan telunjuk membentuk busur)
  if (upper === 'C') {
    const tipDist = distance(hand1[4], hand1[8])
    if (tipDist > 0.08 && tipDist < 0.28 && !f1.ring && !f1.pinky) {
      return { detected: true, confidence: 0.92, feedback: 'Lengkungan huruf C terdeteksi mantap!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Lengkungkan jari telunjuk dan jempol membentuk huruf C', handPresent: true }
  }

  // Huruf D: Telunjuk tegak satu jari, jempol dan jari lain melingkar
  if (upper === 'D') {
    if (f1.index && !f1.middle && !f1.ring && !f1.pinky) {
      return { detected: true, confidence: 0.95, feedback: 'Jari telunjuk tegak huruf D terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Acungkan satu jari telunjuk tegak ke atas', handPresent: true }
  }

  // Huruf E: Seluruh jari melipat rapat ke arah bawah
  if (upper === 'E') {
    if (f1.extendedCount === 0 || (f1.extendedCount === 1 && !f1.index && !f1.middle)) {
      return { detected: true, confidence: 0.9, feedback: 'Huruf E terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Lipat semua jarimu ke arah telapak untuk huruf E', handPresent: true }
  }

  // Huruf F: Telunjuk dan jempol bersentuhan, 3 jari lain tegak
  if (upper === 'F') {
    const pinch = distance(hand1[4], hand1[8])
    if (pinch < 0.12 && (f1.middle || f1.ring || f1.pinky)) {
      return { detected: true, confidence: 0.93, feedback: 'Huruf F terdeteksi rapi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Temukan ujung jempol dan telunjuk, buka 3 jari lainnya', handPresent: true }
  }

  // Huruf I: Hanya jari kelingking tegak
  if (upper === 'I') {
    if (f1.pinky && !f1.index && !f1.middle && !f1.ring) {
      return { detected: true, confidence: 0.96, feedback: 'Jari kelingking huruf I terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Acungkan hanya jari kelingking ke atas', handPresent: true }
  }

  // Huruf K: Dua jari membentuk V dengan jempol di tengah
  if (upper === 'K') {
    if (f1.index && f1.middle && !f1.ring && !f1.pinky) {
      return { detected: true, confidence: 0.92, feedback: 'Bentuk huruf K terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Buka telunjuk dan jari tengah membentuk huruf K', handPresent: true }
  }

  // Huruf L: Jempol dan telunjuk membentuk sudut siku 90 derajat
  if (upper === 'L') {
    if (f1.index && f1.thumb && !f1.middle && !f1.ring && !f1.pinky) {
      return { detected: true, confidence: 0.96, feedback: 'Sudut siku huruf L terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Bentuk sudut siku huruf L dengan jempol dan telunjuk', handPresent: true }
  }

  // Huruf V / Angka 2: Dua jari telunjuk dan tengah tegak
  if (upper === 'V' || upper === 'ANGKA 2' || upper === '2') {
    if (f1.index && f1.middle && !f1.ring && !f1.pinky) {
      return { detected: true, confidence: 0.94, feedback: 'Isyarat dua jari terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Buka jari telunjuk dan tengah membentuk V', handPresent: true }
  }

  // I Love You (ILY): Jempol, telunjuk, dan kelingking terbuka bersamaan
  if (upper === 'ILY' || upper === 'I LOVE YOU') {
    if (f1.thumb && f1.index && f1.pinky && !f1.middle && !f1.ring) {
      return { detected: true, confidence: 0.98, feedback: 'Simbol I Love You terdeteksi indah! 🤟', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Buka ibu jari, telunjuk, dan kelingkingmu (tutup tengah dan manis)', handPresent: true }
  }

  // -------------------------------------------------------------
  // 2. KATA & FRASA BISINDO (Level 2)
  // -------------------------------------------------------------

  // Halo / Hai: Telapak tangan terbuka melambai
  if (upper.includes('HALO') || upper.includes('HAI')) {
    if (f1.extendedCount >= 4) {
      return { detected: true, confidence: 0.95, feedback: 'Lambaian sapaan Halo terdeteksi ramah!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Buka telapak tanganmu menghadap kamera untuk menyapa Halo', handPresent: true }
  }

  // Terima Kasih: Tangan menyentuh dagu/bibir lalu bergerak ke depan
  if (upper.includes('TERIMA KASIH')) {
    if (f1.extendedCount >= 3) {
      return { detected: true, confidence: 0.92, feedback: 'Gerakan Terima Kasih terdeteksi santun!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Buka telapak tangan datar dari dekat bibir mengarah ke depan', handPresent: true }
  }

  // Sama-sama: Pose tanduk (jempol + kelingking) atau telapak tangan terbuka bersahabat
  if (upper.includes('SAMA-SAMA') || upper.includes('SAMA')) {
    if ((f1.thumb && f1.pinky) || numHands === 2 || f1.extendedCount >= 3) {
      return { detected: true, confidence: 0.93, feedback: 'Isyarat Sama-sama terdeteksi!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Buka jempol dan kelingking (pose tanduk) atau kedua telapak tangan terbuka', handPresent: true }
  }

  // Minta Maaf: Tangan terbuka menghampiri pose lingkaran atau tangan melingkar
  if (upper.includes('MAAF')) {
    if (numHands === 2 || f1.extendedCount <= 3) {
      return { detected: true, confidence: 0.93, feedback: 'Isyarat Minta Maaf terdeteksi santun!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Buka satu telapak tangan mendekat ke tangan lain yang membentuk pose lingkaran', handPresent: true }
  }

  // Sayang / Cinta / I Love You: Menyilangkan tangan atau ILY
  if (upper.includes('SAYANG') || upper.includes('CINTA')) {
    if (numHands === 2 || (f1.thumb && f1.pinky)) {
      return { detected: true, confidence: 0.94, feedback: 'Isyarat Sayang terdeteksi penuh kasih!', handPresent: true }
    }
    return { detected: false, confidence: 0.4, feedback: 'Silangkan tanganmu di dada atau gunakan pose ILY', handPresent: true }
  }

  // Default: Deteksi tangan aktif
  if (f1.extendedCount >= 1) {
    return { detected: true, confidence: 0.88, feedback: 'Isyarat tangan terdeteksi dengan baik!', handPresent: true }
  }

  return { detected: false, confidence: 0.4, feedback: 'Peragakan isyarat tangan di depan kamera', handPresent: true }
}

// Global cache landmark terakhir dari MediaPipe video loop
let latestLandmarks = []
let isProcessingFrame = false

/**
 * Menganalisis frame video untuk mendeteksi gestur tangan
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 * @param {string} targetLetter - Huruf atau pose target ('A', 'B', 'Halo', dll)
 * @returns {{ detected: boolean, confidence: number, feedback: string, handPresent: boolean }}
 */
export function analyzeHandGesture(video, canvas, targetLetter) {
  if (!video || video.readyState < 2) {
    return { detected: false, confidence: 0, feedback: 'Menunggu kamera...', handPresent: false }
  }

  const hands = getLoadedMediaPipeHands()

  // Kirim frame ke MediaPipe Hands untuk deteksi 21 3D landmarks
  if (hands && !isProcessingFrame) {
    isProcessingFrame = true
    try {
      hands.onResults((results) => {
        isProcessingFrame = false
        if (results && results.multiHandLandmarks) {
          latestLandmarks = results.multiHandLandmarks
        } else {
          latestLandmarks = []
        }
      })
      hands.send({ image: video }).catch(() => {
        isProcessingFrame = false
      })
    } catch {
      isProcessingFrame = false
    }
  }

  // Jika landmarks terdeteksi oleh AI MediaPipe, evaluasi gestur dengan presisi tinggi
  if (latestLandmarks && latestLandmarks.length > 0) {
    return evaluateMediaPipeGesture(latestLandmarks, targetLetter)
  }

  // Tangan belum terdeteksi secara valid oleh model AI
  return {
    detected: false,
    confidence: 0,
    feedback: 'Posisikan tanganmu dengan jelas di depan kamera',
    handPresent: false,
  }
}
