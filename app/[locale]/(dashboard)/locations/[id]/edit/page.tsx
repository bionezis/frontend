'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { organizationsApi } from '@/lib/api/organizations';
import { locationsApi, UpdateLocationData } from '@/lib/api/locations';
import { LocationForm } from '@/components/locations/LocationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditLocationPage({
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

  const { data: location, isLoading } = useQuery({
    queryKey: ['location', organization?.id, id],
    queryFn: () => locationsApi.getLocation(organization!.id, parseInt(id)),
    enabled: !!organization?.id && !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLocationData) =>
      locationsApi.updateLocation(organization!.id, parseInt(id), data),
    onSuccess: (updatedLocation) => {
      queryClient.invalidateQueries({ queryKey: ['location', organization?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['locations', organization?.id] });
      toast.success(t('locations.updateSuccess'));
      router.push(`/${locale}/locations`);
    },
    onError: (error: any) => {
      console.error('Update location error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to update location';
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

  if (!location || !organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Location not found</h1>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: UpdateLocationData) => {
    await updateMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/locations`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('locations.edit')}</h1>
          <p className="text-gray-600">Update location information and settings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Edit Location: {location.name}
          </CardTitle>
          <CardDescription>
            Update the location details. Address changes will trigger automatic re-geocoding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationForm
            location={location}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            submitLabel={t('common.save')}
          />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="font-semibold text-yellow-900">Important Note</h3>
        <p className="mt-1 text-sm text-yellow-800">
          If you change the address information, the system will automatically update the coordinates
          for this location. This may affect how the location appears on maps and in search results.
        </p>
      </div>
    </div>
  );
}
