import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Trash2, LogOut, Shield, Zap, Key } from 'lucide-react'
import { ChatSession } from '../types'
import { useAuth } from '../hooks/useAuth'
import { getRotator } from '../utils/apiRotator'
import { useState, useEffect } from 'react'

interface SidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onNewChat: () => void
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
  isOpen: boolean
  onToggle: () => void
}

const Sidebar = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onToggle
}: SidebarProps) => {
  const { logout } = useAuth()
  const [apiStatus, setApiStatus] = useState({ active: 0, total: 0 })

  useEffect(() => {
    const rotator = getRotator()
    if (rotator) {
      const status = rotator.getStatus()
      setApiStatus({
        active: status.filter(s => s.isActive).length,
        total: status.length
      })
    }
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0d0d14] border-r border-gray-800/50 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">PenTest AI</h1>
              <p className="text-[10px] text-gray-500 font-mono">Sentinel v2.0</p>
            </div>
          </div>

          <motion.button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 hover:from-emerald-600/30 hover:to-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-2.5 rounded-xl text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Chat Baru
          </motion.button>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2 px-2">
            Riwayat Chat
          </p>
          <div className="space-y-1">
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    activeSessionId === session.id
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'hover:bg-gray-800/30 border border-transparent'
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                    activeSessionId === session.id ? 'text-emerald-400' : 'text-gray-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      activeSessionId === session.id ? 'text-emerald-300' : 'text-gray-400'
                    }`}>
                      {session.title}
                    </p>
                    <p className="text-[10px] text-gray-600">
                      {session.messages.length} pesan
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* API Status */}
        <div className="p-3 border-t border-gray-800/50">
          <div className="flex items-center gap-2 px-2 mb-3">
            <Key className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">API Status</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/30 rounded-lg">
            <Zap className={`w-3.5 h-3.5 ${apiStatus.active > 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="text-xs text-gray-400">
              {apiStatus.active}/{apiStatus.total} keys aktif
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800/50">
          <motion.button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all text-sm"
            whileHover={{ x: 3 }}
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
