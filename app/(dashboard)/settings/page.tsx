'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Lock,
  Mail,
  Calendar,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  createdAt: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form
  const [name, setName] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setName(data.user.name);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess('✅ Profile update हो गई');
      fetchUser();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Update नहीं हुआ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New password और confirm password match नहीं करते');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password कम से कम 6 characters का होना चाहिए');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess('✅ Password update हो गया');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Update नहीं हुआ');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-slate-100 text-slate-700',
      pro: 'bg-blue-100 text-blue-700',
      premium: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800',
    };
    return colors[plan as keyof typeof colors] || colors.free;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-blue-600" />
          Settings
        </h1>
        <p className="text-slate-600 mt-1">
          अपनी profile और preferences manage करो
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Account Info */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserIcon className="w-5 h-5" />
            Account Info
          </CardTitle>
          <CardDescription>
            आपकी account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="text-slate-700 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              Email
            </Label>
            <Input
              value={user?.email || ''}
              disabled
              className="h-11 bg-slate-50"
            />
            <p className="text-xs text-slate-500">
              Email change नहीं हो सकती
            </p>
          </div>

          {/* Plan */}
          <div className="space-y-2">
            <Label className="text-slate-700 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              Plan
            </Label>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'px-4 py-2 rounded-lg font-bold text-sm uppercase',
                  getPlanBadge(user?.plan || 'free')
                )}
              >
                {user?.plan || 'free'}
              </span>
              <Button variant="outline" size="sm">
                Upgrade to Pro →
              </Button>
            </div>
          </div>

          {/* Member Since */}
          {user?.createdAt && (
            <div className="space-y-2">
              <Label className="text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Member Since
              </Label>
              <p className="text-sm text-slate-600">
                {formatDate(user.createdAt)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Name */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">✏️ Update Profile</CardTitle>
          <CardDescription>
            अपना नाम बदलो
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="अपना नाम डालो"
              className="h-11"
            />
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={isSaving || name === user?.name}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            अपना password update करो
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-slate-700">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="पुराना password"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-slate-700">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="नया password (min 6 characters)"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="नया password फिर से"
              className="h-11"
            />
          </div>

          <Button
            onClick={handleUpdatePassword}
            disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold mb-1">🔒 Security Tips</p>
              <ul className="space-y-1 text-xs text-slate-600">
                <li>• Strong password use करो (8+ characters, numbers, symbols)</li>
                <li>• Password किसी के साथ share नहीं करो</li>
                <li>• Regularly password change करो</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}