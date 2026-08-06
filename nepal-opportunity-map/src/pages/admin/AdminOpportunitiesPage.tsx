import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Card, ConfirmModal, Input, Modal, toast } from '@/components/ui'
import { opportunitiesApi, type BusinessOpportunity } from '@/services/opportunities.api'

type OpportunityFormState = {
  title: string
  sector: string
  description: string
  required_infrastructure: string
  min_investment: string
  max_investment: string
  estimated_investment_scale: string
}

const emptyForm: OpportunityFormState = {
  title: '',
  sector: '',
  description: '',
  required_infrastructure: '',
  min_investment: '',
  max_investment: '',
  estimated_investment_scale: '',
}

export const AdminOpportunitiesPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<OpportunityFormState>(emptyForm)

  const { data: opportunities = [], isLoading, error } = useQuery({
    queryKey: ['admin-opportunities'],
    queryFn: () => opportunitiesApi.list({ limit: 100 }),
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return opportunities.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.sector || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
    )
  }, [opportunities, search])

  const createMutation = useMutation({
    mutationFn: (payload: OpportunityFormState) =>
      opportunitiesApi.create({
        title: payload.title.trim(),
        sector: payload.sector.trim() || undefined,
        description: payload.description.trim() || undefined,
        required_infrastructure: payload.required_infrastructure.trim() || undefined,
        min_investment: payload.min_investment ? Number(payload.min_investment) : undefined,
        max_investment: payload.max_investment ? Number(payload.max_investment) : undefined,
        estimated_investment_scale: payload.estimated_investment_scale.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] })
      setEditingId(null)
      setFormState(emptyForm)
      toast.success('Opportunity created successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to create opportunity.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OpportunityFormState }) =>
      opportunitiesApi.update(id, {
        title: payload.title.trim(),
        sector: payload.sector.trim() || undefined,
        description: payload.description.trim() || undefined,
        required_infrastructure: payload.required_infrastructure.trim() || undefined,
        min_investment: payload.min_investment ? Number(payload.min_investment) : undefined,
        max_investment: payload.max_investment ? Number(payload.max_investment) : undefined,
        estimated_investment_scale: payload.estimated_investment_scale.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] })
      setEditingId(null)
      setFormState(emptyForm)
      toast.success('Opportunity updated successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to update opportunity.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => opportunitiesApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] })
      setDeletingId(null)
      toast.success('Opportunity removed successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to delete opportunity.'),
  })

  const openCreate = () => {
    setEditingId('new')
    setFormState(emptyForm)
  }

  const openEdit = (item: BusinessOpportunity) => {
    setEditingId(item.opportunity_id)
    setFormState({
      title: item.title,
      sector: item.sector || '',
      description: item.description || '',
      required_infrastructure: item.required_infrastructure || '',
      min_investment: item.min_investment?.toString() || '',
      max_investment: item.max_investment?.toString() || '',
      estimated_investment_scale: item.estimated_investment_scale || '',
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
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Opportunity Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Create, edit, and delete business opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="text-xs bg-terraced-600 hover:bg-terraced-500 text-white border-0 shadow-none h-8" onClick={openCreate}>
            Add Opportunity
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-mono font-semibold border border-red-500/20 uppercase tracking-wider">
            🔒 Admin Only
          </div>
        </div>
      </div>

      <Card padding="md" className="bg-[#12141A] border border-white/5 shadow-none">
        <Input placeholder="Search opportunities…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      <Card padding="none" className="bg-[#12141A] border border-white/5 shadow-none overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm font-display">Opportunity Catalog</h3>
          <Badge variant="muted" size="sm">
            {filtered.length} total
          </Badge>
        </div>

        {isLoading && (
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terraced-500" />
          </div>
        )}

        {error && <div className="py-8 text-center text-xs text-red-400 font-mono">Failed to load opportunities.</div>}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#0A0C10] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Title</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Sector</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Investment</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Updated</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item) => (
                  <tr key={item.opportunity_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-slate-500 mt-1 line-clamp-2 font-mono text-[10px]">{item.description || 'No description provided.'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{item.sector || 'Unspecified'}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono tabular-nums">
                      {item.min_investment?.toLocaleString() || 'N/A'} - {item.max_investment?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{item.updated_at.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent h-7" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" className="text-xs h-7" onClick={() => setDeletingId(item.opportunity_id)}>
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
          <div className="py-12 text-center text-xs text-slate-500 font-mono">No opportunities match your search.</div>
        )}
      </Card>

      <Modal
        isOpen={editingId !== null}
        onClose={() => setEditingId(null)}
        title={editingId === 'new' ? 'Add Opportunity' : 'Edit Opportunity'}
        description="Manage the catalog entry used by recommendation generation."
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
          <Input label="Title" value={formState.title} onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))} />
          <Input label="Sector" value={formState.sector} onChange={(e) => setFormState((p) => ({ ...p, sector: e.target.value }))} />
          <Input
            label="Minimum Investment"
            type="number"
            min={0}
            value={formState.min_investment}
            onChange={(e) => setFormState((p) => ({ ...p, min_investment: e.target.value }))}
          />
          <Input
            label="Maximum Investment"
            type="number"
            min={0}
            value={formState.max_investment}
            onChange={(e) => setFormState((p) => ({ ...p, max_investment: e.target.value }))}
          />
          <Input
            label="Required Infrastructure"
            value={formState.required_infrastructure}
            onChange={(e) => setFormState((p) => ({ ...p, required_infrastructure: e.target.value }))}
            className="md:col-span-2"
          />
          <Input
            label="Investment Scale"
            value={formState.estimated_investment_scale}
            onChange={(e) => setFormState((p) => ({ ...p, estimated_investment_scale: e.target.value }))}
            className="md:col-span-2"
          />
          <label className="md:col-span-2 space-y-1">
            <span className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Description</span>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg bg-[#0A0C10] text-white focus:outline-none focus:ring-2 focus:ring-terraced-500/50 font-mono"
            />
          </label>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete opportunity"
        message="This will permanently remove the opportunity entry."
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}