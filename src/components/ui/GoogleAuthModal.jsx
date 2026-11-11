import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const supabaseBaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const projectRef = supabaseBaseUrl.replace('https://', '').split('.')[0]
const CALLBACK_URL = `${supabaseBaseUrl}/auth/v1/callback`
const SUPABASE_GOOGLE_SETTINGS_URL = `https://supabase.com/dashboard/project/${projectRef}/auth/providers?provider=Google`
const GOOGLE_CLOUD_CONSOLE_URL = 'https://console.cloud.google.com/apis/credentials'

const GoogleAuthModal = ({ isOpen, onClose, onRetryGoogle }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(CALLBACK_URL)
    setCopied(true)
    toast.success('Redirect URI berhasil disalin!')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-gray-200 max-w-[440px] w-full p-6 sm:p-7 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EB2B36] bg-red-50 px-2.5 py-1 rounded-full">
                  Setup Google OAuth 2.0
                </span>
                <h3 className="text-lg font-extrabold text-[#333333] font-display mt-1.5">
                  Aktifkan Login Akun Google Real
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 font-extrabold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-[#4B5563] leading-relaxed">
              <p className="font-bold text-[#666666]">
                Agar tombol <span className="text-[#EB2B36]">GOOGLE</span> terhubung ke akun Google asli pengguna, aktifkan Google Provider di dashboard Supabase Anda:
              </p>

              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-[#E9E9E9] space-y-2">
                <p className="font-extrabold text-[#333333]">
                  1. Salin Authorized Redirect URI ini ke Google Cloud Console:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2.5 py-2 rounded-lg bg-white border border-gray-200 text-[11px] font-mono text-[#333333] select-all overflow-x-auto">
                    {CALLBACK_URL}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCallback}
                    className="shrink-0 px-3 py-2 rounded-lg bg-[#EB2B36] text-white font-extrabold text-[11px] cursor-pointer"
                  >
                    {copied ? 'Tersalin ✓' : 'Salin'}
                  </button>
                </div>
                <a
                  href={GOOGLE_CLOUD_CONSOLE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-[11px] font-extrabold text-blue-600 hover:underline"
                >
                  ↗ Buka Google Cloud Console (Buat OAuth Client ID Web)
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-[#E9E9E9] space-y-1.5">
                <p className="font-extrabold text-[#333333]">
                  2. Masukkan Client ID & Secret di Supabase Dashboard:
                </p>
                <p className="text-[11px] text-[#666666]">
                  Aktifkan toggle <b>Enable Sign in with Google</b>, tempelkan Client ID & Client Secret, lalu klik <b>Save</b>.
                </p>
                <a
                  href={SUPABASE_GOOGLE_SETTINGS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-[11px] font-extrabold text-[#EB2B36] hover:underline pt-0.5"
                >
                  ↗ Buka Pengaturan Google Provider di Supabase Anda
                </a>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-xs font-extrabold text-[#666666] hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onRetryGoogle()
                }}
                className="flex-1 h-11 rounded-xl btn-3d-primary text-xs font-extrabold uppercase cursor-pointer"
              >
                Sudah Aktif, Coba Lagi
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GoogleAuthModal
