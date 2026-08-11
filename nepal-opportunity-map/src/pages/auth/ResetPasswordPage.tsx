import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Input, Card, toast } from '@/components/ui'
import { authApi } from '@/services/auth.api'

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Invalid or missing password reset token in URL.')
      return
    }

    try {
      const response = await authApi.resetPassword(token, values.newPassword)
      toast.success(response.message || 'Password successfully reset!')
      setIsSuccess(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to reset password. Token may be expired.')
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
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-xs text-emerald-800 font-mono font-bold uppercase tracking-wider">
            Create a secure new password for your account
          </p>
        </div>

        {!token ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm space-y-3 text-center">
            <p className="font-semibold">Missing Reset Token ⚠️</p>
            <p className="text-xs text-amber-800">
              The reset password link is missing a valid security token. Please request a new password reset link.
            </p>
            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full mt-2 h-10 text-xs font-bold"
            >
              Go to Request Password Reset
            </Button>
          </div>
        ) : isSuccess ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm space-y-2">
              <p className="font-semibold text-emerald-800">Password Reset Successful! 🎉</p>
              <p className="text-xs text-emerald-700">
                Your password has been updated. You can now sign in with your new credentials.
              </p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="w-full h-11 text-base font-bold shadow-md shadow-emerald-600/20"
            >
              Sign In Now →
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              className="w-full mt-4 h-11 text-base font-bold shadow-md shadow-emerald-600/20"
            >
              Reset Password →
            </Button>

            <div className="text-center text-xs text-slate-600 pt-4 font-medium">
              Return to{' '}
              <Link to="/login" className="text-emerald-700 font-bold hover:underline">
                Sign In
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
