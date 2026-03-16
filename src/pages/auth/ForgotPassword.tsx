import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, Lock, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export default function ForgotPassword() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    // ─── STEP 1: Validate email & send OTP ───
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if the email exists using a secure RPC function (bypasses RLS)
            // Bypass strict typing because check_email_exists is not in generated types yet
            const { data: emailExists, error: checkError } = await (supabase.rpc as any)(
                'check_email_exists', { target_email: email.trim().toLowerCase() }
            );

            if (checkError) {
                toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong. Please try again.' });
                setLoading(false);
                return;
            }

            if (!emailExists) {
                toast({ variant: 'destructive', title: 'Email not found', description: 'No account exists with this email address.' });
                setLoading(false);
                return;
            }

            // Email exists — send the recovery OTP
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());

            if (resetError) {
                toast({ variant: 'destructive', title: 'Error', description: resetError.message });
                setLoading(false);
                return;
            }

            toast({ title: 'Code sent!', description: 'An 8-digit verification code has been sent to your email.' });
            setResendTimer(60);
            setStep('otp');
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    // ─── STEP 2: Verify OTP ───
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = otp.join('');

        if (token.length !== 8) {
            toast({ variant: 'destructive', title: 'Invalid code', description: 'Please enter the full 8-digit code.' });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email: email.trim().toLowerCase(),
                token,
                type: 'recovery',
            });

            if (error) {
                toast({ variant: 'destructive', title: 'Invalid code', description: 'The code you entered is incorrect or has expired. Please try again.' });
                setOtp(['', '', '', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
                setLoading(false);
                return;
            }

            toast({ title: 'Verified!', description: 'Code verified successfully. Please set your new password.' });
            setStep('newPassword');
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    // ─── STEP 3: Update password ───
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Weak password', description: 'Password must be at least 6 characters long.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Mismatch', description: 'Passwords do not match.' });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
                setLoading(false);
                return;
            }

            // Sign out so that the user logs in with new password
            await supabase.auth.signOut();
            setStep('success');
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    // ─── OTP input helpers ───
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // digits only
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);

        if (value && index < 7) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
        if (pasted.length === 8) {
            setOtp(pasted.split(''));
            otpRefs.current[7]?.focus();
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } else {
            toast({ title: 'Code resent!', description: 'A new 8-digit code has been sent to your email.' });
            setResendTimer(60);
            setOtp(['', '', '', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        }
        setLoading(false);
    };

    // ─── Animation variants ───
    const slideVariants = {
        enter: { opacity: 0, x: 40 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
    };

    return (
        <div className="qresolve-auth grid min-h-screen lg:grid-cols-2 bg-background text-foreground">
            {/* Left panel - Form */}
            <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Logo */}
                    <a href="https://qresolve.com" className="flex items-center gap-2 mb-8 no-underline">
                        <div className="flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-8 w-8 text-primary">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="16" y="16" width="3" height="3" rx="0.5" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-foreground tracking-tight">QResolve</span>
                    </a>

                    <AnimatePresence mode="wait">
                        {/* ──────────── STEP: EMAIL ──────────── */}
                        {step === 'email' && (
                            <motion.div
                                key="email"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold tracking-tight">Forgot your password?</h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Enter your email address and we'll send you an 8-digit verification code to reset your password.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-5">
                                    <div>
                                        <Label htmlFor="reset-email">Email address</Label>
                                        <div className="relative mt-2">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="reset-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                required
                                                className="pl-10"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1">
                                        <ArrowLeft className="h-3 w-3" />
                                        Back to sign in
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {/* ──────────── STEP: OTP ──────────── */}
                        {step === 'otp' && (
                            <motion.div
                                key="otp"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-6">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                        <ShieldCheck className="h-7 w-7 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-semibold tracking-tight">Verify your email</h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        We've sent an 8-digit code to{' '}
                                        <span className="font-medium text-foreground">{email}</span>.
                                        Enter it below.
                                    </p>
                                </div>

                                <form onSubmit={handleOtpSubmit} className="space-y-6">
                                    {/* OTP Boxes */}
                                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { otpRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                className="h-14 w-11 rounded-lg border-2 border-input bg-background text-center text-lg font-semibold shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                autoFocus={i === 0}
                                            />
                                        ))}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading || otp.join('').length !== 8}>
                                        {loading ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                        ) : (
                                            <>
                                                Verify Code
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center text-sm text-muted-foreground">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendTimer > 0 || loading}
                                        className={`font-medium ${resendTimer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:text-primary/80 cursor-pointer'}`}
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                                    </button>
                                </div>

                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '', '', '']); }}
                                        className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
                                    >
                                        <ArrowLeft className="h-3 w-3" />
                                        Change email
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ──────────── STEP: NEW PASSWORD ──────────── */}
                        {step === 'newPassword' && (
                            <motion.div
                                key="newPassword"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-6">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                        <KeyRound className="h-7 w-7 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-semibold tracking-tight">Set new password</h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Your identity has been verified. Choose a strong new password for your account.
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                    <div>
                                        <Label htmlFor="new-password">New password</Label>
                                        <div className="relative mt-2">
                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="new-password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                                className="pl-10 pr-10"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">Must be at least 6 characters</p>
                                    </div>

                                    <div>
                                        <Label htmlFor="confirm-password">Confirm new password</Label>
                                        <div className="relative mt-2">
                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="confirm-password"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {confirmPassword && newPassword !== confirmPassword && (
                                            <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
                                        )}
                                        {confirmPassword && newPassword === confirmPassword && (
                                            <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Passwords match
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                                    >
                                        {loading ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                        ) : (
                                            <>
                                                Confirm & Change Password
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* ──────────── STEP: SUCCESS ──────────── */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </motion.div>
                                <h2 className="text-2xl font-semibold tracking-tight">Password changed!</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Your password has been reset successfully. You can now sign in with your new password.
                                </p>
                                <Button className="w-full mt-8" onClick={() => navigate('/login')}>
                                    Go to Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right panel - Decorative */}
            <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(52,211,153,0.15),transparent_50%)]" />
                    <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center p-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-center text-white"
                        >
                            <img
                                src="/favicon.svg"
                                alt="QResolve logo"
                                className="mx-auto h-20 w-20 mb-6 filter brightness-0 invert"
                            />
                            <h3 className="text-3xl font-semibold mb-4">Secure Password Recovery</h3>
                            <p className="text-lg opacity-90 max-w-md">
                                We take your security seriously. Verify your identity with a one-time code sent to your email.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
