'use client';

import { CommunityHeader } from '@/components/community/community-header';
import { UserList } from '@/components/community/user-list';
import { UserSearch } from '@/components/community/user-search';
import { useState } from 'react';
import type { User } from '@/lib/types/user';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <UserSearch onSearch={(query) => setSearchQuery(query)} />
          <UserList searchQuery={searchQuery} users={users} setUsers={setUsers} />
        </div>
      </main>
    </div>
  );
}