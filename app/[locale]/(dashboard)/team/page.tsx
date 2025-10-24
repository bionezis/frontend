'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { useEffect } from 'react';
import { organizationsApi } from '@/lib/api/organizations';
import { InviteForm } from '@/components/team/InviteForm';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Users, Trash2, Mail, Crown, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export default function TeamPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'en';
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [removingMember, setRemovingMember] = useState<any>(null);

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];
  const isOwner = user?.role === 'owner';

  // Redirect if not owner
  useEffect(() => {
    if (user && !isOwner) {
      router.push(`/${locale}/dashboard`);
    }
  }, [user, isOwner, router, locale]);

  // Don't render if not owner
  if (user && !isOwner) {
    return null;
  }

  const { data: members, isLoading } = useQuery({
    queryKey: ['organization-members', organization?.id],
    queryFn: () => organizationsApi.getOrganizationMembers(organization!.id),
    enabled: !!organization?.id,
  });

      const inviteMutation = useMutation({
        mutationFn: (data: {
          email: string;
          first_name: string;
          last_name: string;
          role: 'owner' | 'member';
        }) => organizationsApi.inviteMember(organization!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organization?.id] });
      toast.success(t('team.inviteSuccess'));
      setShowInviteDialog(false);
    },
    onError: (error: any) => {
      console.error('Invite member error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to invite member';
      toast.error(message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: number) =>
      organizationsApi.removeMember(organization!.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organization?.id] });
      toast.success(t('team.removeSuccess'));
      setRemovingMember(null);
    },
    onError: (error: any) => {
      console.error('Remove member error:', error);
      const message =
        error.response?.data?.detail ||
        error.message ||
        'Failed to remove member';
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
          <h1 className="text-3xl font-bold tracking-tight">{t('team.title')}</h1>
          <p className="text-gray-600">Create an organization first to manage team members</p>
        </div>
      </div>
    );
  }

      const handleInvite = async (data: {
        email: string;
        first_name: string;
        last_name: string;
        role: 'owner' | 'member';
      }) => {
        await inviteMutation.mutateAsync(data);
      };

  const handleRemove = async () => {
    if (removingMember) {
      await removeMutation.mutateAsync(removingMember.id);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <User className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('team.title')}</h1>
          <p className="text-gray-600">Manage your organization's team members</p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('team.invite')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('team.invite')}</DialogTitle>
              <DialogDescription>
                Send an invitation to join your organization as a team member.
                They will be able to create and manage programs and locations.
              </DialogDescription>
            </DialogHeader>
            <InviteForm
              onSubmit={handleInvite}
              isLoading={inviteMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('team.members')}
          </CardTitle>
          <CardDescription>
            {members?.length || 0} members in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {member.user_name}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          {member.user_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getRoleBadgeVariant(member.role)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getRoleIcon(member.role)}
                        {t(`team.${member.role}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemovingMember(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-8 w-8 mb-2" />
              <p>No team members yet</p>
              <p className="text-sm">Invite colleagues to help manage your organization</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">Team Member Permissions</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• <strong>Owners</strong> can manage everything including team members and organization settings</li>
          <li>• <strong>Members</strong> can create and manage programs, offerings, and locations</li>
          <li>• <strong>Members cannot</strong> delete the organization, manage team, or edit organization details</li>
          <li>• All members can view organization information and approval status</li>
        </ul>
      </div>

      {/* Remove Member Dialog */}
      <Dialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {removingMember?.user.first_name} {removingMember?.user.last_name} from your organization? 
              They will lose access to all organization data and programs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemovingMember(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? t('common.loading') : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
