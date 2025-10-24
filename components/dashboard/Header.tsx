'use client';

import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop title */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User info */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
