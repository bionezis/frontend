'use client';

import { useEffect, useState } from 'react';

export default function TestHydrationPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Hydration Test</h1>
      <div className="space-y-4">
        <div>
          <strong>Mounted:</strong> {mounted ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Font Test:</strong> <span className="font-sans">This should use Inter font</span>
        </div>
        <div>
          <strong>CSS Variable Test:</strong> <span style={{ fontFamily: 'var(--font-inter)' }}>This should use CSS variable</span>
        </div>
        <div className="text-sm text-gray-600">
          If you see any hydration warnings in the console, the issue is not fully resolved.
        </div>
      </div>
    </div>
  );
}
