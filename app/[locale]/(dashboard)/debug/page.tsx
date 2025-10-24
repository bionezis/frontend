'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/context';
import { organizationsApi } from '@/lib/api/organizations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function DebugPage() {
  const { user } = useAuth();

  const { data: organizations, isLoading, error, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getMyOrganizations,
  });

  const organization = organizations?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Debug Information</h1>
        <p className="text-gray-600">Debug information for troubleshooting</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {user?.id}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Name:</strong> {user?.first_name} {user?.last_name}</div>
              <div><strong>Role:</strong> {user?.role}</div>
              <div><strong>Organization ID:</strong> {user?.organization_id}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              API Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Loading:</strong> 
                <Badge variant={isLoading ? 'default' : 'secondary'} className="ml-2">
                  {isLoading ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <strong>Error:</strong> 
                <Badge variant={error ? 'destructive' : 'secondary'} className="ml-2">
                  {error ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div><strong>Organizations Count:</strong> {organizations?.length || 0}</div>
            </div>
            <Button 
              onClick={() => refetch()} 
              className="mt-4"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">API Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-800 text-sm">
              <div><strong>Message:</strong> {error.message}</div>
              <div><strong>Status:</strong> {(error as any).response?.status}</div>
              <div><strong>Data:</strong> {JSON.stringify((error as any).response?.data, null, 2)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {organizations && (
        <Card>
          <CardHeader>
            <CardTitle>Organizations Data</CardTitle>
            <CardDescription>
              Raw data from the API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(organizations, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {organization && (
        <Card>
          <CardHeader>
            <CardTitle>Current Organization</CardTitle>
            <CardDescription>
              The organization that should be displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {organization.id}</div>
              <div><strong>Name:</strong> {organization.name}</div>
              <div><strong>Approved:</strong> {organization.is_approved ? 'Yes' : 'No'}</div>
              <div><strong>Created:</strong> {new Date(organization.created_at).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
