'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { OTPInput } from '@/components/auth/otp-input';
import { useCountdown } from '@/hooks/use-countdown';
import {
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Clock,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const timer = useCountdown(600);

  useEffect(() => {
    timer.start(600);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Auto-verify when OTP complete
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !isVerifying && step === 'otp') {
      handleVerifyCode(code);
    }
  }, [otp]);

  const handleVerifyCode = async (code: string) => {
    if (!email) {
      setError('Email missing');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        toast.error(data.message);
        setOtp(Array(6).fill(''));
        return;
      }

      toast.success('Code verified!');
      setSuccess('✅ Code verified! अब नया password set करो');
      setTimeout(() => {
        setStep('password');
        setSuccess('');
      }, 800);
    } catch (err) {
      setError('Verification failed');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.waitTime) setResendCooldown(data.waitTime);
        toast.error(data.message);
        return;
      }

      toast.success('New code sent!');
      setOtp(Array(6).fill(''));
      timer.start(600);
      setResendCooldown(60);
    } catch (err) {
      toast.error('Failed to resend');
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      setError('Password must be at least 6 characters');
      return;
    }

    setIsResetting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        toast.error(data.message);
        return;
      }

      toast.success('🎉 Password reset successfully!');
      setSuccess('🎉 Password reset! Redirecting to login...');

      setTimeout(() => {
        router.push('/login?reset=true');
      }, 1500);
    } catch (err) {
      setError('Password reset failed');
      toast.error('Password reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  if (!email) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Email Missing
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Please start the reset process again.
          </p>
          <Link href="/forgot-password">
            <Button>Start Over</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
        <CardHeader className="space-y-1 pb-4">
          <motion.div
            key={step}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className={cn(
              'flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4 shadow-lg',
              step === 'otp'
                ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/20'
                : 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/20'
            )}
          >
            {step === 'otp' ? (
              <KeyRound className="w-7 h-7 text-white" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-white" />
            )}
          </motion.div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            {step === 'otp' ? 'Enter Reset Code' : 'Set New Password'}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            {step === 'otp' ? (
              <>
                We sent a 6-digit code to
                <br />
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {email}
                </span>
              </>
            ) : (
              'Enter your new password below'
            )}
          </CardDescription>
        </CardHeader>

        <AnimatePresence mode="wait">
          {step === 'otp' ? (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg text-green-700 dark:text-green-400 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={isVerifying}
                  />

                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Clock
                      className={cn(
                        'w-4 h-4',
                        timer.isExpired
                          ? 'text-red-500'
                          : 'text-slate-500 dark:text-slate-400'
                      )}
                    />
                    {timer.isExpired ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        Code expired
                      </span>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400">
                        Expires in{' '}
                        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {timer.formatted}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {isVerifying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </motion.div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <div className="w-full flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Didn't receive?
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Resend Code
                      </>
                    )}
                  </Button>
                </div>

                <Link href="/forgot-password" className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change Email
                  </Button>
                </Link>
              </CardFooter>
            </motion.div>
          ) : (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg text-green-700 dark:text-green-400 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{success}</span>
                    </motion.div>
                  )}

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError('');
                        }}
                        required
                        minLength={6}
                        disabled={isResetting}
                        className="h-11 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Password फिर से डालो"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        required
                        minLength={6}
                        disabled={isResetting}
                        className="h-11 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/20"
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Reset Password
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}