'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { organizationsApi } from '@/lib/api/organizations';
import { programsApi, CreateOfferingData, UpdateOfferingData } from '@/lib/api/programs';
import { locationsApi } from '@/lib/api/locations';
import { OfferingForm } from '@/components/offerings/OfferingForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useState } from 'react';

export default function ProgramOfferingsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { locale, id } = resolvedParams;
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOffering, setEditingOffering] = useState<any>(null);
  const [deletingOffering, setDeletingOffering] = useState<any>(null);

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];

  const { data: program } = useQuery({
    queryKey: ['program', organization?.id, id],
    queryFn: () => programsApi.getProgram(organization!.id, parseInt(id)),
    enabled: !!organization?.id && !!id,
  });

  const { data: offerings, isLoading: offeringsLoading } = useQuery({
    queryKey: ['program-offerings', organization?.id, id],
    queryFn: () => programsApi.getProgramOfferings(organization!.id, parseInt(id)),
    enabled: !!organization?.id && !!id,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations', organization?.id],
    queryFn: () => locationsApi.getLocations(organization!.id),
    enabled: !!organization?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOfferingData) =>
      programsApi.createOffering(organization!.id, parseInt(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-offerings', organization?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['program', organization?.id, id] });
      toast.success(t('offerings.createSuccess'));
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      console.error('Create offering error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to create offering';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ offeringId, data }: { offeringId: number; data: UpdateOfferingData }) =>
      programsApi.updateOffering(organization!.id, parseInt(id), offeringId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-offerings', organization?.id, id] });
      toast.success(t('offerings.updateSuccess'));
      setEditingOffering(null);
    },
    onError: (error: any) => {
      console.error('Update offering error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to update offering';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (offeringId: number) =>
      programsApi.deleteOffering(organization!.id, parseInt(id), offeringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-offerings', organization?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['program', organization?.id, id] });
      toast.success(t('offerings.deleteSuccess'));
      setDeletingOffering(null);
    },
    onError: (error: any) => {
      console.error('Delete offering error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to delete offering';
      toast.error(message);
    },
  });

  if (!program || !organization) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program not found</h1>
        </div>
      </div>
    );
  }

  const handleCreateSubmit = async (data: CreateOfferingData) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdateSubmit = async (data: UpdateOfferingData) => {
    if (editingOffering) {
      await updateMutation.mutateAsync({ offeringId: editingOffering.id, data });
    }
  };

  const handleDelete = async () => {
    if (deletingOffering) {
      await deleteMutation.mutateAsync(deletingOffering.id);
    }
  };

  const formatPrice = (offering: any) => {
    switch (offering.pricing_type) {
      case 'free':
        return 'Free';
      case 'paid':
        return `${offering.price} ${offering.currency || 'USD'}`;
      case 'sliding_scale':
        return 'Sliding Scale';
      case 'insurance':
        return 'Insurance Covered';
      case 'contact':
        return 'Contact for Pricing';
      default:
        return offering.pricing_type;
    }
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{t('offerings.title')}</h1>
          <p className="text-gray-600">Manage offerings for {program.name}</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('offerings.create')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('offerings.create')}</DialogTitle>
              <DialogDescription>
                Add a new offering for this program at a specific location.
              </DialogDescription>
            </DialogHeader>
            {locations && (
              <OfferingForm
                locations={locations}
                onSubmit={handleCreateSubmit}
                isLoading={createMutation.isPending}
                submitLabel={t('offerings.create')}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {!locations || locations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Locations Available</CardTitle>
            <CardDescription>
              You need to create locations before adding program offerings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/locations/create`}>
              <Button>
                <MapPin className="mr-2 h-4 w-4" />
                Create Location
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : offerings && offerings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Offerings Yet</CardTitle>
            <CardDescription>
              Create your first offering to make this program available at a location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('offerings.create')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Program Offerings</CardTitle>
            <CardDescription>
              {offerings?.length || 0} offerings for this program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offerings?.map((offering) => (
                  <TableRow key={offering.id}>
                    <TableCell>
                      <div className="font-medium">{offering.location.name}</div>
                      <div className="text-sm text-gray-500">{offering.location.city}, {offering.location.country}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatPrice(offering)}</Badge>
                    </TableCell>
                    <TableCell>
                      {offering.contact_name && (
                        <div className="text-sm">
                          <div>{offering.contact_name}</div>
                          {offering.contact_email && (
                            <div className="text-gray-500">{offering.contact_email}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {offering.capacity ? `${offering.capacity} people` : 'No limit'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingOffering(offering)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingOffering(offering)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingOffering} onOpenChange={() => setEditingOffering(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('offerings.edit')}</DialogTitle>
            <DialogDescription>
              Update the offering details.
            </DialogDescription>
          </DialogHeader>
          {editingOffering && locations && (
            <OfferingForm
              offering={editingOffering}
              locations={locations}
              onSubmit={handleUpdateSubmit}
              isLoading={updateMutation.isPending}
              submitLabel={t('common.save')}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingOffering} onOpenChange={() => setDeletingOffering(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Offering</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this offering? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingOffering(null)}
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
