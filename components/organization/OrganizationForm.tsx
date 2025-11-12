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
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  onSubmit: (data: CreateOrganizationData | UpdateOrganizationData, logo?: File) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function OrganizationForm({
  organization,
  onSubmit,
  isLoading = false,
  submitLabel,
}: OrganizationFormProps) {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  // Set preview URL when organization changes
  useEffect(() => {
    if (organization?.logo_url) {
      setPreviewUrl(organization.logo_url);
    }
  }, [organization]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert('File size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(organization?.logo_url || null);
    // Reset file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

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
    await onSubmit(cleanData, selectedFile || undefined);
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

        {/* Logo Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Organization Logo</h3>
          
          <div className="flex items-center gap-4">
            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Organization logo preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <div className="flex-1">
              <label
                htmlFor="logo-upload"
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm text-gray-600">
                  {previewUrl ? 'Change logo' : 'Upload logo'}
                </span>
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 200x200px, max 2MB
              </p>
            </div>
          </div>
        </div>

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
