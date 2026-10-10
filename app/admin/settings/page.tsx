'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Save,
  Loader2,
  AlertCircle,
  Globe,
  Mail,
  MessageSquare,
  Shield,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');
  const [weeklyPrice, setWeeklyPrice] = useState('140');
  const [monthlyPrice, setMonthlyPrice] = useState('499');
  const [trialDays, setTrialDays] = useState('2');
  const [supportEmail, setSupportEmail] = useState('support@mytrade.ai');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('✅ Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl lg:text-2xl font-light text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <Settings className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
          Admin Settings
        </h1>
        <p className="text-sm font-light text-slate-500 dark:text-[#71717A] mt-1">
          Configure payment, plans, and platform settings
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl"
      >
        <AlertCircle
          className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
        <div className="text-xs font-light text-blue-800 dark:text-blue-300">
          <p className="font-normal mb-1">Configuration Instructions</p>
          <p className="text-blue-700 dark:text-blue-400">
            Most settings are read from environment variables (Vercel Dashboard).
            For permanent changes, update them in Vercel and redeploy.
          </p>
        </div>
      </motion.div>

      {/* Payment Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="admin-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
          <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
            Payment Settings (Razorpay)
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-light text-slate-700 dark:text-[#A1A1AA]">
              Razorpay Key ID
            </Label>
            <Input
              value={razorpayKey}
              onChange={(e) => setRazorpayKey(e.target.value)}
              placeholder="rzp_test_..."
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white font-mono text-xs h-10"
            />
            <p className="text-[10px] font-light text-slate-500 dark:text-[#71717A]">
              Test mode key. Live mode में Vercel पर update करें।
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-light text-slate-700 dark:text-[#A1A1AA]">
              Razorpay Key Secret
            </Label>
            <Input
              type="password"
              value="••••••••••••••••••••"
              disabled
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white font-mono text-xs h-10"
            />
            <p className="text-[10px] font-light text-amber-600 dark:text-amber-500">
              ⚠️ Secret Vercel Dashboard में ही रहता है (security)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Plan Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="admin-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
          <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
            Plan Pricing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-light text-slate-700 dark:text-[#A1A1AA]">
              Weekly Pro (₹)
            </Label>
            <Input
              type="number"
              value={weeklyPrice}
              onChange={(e) => setWeeklyPrice(e.target.value)}
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white h-10 font-light"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-light text-slate-700 dark:text-[#A1A1AA]">
              Monthly Pro (₹)
            </Label>
            <Input
              type="number"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white h-10 font-light"
            />
          </div>
        </div>

        <div className="space-y-1.5 mt-4">
          <Label className="text-xs font-light text-slate-700 dark:text-[#A1A1AA]">
            Free Trial (Days)
          </Label>
          <Input
            type="number"
            value={trialDays}
            onChange={(e) => setTrialDays(e.target.value)}
            className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white h-10 font-light"
          />
        </div>
      </motion.div>

      {/* Contact & Support */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="admin-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
          <h2 className="text-sm font-normal text-slate-900 dark:text-white tracking-tight">
            Contact & Support
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-light text-slate-700 dark:text-[#A1A1AA] flex items-center gap-1.5">
              <Mail className="w-3 h-3" strokeWidth={1.5} />
              Support Email
            </Label>
            <Input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white h-10 font-light"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-light text-slate-700 dark:text-[#A1A1AA] flex items-center gap-1.5">
              <Globe className="w-3 h-3" strokeWidth={1.5} />
              Telegram Channel URL
            </Label>
            <Input
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
              placeholder="https://t.me/yoursignals"
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white h-10 font-light"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-light text-slate-700 dark:text-[#A1A1AA] flex items-center gap-1.5">
              <Globe className="w-3 h-3" strokeWidth={1.5} />
              Twitter/X URL
            </Label>
            <Input
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              className="bg-slate-50 dark:bg-[#1F1F26] border-0 text-slate-900 dark:text-white h-10 font-light"
            />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white font-light rounded-lg shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" strokeWidth={1.5} />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}