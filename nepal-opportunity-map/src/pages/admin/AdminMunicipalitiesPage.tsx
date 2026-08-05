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

const emptyForm: MunicipalityFormState = {
  name: '',
  district: '',
  province: '',
  total_population: '0',
  geom: '{\n  "type": "Polygon",\n  "coordinates": []\n}',
}

export const AdminMunicipalitiesPage = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<MunicipalityFormState>(emptyForm)

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
  }

  const openEdit = async (row: any) => {
    try {
      setEditingId(row.id)
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
          <h1 className="text-2xl font-bold font-display text-peak-800">Municipality Management</h1>
          <p className="text-xs text-peak-400 mt-1">View and audit all 753 local unit records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="text-xs" onClick={openCreate}>
            Add Municipality
          </Button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            🔒 Admin Only
          </div>
        </div>
      </div>

      {/* Search */}
      <Card padding="md" className="bg-white border border-peak-100 shadow-xs">
        <input
          type="text"
          placeholder="Search municipalities…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full px-3 py-2 text-xs border border-peak-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terraced-400 bg-white text-peak-700 placeholder-peak-300"
        />
      </Card>

      {/* Table */}
      <Card padding="none" className="bg-white border border-peak-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-peak-100 flex items-center justify-between">
          <h3 className="font-semibold text-peak-800 text-sm">Local Units</h3>
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
          <div className="py-8 text-center text-xs text-red-500">Failed to load municipalities.</div>
        )}

        {data && !isLoading && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-peak-50 border-b border-peak-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">District</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Province</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Population</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Agri Score</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Tourism Score</th>
                    <th className="text-left px-4 py-3 font-semibold text-peak-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-peak-50">
                  {data.data.map((m) => (
                    <tr key={m.id} className="hover:bg-peak-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-peak-800">{m.name}</td>
                      <td className="px-4 py-3 text-peak-500 capitalize">{m.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-peak-500">{m.district}</td>
                      <td className="px-4 py-3 text-peak-500">P{m.province}</td>
                      <td className="px-4 py-3 text-peak-500">{m.population.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-peak-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-terraced-400 rounded-full"
                              style={{ width: `${m.agricultureScore}%` }}
                            />
                          </div>
                          <span className="text-peak-600">{m.agricultureScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-peak-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mist-400 rounded-full"
                              style={{ width: `${m.tourismScore}%` }}
                            />
                          </div>
                          <span className="text-peak-600">{m.tourismScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => openEdit(m)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" className="text-xs" onClick={() => setDeletingId(m.id)}>
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
            <div className="p-4 border-t border-peak-100 flex items-center justify-between text-xs text-peak-500">
              <span>
                Page {page} of {Math.ceil(data.total / 15)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-xs"
                >
                  ← Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-xs"
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
          <Input label="Name" value={formState.name} onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))} />
          <Input label="District" value={formState.district} onChange={(e) => setFormState((p) => ({ ...p, district: e.target.value }))} />
          <Input label="Province" value={formState.province} onChange={(e) => setFormState((p) => ({ ...p, province: e.target.value }))} />
          <Input
            label="Population"
            type="number"
            min={0}
            value={formState.total_population}
            onChange={(e) => setFormState((p) => ({ ...p, total_population: e.target.value }))}
          />
          <label className="md:col-span-2 space-y-1">
            <span className="block text-sm font-medium text-peak-600">GeoJSON Boundary</span>
            <textarea
              value={formState.geom}
              onChange={(e) => setFormState((p) => ({ ...p, geom: e.target.value }))}
              rows={10}
              className="w-full px-3 py-2 text-sm border border-peak-200 rounded-lg font-mono"
            />
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
