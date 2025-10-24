'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  FileText,
  MapPin,
  Users,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  {
    href: '/dashboard',
    label: 'nav.dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/organization',
    label: 'nav.organization',
    icon: Building2,
    ownerOnly: true,
  },
  {
    href: '/programs',
    label: 'nav.programs',
    icon: FileText,
  },
  {
    href: '/locations',
    label: 'nav.locations',
    icon: MapPin,
  },
  {
    href: '/team',
    label: 'nav.team',
    icon: Users,
    ownerOnly: true,
  },
  {
    href: '/profile',
    label: 'nav.profile',
    icon: User,
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const locale = pathname.split('/')[1] || 'en';

  const handleLogout = async () => {
    await logout();
    window.location.href = `/${locale}/login`;
  };

  // Check if user is owner (for permission-based rendering)
  const isOwner = user?.role === 'owner';

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex items-center justify-between p-6">
        <div>
          <h2 className="text-xl font-bold">Bionezis</h2>
          <p className="text-sm text-gray-600">Manager Portal</p>
        </div>
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          // Hide owner-only items for non-owners
          if (item.ownerOnly && !isOwner) {
            return null;
          }

          const href = `/${locale}${item.href}`;
          const isActive = pathname.startsWith(href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={href} onClick={onClose}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.label)}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4">
        {user && (
          <div className="mb-4 space-y-1">
            <p className="text-sm font-medium">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  );
}

