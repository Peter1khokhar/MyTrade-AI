'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCard } from '@/components/admin/user-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Loader2,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = ['all', 'free', 'free_trial', 'weekly', 'monthly', 'special'];
const STATUS = ['all', 'pro', 'free', 'trial', 'expired', 'special'];
const SORTS = [
  { value: 'recent', label: 'Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name' },
  { value: 'spent', label: 'Most Spent' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        plan: planFilter,
        status: statusFilter,
        sort,
        page: page.toString(),
        limit: '20',
      });

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, planFilter, statusFilter, sort, page]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl lg:text-2xl font-light text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <UsersIcon className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
          Users Management
        </h1>
        <p className="text-sm font-light text-slate-500 dark:text-[#71717A] mt-1">
          {pagination?.total || 0} total users
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="admin-card p-4 space-y-3"
      >
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-[#71717A]"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-10 bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#71717A] text-sm font-light"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Plan Filter */}
          <div>
            <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] mb-1.5 uppercase tracking-wider">
              Plan
            </p>
            <div className="flex flex-wrap gap-1">
              {PLANS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPlanFilter(p);
                    setPage(1);
                  }}
                  className={cn(
                    'px-2 py-1 rounded-md text-[11px] font-light transition-all',
                    planFilter === p
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-[#1F1F26] text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] mb-1.5 uppercase tracking-wider">
              Status
            </p>
            <div className="flex flex-wrap gap-1">
              {STATUS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={cn(
                    'px-2 py-1 rounded-md text-[11px] font-light transition-all',
                    statusFilter === s
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-[#1F1F26] text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A] mb-1.5 uppercase tracking-wider">
              Sort By
            </p>
            <div className="flex flex-wrap gap-1">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSort(s.value)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[11px] font-light transition-all',
                    sort === s.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-[#1F1F26] text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

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
              transition={{ delay: i * 0.03 }}
            >
              <UserCard user={user} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && users.length === 0 && (
        <div className="text-center py-16">
          <UsersIcon
            className="w-10 h-10 text-slate-300 dark:text-[#27272A] mx-auto mb-3"
            strokeWidth={1}
          />
          <p className="text-sm font-light text-slate-500 dark:text-[#A1A1AA]">
            No users found
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-light text-slate-500 dark:text-[#71717A]">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] h-8"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] h-8"
            >
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}