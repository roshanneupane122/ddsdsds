import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card, toast } from '@/components/ui'
import { authApi } from '@/services/auth.api'
import { useAuthStore } from '@/store'
import { getRoleDashboard } from '@/routes/ProtectedRoute'

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export const RegisterPage = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await authApi.register(values)
      setUser(response.user, response.tokens)
      toast.success('Account created successfully!')
      navigate(getRoleDashboard(response.user.role), { replace: true })
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed.')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <Card padding="lg" className="w-full max-w-md bg-white border border-peak-100 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold font-display text-peak-700">Create Catalyst Account</h1>
          <p className="text-xs text-peak-400">Join Nepal's spatial economic intelligence platform.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Priya Sharma"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="name@organization.np"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-peak-400 pt-2 border-t border-peak-100">
          Already have an account?{' '}
          <Link to="/login" className="text-terraced-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}
