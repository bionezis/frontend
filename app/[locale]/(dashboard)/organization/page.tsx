'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { organizationsApi } from '@/lib/api/organizations';
import { ApprovalBanner } from '@/components/organization/ApprovalBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Mail, Phone, Globe, MapPin, Calendar, Edit } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OrganizationPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0]; // User should have one organization
  const isOwner = user?.role === 'owner';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-32 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('organization.title')}</h1>
          <p className="text-gray-600">Create your organization to get started</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('organization.create')}</CardTitle>
            <CardDescription>
              Set up your organization to start managing programs and locations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/organization/create`}>
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                {t('organization.create')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('organization.title')}</h1>
          <p className="text-gray-600">Manage your organization settings and information</p>
        </div>
        {isOwner && (
          <Link href={`/${locale}/organization/settings`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              {t('organization.edit')}
            </Button>
          </Link>
        )}
      </div>

      <ApprovalBanner isApproved={organization.is_approved} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {organization.name}
              </CardTitle>
              <CardDescription>
                {organization.description || 'No description provided'}
              </CardDescription>
            </div>
            <Badge variant={organization.is_approved ? 'default' : 'secondary'}>
              {organization.is_approved ? t('organization.approved') : t('organization.pending')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              
              {organization.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{organization.email}</span>
                </div>
              )}
              
              {organization.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{organization.phone}</span>
                </div>
              )}
              
              {organization.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Address</h3>
              
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <div>{organization.address}</div>
                  <div>
                    {organization.city}, {organization.country}
                    {organization.postal_code && ` ${organization.postal_code}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              Created on {new Date(organization.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
