import { useState, useEffect } from 'react'
import { Button, Badge, SkeletonCard } from '@/components/ui'
import apiClient from '@/services/apiClient'

interface AiAnalysisDrawerProps {
  isOpen: boolean
  onClose: () => void
  municipalityName: string
  contextText?: string
}

export const AiAnalysisDrawer = ({ isOpen, onClose, municipalityName, contextText = "" }: AiAnalysisDrawerProps) => {
  const [question, setQuestion] = useState(contextText || `Why is ${municipalityName} a good investment opportunity?`)
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && contextText) {
      setQuestion(contextText)
    }
  }, [isOpen, contextText])

  const askAi = async () => {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setResponse(null)
    
    try {
      // POST to our backend AI Chat endpoint
      const res = await apiClient.post('/analyze/chat', {
        message: question,
        municipality_name: municipalityName
      })
      setResponse(res.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI service temporarily unavailable.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 max-w-full bg-white/95 backdrop-blur-xl shadow-2xl border-l border-emerald-100 z-[2000] animate-slide-in-right flex flex-col">
      <div className="p-4 border-b border-emerald-100 flex justify-between items-center bg-slate-900 text-white">
        <h3 className="font-bold flex items-center gap-2">
          <span>🤖</span>
          Catalyst AI Analyst
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Warning / Disclaimer */}
        <div className="bg-blue-50 text-blue-800 text-[10px] p-2 rounded-lg border border-blue-100 leading-relaxed font-mono">
          <span className="font-bold">DATA DISCLAIMER:</span> AI responses are generated using an LLM grounded in the current municipality's data profile. Some indicators are synthetically generated for the FYP prototype.
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Ask a question about {municipalityName}</label>
          <textarea 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full text-sm border border-emerald-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[80px]"
            placeholder="e.g. What are the biggest development gaps here?"
          />
          <Button onClick={askAi} disabled={loading || !question.trim()} className="w-full font-bold bg-slate-900 hover:bg-slate-800 text-white">
            {loading ? 'Analyzing Data...' : 'Generate Analysis'}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-3 pt-2">
            <SkeletonCard className="h-4 w-3/4" />
            <SkeletonCard className="h-4 w-full" />
            <SkeletonCard className="h-4 w-5/6" />
            <SkeletonCard className="h-16 w-full" />
          </div>
        )}

        {response && !loading && (
          <div className="pt-2 animate-fade-in space-y-3">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {response.reply}
            </div>
            
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Context Grounding Used</h4>
              <Badge variant="success" size="sm" className="font-mono text-[9px]">
                Target: {response.municipality_context_used || municipalityName}
              </Badge>
              <p className="text-[10px] text-slate-500 mt-2">
                The AI utilized the development index, infrastructure gaps, and ML-derived opportunities for this context to formulate its answer.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
