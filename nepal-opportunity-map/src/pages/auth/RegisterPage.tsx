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
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background grid - NO GRADIENTS */}
      <div 
        className="absolute inset-0 -z-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '48px 48px' 
        }} 
      />

      <Card padding="lg" className="w-full max-w-md bg-[#12141A] border border-white/5 shadow-2xl space-y-8 relative z-10">
        {/* Header with Logo Mark */}
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-terraced-600 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.2)] mb-4">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Create Catalyst Account</h1>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Spatial Economic Intelligence Platform</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="Priya Sharma"
            error={errors.name?.message}
            {...register('name')}
            className="bg-[#0A0C10] border-white/10 text-white placeholder:text-slate-600 focus:border-terraced-500/50 focus:ring-1 focus:ring-terraced-500/50"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="name@organization.np"
            error={errors.email?.message}
            {...register('email')}
            className="bg-[#0A0C10] border-white/10 text-white placeholder:text-slate-600 focus:border-terraced-500/50 focus:ring-1 focus:ring-terraced-500/50"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
            className="bg-[#0A0C10] border-white/10 text-white placeholder:text-slate-600 focus:border-terraced-500/50 focus:ring-1 focus:ring-terraced-500/50"
          />

          <Button 
            type="submit" 
            isLoading={isSubmitting} 
            className="w-full mt-4 bg-terraced-600 hover:bg-terraced-500 text-white font-semibold border-0 h-11 shadow-none"
          >
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-6 border-t border-white/5">
          Already have institutional access?{' '}
          <Link to="/login" className="text-terraced-400 font-medium hover:text-terraced-300 transition-colors">
            Sign in
          </Link>
        </div>
      </Card>

      {/* Footer disclaimer for premium feel */}
      <p className="absolute bottom-6 text-[10px] text-slate-700 font-mono text-center w-full px-4">
        PROTECTED SYSTEM • UNAUTHORIZED ACCESS IS PROHIBITED • v2.4.0
      </p>
    </div>
  )
}