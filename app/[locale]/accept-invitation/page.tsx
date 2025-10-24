'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, UserPlus, LogIn, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

export default function AcceptInvitationPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, login, register, registerWithInvitation } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [mounted, setMounted] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  
  const code = searchParams.get('code');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (code) {
      fetchInvitationDetails();
    }
  }, [code]);

  const fetchInvitationDetails = async () => {
    try {
      setLoading(true);
      // This would be an API call to get invitation details
      // For now, we'll just show the form
      setLoading(false);
    } catch (err) {
      setError('Failed to load invitation details');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('Invalid invitation code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login(loginData.email, loginData.password);
      
      // After successful login, accept the invitation
      await acceptInvitation();
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('Invalid invitation code');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Register with invitation (auto-approves and logs in)
      await registerWithInvitation({
        ...registerData,
        invitation_code: code,
      });
      
      // Registration with invitation automatically accepts the invitation
      // and logs the user in, so we can redirect to dashboard
      setSuccess(true);
      setLoading(false);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/en/dashboard');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!code) {
      setError('Invalid invitation code');
      return;
    }

    try {
      // Accept the invitation
      const response = await fetch('/api/v1/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to accept invitation');
      }

      setSuccess(true);
      setLoading(false);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/en/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
      setLoading(false);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/en/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Invitation Accepted!
            </CardTitle>
            <CardDescription>
              You have successfully joined the organization. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Accept Invitation
          </CardTitle>
          <CardDescription>
            You have been invited to join an organization. If you already have an account, login. If this is your first time, register with the invitation code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Invitation Code:</strong> {code}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                I Have an Account
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                New User
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                If you already have a Bionezis account, login here to accept the invitation.
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                    ) : (
                      'Login & Join Organization'
                    )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Create a new account using the invitation code. You'll be automatically approved and added to the organization.
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-first-name">First Name</Label>
                    <Input
                      id="register-first-name"
                      value={registerData.first_name}
                      onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-last-name">Last Name</Label>
                    <Input
                      id="register-last-name"
                      value={registerData.last_name}
                      onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone (Optional)</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Create Account & Join Organization'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/en/login')}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
