'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCard } from '@/components/admin/user-card';
import { Loader2, Star, Sparkles } from 'lucide-react';

export default function SpecialUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/special-users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.specialUsers);
          setStats(data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl lg:text-2xl font-light text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <Star className="w-5 h-5 text-amber-500" strokeWidth={1.5} fill="currentColor" />
          Special Users
        </h1>
        <p className="text-sm font-light text-slate-500 dark:text-[#71717A] mt-1">
          Users with lifetime free access (Friends, Partners, Beta Testers)
        </p>
      </motion.div>

      {/* Stats */}
      {stats && stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div className="admin-card p-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] uppercase tracking-wider">
                  Total Special
                </p>
                <p className="text-lg font-light text-slate-900 dark:text-white tracking-tight">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          {Object.entries(stats.byNote || {})
            .slice(0, 3)
            .map(([note, count]: any) => (
              <div key={note} className="admin-card p-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#1F1F26] flex items-center justify-center">
                    <Sparkles
                      className="w-3.5 h-3.5 text-slate-500 dark:text-[#A1A1AA]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] uppercase tracking-wider truncate">
                      {note}
                    </p>
                    <p className="text-lg font-light text-slate-900 dark:text-white tracking-tight">
                      {count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" strokeWidth={1.5} />
        </div>
      )}

      {/* Users Grid */}
      {!isLoading && users.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {users.map((user, i) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <UserCard user={user} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && users.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-7 h-7 text-amber-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-normal text-slate-900 dark:text-white mb-1">
            No special users yet
          </h3>
          <p className="text-sm font-light text-slate-500 dark:text-[#71717A] max-w-md mx-auto">
            Go to Users page and mark any user as "Special" to see them here.
          </p>
        </motion.div>
      )}
    </div>
  );
}