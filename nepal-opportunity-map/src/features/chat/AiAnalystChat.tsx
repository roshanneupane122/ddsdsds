import { useState } from 'react'

export const AiAnalystChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Hello! I am your AI Analyst. How can I help you evaluate opportunities or identify infrastructure gaps today?' }])
  const [input, setInput] = useState('')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/analyze/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am currently offline.' }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to the AI server.' }])
    }
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
              <h3 className="font-bold font-display">AI Analyst</h3>
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
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white border border-emerald-100 text-slate-800 rounded-tl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-emerald-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about opportunities or gaps..." 
              className="flex-1 bg-emerald-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-colors">
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
