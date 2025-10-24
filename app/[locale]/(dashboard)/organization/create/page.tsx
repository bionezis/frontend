'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { organizationsApi, CreateOrganizationData } from '@/lib/api/organizations';
import { OrganizationForm } from '@/components/organization/OrganizationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateOrganizationPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: organizationsApi.createOrganization,
    onSuccess: (organization) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully. It is pending admin approval.');
      router.push(`/${locale}/organization`);
    },
    onError: (error: any) => {
      console.error('Create organization error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to create organization';
      toast.error(message);
    },
  });

  const handleSubmit = async (data: CreateOrganizationData) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/dashboard`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('organization.create')}</h1>
          <p className="text-gray-600">Set up your organization to get started</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Provide details about your healthcare organization. This information will be reviewed by our team before approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            submitLabel={t('organization.create')}
          />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">What happens next?</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• Your organization will be submitted for review</li>
          <li>• Our team will verify the information provided</li>
          <li>• You'll receive an email notification once approved</li>
          <li>• After approval, you can start adding programs and locations</li>
        </ul>
      </div>
    </div>
  );
}
