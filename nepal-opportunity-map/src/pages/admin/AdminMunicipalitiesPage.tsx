import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, Badge, Button, ConfirmModal, Input, Modal, toast } from '@/components/ui'
import { municipalitiesApi } from '@/services/municipalities.api'
import { useState } from 'react'

type MunicipalityFormState = {
  name: string
  district: string
  province: string
  total_population: string
  geom: string
}

type MunicipalityFormErrors = Partial<Record<keyof MunicipalityFormState, string>>

const emptyForm: MunicipalityFormState = {
  name: '',
  district: '',
  province: '',
  total_population: '0',
  geom: '',
}

function validateForm(form: MunicipalityFormState): MunicipalityFormErrors {
  const errors: MunicipalityFormErrors = {}
  if (!form.name.trim()) errors.name = 'Name is required.'
  if (!form.district.trim()) errors.district = 'District is required.'
  if (!form.province.trim()) errors.province = 'Province is required.'

  const population = Number(form.total_population)
  if (!Number.isInteger(population) || population < 0) {
    errors.total_population = 'Population must be a whole number of 0 or more.'
  }

  if (!form.geom.trim()) {
    errors.geom = 'A Polygon or MultiPolygon GeoJSON boundary is required.'
  } else {
    try {
      const geometry = JSON.parse(form.geom)
      const validType = geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon'
      if (!validType || !Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
        errors.geom = 'Boundary must be a non-empty Polygon or MultiPolygon GeoJSON object.'
      }
    } catch {
      errors.geom = 'Boundary must contain valid JSON.'
    }
  }

  return errors
}

export const AdminMunicipalitiesPage = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<MunicipalityFormState>(emptyForm)
  const [formErrors, setFormErrors] = useState<MunicipalityFormErrors>({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-municipalities', page, search],
    queryFn: () =>
      municipalitiesApi.list({
        page,
        pageSize: 15,
        search: search || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: MunicipalityFormState) =>
      municipalitiesApi.create({
        name: payload.name.trim(),
        district: payload.district.trim(),
        province: payload.province.trim(),
        total_population: Number(payload.total_population),
        geom: payload.geom,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-municipalities'] })
      setEditingId(null)
      setFormState(emptyForm)
      toast.success('Municipality created successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to create municipality.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MunicipalityFormState }) =>
      municipalitiesApi.update(id, {
        name: payload.name.trim(),
        district: payload.district.trim(),
        province: payload.province.trim(),
        total_population: Number(payload.total_population),
        geom: payload.geom,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-municipalities'] })
      setEditingId(null)
      setFormState(emptyForm)
      toast.success('Municipality updated successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to update municipality.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => municipalitiesApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-municipalities'] })
      setDeletingId(null)
      toast.success('Municipality removed successfully.')
    },
    onError: (err: any) => toast.error(err?.message || 'Unable to delete municipality.'),
  })

  const openCreate = () => {
    setEditingId('new')
    setFormState(emptyForm)
    setFormErrors({})
  }

  const openEdit = async (row: any) => {
    try {
      setEditingId(row.id)
      setFormErrors({})
      const detail = await municipalitiesApi.detail(row.id)
      setFormState({
        name: detail.name,
        district: detail.district,
        province: String(detail.province),
        total_population: String(detail.population ?? 0),
        geom: JSON.stringify(detail.geom || { type: 'Polygon', coordinates: [] }, null, 2),
      })
    } catch (err: any) {
      setEditingId(null)
      toast.error(err?.message || 'Unable to load municipality details.')
    }
  }

  const submit = async () => {
    const errors = validateForm(formState)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

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
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Municipality Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">View and audit all 753 local unit records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="text-xs bg-terraced-600 hover:bg-terraced-500 text-white border-0 shadow-none h-8" onClick={openCreate}>
            Add Municipality
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-mono font-semibold border border-red-500/20 uppercase tracking-wider">
            🔒 Admin Only
          </div>
        </div>
      </div>

      {/* Search */}
      <Card padding="md" className="bg-[#12141A] border border-white/5 shadow-none">
        <input
          type="text"
          placeholder="Search municipalities…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full px-3 py-2 text-xs border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-terraced-500/50 bg-[#0A0C10] text-white placeholder:text-slate-600 font-mono"
        />
      </Card>

      {/* Table */}
      <Card padding="none" className="bg-[#12141A] border border-white/5 shadow-none overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm font-display">Local Units</h3>
          {data && (
            <Badge variant="muted" size="sm">
              {data.total} total
            </Badge>
          )}
        </div>

        {isLoading && (
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terraced-500" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-xs text-red-400 font-mono">Failed to load municipalities.</div>
        )}

        {data && !isLoading && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#0A0C10] border-b border-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Name</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Type</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">District</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Province</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Population</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Agri Score</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Tourism Score</th>
                    <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.data.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                      <td className="px-4 py-3 text-slate-400 capitalize font-mono">{m.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{m.district}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono">P{m.province}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono tabular-nums">{m.population.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-terraced-500 rounded-full"
                              style={{ width: `${m.agricultureScore}%` }}
                            />
                          </div>
                          <span className="text-slate-400 font-mono tabular-nums">{m.agricultureScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mist-500 rounded-full"
                              style={{ width: `${m.tourismScore}%` }}
                            />
                          </div>
                          <span className="text-slate-400 font-mono tabular-nums">{m.tourismScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent h-7" onClick={() => openEdit(m)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" className="text-xs h-7" onClick={() => setDeletingId(m.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="uppercase tracking-wider text-[10px]">
                Page {page} of {Math.ceil(data.total / 15)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-xs border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent h-7 disabled:opacity-30"
                >
                  ← Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-xs border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent h-7 disabled:opacity-30"
                >
                  Next →
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={editingId !== null}
        onClose={() => setEditingId(null)}
        title={editingId === 'new' ? 'Add Municipality' : 'Edit Municipality'}
        description="Save the core municipality fields and its GeoJSON boundary."
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
          <Input label="Name" required error={formErrors.name} value={formState.name} onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))} />
          <Input label="District" required error={formErrors.district} value={formState.district} onChange={(e) => setFormState((p) => ({ ...p, district: e.target.value }))} />
          <Input label="Province" required error={formErrors.province} value={formState.province} onChange={(e) => setFormState((p) => ({ ...p, province: e.target.value }))} />
          <Input
            label="Population"
            error={formErrors.total_population}
            type="number"
            min={0}
            value={formState.total_population}
            onChange={(e) => setFormState((p) => ({ ...p, total_population: e.target.value }))}
          />
          <label className="md:col-span-2 space-y-1">
            <span className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">GeoJSON Boundary <span className="text-red-400">*</span></span>
            <textarea
              value={formState.geom}
              onChange={(e) => setFormState((p) => ({ ...p, geom: e.target.value }))}
              rows={10}
              className={`w-full px-3 py-2 text-sm rounded-lg font-mono bg-[#0A0C10] text-white focus:outline-none focus:ring-2 focus:ring-terraced-500/50 ${formErrors.geom ? 'border border-red-500/50' : 'border border-white/10'}`}
            />
            {formErrors.geom ? <span className="block mt-1.5 text-xs text-red-400 font-mono">{formErrors.geom}</span> : <span className="block mt-1.5 text-xs text-slate-500 font-mono">Paste a valid GeoJSON Polygon or MultiPolygon with coordinates.</span>}
          </label>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete municipality"
        message="This will remove the municipality record and its associated data."
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}