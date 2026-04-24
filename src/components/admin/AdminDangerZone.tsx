import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, AlertTriangle, Eye, EyeOff, Loader } from 'lucide-react';
import { format } from 'date-fns';

interface AdminInfo {
  id: string;
  email: string;
  created_at: string;
  full_name?: string;
}

export function AdminDangerZone() {
  const { toast } = useToast();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const [adminRes, profileRes] = await Promise.all([
        supabase
          .from('admins')
          .select('id, email, created_at')
          .eq('id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single()
      ]);

      if (adminRes.data) {
        setAdminInfo({
          ...adminRes.data,
          full_name: profileRes.data?.full_name || 'Not set',
        });
      }
    } catch (error) {
      console.error('Error fetching admin info:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    const errors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('password')) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Current password is incorrect',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        });
        setIsPasswordDialogOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-red-500/50 bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-foreground font-serif">Danger Zone</CardTitle>
          <CardDescription className="text-muted-foreground">Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-red-500/50 bg-card shadow-md">
      <CardHeader className="border-b border-red-500/30 pb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-500 font-serif">Danger Zone</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Sensitive admin account operations. Handle with care.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Admin Account Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Account Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 border border-border">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-sm text-foreground font-mono mt-1">{adminInfo?.email || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</p>
              <p className="text-sm text-foreground mt-1">{adminInfo?.full_name || 'Not set'}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admin Since</p>
              <p className="text-sm text-foreground mt-1">
                {adminInfo?.created_at ? format(new Date(adminInfo.created_at), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account ID</p>
              <p className="text-xs text-foreground font-mono mt-1 break-all">{adminInfo?.id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="border-t border-red-500/20 pt-6 space-y-3">
          <h3 className="font-semibold text-foreground">Password Management</h3>
          <p className="text-sm text-muted-foreground">Change your admin account password</p>

          <Button
            variant="destructive"
            onClick={() => setIsPasswordDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            Change Password
          </Button>
        </div>
      </CardContent>

      {/* Change Password Dialog */}
      <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Change Admin Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current password and set a new secure password
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-pwd" className="text-foreground">
                Current Password *
              </Label>
              <div className="relative">
                <Input
                  id="current-pwd"
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                    if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                  }}
                  className={passwordErrors.currentPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-500">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-pwd" className="text-foreground">
                New Password *
              </Label>
              <div className="relative">
                <Input
                  id="new-pwd"
                  type={showPasswords.new ? 'text' : 'password'}
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                    if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: '' });
                  }}
                  className={passwordErrors.newPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500">{passwordErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-pwd" className="text-foreground">
                Confirm New Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirm-pwd"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                    if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                  }}
                  className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isChangingPassword && <Loader className="h-4 w-4 mr-2 animate-spin inline" />}
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
