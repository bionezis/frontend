'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { organizationsApi } from '@/lib/api/organizations';
import { programsApi } from '@/lib/api/programs';
import { ProgramStatusBadge } from '@/components/programs/ProgramStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, FileText, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProgramsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];

  const { data: programs, isLoading } = useQuery({
    queryKey: ['programs', organization?.id],
    queryFn: () => programsApi.getPrograms(organization!.id),
    enabled: !!organization?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('programs.title')}</h1>
          <p className="text-gray-600">Create an organization first to manage programs</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('programs.title')}</h1>
          <p className="text-gray-600">Manage your healthcare programs and offerings</p>
        </div>
        <Link href={`/${locale}/programs/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('programs.create')}
          </Button>
        </Link>
      </div>

      {!organization.is_approved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              Your organization is pending approval. You can create programs, but they won't be visible to the public until your organization is approved.
            </p>
          </CardContent>
        </Card>
      )}

      {programs && programs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Programs Yet</CardTitle>
            <CardDescription>
              Create your first program to start offering healthcare services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/programs/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('programs.create')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('programs.list')}</CardTitle>
            <CardDescription>
              {programs?.length || 0} programs in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Offerings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs?.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{program.name}</div>
                        {program.short_description && (
                          <div className="text-sm text-gray-500">
                            {program.short_description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {program.program_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {program.language.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ProgramStatusBadge
                        status={program.status}
                        isPublished={program.is_published}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {program.offering_count} offerings
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/${locale}/programs/${program.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${locale}/programs/${program.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {program.brochure_url && (
                          <a
                            href={program.brochure_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
