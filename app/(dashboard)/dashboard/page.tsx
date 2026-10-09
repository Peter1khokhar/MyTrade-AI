import { auth } from '@/lib/auth/auth';
import { MarketTicker } from '@/components/dashboard/market-ticker';
import { AnimatedDashboard } from '@/components/dashboard/animated-dashboard';

export default async function DashboardPage() {
  const session = await auth();

  // 🎯 Icons को strings की तरह pass करो
  const stats = [
    { title: 'Active Signals', value: '0', icon: 'zap', color: 'blue' },
    { title: 'Win Rate', value: '--', icon: 'target', color: 'green' },
    { title: 'Total Trades', value: '0', icon: 'trending-up', color: 'purple' },
    { title: 'Watchlist', value: '3', icon: 'bar-chart', color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
          🎉 Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          What to trade today?
        </p>
      </div>

      <MarketTicker />

      <AnimatedDashboard stats={stats} />
    </div>
  );
}