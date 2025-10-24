import { LoginForm } from '@/components/auth/LoginForm';

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  );
}

