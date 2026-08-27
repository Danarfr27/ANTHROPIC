import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, User, Eye, EyeOff, Terminal } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const LoginPage = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800))

    try {
      const success = await login(username, password)
      if (!success) {
        setError('Kredensial tidak valid. Silakan coba lagi.')
      }
    } catch {
      setError('Server login tidak dapat dihubungi. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <motion.div 
          className="text-center mb-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl border border-emerald-500/30" />
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            <span className="text-emerald-400">Pen</span>Test AI
          </h1>
          <p className="text-gray-400 text-sm font-mono">
            <Terminal className="inline w-3 h-3 mr-1" />
            Advanced Security Intelligence Platform
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="glass-panel rounded-2xl p-8 neon-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Autentikasi Diperlukan</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-xl py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Masuk ke Sistem
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/10 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-xs text-gray-600 font-mono">
              v2.0.0 • Secured by OpenRouter • {new Date().getFullYear()}
            </p>
          </div>
        </motion.div>

        {/* Floating badges */}
        <motion.div
          className="flex justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {['OWASP', 'PTES', 'NIST'].map((badge, i) => (
            <motion.span
              key={badge}
              className="px-3 py-1 rounded-full text-xs font-mono bg-gray-800/50 text-gray-500 border border-gray-700/50"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              {badge}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
