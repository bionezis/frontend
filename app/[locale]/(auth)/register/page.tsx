import { RegisterForm } from '@/components/auth/RegisterForm';

export default async function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-8">
        <RegisterForm />
      </div>
    </div>
  );
}

