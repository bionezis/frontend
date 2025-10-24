'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { organizationsApi } from '@/lib/api/organizations';
import { locationsApi, CreateLocationData } from '@/lib/api/locations';
import { LocationForm } from '@/components/locations/LocationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateLocationPage() {
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
    mutationFn: (data: CreateLocationData) =>
      locationsApi.createLocation(organization!.id, data),
    onSuccess: (location) => {
      queryClient.invalidateQueries({ queryKey: ['locations', organization?.id] });
      toast.success(t('locations.createSuccess'));
      router.push(`/${locale}/locations`);
    },
    onError: (error: any) => {
      console.error('Create location error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to create location';
      toast.error(message);
    },
  });

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('locations.create')}</h1>
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

  const handleSubmit = async (data: CreateLocationData) => {
    await createMutation.mutateAsync(data);
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
          <h1 className="text-3xl font-bold tracking-tight">{t('locations.create')}</h1>
          <p className="text-gray-600">Add a new location to your organization</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Information
          </CardTitle>
          <CardDescription>
            Provide the address and contact details for this location. The system will automatically generate coordinates for mapping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            submitLabel={t('locations.create')}
          />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">Location Benefits</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• Locations can be linked to program offerings</li>
          <li>• Automatic geocoding provides coordinates for mapping</li>
          <li>• Contact information helps participants reach your services</li>
          <li>• Multiple locations allow you to serve different areas</li>
        </ul>
      </div>
    </div>
  );
}
