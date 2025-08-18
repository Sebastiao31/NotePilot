import SignUpWithGoogle from '@/components/auth/SignUpWithGoogle'

export default function SignupPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Signup</h1>
        <SignUpWithGoogle />
      </div>
    </div>
  )
}