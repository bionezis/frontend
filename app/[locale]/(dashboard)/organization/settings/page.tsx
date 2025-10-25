'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { organizationsApi, UpdateOrganizationData } from '@/lib/api/organizations';
import { OrganizationForm } from '@/components/organization/OrganizationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Building2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function OrganizationSettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];
  const isOwner = user?.role === 'owner';

  // Redirect if not owner
  useEffect(() => {
    if (user && !isOwner) {
      router.push(`/${locale}/organization`);
    }
  }, [user, isOwner, router, locale]);

  // Redirect if no organization
  useEffect(() => {
    if (!isLoading && !organization) {
      router.push(`/${locale}/organization/create`);
    }
  }, [isLoading, organization, router, locale]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrganizationData }) =>
      organizationsApi.updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success(t('organization.updateSuccess'));
      router.push(`/${locale}/organization`);
    },
    onError: (error: any) => {
      console.error('Update organization error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to update organization';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationsApi.deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization deleted successfully');
      router.push(`/${locale}/dashboard`);
    },
    onError: (error: any) => {
      console.error('Delete organization error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to delete organization';
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-96 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  // Don't render if not owner or no organization (redirects are handled in useEffect)
  if (!isOwner || !organization) {
    return null;
  }

  const handleSubmit = async (data: UpdateOrganizationData) => {
    await updateMutation.mutateAsync({ id: organization.id, data });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(organization.id);
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/organization`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('organization.settings')}</h1>
          <p className="text-gray-600">Update your organization information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('organization.edit')}
          </CardTitle>
          <CardDescription>
            Update your organization details. Changes may require re-approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm
            organization={organization}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            submitLabel={t('organization.updateSuccess')}
          />
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this organization and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Organization</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{organization.name}"? This action cannot be undone.
                  All programs, locations, and team members will be permanently removed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? t('common.loading') : t('common.delete')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
