'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function UserSearch() {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search users..."
        className="pl-8"
      />
    </div>
  );
}