import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

export const AiAnalystChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Hello! I am your Catalyst AI Analyst powered by Llama 3.1. Ask me about any municipality in Rupandehi — opportunities, gaps, business viability, or comparisons.' }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeMunicipality, setActiveMunicipality] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string, municipalityName?: string) => {
    setIsLoading(true)
    try {
      const body: Record<string, unknown> = { message: text }
      const muni = municipalityName || activeMunicipality
      if (muni) body.municipality_name = muni

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/analyze/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        const data = await res.json()
        // Extract municipality context from response if detected
        if (data.municipality_context_used) setActiveMunicipality(data.municipality_context_used)
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'The AI service is temporarily unavailable. Please try again in a moment.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to the AI server. Make sure the backend is running.' }])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const context = searchParams.get('chatContext')
    if (context) {
      setIsOpen(true)
      setActiveMunicipality(context)
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('chatContext')
      setSearchParams(newParams)
      const initialUserText = `Tell me about opportunities and infrastructure gaps in ${context}.`
      setMessages(prev => [...prev, { role: 'user', text: initialUserText }])
      sendMessage(initialUserText, context)
    }
  }, [searchParams, setSearchParams])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    await sendMessage(userMsg)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border border-emerald-100 z-50 flex flex-col overflow-hidden animate-slide-in-right">
          <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-bold font-display text-sm">Catalyst AI Analyst</h3>
                {activeMunicipality && (
                  <p className="text-[10px] text-emerald-200 font-mono">Context: {activeMunicipality}</p>
                )}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-emerald-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-emerald-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                    : 'bg-white border border-emerald-100 text-slate-800 rounded-tl-none shadow-sm'
                }`} style={{ whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-emerald-100 text-slate-500 rounded-2xl rounded-tl-none shadow-sm p-3 text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs ml-1 font-mono">Llama 3.1 thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-emerald-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isLoading ? 'AI is thinking...' : 'Ask about opportunities or gaps...'}
              disabled={isLoading}
              className="flex-1 bg-emerald-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 disabled:opacity-50"
            />
            <button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white p-2 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
