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
      navigate(getRoleDashboard(response.user.role), { replace: true })
    } catch (err: any) {
      toast.error(err?.message || 'Login failed. Check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4FBF7] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle emerald background mesh */}
      <div 
        className="absolute inset-0 -z-0 opacity-40" 
        style={{ 
          backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }} 
      />

      <Card padding="lg" className="w-full max-w-md bg-white border border-emerald-100 shadow-xl space-y-8 relative z-10 rounded-2xl">
        {/* Header with Logo Mark */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Sign in to Catalyst</h1>
          <p className="text-xs text-emerald-800 font-mono font-bold uppercase tracking-wider">Nepal Municipality Spatial Intelligence Engine</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@organization.np"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button 
            type="submit" 
            isLoading={isSubmitting} 
            className="w-full mt-4 h-11 text-base font-bold shadow-md shadow-emerald-600/20"
          >
            Access Platform →
          </Button>
        </form>

        <div className="text-center text-xs text-slate-600 pt-6 border-t border-emerald-100 font-medium">
          Need an account?{' '}
          <Link to="/register" className="text-emerald-700 font-bold hover:underline">
            Register for Access
          </Link>
        </div>
      </Card>

      <p className="absolute bottom-6 text-[10px] text-slate-500 font-mono text-center w-full px-4 font-semibold uppercase tracking-wider">
        SECURE GIS SYSTEM • NEPAL MUNICIPALITY ENGINE • v2.4.0
      </p>
    </div>
  )
}