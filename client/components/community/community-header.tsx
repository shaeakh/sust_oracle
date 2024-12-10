'use client';

import { Users } from 'lucide-react';

export function CommunityHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Community</h1>
        </div>
      </div>
    </header>
  );
}