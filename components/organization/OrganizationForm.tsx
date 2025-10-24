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
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { Organization, CreateOrganizationData, UpdateOrganizationData } from '@/lib/api/organizations';

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: CreateOrganizationData | UpdateOrganizationData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function OrganizationForm({
  organization,
  onSubmit,
  isLoading = false,
  submitLabel,
}: OrganizationFormProps) {
  const t = useTranslations();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || '',
      description: organization?.description || '',
      address: organization?.address || '',
      city: organization?.city || '',
      country: organization?.country || '',
      postal_code: organization?.postal_code || '',
      phone: organization?.phone || '',
      email: organization?.email || '',
      website: organization?.website || '',
    },
  });

  const handleSubmit = async (data: OrganizationFormValues) => {
    // Convert empty strings to undefined for optional fields
    const cleanData = {
      ...data,
      description: data.description || undefined,
      postal_code: data.postal_code || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      website: data.website || undefined,
    };
    await onSubmit(cleanData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('organization.name')}</FormLabel>
                <FormControl>
                  <Input placeholder="Healthcare Center" {...field} />
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
                <FormLabel>{t('organization.email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contact@organization.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('organization.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of your organization..."
                  className="min-h-[100px]"
                  {...field}
                />
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
                <FormLabel>{t('organization.address')}</FormLabel>
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
                  <FormLabel>{t('organization.city')}</FormLabel>
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
                  <FormLabel>{t('organization.country')}</FormLabel>
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
                  <FormLabel>{t('organization.postalCode')}</FormLabel>
                  <FormControl>
                    <Input placeholder="00-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('organization.phone')}</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+48 123 456 789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('organization.website')}</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://organization.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t('common.loading')
              : submitLabel || t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
