'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { organizationsApi } from '@/lib/api/organizations';
import { locationsApi } from '@/lib/api/locations';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, MapPin, Edit, Trash2, Phone, Mail, Building2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export default function LocationsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const queryClient = useQueryClient();
  const [deletingLocation, setDeletingLocation] = useState<any>(null);

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];

  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations', organization?.id],
    queryFn: () => locationsApi.getLocations(organization!.id),
    enabled: !!organization?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (locationId: number) =>
      locationsApi.deleteLocation(organization!.id, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', organization?.id] });
      toast.success(t('locations.deleteSuccess'));
      setDeletingLocation(null);
    },
    onError: (error: any) => {
      console.error('Delete location error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to delete location';
      toast.error(message);
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

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('locations.title')}</h1>
          <p className="text-gray-600">Create an organization first to manage locations</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Link href={`/${locale}/organization/create`}>
              <Button>
                <Building2 className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async () => {
    if (deletingLocation) {
      await deleteMutation.mutateAsync(deletingLocation.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('locations.title')}</h1>
          <p className="text-gray-600">Manage your organization's locations</p>
        </div>
        <Link href={`/${locale}/locations/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('locations.create')}
          </Button>
        </Link>
      </div>

      {!organization.is_approved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              Your organization is pending approval. You can create locations, but they won't be visible to the public until your organization is approved.
            </p>
          </CardContent>
        </Card>
      )}

      {locations && locations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Locations Yet</CardTitle>
            <CardDescription>
              Create your first location to start offering programs at specific addresses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/locations/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('locations.create')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('locations.title')}</CardTitle>
            <CardDescription>
              {locations?.length || 0} locations in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations?.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="font-medium">{location.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{location.address}</div>
                        <div className="text-gray-500">
                          {location.city}, {location.country}
                          {location.postal_code && ` ${location.postal_code}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {location.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span>{location.phone}</span>
                          </div>
                        )}
                        {location.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span>{location.email}</span>
                          </div>
                        )}
                        {!location.phone && !location.email && (
                          <span className="text-gray-400 text-sm">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {location.latitude && location.longitude ? (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="mr-1 h-3 w-3" />
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">Not geocoded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/${locale}/locations/${location.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingLocation(location)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deletingLocation} onOpenChange={() => setDeletingLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingLocation?.name}"? This action cannot be undone.
              Any program offerings at this location will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingLocation(null)}
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
    </div>
  );
}
