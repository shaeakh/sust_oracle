'use client';

import { CommunityHeader } from '@/components/community/community-header';
import { UserList } from '@/components/community/user-list';
import { UserSearch } from '@/components/community/user-search';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { User } from '@/lib/types/user';
import { Users, Sparkles, Search } from 'lucide-react';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <CommunityHeader />
        
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4"
            >
              <div className="inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 opacity-75 blur-lg"></div>
                  <div className="relative bg-white rounded-full p-4">
                    <Users className="w-8 h-8 text-violet-600" />
                  </div>
                </motion.div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                Community Members
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Connect with other members of our community and explore their profiles
              </p>
            </motion.div>

            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-pink-100 rounded-xl blur"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="w-5 h-5 text-violet-500" />
                  <h2 className="text-lg font-semibold text-gray-700">Search Members</h2>
                </div>
                <UserSearch onSearch={(query) => setSearchQuery(query)} />
              </div>
            </motion.div>

            {/* User List Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 backdrop-blur-md rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-semibold text-gray-700">Community Members</h2>
              </div>
              <UserList searchQuery={searchQuery} users={users} setUsers={setUsers} />
            </motion.div>
          </div>
        </motion.main>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}