import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card, toast } from '@/components/ui'
import { authApi } from '@/services/auth.api'
import { useAuthStore } from '@/store'
import { getRoleDashboard } from '@/routes/ProtectedRoute'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await authApi.login(values)
      setUser(response.user, response.tokens)
      toast.success(`Welcome back, ${response.user.name}!`)
      // Redirect based on role
      navigate(getRoleDashboard(response.user.role), { replace: true })
    } catch (err: any) {
      toast.error(err?.message || 'Login failed. Check your credentials.')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <Card padding="lg" className="w-full max-w-md bg-white border border-peak-100 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold font-display text-peak-700">Sign in to Catalyst</h1>
          <p className="text-xs text-peak-400">Access spatial opportunity analysis and saved reports.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-peak-400 pt-2 border-t border-peak-100">
          Don't have an account?{' '}
          <Link to="/register" className="text-terraced-600 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </Card>
    </div>
  )
}
