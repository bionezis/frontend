'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface ProgramStatusBadgeProps {
  status: 'draft' | 'approved' | 'published' | 'archived';
  isPublished?: boolean;
}

export function ProgramStatusBadge({ status, isPublished }: ProgramStatusBadgeProps) {
  const t = useTranslations();

  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          variant: 'secondary' as const,
          label: t('programs.draft'),
          className: 'bg-gray-100 text-gray-800',
        };
      case 'approved':
        return {
          variant: 'default' as const,
          label: isPublished ? t('programs.published') : t('programs.approved'),
          className: isPublished 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800',
        };
      case 'published':
        return {
          variant: 'default' as const,
          label: t('programs.published'),
          className: 'bg-green-100 text-green-800',
        };
      case 'archived':
        return {
          variant: 'outline' as const,
          label: t('programs.archived'),
          className: 'bg-red-50 text-red-800 border-red-200',
        };
      default:
        return {
          variant: 'secondary' as const,
          label: status,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
