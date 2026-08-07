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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terraced-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Manage all registered users and their roles</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-mono font-semibold border border-red-500/20 uppercase tracking-wider">
          🔒 Admin Only
        </div>
      </div>

      {/* Filters */}
      <Card padding="md" className="bg-[#12141A] border border-white/5 shadow-none">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-terraced-500/50 bg-[#0A0C10] text-white placeholder:text-slate-600 font-mono"
          />
          <div className="flex gap-1 bg-[#0A0C10] p-1 rounded-lg border border-white/5">
            {(['all', 'ADMIN', 'MUNICIPAL_OFFICIAL', 'CITIZEN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={[
                  'px-3 py-1.5 rounded-md text-[10px] font-mono font-semibold transition-all uppercase tracking-wider',
                  roleFilter === r
                    ? 'bg-[#12141A] text-white shadow-sm border border-white/10'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent',
                ].join(' ')}
              >
                {r === 'all' ? 'All Roles' : roleLabel(r)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none" className="bg-[#12141A] border border-white/5 shadow-none overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm font-display">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
          </h3>
          <Badge variant="muted" size="sm">
            {users.length} total
          </Badge>
        </div>
        {error && <div className="py-6 text-center text-xs text-red-400 font-mono">Failed to load users.</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#0A0C10] border-b border-white/5">
              <tr>
                <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Name</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Email</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Role</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Joined</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Updated</th>
                <th className="text-left px-4 py-3 font-mono font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-terraced-500/10 border border-terraced-500/20 flex items-center justify-center text-terraced-400 font-bold text-xs flex-shrink-0 font-mono">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                        u.role === 'ADMIN'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : u.role === 'MUNICIPAL_OFFICIAL'
                            ? 'bg-saffron-500/10 text-saffron-400 border-saffron-500/20'
                            : 'bg-terraced-500/10 text-terraced-400 border-terraced-500/20'
                      }`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">
                    {formatDate(u.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent h-7" onClick={() => openEdit(u)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" className="text-xs h-7" onClick={() => setDeletingUser(u)}>
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
        description="Update the stored profile data for this account."
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
          <label className="space-y-1 md:col-span-2">
            <span className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Role</span>
            <select
              value={formState.role}
              onChange={(e) => setFormState((p) => ({ ...p, role: e.target.value as AdminUserRole }))}
              className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg bg-[#0A0C10] text-white focus:outline-none focus:ring-2 focus:ring-terraced-500/50"
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
            hint="Leave blank to keep the current password."
            className="md:col-span-2"
          />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        title="Delete user"
        message={deletingUser ? `Remove ${deletingUser.name} (${deletingUser.email}) from the system?` : ''}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}