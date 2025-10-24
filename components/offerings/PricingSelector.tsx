'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PricingSelectorProps {
  pricingType: 'free' | 'paid' | 'sliding_scale' | 'insurance' | 'contact';
  price?: number;
  currency?: string;
  pricingDetails?: string;
  onPricingTypeChange: (type: 'free' | 'paid' | 'sliding_scale' | 'insurance' | 'contact') => void;
  onPriceChange: (price: number | undefined) => void;
  onCurrencyChange: (currency: string) => void;
  onPricingDetailsChange: (details: string) => void;
}

export function PricingSelector({
  pricingType,
  price,
  currency = 'USD',
  pricingDetails,
  onPricingTypeChange,
  onPriceChange,
  onCurrencyChange,
  onPricingDetailsChange,
}: PricingSelectorProps) {
  const t = useTranslations();

  const pricingTypes = [
    { value: 'free', label: t('offerings.free') },
    { value: 'paid', label: t('offerings.paid') },
    { value: 'sliding_scale', label: t('offerings.slidingScale') },
    { value: 'insurance', label: t('offerings.insurance') },
    { value: 'contact', label: t('offerings.contact') },
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'PLN', label: 'PLN (zł)' },
    { value: 'CAD', label: 'CAD ($)' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('offerings.pricingType')}</Label>
        <Select
          value={pricingType}
          onValueChange={(value) =>
            onPricingTypeChange(value as 'free' | 'paid' | 'sliding_scale' | 'insurance' | 'contact')
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select pricing type" />
          </SelectTrigger>
          <SelectContent>
            {pricingTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pricingType === 'paid' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>{t('offerings.price')}</Label>
            <Input
              type="number"
              placeholder="100"
              value={price || ''}
              onChange={(e) => {
                const value = e.target.value;
                onPriceChange(value ? parseFloat(value) : undefined);
              }}
            />
          </div>
          <div>
            <Label>{t('offerings.currency')}</Label>
            <Select value={currency} onValueChange={onCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {(pricingType === 'sliding_scale' ||
        pricingType === 'insurance' ||
        pricingType === 'contact' ||
        pricingType === 'free') && (
        <div>
          <Label>{t('offerings.pricingDetails')}</Label>
          <Textarea
            placeholder={
              pricingType === 'free'
                ? 'Additional information about free access (e.g., insurance requirements, eligibility criteria)...'
                : pricingType === 'sliding_scale'
                ? 'Describe the sliding scale pricing structure...'
                : pricingType === 'insurance'
                ? 'List accepted insurance providers or requirements...'
                : 'Provide contact information or instructions for pricing inquiries...'
            }
            value={pricingDetails || ''}
            onChange={(e) => onPricingDetailsChange(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        {pricingType === 'free' && (
          <p>This offering is provided at no cost. Use the details field to specify any requirements or conditions.</p>
        )}
        {pricingType === 'paid' && (
          <p>Set a fixed price for this offering. The price will be displayed to potential participants.</p>
        )}
        {pricingType === 'sliding_scale' && (
          <p>Pricing varies based on participant circumstances. Describe your sliding scale structure in the details.</p>
        )}
        {pricingType === 'insurance' && (
          <p>This offering is covered by insurance. List accepted providers or requirements in the details.</p>
        )}
        {pricingType === 'contact' && (
          <p>Participants must contact you for pricing information. Provide contact details or instructions.</p>
        )}
      </div>
    </div>
  );
}
