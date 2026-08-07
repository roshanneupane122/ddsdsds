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
    queryFn: () => recommendationsApi.list({ limit: 100 }).then((r) => r.data),
  })

  const { data: municipalities = [] } = useQuery({
    queryKey: ['admin-recommendations-municipalities'],
    queryFn: () => municipalitiesApi.list({ limit: 100 }).then((r) => r.data),
  })

  const { data: opportunities = [] } = useQuery({
    queryKey: ['admin-recommendations-opportunities'],
    queryFn: () => opportunitiesApi.list({ limit: 100 }),
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return recommendations.filter(
      (item: Recommendation) =>
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
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Recommendation Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">AI algorithmic investment recommendation entries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="text-xs shadow-md shadow-emerald-600/20" onClick={openCreate}>
            + Add Recommendation
          </Button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200 uppercase tracking-wider">
            🔒 Admin Console
          </div>
        </div>
      </div>

      <Card padding="md" className="bg-white border border-emerald-100 shadow-sm">
        <Input placeholder="Search recommendations by title, municipality, or explanation…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      <Card padding="none" className="bg-white border border-emerald-100 shadow-sm overflow-hidden rounded-2xl">
        <div className="p-4 md:p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/40">
          <h3 className="font-bold text-slate-900 text-sm font-display">Recommendation Catalog</h3>
          <Badge variant="success" size="sm">
            {filtered.length} RECOMMENDATIONS GENERATED
          </Badge>
        </div>

        {isLoading && (
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && <div className="py-8 text-center text-xs text-red-500 font-mono">Failed to load recommendations.</div>}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-emerald-50/70 border-b border-emerald-100">
                <tr>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Opportunity</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Municipality</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Score</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Model</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-slate-500 mt-1 line-clamp-2 text-xs">{item.summary}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-900">{item.municipalityName}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 tabular-nums">
                        {Math.round(item.confidenceScore * 100)}% Match
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono font-medium">{item.modelVersion || 'v1.0'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" className="text-xs h-8" onClick={() => setDeletingId(item.id)}>
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
        description="Link a municipality and opportunity to model-generated scores."
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingId(null)} disabled={saveDisabled}>
              Cancel
            </Button>
            <Button onClick={submit} isLoading={saveDisabled}>
              Save Recommendation
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1.5">
            <span className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Municipality</span>
            <select
              value={formState.municipality_id}
              onChange={(e) => setFormState((p) => ({ ...p, municipality_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-emerald-200 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
            >
              <option value="">Select municipality</option>
              {municipalities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Opportunity</span>
            <select
              value={formState.opportunity_id}
              onChange={(e) => setFormState((p) => ({ ...p, opportunity_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-emerald-200 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
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
            label="Suitability Score (0-100)"
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
          <label className="md:col-span-2 space-y-1.5">
            <span className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Explanation</span>
            <textarea
              value={formState.explanation}
              onChange={(e) => setFormState((p) => ({ ...p, explanation: e.target.value }))}
              rows={5}
              className="w-full px-3.5 py-2.5 text-sm border border-emerald-200 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
            />
          </label>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Recommendation"
        message="This will permanently delete this AI recommendation entry."
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}