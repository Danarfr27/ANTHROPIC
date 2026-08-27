import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginPage from './components/LoginPage'
import ChatInterface from './components/ChatInterface'
import ParallaxBackground from './components/ParallaxBackground'
import { useAuth } from './hooks/useAuth'

function App() {
  const { isAuthenticated } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0f]">
      <ParallaxBackground />
      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            key={isAuthenticated ? 'chat' : 'login'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            {isAuthenticated ? <ChatInterface /> : <LoginPage />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
