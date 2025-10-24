'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { organizationsApi } from '@/lib/api/organizations';
import { programsApi, UpdateProgramData } from '@/lib/api/programs';
import { ProgramForm } from '@/components/programs/ProgramForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditProgramPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { locale, id } = resolvedParams;
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', organization?.id, id],
    queryFn: () => programsApi.getProgram(organization!.id, parseInt(id)),
    enabled: !!organization?.id && !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProgramData) =>
      programsApi.updateProgram(organization!.id, parseInt(id), data),
    onSuccess: (updatedProgram) => {
      queryClient.invalidateQueries({ queryKey: ['program', organization?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['programs', organization?.id] });
      toast.success(t('programs.updateSuccess'));
      router.push(`/${locale}/programs/${id}`);
    },
    onError: (error: any) => {
      console.error('Update program error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to update program';
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

  if (!program || !organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program not found</h1>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: UpdateProgramData) => {
    await updateMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/programs/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('programs.edit')}</h1>
          <p className="text-gray-600">Update program information and settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Program: {program.name}
          </CardTitle>
          <CardDescription>
            Make changes to your program. Significant changes may require re-approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm
            program={program}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            submitLabel={t('common.save')}
          />
        </CardContent>
      </Card>

      {program.status !== 'draft' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="font-semibold text-yellow-900">Important Note</h3>
          <p className="mt-1 text-sm text-yellow-800">
            This program has been approved or published. Significant changes may require re-approval
            and could temporarily unpublish the program.
          </p>
        </div>
      )}
    </div>
  );
}
