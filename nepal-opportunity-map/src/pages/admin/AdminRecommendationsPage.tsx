import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Card, ConfirmModal, Input, Modal, toast } from '@/components/ui'
import { municipalitiesApi } from '@/services/municipalities.api'
import { opportunitiesApi } from '@/services/opportunities.api'
import { recommendationsApi } from '@/services/recommendations.api'
import type { Recommendation } from '@/types'

type RecommendationFormState = {
  municipality_id: string
  opportunity_id: string
  suitability_score: string
  explanation: string
  model_version: string
}

const emptyForm: RecommendationFormState = {
  municipality_id: '',
  opportunity_id: '',
  suitability_score: '80',
  explanation: '',
  model_version: 'v1.0',
}

export const AdminRecommendationsPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<RecommendationFormState>(emptyForm)

  const { data: recommendations = [], isLoading, error } = useQuery({
    queryKey: ['admin-recommendations'],
    queryFn: () => recommendationsApi.list({ limit: 100 }),
  })

  const { data: municipalities = [] } = useQuery({
    queryKey: ['admin-recommendations-municipalities'],
    queryFn: () => municipalitiesApi.list({ limit: 100 }),
  })

  const { data: opportunities = [] } = useQuery({
    queryKey: ['admin-recommendations-opportunities'],
    queryFn: () => opportunitiesApi.list({ limit: 100 }),
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return recommendations.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.municipalityName.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
    )
  }, [recommendations, search])

  const createMutation = useMutation({
    mutationFn: (payload: RecommendationFormState) =>
      recommendationsApi.create({
        municipality_id: payload.municipality_id,
        opportunity_id: payload.opportunity_id,
        suitability_score: Number(payload.suitability_score),
        explanation: payload.explanation.trim() || undefined,
        model_version: payload.model_version.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-recommendations'] })
      setEditingId(null)
      setFormState(emptyForm)
      toast.success('Recommendation created successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to create recommendation.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecommendationFormState }) =>
      recommendationsApi.update(id, {
        municipality_id: payload.municipality_id,
        opportunity_id: payload.opportunity_id,
        suitability_score: Number(payload.suitability_score),
        explanation: payload.explanation.trim() || undefined,
        model_version: payload.model_version.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-recommendations'] })
      setEditingId(null)
      setFormState(emptyForm)
      toast.success('Recommendation updated successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to update recommendation.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recommendationsApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-recommendations'] })
      setDeletingId(null)
      toast.success('Recommendation removed successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to delete recommendation.'),
  })

  const openCreate = () => {
    setEditingId('new')
    setFormState(emptyForm)
  }

  const openEdit = (item: Recommendation) => {
    setEditingId(item.id)
    setFormState({
      municipality_id: item.municipalityId,
      opportunity_id: item.opportunityId || '',
      suitability_score: String(Math.round(item.confidenceScore * 100)),
      explanation: item.explanation,
      model_version: item.modelVersion || 'v1.0',
    })
  }

  const submit = async () => {
    if (editingId === 'new') {
      await createMutation.mutateAsync(formState)
      return
    }
    if (!editingId) return
    await updateMutation.mutateAsync({ id: editingId, payload: formState })
  }

  const saveDisabled = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Recommendation Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Create, edit, and delete AI recommendation records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="text-xs bg-terraced-600 hover:bg-terraced-500 text-white border-0 shadow-none h-8" onClick={openCreate}>
            Add Recommendation
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-mono font-semibold border border-red-500/20 uppercase tracking-wider">
            🔒 Admin Only
          </div>
        </div>
      </div>

      <Card padding="md" className="bg-[#12141A] border border-white/5 shadow-none">
        <Input placeholder="Search recommendations…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      <Card padding="none" className="bg-[#12141A] border border-white/5 shadow-none overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm font-display">Recommendation Catalog</h3>
          <Badge variant="muted" size="sm">
            {filtered.length} total
          </Badge>
        </div>

        {isLoading && (
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terraced-500" />
          </div>
        )}

        {error && <div className="py-8 text-center text-xs text-red-400 font-mono">Failed to load recommendations.</div>}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#0A0C10] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Opportunity</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Municipality</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Score</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Model</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-slate-500 mt-1 line-clamp-2 font-mono text-[10px]">{item.summary}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{item.municipalityName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-terraced-500/10 text-terraced-400 border border-terraced-500/20 tabular-nums">
                        {Math.round(item.confidenceScore * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{item.modelVersion || 'v1.0'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent h-7" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" className="text-xs h-7" onClick={() => setDeletingId(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">No recommendations match your search.</div>
        )}
      </Card>

      <Modal
        isOpen={editingId !== null}
        onClose={() => setEditingId(null)}
        title={editingId === 'new' ? 'Add Recommendation' : 'Edit Recommendation'}
        description="Link a municipality and opportunity to a model-generated recommendation."
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingId(null)} disabled={saveDisabled}>
              Cancel
            </Button>
            <Button onClick={submit} isLoading={saveDisabled}>
              Save
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Municipality</span>
            <select
              value={formState.municipality_id}
              onChange={(e) => setFormState((p) => ({ ...p, municipality_id: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg bg-[#0A0C10] text-white focus:outline-none focus:ring-2 focus:ring-terraced-500/50"
            >
              <option value="">Select municipality</option>
              {municipalities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Opportunity</span>
            <select
              value={formState.opportunity_id}
              onChange={(e) => setFormState((p) => ({ ...p, opportunity_id: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg bg-[#0A0C10] text-white focus:outline-none focus:ring-2 focus:ring-terraced-500/50"
            >
              <option value="">Select opportunity</option>
              {opportunities.map((item) => (
                <option key={item.opportunity_id} value={item.opportunity_id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Suitability Score"
            type="number"
            min={0}
            max={100}
            value={formState.suitability_score}
            onChange={(e) => setFormState((p) => ({ ...p, suitability_score: e.target.value }))}
          />
          <Input
            label="Model Version"
            value={formState.model_version}
            onChange={(e) => setFormState((p) => ({ ...p, model_version: e.target.value }))}
          />
          <label className="md:col-span-2 space-y-1">
            <span className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Explanation</span>
            <textarea
              value={formState.explanation}
              onChange={(e) => setFormState((p) => ({ ...p, explanation: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg bg-[#0A0C10] text-white focus:outline-none focus:ring-2 focus:ring-terraced-500/50 font-mono"
            />
          </label>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete recommendation"
        message="This will permanently remove the recommendation record."
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}