import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaShieldAlt,
  FaSignOutAlt,
  FaFire,
  FaStar,
  FaSyncAlt,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaLock,
  FaCheckCircle,
} from 'react-icons/fa'
import { adminService, ADMIN_EMAIL } from '../services/storage'

const ALL_LEVELS = [1, 2, 3, 4, 5, 6]

const EMPTY_FORM = {
  nama: '',
  email: '',
  umur: '',
  password: '',
  xp: 0,
  streak: 0,
  current_unit: 1,
  completed_lessons: [],
  unlocked_islands: [1],
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(() => adminService.isAdminAuthenticated())
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [showFormPass, setShowFormPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [deletingUser, setDeletingUser] = useState(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const list = await adminService.listUsers()
      setUsers(list)
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data user')
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin, loadUsers])

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      await adminService.loginAdmin({
        email: loginEmail,
        password: loginPassword,
      })
      setIsAdmin(true)
      setLoginPassword('')
      toast.success('Selamat datang di Panel Admin Handoora!')
    } catch (err) {
      setLoginError(err.message || 'Gagal masuk sebagai admin.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleAdminLogout = () => {
    adminService.logoutAdmin()
    setIsAdmin(false)
    setUsers([])
    setLoginEmail('')
    setLoginPassword('')
    toast.success('Sesi admin telah ditutup.')
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData(EMPTY_FORM)
    setShowFormPass(false)
    setShowFormModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      nama: user.nama || '',
      email: user.email || '',
      umur: user.umur ?? '',
      password: '',
      xp: Number(user.xp) || 0,
      streak: Number(user.streak) || 0,
      current_unit: Number(user.current_unit) || 1,
      completed_lessons: Array.isArray(user.completed_lessons) ? user.completed_lessons : [],
      unlocked_islands:
        Array.isArray(user.unlocked_islands) && user.unlocked_islands.length > 0
          ? user.unlocked_islands
          : [1],
    })
    setShowFormPass(false)
    setShowFormModal(true)
  }

  const toggleArrayLevel = (field, lvl) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : []
      const exists = current.includes(lvl)
      let next = exists ? current.filter((item) => item !== lvl) : [...current, lvl]
      if (field === 'unlocked_islands' && !next.includes(1)) {
        next = [1, ...next]
      }
      next.sort((a, b) => a - b)
      return { ...prev, [field]: next }
    })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingUser) {
        const res = await adminService.updateUser(editingUser.id, formData)
        if (res.remoteWarning) {
          toast.error(`Gagal sinkron update ke Supabase: ${res.remoteWarning}. Jalankan supabase/schema.sql di Supabase SQL Editor.`)
        } else {
          toast.success(`Data ${res.user.nama} berhasil diperbarui!`)
        }
      } else {
        const res = await adminService.createUser(formData)
        if (res.remoteWarning) {
          toast.error(`Gagal sinkron tambah user ke Supabase: ${res.remoteWarning}. Jalankan supabase/schema.sql di Supabase SQL Editor.`)
        } else {
          toast.success(`User ${res.user.nama} berhasil ditambahkan!`)
        }
      }
      setShowFormModal(false)
      await loadUsers()
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingUser) return
    setDeletingLoading(true)
    try {
      const res = await adminService.deleteUser(deletingUser.id)
      if (res.remoteWarning) {
        toast.error(`Gagal menghapus di Supabase: ${res.remoteWarning}. Jalankan supabase/schema.sql di Supabase SQL Editor.`)
      } else {
        toast.success(`User ${deletingUser.nama} berhasil dihapus!`)
      }
      setDeletingUser(null)
      await loadUsers()
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus user')
    } finally {
      setDeletingLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'supabase' && u.source === 'Supabase') ||
        (sourceFilter === 'lokal' && u.source === 'Lokal') ||
        (sourceFilter === 'demo' && u.source === 'Demo')

      if (!matchesSource) return false
      if (!q) return true
      return (
        String(u.nama || '').toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q) ||
        String(u.id || '').toLowerCase().includes(q)
      )
    })
  }, [users, searchQuery, sourceFilter])

  const stats = useMemo(() => {
    const totalUsers = users.length
    const totalXp = users.reduce((sum, u) => sum + (Number(u.xp) || 0), 0)
    const activeStreaks = users.filter((u) => (Number(u.streak) || 0) > 0).length
    const avgUnit =
      totalUsers > 0
        ? (users.reduce((sum, u) => sum + (Number(u.current_unit) || 1), 0) / totalUsers).toFixed(1)
        : '0'
    return { totalUsers, totalXp, activeStreaks, avgUnit }
  }, [users])

  // ============================================================
  // TAMPILAN LOGIN GATE ADMIN (/adminhandoora)
  // ============================================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#FFF5F5] to-[#F1F5F9] flex flex-col items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl border border-[#E5E5E5] shadow-xl p-8"
        >
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-[#D32F2F]/10 text-[#D32F2F] flex items-center justify-center mb-4">
              <FaShieldAlt className="text-3xl" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D32F2F]/10 text-[#D32F2F] text-xs font-extrabold uppercase tracking-wider mb-2">
              <FaLock className="text-[10px]" /> Akses Terbatas
            </span>
            <h1 className="text-2xl font-extrabold text-[#1E293B] font-display">
              Admin Handoora
            </h1>
            <p className="text-sm text-[#64748B] mt-1.5">
              Masuk dengan akun administrator untuk mengelola data pengguna aplikasi Handoora.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                Email Admin
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@gmail.com"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#D32F2F] outline-none text-sm font-semibold text-[#1E293B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-[#E2E8F0] focus:border-[#D32F2F] outline-none text-sm font-semibold text-[#1E293B] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                  aria-label="Toggle password"
                >
                  {showLoginPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-[#D32F2F]">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] active:translate-y-0.5 text-white font-extrabold text-sm tracking-wide shadow-[0_4px_0_#991B1B] transition-all disabled:opacity-60 cursor-pointer"
            >
              {loginLoading ? 'MEMVERIFIKASI...' : 'MASUK PANEL ADMIN'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              <FaArrowLeft /> Kembali ke Beranda Handoora
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ============================================================
  // TAMPILAN DASHBOARD CRUD USER ADMIN
  // ============================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-sm">
              <FaShieldAlt className="text-lg" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#1E293B] leading-tight font-display">
                Handoora Admin Panel
              </h1>
              <p className="text-xs font-semibold text-[#64748B] hidden sm:block">
                Manajemen CRUD Data Pengguna ({ADMIN_EMAIL})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadUsers}
              disabled={loadingUsers}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors cursor-pointer"
              title="Muat ulang data"
            >
              <FaSyncAlt className={loadingUsers ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/belajar"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors"
            >
              <FaArrowLeft className="text-[11px]" />
              <span className="hidden sm:inline">Aplikasi</span>
            </Link>

            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D32F2F]/10 hover:bg-[#D32F2F]/20 text-xs font-extrabold text-[#D32F2F] transition-colors cursor-pointer"
            >
              <FaSignOutAlt />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Summary Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center shrink-0">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase">Total User</p>
              <p className="text-2xl font-extrabold text-[#1E293B]">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#FFC800]/15 text-[#E5A000] flex items-center justify-center shrink-0">
              <FaStar className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase">Total XP</p>
              <p className="text-2xl font-extrabold text-[#1E293B]">{stats.totalXp.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#D32F2F]/10 text-[#D32F2F] flex items-center justify-center shrink-0">
              <FaFire className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase">Streak Aktif</p>
              <p className="text-2xl font-extrabold text-[#1E293B]">{stats.activeStreaks}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#58CC02]/15 text-[#46A302] flex items-center justify-center shrink-0">
              <FaCheckCircle className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase">Rata-rata Level</p>
              <p className="text-2xl font-extrabold text-[#1E293B]">{stats.avgUnit} / 6</p>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, atau ID user..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#1CB0F6] outline-none text-sm font-medium"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#475569] outline-none cursor-pointer"
            >
              <option value="all">Semua Sumber ({users.length})</option>
              <option value="supabase">Supabase</option>
              <option value="lokal">Lokal</option>
              <option value="demo">Demo</option>
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold text-sm shadow-[0_3px_0_#3B8702] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <FaPlus /> Tambah User
          </button>
        </section>

        {/* Table */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-3 text-center">Umur</th>
                  <th className="py-3.5 px-3 text-center">XP</th>
                  <th className="py-3.5 px-3 text-center">Streak</th>
                  <th className="py-3.5 px-3 text-center">Level</th>
                  <th className="py-3.5 px-3 text-center">Sumber</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-sm">
                {loadingUsers && users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#64748B] font-semibold">
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#64748B] font-semibold">
                      Tidak ada pengguna yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const initial = (user.nama || user.email || 'U').charAt(0).toUpperCase()
                    const completedCount = Array.isArray(user.completed_lessons)
                      ? user.completed_lessons.length
                      : 0
                    return (
                      <tr key={user.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.nama}
                                className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#D32F2F]/10 text-[#D32F2F] font-extrabold flex items-center justify-center shrink-0">
                                {initial}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-[#1E293B] truncate">{user.nama}</p>
                              <p className="text-xs text-[#64748B] truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold text-[#475569]">
                          {user.umur ? `${user.umur} th` : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFC800]/15 text-[#B45309] font-extrabold text-xs">
                            <FaStar className="text-[11px]" /> {user.xp}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D32F2F]/10 text-[#D32F2F] font-extrabold text-xs">
                            <FaFire className="text-[11px]" /> {user.streak}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="text-xs font-bold text-[#1E293B]">
                            Level {user.current_unit || 1}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {completedCount}/6 selesai
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                              user.source === 'Supabase'
                                ? 'bg-emerald-100 text-emerald-700'
                                : user.source === 'Demo'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-sky-100 text-sky-700'
                            }`}
                          >
                            {user.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 rounded-lg border border-[#E2E8F0] text-[#0284C7] hover:bg-sky-50 transition-colors cursor-pointer"
                              title="Edit user"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="p-2 rounded-lg border border-[#E2E8F0] text-[#D32F2F] hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus user"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal Create / Edit User */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#1E293B] font-display">
                  {editingUser ? `Edit User: ${editingUser.nama}` : 'Tambah User Baru'}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#1CB0F6] outline-none text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#1CB0F6] outline-none text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      Umur
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={formData.umur}
                      onChange={(e) => setFormData((p) => ({ ...p, umur: e.target.value }))}
                      placeholder="Contoh: 20"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#1CB0F6] outline-none text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">
                      {editingUser ? 'Password Baru (Opsional)' : 'Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPass ? 'text' : 'password'}
                        required={!editingUser}
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#E2E8F0] focus:border-[#1CB0F6] outline-none text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      >
                        {showFormPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">XP</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.xp}
                      onChange={(e) => setFormData((p) => ({ ...p, xp: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Streak</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.streak}
                      onChange={(e) => setFormData((p) => ({ ...p, streak: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Unit</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={formData.current_unit}
                      onChange={(e) => setFormData((p) => ({ ...p, current_unit: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    Level Selesai (Completed Lessons)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_LEVELS.map((lvl) => {
                      const active = formData.completed_lessons.includes(lvl)
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => toggleArrayLevel('completed_lessons', lvl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#58CC02] text-white border-[#46A302]'
                              : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                          }`}
                        >
                          Level {lvl}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    Level Terbuka (Unlocked Islands)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_LEVELS.map((lvl) => {
                      const active = formData.unlocked_islands.includes(lvl)
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => toggleArrayLevel('unlocked_islands', lvl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#1CB0F6] text-white border-[#0284C7]'
                              : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                          }`}
                        >
                          Level {lvl}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-extrabold shadow-[0_3px_0_#991B1B] disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Buat User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#D32F2F] flex items-center justify-center">
                <FaTrash className="text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1E293B]">Hapus Pengguna?</h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Anda yakin ingin menghapus akun <span className="font-bold text-[#1E293B]">{deletingUser.nama}</span> ({deletingUser.email})? Tindakan ini akan menghapus data progres pengguna tersebut.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#475569] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={deletingLoading}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-extrabold shadow-[0_3px_0_#991B1B] disabled:opacity-60 cursor-pointer"
                >
                  {deletingLoading ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
