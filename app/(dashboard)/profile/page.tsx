'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Crown,
  Star,
  Zap,
  Target,
  Settings,
  LogOut,
  Send,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Shield,
  Bell,
  Sparkles,
  CreditCard,
  FileText,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  plan: 'free' | 'free_trial' | 'weekly' | 'monthly' | 'special';
  planExpiry?: string;
  isSpecial: boolean;
  specialNote?: string;
  watchlist: string[];
  createdAt: string;
  lastActiveAt: string;
  totalSpent: number;
  telegramConnected: boolean;
  telegramUsername?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [signalCount, setSignalCount] = useState(0);

  useEffect(() => {
    fetchUser();
    fetchSignalCount();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSignalCount = async () => {
    try {
      const res = await fetch('/api/signals?limit=1');
      const data = await res.json();
      if (data.success) setSignalCount(data.total || 0);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleConnectTelegram = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/user/telegram');
      const data = await res.json();

      if (data.success && data.connectLink) {
        window.open(data.connectLink, '_blank');
        toast.success('Telegram bot khol diya! /start bhejo');
        setTimeout(fetchUser, 5000);
      } else {
        toast.error('Failed to get connect link');
      }
    } catch (error) {
      toast.error('Failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    if (!confirm('Disconnect Telegram?')) return;

    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/user/telegram', { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success('Telegram disconnected');
        fetchUser();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isPro = ['weekly', 'monthly'].includes(user.plan);
   const isSpecial = user.isSpecial || false;
  const isExpired = user.planExpiry && new Date(user.planExpiry) < new Date();

  const daysRemaining = user.planExpiry
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.planExpiry).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const getPlanBadge = () => {
    if (user.isSpecial) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-700 rounded-md border border-purple-100">
          <Star className="w-3 h-3" fill="currentColor" />
          Special
        </span>
      );
    }
    if (isPro && !isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-orange-50 text-orange-700 rounded-md border border-orange-100">
          <Crown className="w-3 h-3" />
          {user.plan === 'weekly' ? 'Weekly Pro' : 'Monthly Pro'}
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-700 rounded-md border border-red-100">
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-gray-50 text-gray-700 rounded-md border border-gray-200">
        Free
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ═══════════════════════════════════════════════════════════
          PROFILE HEADER CARD
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Avatar + Basic Info */}
            <div className="flex gap-5 flex-1">
              <Avatar className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 border-2 border-gray-100 dark:border-slate-800">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-2xl font-medium">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
                    {user.name}
                  </h1>
                  {getPlanBadge()}
                </div>

                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
                  {isSpecial ? 'Lifetime Member' : isPro ? 'Pro Trader' : 'Free Trader'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      Joined{' '}
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>India</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Forex Trader</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-row lg:flex-col gap-2 lg:w-40">
              <Button
                onClick={() => router.push('/settings')}
                className="flex-1 lg:flex-none h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1 lg:flex-none h-10 text-sm font-medium border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          STATS GRID (4 cards)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Signals',
            value: signalCount,
            icon: Zap,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Watchlist',
            value: user.watchlist.length,
            icon: Target,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: 'Days Left',
            value: user.isSpecial ? '∞' : daysRemaining,
            icon: Calendar,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: 'Total Spent',
            value: `₹${user.totalSpent}`,
            icon: CreditCard,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-slate-700 transition-all"
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', stat.bg)}>
                <Icon className={cn('w-4 h-4', stat.color)} strokeWidth={1.75} />
              </div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TWO COLUMN LAYOUT
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Telegram Integration */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <Send className="w-4 h-4 text-orange-500" strokeWidth={1.75} />
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                Telegram Integration
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
              Get instant signals on your phone
            </p>

            {user.telegramConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 dark:text-green-300">
                      Connected
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 truncate">
                      {user.telegramUsername
                        ? `@${user.telegramUsername}`
                        : 'You will receive signals on Telegram'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push('/notifications')}
                    variant="outline"
                    className="flex-1 h-10 text-sm border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                  >
                    <Bell className="w-4 h-4 mr-2" strokeWidth={1.75} />
                    View Signals
                  </Button>
                  <Button
                    onClick={handleDisconnectTelegram}
                    disabled={isDisconnecting}
                    variant="outline"
                    className="flex-1 h-10 text-sm border-gray-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    {isDisconnecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" strokeWidth={1.75} />
                    )}
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      Not Connected
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                      Connect to receive instant trading signals on your phone. Free.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleConnectTelegram}
                  disabled={isConnecting}
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening Telegram...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" strokeWidth={1.75} />
                      Connect Telegram
                      <ExternalLink className="w-3.5 h-3.5 ml-2" strokeWidth={1.75} />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-gray-500 dark:text-slate-500 text-center">
                  Telegram khulega. Wahan{' '}
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-orange-600 dark:text-orange-400 font-mono">
                    /start
                  </code>{' '}
                  bhejo.
                </p>
              </div>
            )}
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-orange-500" strokeWidth={1.75} />
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                Account Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Account ID</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                  {user.id.slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Plan</span>
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    user.isSpecial && 'text-purple-600 dark:text-purple-400',
                    isPro && !isExpired && 'text-green-600 dark:text-green-400',
                    isExpired && 'text-red-600 dark:text-red-400',
                    !isPro && !user.isSpecial && 'text-gray-900 dark:text-white'
                  )}
                >
                  {user.isSpecial
                    ? '⭐ Lifetime'
                    : isPro && !isExpired
                    ? `Active (${daysRemaining}d left)`
                    : isExpired
                    ? 'Expired'
                    : 'Free'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Member Since</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Last Active</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Recently
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN - 1/3 width */}
        <div className="space-y-6">
          {/* Upgrade CTA */}
          {!user.isSpecial && !isPro && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white"
            >
              <Crown className="w-8 h-8 mb-3" strokeWidth={1.75} />
              <h3 className="text-base font-medium mb-2">Upgrade to Pro</h3>
              <p className="text-xs opacity-90 mb-4 leading-relaxed">
                Unlock unlimited signals, priority AI, and advanced features.
              </p>
              <Button
                onClick={() => router.push('/pricing')}
                className="w-full h-10 bg-white text-orange-600 hover:bg-gray-100 text-sm font-medium rounded-lg"
              >
                View Plans
              </Button>
            </motion.div>
          )}

          {/* Skill Tags - like SkillGravity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-orange-500" strokeWidth={1.75} />
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                Watchlist
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.watchlist.map((pair) => (
                <span
                  key={pair}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-md border border-orange-100 dark:border-orange-900/30"
                >
                  {pair}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Attachments - like SkillGravity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-orange-500" strokeWidth={1.75} />
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                Quick Links
              </h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Signals History', href: '/history' },
                { label: 'AI Learning', href: '/learning' },
                { label: 'Pricing Plans', href: '/pricing' },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => router.push(link.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {link.label}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.75} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}