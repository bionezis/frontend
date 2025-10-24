'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { profileApi, UpdateProfileData, ChangePasswordData } from '@/lib/api/profile';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordForm } from '@/components/profile/PasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Calendar, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const t = useTranslations();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      refreshUser(); // Refresh user data in auth context
      toast.success(t('profile.updateSuccess'));
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to update profile';
      toast.error(message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success(t('profile.passwordChanged'));
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to change password';
      toast.error(message);
    },
  });

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  const handleUpdateProfile = async (data: UpdateProfileData) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handleChangePassword = async (data: ChangePasswordData) => {
    await changePasswordMutation.mutateAsync(data);
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profile.edit')}
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                user={user}
                onSubmit={handleUpdateProfile}
                isLoading={updateProfileMutation.isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('profile.changePassword')}
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm
                onSubmit={handleChangePassword}
                isLoading={changePasswordMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-900">Full Name</div>
                <div className="text-gray-600">
                  {user.first_name} {user.last_name}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-gray-900">Email Address</div>
                <div className="text-gray-600">{user.email}</div>
              </div>

              <Separator />

              {user.phone && (
                <>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Phone Number</div>
                    <div className="text-gray-600">{user.phone}</div>
                  </div>
                  <Separator />
                </>
              )}

              {user.role && (
                <>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Role</div>
                    <Badge 
                      variant={getRoleBadgeVariant(user.role)}
                      className="flex items-center gap-1 w-fit mt-1"
                    >
                      {getRoleIcon(user.role)}
                      {t(`team.${user.role}`)}
                    </Badge>
                  </div>
                  <Separator />
                </>
              )}

              {user.organization_id && (
                <div>
                  <div className="text-sm font-medium text-gray-900">Organization ID</div>
                  <div className="text-gray-600">#{user.organization_id}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use a strong, unique password</li>
                <li>• Don't share your account credentials</li>
                <li>• Log out from shared devices</li>
                <li>• Keep your contact information updated</li>
                <li>• Report suspicious activity immediately</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
