import LoginForm from '@/features/auth/components/LoginForm'
import { useLogin } from '@/features/auth/hooks/useAuthMutations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FileText } from 'lucide-react'

const LoginPage = () => {
  const { mutate: login, isPending } = useLogin()

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Contract Management</h1>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onSubmit={login} isLoading={isPending} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
