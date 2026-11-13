// Sound Effects Engine untuk Handoora Quiz
// Menggunakan HTML5 Audio dengan fallback Web Audio API untuk keandalan 100% di semua browser

class SoundEffects {
  constructor() {
    this.audioCache = {}
    this.audioFiles = {
      select: '/assets/audio/select.wav',
      correct: '/assets/audio/correct.wav',
      wrong: '/assets/audio/wrong.wav',
      skip: '/assets/audio/skip.wav',
      victory: '/assets/audio/victory.wav',
    }
  }

  isSoundEnabled() {
    if (typeof window === 'undefined') return true
    try {
      const saved = localStorage.getItem('handoora_user_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.soundEnabled !== undefined) {
          return Boolean(parsed.soundEnabled)
        }
      }
    } catch {
      // ignore
    }
    return true
  }

  // Pre-load audio agar instan berbunyi saat dipanggil
  preload() {
    if (typeof window === 'undefined') return
    Object.entries(this.audioFiles).forEach(([name, src]) => {
      if (!this.audioCache[name]) {
        try {
          const audio = new Audio(src)
          audio.preload = 'auto'
          this.audioCache[name] = audio
        } catch {
          // ignore
        }
      }
    })
  }

  play(name, volume = 0.7) {
    if (typeof window === 'undefined') return
    if (!this.isSoundEnabled()) return

    const src = this.audioFiles[name]
    if (!src) return

    try {
      // Buat instance Audio baru atau clone agar dapat dimainkan berulang cepat tanpa terpotong
      const sound = new Audio(src)
      sound.volume = volume
      const playPromise = sound.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback Web Audio API jika browser memblokir HTML5 Audio
          this.playFallbackSynth(name)
        })
      }
    } catch {
      this.playFallbackSynth(name)
    }
  }

  // Fallback synthesizer
  playFallbackSynth(name) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      if (name === 'correct' || name === 'victory') {
        osc.frequency.setValueAtTime(587.33, t)
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.15)
      } else if (name === 'wrong') {
        osc.frequency.setValueAtTime(250, t)
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.25)
      } else {
        osc.frequency.setValueAtTime(440, t)
      }

      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.22)
    } catch {
      // ignore
    }
  }

  playSelect() {
    this.play('select', 0.6)
  }

  playCorrect() {
    this.play('correct', 0.8)
  }

  playWrong() {
    this.play('wrong', 0.7)
  }

  playSkip() {
    this.play('skip', 0.5)
  }

  playVictory() {
    this.play('victory', 0.85)
  }
}

export const soundFx = new SoundEffects()
if (typeof window !== 'undefined') {
  soundFx.preload()
}
