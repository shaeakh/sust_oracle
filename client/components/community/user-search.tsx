'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCallback, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UserSearchProps {
  onSearch: (query: string) => void;
}

export function UserSearch({ onSearch }: UserSearchProps) {
  const [value, setValue] = useState('');

  const debouncedSearch = useDebouncedCallback((query:string) => {
    onSearch(query);
  }, 300);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setValue(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search users..."
        value={value}
        onChange={handleSearch}
        className="pl-10"
      />
    </div>
  );
}