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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PricingSelector } from './PricingSelector';
import { useTranslations } from 'next-intl';
import { ProgramOffering, CreateOfferingData, UpdateOfferingData } from '@/lib/api/programs';
import { Location } from '@/lib/api/locations';

const offeringSchema = z.object({
  location_id: z.number().min(1, 'Please select a location'),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  pricing_type: z.enum(['free', 'paid', 'sliding_scale', 'insurance', 'contact']),
  price: z.number().optional(),
  currency: z.string().optional(),
  pricing_details: z.string().optional(),
  schedule_info: z.string().optional(),
  capacity: z.number().optional(),
  notes: z.string().optional(),
});

type OfferingFormValues = z.infer<typeof offeringSchema>;

interface OfferingFormProps {
  offering?: ProgramOffering;
  locations: Location[];
  onSubmit: (data: CreateOfferingData | UpdateOfferingData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function OfferingForm({
  offering,
  locations,
  onSubmit,
  isLoading = false,
  submitLabel,
}: OfferingFormProps) {
  const t = useTranslations();

  const form = useForm<OfferingFormValues>({
    resolver: zodResolver(offeringSchema),
    defaultValues: {
      location_id: offering?.location_id || 0,
      contact_name: offering?.contact_name || '',
      contact_phone: offering?.contact_phone || '',
      contact_email: offering?.contact_email || '',
      pricing_type: offering?.pricing_type || 'free',
      price: offering?.price || undefined,
      currency: offering?.currency || 'USD',
      pricing_details: offering?.pricing_details || '',
      schedule_info: offering?.schedule_info || '',
      capacity: offering?.capacity || undefined,
      notes: offering?.notes || '',
    },
  });

  const watchedPricingType = form.watch('pricing_type');

  const handleSubmit = async (data: OfferingFormValues) => {
    // Convert empty strings to undefined for optional fields
    const cleanData = {
      ...data,
      contact_name: data.contact_name || undefined,
      contact_phone: data.contact_phone || undefined,
      contact_email: data.contact_email || undefined,
      price: data.pricing_type === 'paid' ? data.price : undefined,
      currency: data.pricing_type === 'paid' ? data.currency : undefined,
      pricing_details: data.pricing_details || undefined,
      schedule_info: data.schedule_info || undefined,
      capacity: data.capacity || undefined,
      notes: data.notes || undefined,
    };
    await onSubmit(cleanData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">{t('offerings.location')}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger className="h-16 w-full text-base">
                    <SelectValue placeholder="Select a location">
                      {field.value && locations.find(loc => loc.id === field.value) && (
                        <div className="flex flex-col text-left">
                          <span className="font-medium">
                            {locations.find(loc => loc.id === field.value)?.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {locations.find(loc => loc.id === field.value)?.city}, {locations.find(loc => loc.id === field.value)?.country}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()} className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{location.name}</span>
                        <span className="text-sm text-gray-500">{location.city}, {location.country}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <p className="text-sm text-gray-600">
            Provide specific contact details for this offering (optional)
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('offerings.contactName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('offerings.contactPhone')}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('offerings.contactEmail')}</FormLabel>
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing</h3>
          <PricingSelector
            pricingType={form.watch('pricing_type')}
            price={form.watch('price')}
            currency={form.watch('currency')}
            pricingDetails={form.watch('pricing_details')}
            onPricingTypeChange={(type) => form.setValue('pricing_type', type)}
            onPriceChange={(price) => form.setValue('price', price)}
            onCurrencyChange={(currency) => form.setValue('currency', currency)}
            onPricingDetailsChange={(details) => form.setValue('pricing_details', details)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>

          <FormField
            control={form.control}
            name="schedule_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('offerings.scheduleInfo')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Mondays and Wednesdays, 2:00 PM - 3:30 PM. Starting January 15th..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('offerings.capacity')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="12"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseInt(value) : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('offerings.notes')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes, requirements, or special instructions..."
                    className="min-h-[80px]"
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
