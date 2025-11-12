'use client';

import { Organization } from '@/lib/api/organizations';
import { Building2 } from 'lucide-react';
import Image from 'next/image';

interface OrganizationLogoProps {
  organization: Organization;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function OrganizationLogo({ 
  organization, 
  size = 'md', 
  className = '' 
}: OrganizationLogoProps) {
  const sizeClass = sizeClasses[size];

  if (organization.logo_url) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <Image
          src={organization.logo_url}
          alt={`${organization.name} logo`}
          fill
          className="object-cover rounded-lg border"
          sizes="(max-width: 768px) 32px, (max-width: 1200px) 48px, 64px"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className} bg-gray-100 rounded-lg border flex items-center justify-center`}>
      <Building2 className="w-1/2 h-1/2 text-gray-400" />
    </div>
  );
}
