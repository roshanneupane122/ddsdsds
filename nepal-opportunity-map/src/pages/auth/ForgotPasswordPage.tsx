import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button, Input, Card, toast } from '@/components/ui'
import { authApi } from '@/services/auth.api'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address (e.g. user@gmail.com)'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordPage = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const response = await authApi.forgotPassword(values.email.trim())
      setSubmittedEmail(values.email.trim())
      toast.success(response.message || 'Password reset link sent to your email!')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to send password reset email.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4FBF7] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background mesh grid */}
      <div 
        className="absolute inset-0 -z-0 opacity-40" 
        style={{ 
          backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }} 
      />

      <Card padding="lg" className="w-full max-w-md bg-white border border-emerald-100 shadow-xl space-y-8 relative z-10 rounded-2xl">
        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-emerald-800 font-mono font-bold uppercase tracking-wider">
            Enter your email to receive a password reset link
          </p>
        </div>

        {submittedEmail ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm space-y-2">
              <p className="font-semibold text-emerald-800">Check your inbox 📩</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                If an account exists for <span className="font-bold underline">{submittedEmail}</span>, we've sent instructions to reset your password.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSubmittedEmail(null)}
                className="w-full h-11 text-sm font-semibold"
              >
                Try Another Email
              </Button>

              <Link
                to="/login"
                className="block text-center text-xs font-bold text-emerald-700 hover:underline pt-2"
              >
                ← Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="ram@gmail.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              className="w-full mt-4 h-11 text-base font-bold shadow-md shadow-emerald-600/20"
            >
              Send Reset Link →
            </Button>

            <div className="text-center text-xs text-slate-600 pt-4 font-medium">
              Remembered your password?{' '}
              <Link to="/login" className="text-emerald-700 font-bold hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>

      <p className="absolute bottom-6 text-[10px] text-slate-500 font-mono text-center w-full px-4 font-semibold uppercase tracking-wider">
        SECURE GIS SYSTEM • NEPAL MUNICIPALITY ENGINE • v2.4.0
      </p>
    </div>
  )
}
