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
import { ChangePasswordData } from '@/lib/api/profile';

const passwordSchema = z
  .object({
    current_password: z.string().min(6, 'Current password is required'),
    new_password: z.string().min(6, 'New password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords must match',
    path: ['confirm_password'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordFormProps {
  onSubmit: (data: ChangePasswordData) => Promise<void>;
  isLoading?: boolean;
}

export function PasswordForm({ onSubmit, isLoading = false }: PasswordFormProps) {
  const t = useTranslations();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const handleSubmit = async (data: PasswordFormValues) => {
    const { confirm_password, ...submitData } = data;
    await onSubmit(submitData);
    form.reset(); // Clear form after successful submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="current_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.currentPassword')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.newPassword')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h4 className="font-medium text-yellow-900">Password Requirements</h4>
          <ul className="mt-2 text-sm text-yellow-800 space-y-1">
            <li>• At least 6 characters long</li>
            <li>• Use a strong, unique password</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('profile.changePassword')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
