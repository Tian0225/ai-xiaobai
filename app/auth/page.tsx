import AuthForm from '@/components/auth/auth-form'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI-xiaobai</h1>
          <p className="text-gray-600">小白学 AI，不焦虑</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
