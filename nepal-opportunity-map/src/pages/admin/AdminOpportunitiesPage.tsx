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
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Opportunity Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Catalog of business sector investment opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="text-xs shadow-md shadow-emerald-600/20" onClick={openCreate}>
            + Add Opportunity
          </Button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200 uppercase tracking-wider">
            🔒 Admin Console
          </div>
        </div>
      </div>

      <Card padding="md" className="bg-white border border-emerald-100 shadow-sm">
        <Input placeholder="Search opportunities by title, sector, or keyword…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      <Card padding="none" className="bg-white border border-emerald-100 shadow-sm overflow-hidden rounded-2xl">
        <div className="p-4 md:p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/40">
          <h3 className="font-bold text-slate-900 text-sm font-display">Opportunity Catalog</h3>
          <Badge variant="success" size="sm">
            {filtered.length} OPPORTUNITIES TOTAL
          </Badge>
        </div>

        {isLoading && (
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && <div className="py-8 text-center text-xs text-red-500 font-mono">Failed to load opportunities.</div>}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-emerald-50/70 border-b border-emerald-100">
                <tr>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Title</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Sector</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Investment</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Updated</th>
                  <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.opportunity_id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-slate-500 mt-1 line-clamp-2 text-xs font-normal">{item.description || 'No description provided.'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100/90 text-emerald-900 uppercase tracking-wider border border-emerald-200">
                        {item.sector || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-mono tabular-nums font-bold">
                      ${item.min_investment?.toLocaleString() || '0'} - ${item.max_investment?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">{item.updated_at.slice(0, 10)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" className="text-xs h-8" onClick={() => setDeletingId(item.opportunity_id)}>
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
        description="Manage opportunity details and capital expenditure targets."
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingId(null)} disabled={saveDisabled}>
              Cancel
            </Button>
            <Button onClick={submit} isLoading={saveDisabled}>
              Save Opportunity
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" value={formState.title} onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))} />
          <Input label="Sector" value={formState.sector} onChange={(e) => setFormState((p) => ({ ...p, sector: e.target.value }))} />
          <Input
            label="Minimum Investment ($)"
            type="number"
            min={0}
            value={formState.min_investment}
            onChange={(e) => setFormState((p) => ({ ...p, min_investment: e.target.value }))}
          />
          <Input
            label="Maximum Investment ($)"
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
          <label className="md:col-span-2 space-y-1.5">
            <span className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Description</span>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm border border-emerald-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 font-medium"
            />
          </label>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Opportunity"
        message="This will permanently delete this opportunity catalog entry."
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}