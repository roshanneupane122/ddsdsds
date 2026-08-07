import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Card, ConfirmModal, Input, Modal, toast } from '@/components/ui'
import { usersApi, type AdminUserRecord, type AdminUserRole } from '@/services/users.api'

type UserFormState = {
  name: string
  email: string
  role: AdminUserRole
  password: string
}

const defaultFormState: UserFormState = {
  name: '',
  email: '',
  role: 'CITIZEN',
  password: '',
}

const roleLabel = (role: AdminUserRole) => role.replace(/_/g, ' ')

export const AdminUsersPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUserRole>('all')
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUserRecord | null>(null)
  const [formState, setFormState] = useState<UserFormState>(defaultFormState)

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.list({ limit: 100 }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UserFormState> }) =>
      usersApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'recent-users'] })
      setEditingUser(null)
      toast.success('User updated successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Unable to update user.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      await queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'recent-users'] })
      setDeletingUser(null)
      toast.success('User removed successfully.')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Unable to delete user.')
    },
  })

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      return matchSearch && matchRole
    })
  }, [roleFilter, search, users])

  const openEdit = (user: AdminUserRecord) => {
    setEditingUser(user)
    setFormState({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    })
  }

  const submitEdit = async () => {
    if (!editingUser) return

    const payload: Partial<UserFormState> = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      role: formState.role,
    }

    if (formState.password.trim()) {
      payload.password = formState.password.trim()
    }

    await updateMutation.mutateAsync({ id: editingUser.id, payload })
  }

  const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Manage all registered users and permissions</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200 uppercase tracking-wider">
          🔒 Admin Console
        </div>
      </div>

      {/* Filters */}
      <Card padding="md" className="bg-white border border-emerald-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 bg-white text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <div className="flex gap-1 bg-emerald-50/60 p-1 rounded-xl border border-emerald-100">
            {(['all', 'ADMIN', 'MUNICIPAL_OFFICIAL', 'CITIZEN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all uppercase tracking-wider',
                  roleFilter === r
                    ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                    : 'text-slate-600 hover:text-emerald-700 border border-transparent',
                ].join(' ')}
              >
                {r === 'all' ? 'All Roles' : roleLabel(r)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none" className="bg-white border border-emerald-100 shadow-sm overflow-hidden rounded-2xl">
        <div className="p-4 md:p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/40">
          <h3 className="font-bold text-slate-900 text-sm font-display">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
          </h3>
          <Badge variant="success" size="sm">
            {users.length} TOTAL REGISTERED
          </Badge>
        </div>
        {error && <div className="py-6 text-center text-xs text-red-500 font-mono">Failed to load users.</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-emerald-50/70 border-b border-emerald-100">
              <tr>
                <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Name</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Email</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Role</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Joined</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Updated</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-emerald-900 uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono shadow-2xs">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-mono font-medium">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        u.role === 'ADMIN'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : u.role === 'MUNICIPAL_OFFICIAL'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono">
                    {formatDate(u.updatedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => openEdit(u)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" className="text-xs h-8" onClick={() => setDeletingUser(u)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500 font-mono">No users match your search.</div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={editingUser ? `Edit ${editingUser.name}` : 'Edit User'}
        description="Update profile information and system privileges."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingUser(null)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={submitEdit} isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={formState.name} onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Email" value={formState.email} onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))} />
          <label className="space-y-1.5 md:col-span-2">
            <span className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Role</span>
            <select
              value={formState.role}
              onChange={(e) => setFormState((p) => ({ ...p, role: e.target.value as AdminUserRole }))}
              className="w-full px-3.5 py-2.5 text-sm border border-emerald-200 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
            >
              <option value="ADMIN">Admin</option>
              <option value="MUNICIPAL_OFFICIAL">Municipal Official</option>
              <option value="CITIZEN">Citizen</option>
            </select>
          </label>
          <Input
            label="New Password"
            type="password"
            value={formState.password}
            onChange={(e) => setFormState((p) => ({ ...p, password: e.target.value }))}
            hint="Leave blank to keep current password."
            className="md:col-span-2"
          />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        title="Delete User"
        message={deletingUser ? `Are you sure you want to remove ${deletingUser.name} (${deletingUser.email})?` : ''}
        confirmLabel="Delete User"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}