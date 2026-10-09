export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              💱
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              TradeSage AI
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            AI-Powered Forex Trading Signals
          </p>
        </div>

        {children}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-8">
          © 2026 TradeSage AI • All rights reserved
        </p>
      </div>
    </div>
  );
}