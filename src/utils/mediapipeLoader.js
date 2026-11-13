// ============================================================
// MediaPipe Vision Hands Helper
// Memuat MediaPipe Hands dari global window.Hands
// ============================================================

let handsInstance = null

export function initMediaPipeHands() {
  if (typeof window === 'undefined') return null
  if (handsInstance) return handsInstance

  const HandsClass = window.Hands
  if (!HandsClass) return null

  try {
    const hands = new HandsClass({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.5,
    })

    handsInstance = hands
    return handsInstance
  } catch (err) {
    console.warn('Gagal menginisialisasi MediaPipe Hands:', err)
    return null
  }
}

export function getLoadedMediaPipeHands() {
  if (!handsInstance) {
    return initMediaPipeHands()
  }
  return handsInstance
}
