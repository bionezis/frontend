'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApprovalBannerProps {
  isApproved: boolean;
}

export function ApprovalBanner({ isApproved }: ApprovalBannerProps) {
  const t = useTranslations();

  if (isApproved) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your organization has been approved and is now active.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>{t('organization.pending')}</strong> - {t('organization.pendingMessage')}
      </AlertDescription>
    </Alert>
  );
}
