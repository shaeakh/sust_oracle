'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MapPin } from 'lucide-react';
import type { User } from '@/lib/types/user';
import { useRouter } from 'next/navigation';

interface UserListProps {
  searchQuery: string;
  users: User[];
  setUsers: (users: User[]) => void;
}

export function UserList({ searchQuery, users, setUsers }: UserListProps) {
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_IP_ADD}/user/all-users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [setUsers]);

  const filteredUsers = Array.isArray(users) ? users.filter((user) =>
    user?.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleUserClick = (userId: number) => {
    router.push(`/user/${userId}`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filteredUsers.map((user) => (
        <Card 
          key={user.uid} 
          className="p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => handleUserClick(user.uid)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{user.user_name}</h3>
                {user.isverified && (
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.user_email}</p>
              {user.bio && (
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              )}
              {user.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
            <Badge variant={user.isverified ? "default" : "secondary"}>
              {user.isverified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}