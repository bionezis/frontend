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
import { User } from '@/lib/api/auth';
import { UpdateProfileData } from '@/lib/api/profile';

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
  onSubmit: (data: UpdateProfileData) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ user, onSubmit, isLoading = false }: ProfileFormProps) {
  const t = useTranslations();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
    },
  });

  const handleSubmit = async (data: ProfileFormValues) => {
    const cleanData = {
      ...data,
      phone: data.phone || undefined,
    };
    await onSubmit(cleanData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.firstName')}</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.lastName')}</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.phone')}</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="text-sm">
            <div className="font-medium text-gray-900">Email Address</div>
            <div className="text-gray-600">{user.email}</div>
            <div className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact support if you need to update your email address.
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
