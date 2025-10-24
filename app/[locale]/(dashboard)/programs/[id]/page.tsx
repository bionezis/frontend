'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { organizationsApi } from '@/lib/api/organizations';
import { programsApi } from '@/lib/api/programs';
import { ProgramStatusBadge } from '@/components/programs/ProgramStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Globe,
  MapPin,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { locale, id } = resolvedParams;
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const { data: offerings } = useQuery({
    queryKey: ['program-offerings', organization?.id, id],
    queryFn: () => programsApi.getProgramOfferings(organization!.id, parseInt(id)),
    enabled: !!organization?.id && !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => programsApi.deleteProgram(organization!.id, parseInt(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs', organization?.id] });
      toast.success(t('programs.deleteSuccess'));
      router.push(`/${locale}/programs`);
    },
    onError: (error: any) => {
      console.error('Delete program error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to delete program';
      toast.error(message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => programsApi.publishProgram(organization!.id, parseInt(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', organization?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['programs', organization?.id] });
      toast.success('Program published successfully');
    },
    onError: (error: any) => {
      console.error('Publish program error:', error);
      toast.error('Failed to publish program');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => programsApi.unpublishProgram(organization!.id, parseInt(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', organization?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['programs', organization?.id] });
      toast.success('Program unpublished successfully');
    },
    onError: (error: any) => {
      console.error('Unpublish program error:', error);
      toast.error('Failed to unpublish program');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded bg-gray-200" />
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

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    setShowDeleteDialog(false);
  };

  const canPublish = program.status === 'approved' && !program.is_published;
  const canUnpublish = program.status === 'approved' && program.is_published;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/programs`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
          <p className="text-gray-600">{program.short_description}</p>
        </div>
        <div className="flex items-center gap-2">
          {canPublish && (
            <Button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
            >
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
          {canUnpublish && (
            <Button
              variant="outline"
              onClick={() => unpublishMutation.mutate()}
              disabled={unpublishMutation.isPending}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Unpublish
            </Button>
          )}
          <Link href={`/${locale}/programs/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              {t('common.edit')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Program Details
                </CardTitle>
                <div className="flex items-center gap-2">
                  <ProgramStatusBadge
                    status={program.status}
                    isPublished={program.is_published}
                  />
                  <Badge variant="secondary">
                    {program.language.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {program.program_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{program.description}</p>
              </div>

              {program.brochure_url && (
                <div>
                  <h3 className="font-semibold mb-2">Brochure</h3>
                  <a
                    href={program.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View Program Brochure (PDF)
                  </a>
                </div>
              )}

              <Separator />

              <div className="grid gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Created on {new Date(program.created_at).toLocaleDateString()}</span>
                </div>
                {program.created_by_email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>Created by {program.created_by_email}</span>
                  </div>
                )}
                {program.approved_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>
                      Approved on {new Date(program.approved_at).toLocaleDateString()}
                      {program.approved_by_email && ` by ${program.approved_by_email}`}
                    </span>
                  </div>
                )}
                {program.published_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span>Published on {new Date(program.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('programs.offerings')} ({program.offering_count})
                  </CardTitle>
                  <CardDescription>
                    Locations where this program is offered
                  </CardDescription>
                </div>
                <Link href={`/${locale}/programs/${id}/offerings`}>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Offering
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {offerings && offerings.length > 0 ? (
                <div className="space-y-4">
                  {offerings.map((offering) => (
                    <div
                      key={offering.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <div className="font-medium">{offering.location.name} </div>
                        <div className="text-sm text-gray-600">
                          {offering.pricing_type === 'free' && 'Free'}
                          {offering.pricing_type === 'paid' && 
                            `${offering.price} ${offering.currency || 'USD'}`}
                          {offering.pricing_type === 'sliding_scale' && 'Sliding Scale'}
                          {offering.pricing_type === 'insurance' && 'Insurance Covered'}
                          {offering.pricing_type === 'contact' && 'Contact for Pricing'}
                        </div>
                      </div>
                      <Link href={`/${locale}/programs/${id}/offerings`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="mx-auto h-8 w-8 mb-2" />
                  <p>No offerings yet</p>
                  <p className="text-sm">Add locations where this program is available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Program</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete "{program.name}"? This action cannot be undone.
                      All associated offerings will also be deleted.
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
      </div>
    </div>
  );
}
