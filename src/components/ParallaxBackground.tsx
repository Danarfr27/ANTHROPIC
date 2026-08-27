import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const ParallaxBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
    }> = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      particles = []
      const count = Math.floor((canvas.width * canvas.height) / 15000)

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
          color: Math.random() > 0.5 ? '#00ff88' : '#00d4ff'
        })
      }
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      )
      gradient.addColorStop(0, 'rgba(10, 10, 20, 0)')
      gradient.addColorStop(1, 'rgba(10, 10, 20, 0.8)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particles.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()

        // Connect nearby particles
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color
            ctx.globalAlpha = (1 - dist / 150) * 0.15
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })

        // Update position
        p.x += p.speedX
        p.y += p.speedY

        // Wrap around
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      })

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(drawParticles)
    }

    resize()
    createParticles()
    drawParticles()

    window.addEventListener('resize', () => {
      resize()
      createParticles()
    })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />
      {/* Floating geometric shapes */}
      <motion.div
        className="fixed w-96 h-96 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, #00ff88, transparent)',
          top: '10%',
          left: '10%',
          filter: 'blur(60px)',
          zIndex: 1
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="fixed w-80 h-80 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, #00d4ff, transparent)',
          bottom: '20%',
          right: '15%',
          filter: 'blur(60px)',
          zIndex: 1
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      {/* Grid overlay */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 1
        }}
      />
      {/* Scanline effect */}
      <div className="scanline" />
    </>
  )
}

export default ParallaxBackground
