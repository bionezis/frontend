'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { organizationsApi } from '@/lib/api/organizations';
import { programsApi, CreateProgramData } from '@/lib/api/programs';
import { ProgramForm } from '@/components/programs/ProgramForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateProgramPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const queryClient = useQueryClient();

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];

  const createMutation = useMutation({
    mutationFn: (data: CreateProgramData) =>
      programsApi.createProgram(organization!.id, data),
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: ['programs', organization?.id] });
      toast.success(t('programs.createSuccess'));
      router.push(`/${locale}/programs/${program.id}`);
    },
    onError: (error: any) => {
      console.error('Create program error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to create program';
      toast.error(message);
    },
  });

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('programs.create')}</h1>
          <p className="text-gray-600">Create an organization first</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Link href={`/${locale}/organization/create`}>
              <Button>Create Organization</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: CreateProgramData) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/programs`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('programs.create')}</h1>
          <p className="text-gray-600">Add a new healthcare program to your organization</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Program Information
          </CardTitle>
          <CardDescription>
            Provide details about your healthcare program. Programs start as drafts and can be published once approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            submitLabel={t('programs.create')}
          />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">Program Workflow</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• Programs start as <strong>drafts</strong> that you can edit</li>
          <li>• Once ready, programs are <strong>approved</strong> by administrators</li>
          <li>• Approved programs can be <strong>published</strong> to make them publicly visible</li>
          <li>• You can add offerings (locations, pricing) to published programs</li>
        </ul>
      </div>
    </div>
  );
}
