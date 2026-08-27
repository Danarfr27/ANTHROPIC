import { motion } from 'framer-motion'
import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  index: number
}

const MessageBubble = ({ message, index }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}
    >
      {/* Avatar */}
      <motion.div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-cyan-600 to-cyan-500'
            : 'bg-gradient-to-br from-emerald-600 to-emerald-500'
        }`}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </motion.div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative group rounded-2xl px-5 py-4 ${
            isUser
              ? 'bg-gradient-to-br from-cyan-600/20 to-cyan-500/10 border border-cyan-500/20 ml-auto'
              : 'bg-gradient-to-br from-emerald-600/10 to-emerald-500/5 border border-emerald-500/10'
          }`}
        >
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Message content */}
          <div className={`prose prose-invert prose-sm max-w-none ${isUser ? 'text-right' : ''}`}>
            {isUser ? (
              <p className="text-gray-200 m-0">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg my-2 text-xs"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400 text-xs" {...props}>
                        {children}
                      </code>
                    )
                  },
                  h1: ({ children }) => <h1 className="text-xl font-bold text-emerald-400 mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-emerald-300 mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold text-emerald-200 mt-3 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-2">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-300">{children}</li>,
                  strong: ({ children }) => <strong className="text-emerald-300 font-semibold">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-emerald-500/50 pl-4 italic text-gray-400 my-2">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border-collapse border border-gray-700 text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-800">{children}</thead>,
                  th: ({ children }) => <th className="border border-gray-700 px-3 py-2 text-left text-emerald-300 font-semibold">{children}</th>,
                  td: ({ children }) => <td className="border border-gray-700 px-3 py-2 text-gray-300">{children}</td>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Timestamp */}
          <div className={`mt-2 text-[10px] text-gray-600 font-mono ${isUser ? 'text-right' : ''}`}>
            {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
