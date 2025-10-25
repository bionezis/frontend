'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Location, CreateLocationData, UpdateLocationData } from '@/lib/api/locations';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

const locationSchema = z.object({
  name: z.string().min(2, 'Location name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: CreateLocationData | UpdateLocationData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function LocationForm({
  location,
  onSubmit,
  isLoading = false,
  submitLabel,
}: LocationFormProps) {
  const t = useTranslations();

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      address: location?.address || '',
      city: location?.city || '',
      country: location?.country || '',
      postal_code: location?.postal_code || '',
      phone: location?.phone || '',
      email: location?.email || '',
    },
  });

  const handleSubmit = async (data: LocationFormValues) => {
    // Convert empty strings to undefined for optional fields
    const cleanData = {
      ...data,
      postal_code: data.postal_code || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
    };
    await onSubmit(cleanData);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('locations.name')}</FormLabel>
                <FormControl>
                  <Input placeholder="Main Office" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('locations.address')}</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('locations.city')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Warsaw" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('locations.country')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Poland" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('locations.postalCode')}</FormLabel>
                    <FormControl>
                      <Input placeholder="00-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('locations.phone')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+48 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('locations.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="location@organization.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {location && location.coordinates && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Geocoding Information</h3>
              <div className="rounded-lg border bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Location Geocoded</span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-green-800">
                  <div>Latitude: {location.coordinates.latitude.toFixed(6)}</div>
                  <div>Longitude: {location.coordinates.longitude.toFixed(6)}</div>
                  <div className="text-xs text-green-600 mt-2">
                    Coordinates are automatically generated when the location is saved.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t('common.loading')
                : submitLabel || t('common.save')}
            </Button>
          </div>
        </form>
      </Form>

      {!location && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-900">Automatic Geocoding</h3>
          <p className="mt-1 text-sm text-blue-800">
            When you save this location, the system will automatically generate coordinates
            (latitude and longitude) based on the address information provided.
          </p>
        </div>
      )}
    </div>
  );
}
