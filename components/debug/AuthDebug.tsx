'use client';

import { useAuth } from '@/lib/auth/context';
import { useEffect, useState } from 'react';

export function AuthDebug() {
  const { user, loading, refreshUser } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      setLocalStorageData({
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
      });
    }
  }, []);

  const handleRefresh = async () => {
    try {
      await refreshUser();
      // Also refresh localStorage data
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      setLocalStorageData({
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
      });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <button 
          onClick={handleRefresh}
          className="bg-white text-black px-2 py-1 rounded text-xs hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-1">
        <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
        <div><strong>User:</strong> {user ? `${user.first_name} ${user.last_name}` : 'null'}</div>
        <div><strong>User Email:</strong> {user?.email || 'null'}</div>
        <div><strong>User Role:</strong> {user?.role || 'null'}</div>
        <div><strong>Access Token:</strong> {localStorageData?.accessToken || 'null'}</div>
        <div><strong>Refresh Token:</strong> {localStorageData?.refreshToken || 'null'}</div>
      </div>
    </div>
  );
}
