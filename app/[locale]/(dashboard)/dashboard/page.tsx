'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { organizationsApi } from '@/lib/api/organizations';
import { programsApi } from '@/lib/api/programs';
import { locationsApi } from '@/lib/api/locations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarCheck, MapPin, Users, Building2, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthDebug } from '@/components/debug/AuthDebug';

export default function DashboardPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const { data: organizations, isLoading: orgsLoading, error: orgsError } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];
  const isOwner = user?.role === 'owner';

  // Debug logging
  console.log('Dashboard Debug:', {
    organizations,
    organization,
    user,
    isOwner,
    orgsLoading,
    orgsError
  });

  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ['programs', organization?.id],
    queryFn: () => programsApi.getPrograms(organization!.id),
    enabled: !!organization?.id,
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations', organization?.id],
    queryFn: () => locationsApi.getLocations(organization!.id),
    enabled: !!organization?.id,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['organization-members', organization?.id],
    queryFn: () => organizationsApi.getOrganizationMembers(organization!.id),
    enabled: !!organization?.id && isOwner,
  });

  if (orgsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (orgsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.welcome')}</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <h3 className="font-semibold">Error loading organizations</h3>
              <p className="text-sm mt-1">
                {orgsError.message || 'Failed to load organization data. Please try refreshing the page.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.welcome')}</p>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Building2 className="h-5 w-5" />
              {t('organization.noOrganization')}
            </CardTitle>
            <CardDescription className="text-blue-800">
              Create your organization to start managing programs and locations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/organization/create`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                {t('organization.create')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: t('dashboard.programs'),
      value: programs?.length || 0,
      icon: CalendarCheck,
      href: `/${locale}/programs`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('dashboard.locations'),
      value: locations?.length || 0,
      icon: MapPin,
      href: `/${locale}/locations`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('dashboard.teamMembers'),
      value: members?.length || 1,
      icon: Users,
      href: isOwner ? `/${locale}/team` : undefined,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <AuthDebug />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.welcome')}</p>
        </div>
        {!organization.is_approved && (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <AlertCircle className="h-3 w-3" />
            {t('organization.pendingApproval')}
          </Badge>
        )}
      </div>

      {!organization.is_approved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{t('organization.approvalPending')}</span>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              Your organization is awaiting approval. You can manage programs and locations, but they won't be visible to the public until approved.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href || '#'}
            className={`group block rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
              !stat.href ? 'cursor-default' : 'hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            {stat.href && (
              <div className="mt-4 flex items-center text-sm text-gray-500 group-hover:text-gray-700">
                <span>{t('dashboard.viewDetails')}</span>
                <Plus className="ml-1 h-3 w-3" />
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {organization.name}
            </CardTitle>
            <CardDescription>
              {organization.is_approved ? t('organization.approved') : t('organization.pending')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{organization.city}, {organization.country}</span>
              </div>
              <div className="text-gray-500">
                {organization.description || t('organization.noDescription')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            <CardDescription>
              {t('dashboard.quickActionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/${locale}/programs/create`}>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                {t('programs.create')}
              </Button>
            </Link>
            <Link href={`/${locale}/locations/create`}>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                {t('locations.create')}
              </Button>
            </Link>
            {isOwner && (
              <Link href={`/${locale}/team`}>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {t('team.manage')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

